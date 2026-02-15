import { beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../worker';

type CacheKey = RequestInfo | URL;

const fetchMock = vi.fn();
global.fetch = fetchMock as typeof fetch;

const createEnv = () =>
  ({
    ASSETS: {
      fetch: vi.fn(async () => new Response('Not Found', { status: 404 })),
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
    const request = new Request('https://rustatian.me/api/v1/github/blog/summary');

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
