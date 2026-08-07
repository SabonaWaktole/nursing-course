import { Request, Response, NextFunction } from 'express';

/**
 * Dependency-free sliding-window rate limiter.
 *
 * Written in-house rather than pulling in express-rate-limit because this deploy
 * cannot reliably run `npm install`, and it mirrors the existing hand-rolled
 * `withConcurrencyLimit` in utils/concurrency.ts.
 *
 * Counts requests per client per window in memory. Single-process only — if the host
 * ever runs multiple Node workers, each enforces its own budget, so the effective
 * limit is (limit × workers). That is fine for abuse control; it is not a billing
 * quota.
 */

interface Bucket {
    hits: number[]; // timestamps within the current window
}

const buckets = new Map<string, Bucket>();

// Drop idle buckets so a long-running process does not accumulate one entry per IP
// forever. unref() keeps this timer from holding the event loop open at shutdown.
const SWEEP_INTERVAL_MS = 60_000;
const sweeper = setInterval(() => {
    const cutoff = Date.now() - 15 * 60_000;
    for (const [key, bucket] of buckets) {
        if (bucket.hits.length === 0 || bucket.hits[bucket.hits.length - 1] < cutoff) {
            buckets.delete(key);
        }
    }
}, SWEEP_INTERVAL_MS);
sweeper.unref();

/** `app.set('trust proxy', 1)` is set in server.ts, so req.ip is the real client. */
function clientKey(req: Request, scope: string): string {
    return `${scope}:${req.ip || req.socket.remoteAddress || 'unknown'}`;
}

export interface RateLimitOptions {
    /** Requests allowed per window. */
    limit: number;
    /** Window length in seconds. */
    windowSeconds: number;
    /** Namespace, so separate limiters do not share a budget. */
    scope: string;
}

export function rateLimit({ limit, windowSeconds, scope }: RateLimitOptions) {
    const windowMs = windowSeconds * 1000;

    return (req: Request, res: Response, next: NextFunction): void => {
        // Preflights are free — they are cheap, and charging for them would make a
        // browser's mandatory CORS handshake count against the caller's real budget.
        if (req.method === 'OPTIONS') return next();

        const key = clientKey(req, scope);
        const now = Date.now();
        const bucket = buckets.get(key) ?? { hits: [] };

        // Sliding window: discard timestamps that have aged out.
        bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

        if (bucket.hits.length >= limit) {
            const retryAfter = Math.ceil((windowMs - (now - bucket.hits[0])) / 1000);
            buckets.set(key, bucket);
            res.setHeader('Retry-After', String(Math.max(retryAfter, 1)));
            res.setHeader('X-RateLimit-Limit', String(limit));
            res.setHeader('X-RateLimit-Remaining', '0');
            res.status(429).json({ message: 'Too many requests. Please slow down.' });
            return;
        }

        bucket.hits.push(now);
        buckets.set(key, bucket);

        res.setHeader('X-RateLimit-Limit', String(limit));
        res.setHeader('X-RateLimit-Remaining', String(limit - bucket.hits.length));

        next();
    };
}
