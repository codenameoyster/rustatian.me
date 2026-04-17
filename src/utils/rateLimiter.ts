interface TokenBucketOptions {
  capacity: number;
  refillPerSecond: number;
  idleTtlMs?: number;
}

interface BucketState {
  tokens: number;
  lastRefillMs: number;
  lastSeenMs: number;
}

const DEFAULT_IDLE_TTL_MS = 5 * 60 * 1000;

export class TokenBucket {
  private readonly capacity: number;
  private readonly refillPerSecond: number;
  private readonly idleTtlMs: number;
  private readonly state = new Map<string, BucketState>();

  constructor(options: TokenBucketOptions) {
    this.capacity = options.capacity;
    this.refillPerSecond = options.refillPerSecond;
    this.idleTtlMs = options.idleTtlMs ?? DEFAULT_IDLE_TTL_MS;
  }

  get size(): number {
    return this.state.size;
  }

  tryConsume(key: string): boolean {
    const now = Date.now();
    this.evictIdle(now);
    const bucket = this.state.get(key) ?? {
      tokens: this.capacity,
      lastRefillMs: now,
      lastSeenMs: now,
    };

    const elapsedSeconds = (now - bucket.lastRefillMs) / 1000;
    const refill = elapsedSeconds * this.refillPerSecond;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + refill);
    bucket.lastRefillMs = now;
    bucket.lastSeenMs = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      this.state.set(key, bucket);
      return true;
    }

    this.state.set(key, bucket);
    return false;
  }

  private evictIdle(now: number): void {
    for (const [key, bucket] of this.state) {
      if (now - bucket.lastSeenMs > this.idleTtlMs) {
        this.state.delete(key);
      }
    }
  }
}
