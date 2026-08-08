import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

/**
 * Serves the pdf.js worker script from a real Next.js route instead of `public/`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY NOT public/pdf.worker.min.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * That was the first attempt, and it broke PDFs in production. Confirmed by curling
 * the live site and comparing response headers:
 *
 *   GET /                      -> x-nextjs-cache, x-nextjs-prerender, platform:
 *                                 hostinger, panel: hpanel  (reaches the Next.js
 *                                 process — these headers only appear on routes
 *                                 Next.js itself renders)
 *   GET /robots.txt             -> same Next-specific headers (it's app/robots.ts,
 *                                 a real route, not a public/ file)
 *   GET /file.svg                -> none of those headers, ~2ms upstream time,
 *                                 correct Content-Type (image/svg+xml)
 *   GET /pdf.worker.min.mjs      -> none of those headers, ~3ms upstream time,
 *                                 WRONG Content-Type (text/plain)
 *
 * Every plain file under `public/` — correct MIME type or not — is served by a fast
 * static layer in front of the Node process (Hostinger's edge/CDN) that never
 * reaches Next.js at all. That layer's MIME table has an entry for `.svg` but not
 * for `.mjs`, and there is no `.htaccess` anywhere in this repo (confirmed by
 * search) and no other evidence of an Apache layer — this is Hostinger's own
 * static-asset path, which is not configurable from inside this project.
 *
 * Next.js's own static file server (the `send` package it bundles) DOES map
 * `.mjs -> application/javascript` correctly — verified directly against the
 * installed dependency — so the fix is not "teach Next about .mjs". The fix is to
 * stop asking the layer that doesn't know about `.mjs` to serve this file, and use
 * the one proven (by the /robots.txt and / responses above) to actually reach
 * Next.js: a route handler.
 *
 * The source file lives at public/_vendor/pdfjs/ rather than a project-root vendor
 * folder specifically because THIS deployment has already proven it copies
 * `public/` into the running server — the broken file was being served with
 * correct bytes, just the wrong header, which is only possible if the bytes made
 * it to the server's filesystem. A new top-level folder would have no such
 * evidence behind it. The underscore signals "not meant to be linked directly";
 * nothing in the app fetches this path — every consumer goes through /api/pdf-worker.
 *
 * ⚠️ Keep in sync with the installed pdfjs-dist version:
 *     cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/_vendor/pdfjs/
 */

export const runtime = 'nodejs';

const WORKER_PATH = path.join(process.cwd(), 'public', '_vendor', 'pdfjs', 'pdf.worker.min.mjs');

// Read and hold in memory rather than re-reading from disk on every request. The
// file is immutable for the life of the deployed build (it is only replaced by
// re-running the copy step above and redeploying), so there is nothing to invalidate.
let cached: Buffer | null = null;

function loadWorker(): Buffer {
    if (!cached) {
        cached = fs.readFileSync(WORKER_PATH);
    }
    return cached;
}

export async function GET() {
    let body: Buffer;
    try {
        body = loadWorker();
    } catch (err) {
        // Fails loudly rather than serving a 200 with the wrong content — a silent
        // fallback here would reproduce exactly the "looks fine, breaks in the
        // browser" failure mode this route exists to avoid.
        console.error('pdf-worker route: could not read vendored worker file:', err);
        return new NextResponse('PDF worker asset missing on server', { status: 500 });
    }

    // NextResponse's BodyInit type doesn't include Node's Buffer, even though the
    // underlying Response constructor accepts it fine at runtime (it's a Uint8Array
    // subclass). Wrapping in Uint8Array satisfies the type without copying.
    return new NextResponse(new Uint8Array(body), {
        status: 200,
        headers: {
            // The one thing this whole route exists to guarantee. Browsers enforce
            // strict MIME checking for ES module scripts — anything else here and
            // pdf.js's worker import fails exactly as it did before.
            'Content-Type': 'application/javascript; charset=utf-8',
            'Content-Length': String(body.length),
            // Version-pinned to the installed pdfjs-dist build (see the file header
            // comment); it cannot change without a new deploy, so it is safe to
            // cache indefinitely, same as the backend's /uploads immutable assets.
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}
