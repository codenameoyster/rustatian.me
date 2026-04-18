import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type CacheKey = RequestInfo | URL;
type Worker = typeof import('../worker').default;

const fetchMock = vi.fn();
global.fetch = fetchMock as typeof fetch;

// `worker.ts` holds a module-scoped rate-limit bucket. Re-importing the
// module for every test gives each one a fresh bucket so state doesn't
// leak between tests.
let worker: Worker;
const loadWorker = async (): Promise<Worker> => {
  vi.resetModules();
  return (await import('../worker')).default;
};

const createEnv = (
  assetFetch: (request: Request) => Promise<Response> = async () =>
    new Response('Not Found', { status: 404 }),
) =>
  ({
    ASSETS: {
      fetch: vi.fn(assetFetch),
    },
  }) as unknown as Parameters<Worker['fetch']>[1];

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
  beforeEach(async () => {
    fetchMock.mockReset();
    worker = await loadWorker();
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

  it('returns 404 for retired /blog routes (no longer proxied)', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    const env = createEnv();
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/blog/some-post.md'),
      env,
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'NOT_FOUND' },
    });
  });

  it('returns 404 for retired /readme route', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    const env = createEnv();
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/readme'),
      env,
    );

    expect(response.status).toBe(404);
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
      new Request('https://rustatian.me/api/v1/github/user'),
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

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ login: 'rustatian' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const env = createEnv();
    const request = new Request('https://rustatian.me/api/v1/github/user', {
      headers: { 'cf-connecting-ip': '192.0.2.10' },
    });

    const firstResponse = await worker.fetch(request, env);
    expect(firstResponse.status).toBe(200);
    expect(firstResponse.headers.get('x-cache')).toBe('MISS');
    expect(await firstResponse.json()).toMatchObject({ login: 'rustatian' });

    // Jump past the 600s user TTL to force a refresh, which fails.
    nowSpy.mockReturnValue(1_000_000 + 601_000);
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    const staleResponse = await worker.fetch(request, env);
    expect(staleResponse.status).toBe(200);
    expect(staleResponse.headers.get('x-cache')).toBe('STALE');
    expect(await staleResponse.json()).toMatchObject({ login: 'rustatian' });

    nowSpy.mockRestore();
  });
});

describe('worker /pinned GraphQL proxy', () => {
  beforeEach(async () => {
    fetchMock.mockReset();
    worker = await loadWorker();
  });

  it('returns 503 TOKEN_UNAVAILABLE when GITHUB_TOKEN is missing', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    const env = createEnv();
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/pinned'),
      env,
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'TOKEN_UNAVAILABLE' },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects non-GET methods on /pinned with 405', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    const env = createEnv();
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/pinned', { method: 'POST' }),
      env,
    );

    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'METHOD_NOT_ALLOWED' },
    });
  });

  it('normalizes GraphQL pinned nodes into REST /repos shape', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            user: {
              pinnedItems: {
                nodes: [
                  {
                    name: 'roadrunner',
                    description: 'High-performance PHP app server',
                    url: 'https://github.com/rustatian/roadrunner',
                    stargazerCount: 8000,
                    forkCount: 400,
                    primaryLanguage: { name: 'Go' },
                  },
                  {
                    name: 'velox',
                    description: null,
                    url: 'https://github.com/rustatian/velox',
                    stargazerCount: 100,
                    forkCount: 10,
                    primaryLanguage: null,
                  },
                ],
              },
            },
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const env = { ...createEnv(), GITHUB_TOKEN: 'ghp_test' } as Parameters<Worker['fetch']>[1];
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/pinned'),
      env,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('x-cache')).toBe('MISS');
    const body = (await response.json()) as unknown[];
    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({
      name: 'roadrunner',
      description: 'High-performance PHP app server',
      html_url: 'https://github.com/rustatian/roadrunner',
      stargazers_count: 8000,
      forks_count: 400,
      language: 'Go',
    });
    expect(body[1]).toMatchObject({
      name: 'velox',
      description: null,
      stargazers_count: 100,
      language: null,
    });

    const [calledUrl, init] = fetchMock.mock.calls[0]!;
    expect(String(calledUrl)).toBe('https://api.github.com/graphql');
    expect((init as RequestInit).method).toBe('POST');
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer ghp_test',
    });
  });

  it('caches pinned responses and serves HIT on second call', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { user: { pinnedItems: { nodes: [] } } } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const env = { ...createEnv(), GITHUB_TOKEN: 'ghp_test' } as Parameters<Worker['fetch']>[1];
    const req = () => new Request('https://rustatian.me/api/v1/github/pinned');

    const first = await worker.fetch(req(), env);
    expect(first.headers.get('x-cache')).toBe('MISS');

    const second = await worker.fetch(req(), env);
    expect(second.headers.get('x-cache')).toBe('HIT');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps GraphQL upstream failures to UPSTREAM_ERROR', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    fetchMock.mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));

    const env = { ...createEnv(), GITHUB_TOKEN: 'ghp_test' } as Parameters<Worker['fetch']>[1];
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/pinned'),
      env,
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'UPSTREAM_ERROR', upstreamStatus: 401 },
    });
  });

  it('surfaces UPSTREAM_GRAPHQL_ERROR when the GraphQL body has an errors array', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          errors: [{ type: 'RATE_LIMITED', message: 'API rate limit exceeded' }],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const env = { ...createEnv(), GITHUB_TOKEN: 'ghp_test' } as Parameters<Worker['fetch']>[1];
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/pinned'),
      env,
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'UPSTREAM_GRAPHQL_ERROR' },
    });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('surfaces UPSTREAM_GRAPHQL_ERROR when the GraphQL body is missing data.user', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { user: null } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const env = { ...createEnv(), GITHUB_TOKEN: 'ghp_test' } as Parameters<Worker['fetch']>[1];
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/pinned'),
      env,
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'UPSTREAM_GRAPHQL_ERROR' },
    });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('does not cache a GraphQL error response (next request re-fetches)', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: [{ message: 'bad' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { user: { pinnedItems: { nodes: [] } } } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const env = { ...createEnv(), GITHUB_TOKEN: 'ghp_test' } as Parameters<Worker['fetch']>[1];
    const first = await worker.fetch(new Request('https://rustatian.me/api/v1/github/pinned'), env);
    expect(first.status).toBe(502);

    const second = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/pinned'),
      env,
    );
    expect(second.status).toBe(200);
    expect(second.headers.get('x-cache')).toBe('MISS');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });
});

