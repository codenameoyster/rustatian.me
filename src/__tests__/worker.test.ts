import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../worker';

type CacheKey = RequestInfo | URL;

const fetchMock = vi.fn();
global.fetch = fetchMock as typeof fetch;

const createEnv = (
  assetFetch: (request: Request) => Promise<Response> = async () =>
    new Response('Not Found', { status: 404 }),
) =>
  ({
    ASSETS: {
      fetch: vi.fn(assetFetch),
    },
  }) as unknown as Parameters<(typeof worker)['fetch']>[1];

const createMockCache = () => {
  const store = new Map<string, Response>();
  const cache = {
    add: vi.fn(),
    addAll: vi.fn(),
    delete: vi.fn(),
    keys: vi.fn(),
    match: vi.fn(async (request: CacheKey) => {
      const key = typeof request === 'string' ? request : request.toString();
      const cached = store.get(key);
      return cached ? cached.clone() : undefined;
    }),
    put: vi.fn(async (request: CacheKey, response: Response) => {
      const key = typeof request === 'string' ? request : request.toString();
      store.set(key, response.clone());
    }),
  } as unknown as Cache;

  return {
    cacheStorage: {
      delete: vi.fn(),
      keys: vi.fn(),
      has: vi.fn(),
      match: vi.fn(async (request: RequestInfo | URL) => {
        return cache.match(request);
      }),
      open: vi.fn(async () => {
        return cache;
      }),
    } as unknown as CacheStorage,
    store,
  };
};

const expectBaseSecurityHeaders = (response: Response): void => {
  expect(response.headers.get('x-frame-options')).toBe('DENY');
  expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  expect(response.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
  expect(response.headers.get('permissions-policy')).toBe(
    'geolocation=(), microphone=(), camera=()',
  );
};

describe('worker GitHub proxy API', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('proxies user endpoint and serves cache hit on subsequent request', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ login: 'rustatian' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const env = createEnv();
    const request = new Request('https://rustatian.me/api/v1/github/user');

    const firstResponse = await worker.fetch(request, env);
    expect(firstResponse.status).toBe(200);
    expect(firstResponse.headers.get('x-cache')).toBe('MISS');
    expect(await firstResponse.json()).toMatchObject({ login: 'rustatian' });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const secondResponse = await worker.fetch(request, env);
    expect(secondResponse.status).toBe(200);
    expect(secondResponse.headers.get('x-cache')).toBe('HIT');
    expect(await secondResponse.json()).toMatchObject({ login: 'rustatian' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid encoded blog path traversal', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    const env = createEnv();
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/blog/%2E%2E%2Fsecret.md'),
      env,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: 'INVALID_PATH',
      },
    });
  });

  it('rejects unsupported methods for API endpoints', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    const env = createEnv();
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/user', { method: 'POST' }),
      env,
    );

    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: 'METHOD_NOT_ALLOWED',
      },
    });
  });

  it('maps upstream HTTP errors into normalized Worker API errors', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    fetchMock.mockResolvedValueOnce(new Response('Not Found', { status: 404 }));

    const env = createEnv();
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/readme'),
      env,
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: 'UPSTREAM_ERROR',
        upstreamStatus: 404,
      },
    });
  });

  it('serves stale cache when upstream refresh fails', async () => {
    const nowSpy = vi.spyOn(Date, 'now');
    nowSpy.mockReturnValue(1_000_000);

    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    fetchMock.mockResolvedValueOnce(new Response('# Summary', { status: 200 }));

    const env = createEnv();
    const request = new Request('https://rustatian.me/api/v1/github/blog/summary', {
      headers: { 'cf-connecting-ip': '192.0.2.10' },
    });

    const firstResponse = await worker.fetch(request, env);
    expect(firstResponse.status).toBe(200);
    expect(firstResponse.headers.get('x-cache')).toBe('MISS');
    expect(await firstResponse.text()).toBe('# Summary');

    nowSpy.mockReturnValue(1_000_000 + 901_000);
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    const staleResponse = await worker.fetch(request, env);
    expect(staleResponse.status).toBe(200);
    expect(staleResponse.headers.get('x-cache')).toBe('STALE');
    expect(await staleResponse.text()).toBe('# Summary');

    nowSpy.mockRestore();
  });
});

