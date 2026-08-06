import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage and Site Number
api.interceptors.request.use((config) => {
    const siteNumber = process.env.NEXT_PUBLIC_SITE_NUMBER;
    if (siteNumber) {
        config.headers['X-Site-Number'] = siteNumber;
    }

    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

/* ═══════════════════════════════════════════
   READ CACHE + REQUEST DEDUPLICATION
   ═══════════════════════════════════════════

   Public reads (/courses, /guide, /public/stats) were previously fetched by every
   component that wanted them, with no sharing — /api/courses alone has five call
   sites, and navigating from the homepage to /courses refetched it from scratch.

   Two maps: one holds settled responses for a TTL, the other holds in-flight
   promises so N simultaneous callers share a single request instead of issuing N.

   Deliberately hand-rolled rather than SWR/React Query: this needs deduplication
   and a TTL, not mutation lifecycles or revalidation strategies, and the deploy
   target is fragile enough that avoiding another runtime dependency is worth more
   than the ergonomics.
*/

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

const responseCache = new Map<string, { data: unknown; ts: number }>();
const inflight = new Map<string, Promise<unknown>>();

interface CacheOptions {
    /** Milliseconds a cached response stays fresh. Defaults to 5 minutes. */
    ttl?: number;
    /** Skip the cache and refetch. The result still populates the cache. */
    force?: boolean;
}

/**
 * GET `url`, reusing a recent response or an in-flight request when possible.
 * Errors are never cached — a failed request leaves the cache untouched so the
 * next caller retries.
 */
export async function getCached<T = unknown>(url: string, options: CacheOptions = {}): Promise<T> {
    const { ttl = DEFAULT_TTL, force = false } = options;

    if (!force) {
        const hit = responseCache.get(url);
        if (hit && Date.now() - hit.ts < ttl) {
            return hit.data as T;
        }

        const pending = inflight.get(url);
        if (pending) return pending as Promise<T>;
    }

    const request = api
        .get(url)
        .then((res) => {
            responseCache.set(url, { data: res.data, ts: Date.now() });
            return res.data as T;
        })
        .finally(() => {
            inflight.delete(url);
        });

    inflight.set(url, request);
    return request as Promise<T>;
}

/**
 * Drop cached responses. Pass a prefix to clear one resource family
 * (`invalidate('/courses')` also clears `/courses?fields=card&limit=3`), or omit
 * it to clear everything — done on login/logout, where the caller's identity
 * changes what the same URL returns.
 */
export function invalidate(prefix?: string): void {
    if (!prefix) {
        responseCache.clear();
        inflight.clear();
        return;
    }
    for (const key of responseCache.keys()) {
        if (key.startsWith(prefix)) responseCache.delete(key);
    }
    for (const key of inflight.keys()) {
        if (key.startsWith(prefix)) inflight.delete(key);
    }
}

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            invalidate(); // cached reads belong to the session that just ended
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
