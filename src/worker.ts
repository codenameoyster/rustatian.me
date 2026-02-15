/// <reference types="@cloudflare/workers-types" />

import {
  BLOG_ROOT_URL,
  BLOG_SUMMARY_MD_URL,
  PROFILE_BRANCH,
  PROFILE_NAME,
  PROFILE_REPO_NAME,
} from './constants';

interface Env {
  ASSETS: Fetcher;
  APP_ENV?: string;
}

interface WorkerApiErrorBody {
  error: {
    code: string;
    message: string;
    requestId: string;
    upstreamStatus?: number;
  };
}

interface UpstreamRoute {
  upstreamUrl: string;
  ttlSeconds: number;
  contentType: string;
}

const API_PREFIX = '/api/v1/github';
const RAW_GITHUB_HOST = 'https://raw.githubusercontent.com';
const GITHUB_API_HOST = 'https://api.github.com';
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_EXPIRES_HEADER = 'x-edge-expires-at';
const REQUEST_ID_HEADER = 'x-request-id';
const CACHE_STATUS_HEADER = 'x-cache';
const BLOG_PATH_PATTERN = /^[a-zA-Z0-9._\-\/]+$/;

/**
 * Content Security Policy (CSP) Configuration
 *
 * Security considerations for this CSP:
 *
 * 1. Script/style policy:
 *    - Scripts are restricted to 'self' only
 *    - Styles keep 'unsafe-inline' for Emotion/MUI runtime styles
 *    - Mitigation: markdown content is sanitized before rendering
 *
 * 2. External resources:
 *    - fonts.googleapis.com / fonts.gstatic.com: Google Fonts for typography
 *    - Images allow 'data:' for inline SVGs and base64 images from markdown
 *
 * 3. frame-ancestors 'none': Prevents clickjacking by disallowing embedding
 *
 * Future improvements:
 * - Consider nonce-based CSP if moving away from CSS-in-JS
 * - Evaluate Trusted Types API when browser support improves
 */
const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https: raw.githubusercontent.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
].join('; ');

/**
 * Apply security headers to a response
 */
const applySecurityHeaders = (headers: Headers, includeCSP = false): void => {
  if (includeCSP) {
    headers.set('content-security-policy', CSP_POLICY);
  }
  headers.set('x-frame-options', 'DENY');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  headers.set('permissions-policy', 'geolocation=(), microphone=(), camera=()');
  headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains; preload');
  headers.set('cross-origin-opener-policy', 'same-origin');
  headers.set('cross-origin-resource-policy', 'same-origin');
};

const createRequestId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const buildApiErrorResponse = (
  status: number,
  payload: WorkerApiErrorBody,
  requestId: string,
): Response => {
  const headers = new Headers({
    'content-type': 'application/json; charset=UTF-8',
    'cache-control': 'no-store',
    [REQUEST_ID_HEADER]: requestId,
  });

  applySecurityHeaders(headers, false);

  return new Response(JSON.stringify(payload), {
    status,
    headers,
  });
};

