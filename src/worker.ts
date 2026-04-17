/// <reference types="@cloudflare/workers-types" />

import {
  BLOG_ROOT_URL,
  BLOG_SUMMARY_MD_URL,
  PROFILE_BRANCH,
  PROFILE_NAME,
  PROFILE_REPO_NAME,
} from './constants';
import { TokenBucket } from './utils/rateLimiter';

const RATE_LIMIT_BURST = 10;
const RATE_LIMIT_SUSTAINED_PER_MINUTE = 100;

const RATE_LIMIT_BUCKET = new TokenBucket({
  capacity: RATE_LIMIT_BURST,
  refillPerSecond: RATE_LIMIT_SUSTAINED_PER_MINUTE / 60,
});

const getClientIp = (request: Request): string => {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  return 'unknown';
};

interface Env {
  ASSETS: Fetcher;
  APP_ENV?: string;
  GITHUB_TOKEN?: string;
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
const STATIC_ASSET_PREFIXES = ['/assets/', '/src/'];
const STATIC_ASSET_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/i;

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
  } else {
    headers.delete('content-security-policy');
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

const buildRateLimitResponse = (requestId: string): Response =>
  buildApiErrorResponse(
    429,
    {
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests — please slow down',
        requestId,
      },
    },
    requestId,
  );

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

const isHtmlResponse = (headers: Headers, forceHtml = false): boolean => {
  if (forceHtml) {
    return true;
  }

  return headers.get('content-type')?.toLowerCase().includes('text/html') ?? false;
};

const buildResponseWithSecurityHeaders = (
  response: Response,
  options?: {
    forceHtml?: boolean;
    overrideStatus?: number;
    extraHeaders?: Record<string, string>;
  },
): Response => {
  const headers = new Headers(response.headers);
  const forceHtml = options?.forceHtml ?? false;

  if (options?.extraHeaders) {
    Object.entries(options.extraHeaders).forEach(([key, value]) => headers.set(key, value));
  }

  if (forceHtml && !headers.has('content-type')) {
    headers.set('content-type', 'text/html; charset=UTF-8');
  }

  applySecurityHeaders(headers, isHtmlResponse(headers, forceHtml));

  const status = options?.overrideStatus ?? response.status;
  const init: ResponseInit = {
    status,
    headers,
  };

  if (options?.overrideStatus === undefined) {
    init.statusText = response.statusText;
  }

  return new Response(response.body, init);
};

const buildTextErrorResponse = (status: number, message: string): Response => {
  const headers = new Headers({ 'content-type': 'text/plain; charset=UTF-8' });
  applySecurityHeaders(headers, false);

  return new Response(message, {
    status,
    headers,
  });
};

const isStaticAssetPath = (pathname: string): boolean => {
  return (
    STATIC_ASSET_PREFIXES.some(prefix => pathname.startsWith(prefix)) ||
    STATIC_ASSET_EXTENSIONS.test(pathname)
  );
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
  githubToken?: string,
): Promise<Response> => {
  const cache = await getEdgeCache();
  const cacheRequest = new Request(request.url, { method: 'GET' });
  const headers: Record<string, string> = {
    Accept: route.contentType.includes('json') ? 'application/json' : 'text/plain',
    'User-Agent': 'rustatian.me/edge-proxy',
  };

  if (githubToken) {
    headers['Authorization'] = `Bearer ${githubToken}`;
  }

  const requestInit: RequestInit = { headers };

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

const handleGitHubApiRequest = async (request: Request, env: Env): Promise<Response> => {
  const requestId = createRequestId();

  const clientIp = getClientIp(request);
  if (!RATE_LIMIT_BUCKET.tryConsume(clientIp)) {
    return buildRateLimitResponse(requestId);
  }

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

  return fetchAndCacheGitHubResource(request, route, requestId, staleResponse, env.GITHUB_TOKEN);
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith(API_PREFIX)) {
      return handleGitHubApiRequest(request, env);
    }

    if (isStaticAssetPath(url.pathname)) {
      const assetResponse = await env.ASSETS.fetch(request);
      return buildResponseWithSecurityHeaders(assetResponse);
    }

    if (request.method === 'GET') {
      try {
        const assetResponse = await env.ASSETS.fetch(request);

        if (assetResponse.ok) {
          return buildResponseWithSecurityHeaders(assetResponse);
        }

        const indexRequest = new Request(new URL('/', url.origin), request);
        const indexResponse = await env.ASSETS.fetch(indexRequest);

        if (indexResponse.ok) {
          return buildResponseWithSecurityHeaders(indexResponse, {
            forceHtml: true,
            overrideStatus: 200,
            extraHeaders: {
              'content-type': 'text/html; charset=UTF-8',
            },
          });
        }

        return buildTextErrorResponse(404, 'Not Found');
      } catch (error) {
        console.error('Navigation request error:', error);
        return buildTextErrorResponse(500, 'Internal Server Error');
      }
    }

    const response = await env.ASSETS.fetch(request);
    return buildResponseWithSecurityHeaders(response);
  },
};
