/**
 * Tiny in-memory token-bucket rate limiter.
 *
 * Best-effort, per-process: state lives in this module's Map and is lost on
 * restart and not shared across replicas. That is fine for a single-instance
 * deployment (Railway) where the goal is to make casual abuse expensive
 * without standing up a Redis. For multi-replica deployments, swap this for
 * an external store.
 */

type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();
const MAX_TRACKED = 10_000;

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const refillPerMs = opts.limit / opts.windowMs;

  let bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size >= MAX_TRACKED) evictOldest();
    bucket = { tokens: opts.limit, updatedAt: now };
    buckets.set(key, bucket);
  } else {
    const elapsed = now - bucket.updatedAt;
    bucket.tokens = Math.min(opts.limit, bucket.tokens + elapsed * refillPerMs);
    bucket.updatedAt = now;
  }

  if (bucket.tokens < 1) {
    const needed = 1 - bucket.tokens;
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil(needed / refillPerMs / 1000)) };
  }
  bucket.tokens -= 1;
  return { ok: true };
}

/**
 * Apply a burst limiter (per-second) plus a sustained limiter (per-window).
 * Returns the first failure encountered, so the strictest backoff is surfaced.
 */
export function rateLimitMulti(
  key: string,
  ...checks: { suffix: string; limit: number; windowMs: number }[]
): RateLimitResult {
  for (const c of checks) {
    const r = rateLimit(`${key}:${c.suffix}`, { limit: c.limit, windowMs: c.windowMs });
    if (!r.ok) return r;
  }
  return { ok: true };
}

function evictOldest(): void {
  let oldestKey: string | null = null;
  let oldestAt = Infinity;
  for (const [k, b] of buckets) {
    if (b.updatedAt < oldestAt) {
      oldestAt = b.updatedAt;
      oldestKey = k;
    }
  }
  if (oldestKey) buckets.delete(oldestKey);
}

/**
 * Best-effort client identifier. Trusts X-Forwarded-For because Next.js on
 * Railway or behind any reverse proxy strips the original IP otherwise. An
 * attacker can spoof this header when hitting the app directly, so this is
 * not suitable for hard authorization decisions, only for rate limiting.
 */
export function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'anon';
}

/**
 * Bound concurrent in-flight work for a given pool name. Returns a release
 * function the caller MUST invoke (use try/finally). When the pool is full,
 * returns null and the caller should respond with 503. This protects the
 * process from CPU and memory blowups when a hot endpoint is suddenly
 * fanning out work (e.g. sharp re-encoding under traffic spikes).
 */
const inflight = new Map<string, number>();

export function acquireSlot(pool: string, maxConcurrent: number): (() => void) | null {
  const current = inflight.get(pool) ?? 0;
  if (current >= maxConcurrent) return null;
  inflight.set(pool, current + 1);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const next = (inflight.get(pool) ?? 1) - 1;
    if (next <= 0) inflight.delete(pool);
    else inflight.set(pool, next);
  };
}

/**
 * A single global counter applied across all hot endpoints. Acts as a hard
 * ceiling on simultaneous heavy work, regardless of how many clients hit at
 * once. Set generously (the goal is to fail fast under abuse, not to throttle
 * normal traffic).
 */
export const GLOBAL_HEAVY_POOL = 'global-heavy';
export const GLOBAL_HEAVY_MAX = Number(process.env.ESG_MAX_CONCURRENCY ?? 16);
