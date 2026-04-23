/// <reference types="@cloudflare/workers-types" />

import type { WorkerErrorCode } from './api/errorCodes';
import { PROFILE_NAME } from './constants';
import { CSP_NONCE_PLACEHOLDER, generateCspNonce, injectCspNonceIntoHtml } from './utils/cspNonce';
import { TokenBucket } from './utils/rateLimiter';
import { CONTRIBUTIONS_QUERY, transformContributions } from './worker/contributions';
import { GraphQLResponseError, UpstreamRequestError } from './worker/errors';

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

interface UpstreamRouteBase {
  upstreamUrl: string;
  ttlSeconds: number;
  contentType: string;
  // Override the edge cache key. Defaults to the incoming request URL. Use a
  // stable `https://cache.internal/...` URL when the response doesn't vary
  // per-request and all clients should share a single cached entry (e.g. the
  // daily-refreshed contributions calendar).
  cacheKey?: string;
  // Cap how long a stale response can be served on upstream failure. Omit for
  // "serve stale forever" (previous behavior). Set to bound outage tolerance:
  // once past `expiresAt + maxStaleSeconds` the worker surfaces a 502 instead
  // of serving fossilised data.
  maxStaleSeconds?: number;
}

// Discriminated union on `kind` so TypeScript (and readers) can't conflate
// the simple proxy case with the authenticated GraphQL case. Each variant
// only carries fields relevant to its mode — no optionals that "should only
// appear together."
type UpstreamRoute =
  | (UpstreamRouteBase & { kind: 'simple-get' })
  | (UpstreamRouteBase & {
      kind: 'graphql-post';
      body: string;
      bodyContentType: string;
      // Must throw `UpstreamRequestError` or `GraphQLResponseError` to surface
      // parse / schema / application failures; the returned string is cached
      // verbatim under the incoming request URL.
      transform: (rawBody: string) => string;
    });

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

const resolveGitHubRoute = (pathname: string): UpstreamRoute | null => {
  if (pathname === `${API_PREFIX}/user`) {
    return {
      kind: 'simple-get',
      upstreamUrl: new URL(`/users/${PROFILE_NAME}`, GITHUB_API_HOST).toString(),
      ttlSeconds: 60 * 10,
      contentType: 'application/json; charset=UTF-8',
    };
  }

  if (pathname === `${API_PREFIX}/contributions`) {
    return {
      kind: 'graphql-post',
      upstreamUrl: new URL('/graphql', GITHUB_API_HOST).toString(),
      // One refresh per day — the GitHub calendar rolls over at UTC midnight and
      // the grid is purely decorative between rollovers. Short-circuits every
      // subsequent browser tab for the next 24h.
      ttlSeconds: 60 * 60 * 24,
      // Allow up to a week of stale on outage; past that, fail loudly rather
      // than paint a calendar that's a month out of date.
      maxStaleSeconds: 60 * 60 * 24 * 7,
      // Static key so all visitors share one cached entry regardless of the
      // request URL they arrived at. The Workers Cache API wants a full URL.
      cacheKey: 'https://cache.internal/rustatian-me/contributions-v1',
      contentType: 'application/json; charset=UTF-8',
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: { login: PROFILE_NAME },
      }),
      bodyContentType: 'application/json',
      transform: transformContributions,
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
  route: UpstreamRoute,
  cacheRequest: Request,
  requestId: string,
  staleResponse: Response | null,
  githubToken?: string,
): Promise<Response> => {
  const cache = await getEdgeCache();
  const upstreamHeaders: Record<string, string> = {
    Accept: route.contentType.includes('json') ? 'application/json' : 'text/plain',
    'User-Agent': 'rustatian.me/edge-proxy',
  };

  if (route.kind === 'graphql-post') {
    upstreamHeaders['Content-Type'] = route.bodyContentType;
    if (!githubToken) {
      // GraphQL always requires a token; fail fast rather than burning a
      // request we know GitHub will reject.
      return buildApiErrorResponse(
        502,
        {
          error: {
            code: 'UPSTREAM_ERROR',
            message: 'GitHub authentication token is not configured',
            requestId,
          },
        },
        requestId,
      );
    }
  }

  if (githubToken) {
    upstreamHeaders['Authorization'] = `Bearer ${githubToken}`;
  }

  const requestInit: RequestInit =
    route.kind === 'graphql-post'
      ? { method: 'POST', headers: upstreamHeaders, body: route.body }
      : { method: 'GET', headers: upstreamHeaders };

  const timeoutSignal = createTimeoutSignal();
  if (timeoutSignal) {
    requestInit.signal = timeoutSignal;
  }

  try {
    const upstreamResponse = await fetch(route.upstreamUrl, requestInit);

    if (!upstreamResponse.ok) {
      throw new UpstreamRequestError(upstreamResponse.status);
    }

    const rawBody = await upstreamResponse.text();
    const body = route.kind === 'graphql-post' ? route.transform(rawBody) : rawBody;
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
    // Log every failure before deciding whether to serve stale. Without this,
    // a warm edge cache would mask schema drift or auth failures forever —
    // the stale-fallback path is intentionally silent at the HTTP level, so
    // observability has to happen here.
    const logPayload: Record<string, unknown> = {
      type:
        error instanceof GraphQLResponseError
          ? 'upstream-graphql-error'
          : error instanceof UpstreamRequestError
            ? 'upstream-http-error'
            : 'upstream-fetch-failure',
      requestId,
      route: route.upstreamUrl,
      servedStale: staleResponse !== null,
      error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
    };
    if (error instanceof GraphQLResponseError) {
      logPayload['graphqlErrors'] = error.graphqlErrors;
    } else if (error instanceof UpstreamRequestError) {
      logPayload['upstreamStatus'] = error.status;
      logPayload['reason'] = error.reason;
      if (error.issues !== undefined) logPayload['issues'] = error.issues;
    }
    console.error(JSON.stringify(logPayload));

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

    if (error instanceof GraphQLResponseError) {
      // Upstream HTTP was 200 — no `upstreamStatus` so the client isn't
      // misled into thinking GitHub returned a 5xx.
      return buildApiErrorResponse(
        502,
        {
          error: {
            code: 'UPSTREAM_ERROR',
            message: error.message,
            requestId,
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
  const cacheUrl = route.cacheKey ?? request.url;
  const cacheRequest = new Request(cacheUrl, { method: 'GET' });
  const cachedResponse = await cache.match(cacheRequest);
  let staleResponse: Response | null = null;

  if (cachedResponse) {
    const expiresAt = Number(cachedResponse.headers.get(CACHE_EXPIRES_HEADER) ?? '0');
    const now = Date.now();

    if (Number.isFinite(expiresAt) && expiresAt > now) {
      return cloneResponseWithHeaders(cachedResponse, {
        [CACHE_STATUS_HEADER]: 'HIT',
        [REQUEST_ID_HEADER]: requestId,
      });
    }

    // Enforce the stale cap so a broken token / dead upstream can't pin us on
    // fossilised data indefinitely — past the window, refuse to serve stale
    // and let the refresh-path error bubble to the client.
    const maxStaleMs =
      route.maxStaleSeconds !== undefined ? route.maxStaleSeconds * 1000 : Number.POSITIVE_INFINITY;
    const stalenessMs = now - expiresAt;
    if (stalenessMs <= maxStaleMs) {
      staleResponse = cachedResponse;
    }
  }

  return fetchAndCacheGitHubResource(
    route,
    cacheRequest,
    requestId,
    staleResponse,
    env.GITHUB_TOKEN,
  );
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