describe('worker /repos proxy', () => {
  beforeEach(async () => {
    fetchMock.mockReset();
    worker = await loadWorker();
  });

  it('proxies the repos list and returns upstream JSON', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            name: 'demo',
            description: 'A demo repo',
            html_url: 'https://github.com/rustatian/demo',
            stargazers_count: 5,
            forks_count: 1,
            language: 'TypeScript',
          },
        ]),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const env = createEnv();
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/repos'),
      env,
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { name: string }[];
    expect(body[0]!.name).toBe('demo');
  });

  it('caches /repos and serves HIT on the second request', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const env = createEnv();
    const req = () => new Request('https://rustatian.me/api/v1/github/repos');

    const first = await worker.fetch(req(), env);
    expect(first.headers.get('x-cache')).toBe('MISS');

    const second = await worker.fetch(req(), env);
    expect(second.headers.get('x-cache')).toBe('HIT');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects non-GET on /repos with 405', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    const env = createEnv();
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/repos', { method: 'POST' }),
      env,
    );

    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'METHOD_NOT_ALLOWED' },
    });
  });

  it('maps upstream 5xx on /repos to UPSTREAM_ERROR with upstreamStatus', async () => {
    const { cacheStorage } = createMockCache();
    (globalThis as { caches: CacheStorage }).caches = cacheStorage;

    fetchMock.mockResolvedValueOnce(new Response('Bad Gateway', { status: 502 }));

    const env = createEnv();
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/github/repos'),
      env,
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'UPSTREAM_ERROR', upstreamStatus: 502 },
    });
  });
});

describe('worker HTML shell fallback and headers', () => {
  beforeEach(async () => {
    fetchMock.mockReset();
    worker = await loadWorker();
  });

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
  beforeEach(async () => {
    fetchMock.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-17T12:00:00Z'));
    worker = await loadWorker();
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
    const failures: Response[] = [];

    for (let i = 0; i < 15; i += 1) {
      const response = await worker.fetch(makeRequest(), env);
      if (response.status === 429) {
        failures.push(response);
      } else {
        successes.push(i);
      }
    }

    expect(successes.length).toBe(10);
    expect(failures.length).toBe(5);
    expect(failures[0]!.headers.get('retry-after')).toBe('1');
    await expect(failures[0]!.json()).resolves.toMatchObject({
      error: { code: 'RATE_LIMITED' },
    });
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
  beforeEach(async () => {
    fetchMock.mockReset();
    worker = await loadWorker();
  });

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
  beforeEach(async () => {
    fetchMock.mockReset();
    worker = await loadWorker();
  });

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
  beforeEach(async () => {
    fetchMock.mockReset();
    worker = await loadWorker();
  });

  it('accepts POST to /api/v1/csp-report and returns 204', async () => {
    const env = createEnv();
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/csp-report', {
        method: 'POST',
        headers: {
          'content-type': 'application/csp-report',
          'cf-connecting-ip': '203.0.113.20',
        },
        body: JSON.stringify({ 'csp-report': { 'violated-directive': 'style-src' } }),
      }),
      env,
    );

    expect(response.status).toBe(204);
  });

  it('rejects GET on /api/v1/csp-report with 405', async () => {
    const env = createEnv();
    const response = await worker.fetch(
      new Request('https://rustatian.me/api/v1/csp-report', {
        method: 'GET',
        headers: { 'cf-connecting-ip': '203.0.113.21' },
      }),
      env,
    );

    expect(response.status).toBe(405);
  });

  it('applies rate limiting to csp-report POSTs per client IP', async () => {
    const env = createEnv();
    const makeRequest = () =>
      new Request('https://rustatian.me/api/v1/csp-report', {
        method: 'POST',
        headers: {
          'content-type': 'application/csp-report',
          'cf-connecting-ip': '203.0.113.22',
        },
        body: JSON.stringify({ 'csp-report': { 'violated-directive': 'style-src' } }),
      });

    const statuses: number[] = [];
    for (let i = 0; i < 15; i += 1) {
      const response = await worker.fetch(makeRequest(), env);
      statuses.push(response.status);
    }

    expect(statuses.some(s => s === 204)).toBe(true);
    expect(statuses.some(s => s === 429)).toBe(true);
  });
});
