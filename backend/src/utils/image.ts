import path from 'path';
import fs from 'fs';

/**
 * Image derivative generation.
 *
 * Uploaded images used to be stored at whatever resolution the admin happened to
 * upload (guide screenshots were 0.8–1.7MB PNGs). Those originals were then fetched
 * and re-encoded by the Next.js image optimizer on every cold cache — one user-visible
 * image cost CPU and a process slot on BOTH the frontend and backend processes.
 *
 * We now resize once, at upload time, and serve the derivative directly.
 *
 * `sharp` is a native module and installing it on shared hosting is the fragile step
 * here, so it is required lazily and every failure path degrades to "keep the original"
 * rather than breaking uploads.
 */

const DISPLAY_WIDTH = 1600;
const DISPLAY_QUALITY = 80;
const THUMB_WIDTH = 480;
const THUMB_QUALITY = 75;

// Extensions we can meaningfully re-encode. GIFs are skipped: they may be animated,
// and a single-frame WebP conversion would silently drop the animation.
const CONVERTIBLE = ['.jpg', '.jpeg', '.png', '.webp'];

let sharpModule: any | undefined; // undefined = not tried yet, null = unavailable

function loadSharp(): any | null {
    if (sharpModule !== undefined) return sharpModule;
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        sharpModule = require('sharp');
        console.log('✅ sharp loaded — image derivatives enabled');
    } catch (err: any) {
        sharpModule = null;
        console.warn(
            `⚠️ sharp unavailable (${err?.message}) — uploads will store originals without resizing. ` +
            `Run "npm install sharp" in the backend to enable image optimization.`
        );
    }
    return sharpModule;
}

export interface Derivatives {
    /** URL of the resized display image, e.g. /uploads/guides/123.webp */
    displayUrl: string;
    /** URL of the small thumbnail, e.g. /uploads/guides/123-sm.webp */
    thumbUrl: string;
}

/**
 * Generate display + thumbnail WebP derivatives next to an uploaded image.
 *
 * @param absPath  Absolute path to the uploaded original on disk.
 * @param urlPrefix URL prefix the file is served under, e.g. `/uploads/guides`.
 * @returns The derivative URLs, or `null` if they could not be produced (caller
 *          should fall back to the original file).
 */
export async function generateDerivatives(
    absPath: string,
    urlPrefix: string
): Promise<Derivatives | null> {
    const sharp = loadSharp();
    if (!sharp) return null;

    const ext = path.extname(absPath).toLowerCase();
    if (!CONVERTIBLE.includes(ext)) return null;

    const dir = path.dirname(absPath);
    const base = path.basename(absPath, ext);

    // If the upload is already a .webp, writing <base>.webp would clobber the source
    // mid-read. Give the derivative a distinct name in that case.
    const displayName = ext === '.webp' ? `${base}-lg.webp` : `${base}.webp`;
    const thumbName = `${base}-sm.webp`;

    const displayPath = path.join(dir, displayName);
    const thumbPath = path.join(dir, thumbName);

    try {
        await Promise.all([
            sharp(absPath)
                .rotate() // honour EXIF orientation before resizing
                .resize({ width: DISPLAY_WIDTH, withoutEnlargement: true })
                .webp({ quality: DISPLAY_QUALITY })
                .toFile(displayPath),
            sharp(absPath)
                .rotate()
                .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
                .webp({ quality: THUMB_QUALITY })
                .toFile(thumbPath),
        ]);

        return {
            displayUrl: `${urlPrefix}/${displayName}`,
            thumbUrl: `${urlPrefix}/${thumbName}`,
        };
    } catch (err: any) {
        console.warn(`⚠️ Could not generate derivatives for ${absPath}: ${err?.message}`);
        // Clean up half-written output so a retry starts clean.
        for (const p of [displayPath, thumbPath]) {
            try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch { }
        }
        return null;
    }
}

/** True when sharp is importable. Used by the backfill script to fail fast. */
export function isImageProcessingAvailable(): boolean {
    return loadSharp() !== null;
}
