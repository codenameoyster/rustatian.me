import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { TokenBucket } from '../rateLimiter';

describe('TokenBucket', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-17T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts full and allows requests up to capacity', () => {
    const bucket = new TokenBucket({ capacity: 3, refillPerSecond: 1 });
    expect(bucket.tryConsume('ip-1')).toBe(true);
    expect(bucket.tryConsume('ip-1')).toBe(true);
    expect(bucket.tryConsume('ip-1')).toBe(true);
    expect(bucket.tryConsume('ip-1')).toBe(false);
  });

  it('refills tokens at the configured rate', () => {
    const bucket = new TokenBucket({ capacity: 2, refillPerSecond: 2 });
    bucket.tryConsume('ip-1');
    bucket.tryConsume('ip-1');
    expect(bucket.tryConsume('ip-1')).toBe(false);

    vi.advanceTimersByTime(500);
    expect(bucket.tryConsume('ip-1')).toBe(true);

    vi.advanceTimersByTime(500);
    expect(bucket.tryConsume('ip-1')).toBe(true);
  });

  it('tracks different keys independently', () => {
    const bucket = new TokenBucket({ capacity: 1, refillPerSecond: 1 });
    expect(bucket.tryConsume('ip-a')).toBe(true);
    expect(bucket.tryConsume('ip-a')).toBe(false);
    expect(bucket.tryConsume('ip-b')).toBe(true);
  });

  it('caps refill at capacity', () => {
    const bucket = new TokenBucket({ capacity: 2, refillPerSecond: 10 });
    bucket.tryConsume('ip-1');
    bucket.tryConsume('ip-1');
    vi.advanceTimersByTime(10_000);
    expect(bucket.tryConsume('ip-1')).toBe(true);
    expect(bucket.tryConsume('ip-1')).toBe(true);
    expect(bucket.tryConsume('ip-1')).toBe(false);
  });

  it('evicts idle keys after the configured TTL', () => {
    const bucket = new TokenBucket({
      capacity: 1,
      refillPerSecond: 1,
      idleTtlMs: 60_000,
    });
    bucket.tryConsume('ip-1');
    expect(bucket.size).toBe(1);

    vi.advanceTimersByTime(60_001);
    bucket.tryConsume('ip-2');
    expect(bucket.size).toBe(1);
  });
});
