import { Request, Response, NextFunction } from 'express';

/**
 * Cache-Control for public, read-only GET endpoints.
 *
 * ⚠️ Correctness, not just performance: these responses vary by more than the URL.
 *
 *  - `/api/courses` filters by the `X-Site-Number` header, so two sites share a URL
 *    but must never share a cache entry.
 *  - `/api/courses` also inspects `Authorization` — an ADMIN token bypasses the site
 *    filter and receives every course across every site
 *    (see getAllCourses in course.controller.ts).
 *
 * A blanket `Cache-Control: public` would therefore let a shared cache serve an
 * admin's cross-site listing to anonymous visitors. To prevent that:
 *
 *  1. `Vary` always names both headers, so any correct cache keys on them.
 *  2. Authenticated requests are marked `no-store` outright — belt and braces, since
 *     a misconfigured intermediary that ignores `Vary` still cannot retain them.
 */
export function publicCache(maxAgeSeconds = 300) {
    const swr = maxAgeSeconds * 2;

    return (req: Request, res: Response, next: NextFunction): void => {
        res.setHeader('Vary', 'X-Site-Number, Authorization');

        if (req.headers.authorization) {
            res.setHeader('Cache-Control', 'no-store');
        } else {
            res.setHeader(
                'Cache-Control',
                `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${swr}`
            );
        }

        next();
    };
}

/* ═══════════════════════════════════════════
   SERVER-SIDE RESPONSE CACHE
   ═══════════════════════════════════════════

   `Cache-Control` only helps a browser that has already been here. Every *first*
   visit, every crawler, and every cold client still reaches the database.

   That is expensive here for a specific reason: production MariaDB runs with
   `wait_timeout = 20`, so it hangs up on idle pooled connections after 20 seconds.
   Under anything less than constant traffic, a request that has to touch the
   database frequently pays a full reconnect handshake before it can even query.

   These three endpoints return the same bytes to every anonymous caller and change
   only when an admin edits something, so serving them from memory for a short TTL
   removes almost all of that work.

   Authenticated requests are never served from — or written to — this cache: an
   ADMIN token changes what `/api/courses` returns.
*/

interface CacheEntry {
    body: unknown;
    ts: number;
}

const store = new Map<string, CacheEntry>();

/** Requests differing in site number are different responses. */
function cacheKey(req: Request): string {
    const site = (req.headers['x-site-number'] as string) || 'default';
    return `${req.method}:${req.originalUrl}:site=${site}`;
}

export function responseCache(ttlSeconds = 60) {
    const ttlMs = ttlSeconds * 1000;

    return (req: Request, res: Response, next: NextFunction): void => {
        // Never cache a personalised response.
        if (req.headers.authorization) return next();

        const key = cacheKey(req);
        const hit = store.get(key);

        if (hit && Date.now() - hit.ts < ttlMs) {
            res.setHeader('X-Cache', 'HIT');
            res.json(hit.body);
            return;
        }

        res.setHeader('X-Cache', 'MISS');

        // Capture whatever the handler sends, without changing how handlers are written.
        const originalJson = res.json.bind(res);
        res.json = (body: unknown) => {
            // Only cache successful responses — an error must not stick for the TTL.
            if (res.statusCode >= 200 && res.statusCode < 300) {
                store.set(key, { body, ts: Date.now() });
            }
            return originalJson(body);
        };

        next();
    };
}

/**
 * Drop cached responses so an admin write shows up immediately instead of after the
 * TTL. Pass a path fragment (`'/api/courses'`) or omit to clear everything.
 */
export function invalidateResponseCache(pathFragment?: string): void {
    if (!pathFragment) {
        store.clear();
        return;
    }
    for (const key of store.keys()) {
        if (key.includes(pathFragment)) store.delete(key);
    }
}
