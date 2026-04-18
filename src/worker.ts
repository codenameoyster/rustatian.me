/// <reference types="@cloudflare/workers-types" />

import type { WorkerErrorCode } from './api/errorCodes';
import { PROFILE_NAME } from './constants';
import { CSP_NONCE_PLACEHOLDER, generateCspNonce, injectCspNonceIntoHtml } from './utils/cspNonce';
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
    code: WorkerErrorCode;
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
const CSP_REPORT_PATH = '/api/v1/csp-report';
const GITHUB_API_HOST = 'https://api.github.com';
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_EXPIRES_HEADER = 'x-edge-expires-at';
const REQUEST_ID_HEADER = 'x-request-id';
const CACHE_STATUS_HEADER = 'x-cache';
const STATIC_ASSET_PREFIXES = ['/assets/', '/src/'];
const STATIC_ASSET_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/i;

const buildCspPolicy = (nonce?: string): string => {
  const scriptSrc = nonce ? `script-src 'self' 'nonce-${nonce}'` : "script-src 'self'";
  return [
    "default-src 'self'",
    scriptSrc,
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
};

const buildCspReportOnlyPolicy = (nonce: string | undefined): string => {
  const scriptSrc = nonce ? `script-src 'self' 'nonce-${nonce}'` : "script-src 'self'";
  const styleSrc = nonce
    ? `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`
    : "style-src 'self' https://fonts.googleapis.com";
  return [
    "default-src 'self'",
    scriptSrc,
    styleSrc,
    "img-src 'self' data: https: raw.githubusercontent.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
    "require-trusted-types-for 'script'",
    'report-uri /api/v1/csp-report',
  ].join('; ');
};

const applySecurityHeaders = (headers: Headers, includeCSP = false, nonce?: string): void => {
  if (includeCSP) {
    headers.set('content-security-policy', buildCspPolicy(nonce));
    headers.set('content-security-policy-report-only', buildCspReportOnlyPolicy(nonce));
  } else {
    headers.delete('content-security-policy');
    headers.delete('content-security-policy-report-only');
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
  extraHeaders?: Record<string, string>,
): Response => {
  const headers = new Headers({
    'content-type': 'application/json; charset=UTF-8',
    'cache-control': 'no-store',
    [REQUEST_ID_HEADER]: requestId,
  });

  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      headers.set(key, value);
    }
  }

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
    { 'retry-after': '1' },
  );

const cloneResponseWithHeaders = (
  response: Response,
  extraHeaders: Record<string, string>,
): Response => {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(extraHeaders)) {
    headers.set(key, value);
  }

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

const buildResponseWithSecurityHeaders = async (
  response: Response,
  options?: {
    forceHtml?: boolean;
    overrideStatus?: number;
    extraHeaders?: Record<string, string>;
  },
): Promise<Response> => {
  const headers = new Headers(response.headers);
  const forceHtml = options?.forceHtml ?? false;

  if (options?.extraHeaders) {
    for (const [key, value] of Object.entries(options.extraHeaders)) {
      headers.set(key, value);
    }
  }

  if (forceHtml && !headers.has('content-type')) {
    headers.set('content-type', 'text/html; charset=UTF-8');
  }

  const isHtml = isHtmlResponse(headers, forceHtml);

  let body: BodyInit | null = response.body;
  let nonce: string | undefined;

  if (isHtml) {
    const rawHtml = await response.text();
    if (rawHtml.includes(CSP_NONCE_PLACEHOLDER)) {
      nonce = generateCspNonce();
      body = injectCspNonceIntoHtml(rawHtml, nonce);
      headers.set('cache-control', 'no-store');
      headers.delete('content-length');
      headers.delete('etag');
    } else {
      body = rawHtml;
    }
  }

  applySecurityHeaders(headers, isHtml, nonce);

  const status = options?.overrideStatus ?? response.status;
  const init: ResponseInit = {
    status,
    headers,
  };

  if (options?.overrideStatus === undefined) {
    init.statusText = response.statusText;
  }

  return new Response(body, init);
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

class UpstreamRequestError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Upstream request failed: ${status}`);
    this.status = status;
  }
}

const resolveGitHubRoute = (pathname: string): UpstreamRoute | null => {
  if (pathname === `${API_PREFIX}/user`) {
    return {
      upstreamUrl: new URL(`/users/${PROFILE_NAME}`, GITHUB_API_HOST).toString(),
      ttlSeconds: 60 * 10,
      contentType: 'application/json; charset=UTF-8',
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
  const upstreamHeaders: Record<string, string> = {
    Accept: route.contentType.includes('json') ? 'application/json' : 'text/plain',
    'User-Agent': 'rustatian.me/edge-proxy',
  };

  if (githubToken) {
    upstreamHeaders['Authorization'] = `Bearer ${githubToken}`;
  }

  const requestInit: RequestInit = { headers: upstreamHeaders };

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

    // Non-upstream-HTTP failure: DNS, network, timeout (AbortError from
    // createTimeoutSignal), JSON parse bugs, etc. Log so production outages
    // aren't invisible; the handlePinnedRequest path logs the same way.
    console.error(
      JSON.stringify({
        type: 'upstream-fetch-failure',
        requestId,
        route: route.upstreamUrl,
        error:
          error instanceof Error ? { name: error.name, message: error.message } : String(error),
      }),
    );

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

// Cap the body we log so a hostile UA can't flood logs with oversized reports.
const CSP_REPORT_MAX_CHARS = 2000;

const handleCspReportRequest = async (request: Request): Promise<Response> => {
  const requestId = createRequestId();

  if (request.method !== 'POST') {
    return buildApiErrorResponse(
      405,
      {
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only POST is supported for csp-report',
          requestId,
        },
      },
      requestId,
    );
  }

  if (!RATE_LIMIT_BUCKET.tryConsume(getClientIp(request))) {
    return buildRateLimitResponse(requestId);
  }

  try {
    const raw = (await request.text()).slice(0, CSP_REPORT_MAX_CHARS);
    let report: unknown;
    try {
      report = JSON.parse(raw);
    } catch {
      report = { rawPrefix: raw.slice(0, 200) };
    }
    console.warn(JSON.stringify({ type: 'csp-violation', requestId, report }));
  } catch (error) {
    console.warn(
      JSON.stringify({
        type: 'csp-report-drop',
        requestId,
        error:
          error instanceof Error ? { name: error.name, message: error.message } : String(error),
      }),
    );
  }

  const headers = new Headers({
    'cache-control': 'no-store',
    [REQUEST_ID_HEADER]: requestId,
  });
  applySecurityHeaders(headers, false);
  return new Response(null, { status: 204, headers });
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

  const route = resolveGitHubRoute(url.pathname);

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

    if (url.pathname === CSP_REPORT_PATH) {
      return handleCspReportRequest(request);
    }

    if (url.pathname.startsWith(API_PREFIX)) {
      return handleGitHubApiRequest(request, env);
    }

    if (isStaticAssetPath(url.pathname)) {
      const assetResponse = await env.ASSETS.fetch(request);
      return await buildResponseWithSecurityHeaders(assetResponse);
    }

    if (request.method === 'GET') {
      try {
        const assetResponse = await env.ASSETS.fetch(request);

        if (assetResponse.ok) {
          return await buildResponseWithSecurityHeaders(assetResponse);
        }

        const indexRequest = new Request(new URL('/', url.origin), request);
        const indexResponse = await env.ASSETS.fetch(indexRequest);

        if (indexResponse.ok) {
          return await buildResponseWithSecurityHeaders(indexResponse, {
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
    return await buildResponseWithSecurityHeaders(response);
  },
};