const cloneResponseWithHeaders = (
  response: Response,
  extraHeaders: Record<string, string>,
): Response => {
  const headers = new Headers(response.headers);

  Object.entries(extraHeaders).forEach(([key, value]) => headers.set(key, value));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

class InvalidBlogPathError extends Error {}
class UpstreamRequestError extends Error {
  status: number;

  constructor(status: number) {
    super(`Upstream request failed: ${status}`);
    this.status = status;
  }
}

const sanitizeBlogSlug = (slug: string): string => {
  let decoded = '';

  try {
    decoded = decodeURIComponent(slug).replace(/^\/+/, '');
  } catch {
    throw new InvalidBlogPathError('Invalid blog slug');
  }

  if (!decoded.trim()) {
    throw new InvalidBlogPathError('Blog slug is required');
  }

  if (decoded.includes('..') || decoded.includes('//') || decoded.includes('\\')) {
    throw new InvalidBlogPathError('Invalid blog slug');
  }

  if (!BLOG_PATH_PATTERN.test(decoded)) {
    throw new InvalidBlogPathError('Invalid blog slug');
  }

  return decoded;
};

const resolveGitHubRoute = (pathname: string): UpstreamRoute | null => {
  if (pathname === `${API_PREFIX}/user`) {
    return {
      upstreamUrl: new URL(`/users/${PROFILE_NAME}`, GITHUB_API_HOST).toString(),
      ttlSeconds: 60 * 10,
      contentType: 'application/json; charset=UTF-8',
    };
  }

  if (pathname === `${API_PREFIX}/readme`) {
    const readmePath = `${PROFILE_NAME}/${PROFILE_REPO_NAME}/${PROFILE_BRANCH}/README.md`;
    return {
      upstreamUrl: new URL(readmePath, RAW_GITHUB_HOST).toString(),
      ttlSeconds: 60 * 15,
      contentType: 'text/plain; charset=UTF-8',
    };
  }

  if (pathname === `${API_PREFIX}/blog/summary`) {
    return {
      upstreamUrl: new URL(BLOG_SUMMARY_MD_URL, RAW_GITHUB_HOST).toString(),
      ttlSeconds: 60 * 15,
      contentType: 'text/plain; charset=UTF-8',
    };
  }

  if (pathname.startsWith(`${API_PREFIX}/blog/`)) {
    const rawSlug = pathname.slice(`${API_PREFIX}/blog/`.length);
    const sanitizedSlug = sanitizeBlogSlug(rawSlug);
    const rootPath = BLOG_ROOT_URL.replace(/^\/+/, '');

    return {
      upstreamUrl: new URL(`${rootPath}/${sanitizedSlug}`, RAW_GITHUB_HOST).toString(),
      ttlSeconds: 60 * 60,
      contentType: 'text/plain; charset=UTF-8',
    };
  }

  return null;
};

const createTimeoutSignal = (): AbortSignal | undefined => {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  }

  return undefined;
};

const getEdgeCache = async (): Promise<Cache> => caches.open('github-proxy-cache');

const fetchAndCacheGitHubResource = async (
  request: Request,
  route: UpstreamRoute,
  requestId: string,
  staleResponse: Response | null,
): Promise<Response> => {
  const cache = await getEdgeCache();
  const cacheRequest = new Request(request.url, { method: 'GET' });
  const requestInit: RequestInit = {
    headers: {
      Accept: route.contentType.includes('json') ? 'application/json' : 'text/plain',
      'User-Agent': 'rustatian.me/edge-proxy',
    },
  };

  const timeoutSignal = createTimeoutSignal();
  if (timeoutSignal) {
    requestInit.signal = timeoutSignal;
  }

  try {
    const upstreamResponse = await fetch(route.upstreamUrl, requestInit);

    if (!upstreamResponse.ok) {
      throw new UpstreamRequestError(upstreamResponse.status);
    }

    const body = await upstreamResponse.text();
    const headers = new Headers({
      'content-type': route.contentType,
      'cache-control': `public, max-age=${route.ttlSeconds}`,
      [CACHE_EXPIRES_HEADER]: String(Date.now() + route.ttlSeconds * 1000),
      [CACHE_STATUS_HEADER]: 'MISS',
      [REQUEST_ID_HEADER]: requestId,
    });

    applySecurityHeaders(headers, false);

    const response = new Response(body, {
      status: 200,
      headers,
    });

    await cache.put(cacheRequest, response.clone());
    return response;
  } catch (error) {
    if (staleResponse) {
      return cloneResponseWithHeaders(staleResponse, {
        [CACHE_STATUS_HEADER]: 'STALE',
        [REQUEST_ID_HEADER]: requestId,
      });
    }

    if (error instanceof UpstreamRequestError) {
      return buildApiErrorResponse(
        502,
        {
          error: {
            code: 'UPSTREAM_ERROR',
            message: `GitHub upstream responded with status ${error.status}`,
            requestId,
            upstreamStatus: error.status,
          },
        },
        requestId,
      );
    }

    return buildApiErrorResponse(
      502,
      {
        error: {
          code: 'UPSTREAM_ERROR',
          message: 'Failed to fetch GitHub upstream resource',
          requestId,
        },
      },
      requestId,
    );
  }
};