describe('worker HTML shell fallback and headers', () => {
  it('returns HTML and security headers for root path even with wildcard accept', async () => {
    const env = createEnv(async (request: Request) => {
      const pathname = new URL(request.url).pathname;
      if (pathname === '/') {
        return new Response('<!doctype html><html><body>Home</body></html>', {
          status: 200,
          headers: {
            'content-type': 'text/html; charset=UTF-8',
          },
        });
      }

      return new Response('Not Found', { status: 404 });
    });

    const response = await worker.fetch(
      new Request('https://rustatian.me/', { headers: { Accept: '*/*' } }),
      env,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-security-policy')).toBeTruthy();
    expectBaseSecurityHeaders(response);
    expect(await response.text()).toContain('Home');
  });

  it('falls back to index shell for /blog with wildcard accept', async () => {
    const env = createEnv(async (request: Request) => {
      const pathname = new URL(request.url).pathname;
      if (pathname === '/blog') {
        return new Response('Not Found', { status: 404 });
      }
      if (pathname === '/') {
        return new Response('<!doctype html><html><body>Index</body></html>', {
          status: 200,
          headers: {
            'content-type': 'text/html; charset=UTF-8',
          },
        });
      }

      return new Response('Not Found', { status: 404 });
    });

    const response = await worker.fetch(
      new Request('https://rustatian.me/blog', { headers: { Accept: '*/*' } }),
      env,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(response.headers.get('content-security-policy')).toBeTruthy();
    expectBaseSecurityHeaders(response);
    expect(await response.text()).toContain('Index');
  });

  it('falls back to index shell for unknown non-asset routes', async () => {
    const env = createEnv(async (request: Request) => {
      const pathname = new URL(request.url).pathname;
      if (pathname === '/does-not-exist') {
        return new Response('Not Found', { status: 404 });
      }
      if (pathname === '/') {
        return new Response('<!doctype html><html><body>Index</body></html>', {
          status: 200,
          headers: {
            'content-type': 'text/html; charset=UTF-8',
          },
        });
      }

      return new Response('Not Found', { status: 404 });
    });

    const response = await worker.fetch(
      new Request('https://rustatian.me/does-not-exist', { headers: { Accept: '*/*' } }),
      env,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(response.headers.get('content-security-policy')).toBeTruthy();
    expectBaseSecurityHeaders(response);
    expect(await response.text()).toContain('Index');
  });
});

describe('worker rate limiting', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-17T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 429 after exceeding burst capacity on the same IP', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ login: 'rustatian' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const env = createEnv();
    const makeRequest = () =>
      new Request('https://rustatian.me/api/v1/github/user', {
        headers: { 'cf-connecting-ip': '203.0.113.5' },
      });

    const successes: number[] = [];
    const failures: number[] = [];

    for (let i = 0; i < 15; i += 1) {
      const response = await worker.fetch(makeRequest(), env);
      if (response.status === 429) {
        failures.push(i);
      } else {
        successes.push(i);
      }
    }

    expect(successes.length).toBe(10);
    expect(failures.length).toBe(5);
  });

  it('tracks different IPs independently', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ login: 'rustatian' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const env = createEnv();
    const buildRequest = (ip: string) =>
      new Request('https://rustatian.me/api/v1/github/user', {
        headers: { 'cf-connecting-ip': ip },
      });

    for (let i = 0; i < 15; i += 1) {
      await worker.fetch(buildRequest('198.51.100.1'), env);
    }
    const freshIpResponse = await worker.fetch(buildRequest('198.51.100.2'), env);
    expect(freshIpResponse.status).not.toBe(429);
  });
});

describe('worker CSP nonce injection', () => {
  it('replaces the nonce placeholder with a real value in served HTML', async () => {
    const env = createEnv(async (request: Request) => {
      const pathname = new URL(request.url).pathname;
      if (pathname === '/') {
        return new Response(
          '<!doctype html><html><head><meta name="csp-nonce" content="__CSP_NONCE__" /></head><body>Home</body></html>',
          {
            status: 200,
            headers: { 'content-type': 'text/html; charset=UTF-8' },
          },
        );
      }
      return new Response('Not Found', { status: 404 });
    });

    const response = await worker.fetch(
      new Request('https://rustatian.me/', { headers: { Accept: 'text/html' } }),
      env,
    );

    const html = await response.text();
    expect(html).not.toContain('__CSP_NONCE__');
    const match = html.match(/content="([A-Za-z0-9+/=]{22,})"/);
    expect(match).not.toBeNull();
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('content-security-policy')).toContain(`'nonce-${match![1]}'`);
  });
});

describe('worker CSP report-only', () => {
  it('sets a report-only CSP that excludes unsafe-inline for styles', async () => {
    const env = createEnv(async (request: Request) => {
      const pathname = new URL(request.url).pathname;
      if (pathname === '/') {
        return new Response(
          '<!doctype html><html><head><meta name="csp-nonce" content="__CSP_NONCE__" /></head><body>Home</body></html>',
          {
            status: 200,
            headers: { 'content-type': 'text/html; charset=UTF-8' },
          },
        );
      }
      return new Response('Not Found', { status: 404 });
    });

    const response = await worker.fetch(
      new Request('https://rustatian.me/', { headers: { Accept: 'text/html' } }),
      env,
    );

    const reportOnly = response.headers.get('content-security-policy-report-only');
    expect(reportOnly).not.toBeNull();
    expect(reportOnly).not.toContain("'unsafe-inline'");
    expect(reportOnly).toContain('require-trusted-types-for');
    expect(reportOnly).toContain('upgrade-insecure-requests');
    expect(reportOnly).toContain('report-uri /api/v1/csp-report');

    const enforced = response.headers.get('content-security-policy');
    expect(enforced).not.toBeNull();
    expect(enforced).toContain("'unsafe-inline'");

    const nonceMatch = enforced!.match(/'nonce-([A-Za-z0-9+/=]+)'/);
    expect(nonceMatch).not.toBeNull();
    expect(reportOnly).toContain(
      `style-src 'self' 'nonce-${nonceMatch![1]}' https://fonts.googleapis.com`,
    );
  });
});

describe('worker CSP report endpoint', () => {
  it('accepts POST to /api/v1/csp-report and returns 204', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    const env = createEnv();
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/csp-report', {
        method: 'POST',
        headers: { 'content-type': 'application/csp-report' },
        body: JSON.stringify({ 'csp-report': { 'violated-directive': 'style-src' } }),
      }),
      env,
    );

    expect(response.status).toBe(204);
  });

  it('rejects GET on /api/v1/csp-report with 405', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    const env = createEnv();
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/csp-report', { method: 'GET' }),
      env,
    );

    expect(response.status).toBe(405);
  });
});
