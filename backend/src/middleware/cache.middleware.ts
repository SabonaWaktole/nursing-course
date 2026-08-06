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