const handleGitHubApiRequest = async (request: Request): Promise<Response> => {
  const requestId = createRequestId();

  if (request.method !== 'GET') {
    return buildApiErrorResponse(
      405,
      {
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only GET is supported for this endpoint',
          requestId,
        },
      },
      requestId,
    );
  }

  const url = new URL(request.url);

  let route: UpstreamRoute | null = null;

  try {
    route = resolveGitHubRoute(url.pathname);
  } catch (error) {
    if (error instanceof InvalidBlogPathError) {
      return buildApiErrorResponse(
        400,
        {
          error: {
            code: 'INVALID_PATH',
            message: 'Invalid blog path',
            requestId,
          },
        },
        requestId,
      );
    }

    return buildApiErrorResponse(
      500,
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Unexpected route resolution error',
          requestId,
        },
      },
      requestId,
    );
  }

  if (!route) {
    return buildApiErrorResponse(
      404,
      {
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint not found',
          requestId,
        },
      },
      requestId,
    );
  }

  const cache = await getEdgeCache();
  const cacheRequest = new Request(request.url, { method: 'GET' });
  const cachedResponse = await cache.match(cacheRequest);
  let staleResponse: Response | null = null;

  if (cachedResponse) {
    const expiresAt = Number(cachedResponse.headers.get(CACHE_EXPIRES_HEADER) ?? '0');

    if (Number.isFinite(expiresAt) && expiresAt > Date.now()) {
      return cloneResponseWithHeaders(cachedResponse, {
        [CACHE_STATUS_HEADER]: 'HIT',
        [REQUEST_ID_HEADER]: requestId,
      });
    }

    staleResponse = cachedResponse;
  }

  return fetchAndCacheGitHubResource(request, route, requestId, staleResponse);
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith(API_PREFIX)) {
      return handleGitHubApiRequest(request);
    }

    // Serve static assets directly from the ASSETS binding
    // This includes JS, CSS, images, fonts, etc.
    if (
      url.pathname.startsWith('/assets/') ||
      url.pathname.startsWith('/src/') ||
      url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/)
    ) {
      const assetResponse = await env.ASSETS.fetch(request);
      const headers = new Headers(assetResponse.headers);
      applySecurityHeaders(headers, false);

      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      });
    }

    // For HTML navigation requests, perform SSR
    if (request.method === 'GET' && request.headers.get('accept')?.includes('text/html')) {
      try {
        // Try to fetch the prerendered HTML from assets first
        const assetResponse = await env.ASSETS.fetch(request);

        if (assetResponse.ok) {
          const headers = new Headers(assetResponse.headers);
          applySecurityHeaders(headers, true);

          return new Response(assetResponse.body, {
            status: assetResponse.status,
            statusText: assetResponse.statusText,
            headers,
          });
        }

        // If no prerendered asset exists, fall back to index.html
        // This handles client-side routing
        const indexRequest = new Request(new URL('/', url.origin), request);
        const indexResponse = await env.ASSETS.fetch(indexRequest);

        if (indexResponse.ok) {
          const headers = new Headers(indexResponse.headers);
          headers.set('content-type', 'text/html;charset=UTF-8');
          applySecurityHeaders(headers, true);

          return new Response(indexResponse.body, {
            status: 200,
            headers,
          });
        }

        const headers = new Headers({ 'content-type': 'text/plain; charset=UTF-8' });
        applySecurityHeaders(headers, true);
        return new Response('Not Found', { status: 404, headers });
      } catch (error) {
        console.error('SSR Error:', error);
        const headers = new Headers({ 'content-type': 'text/plain; charset=UTF-8' });
        applySecurityHeaders(headers, true);
        return new Response('Internal Server Error', { status: 500, headers });
      }
    }

    // For all other requests, try to fetch from assets
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    applySecurityHeaders(headers, false);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
