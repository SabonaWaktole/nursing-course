/**
 * One-off backfill: generate WebP derivatives for images uploaded before
 * resize-on-upload existed, and repoint the database rows at them.
 *
 * Idempotent — rows already pointing at a .webp derivative are skipped, so it is
 * safe to re-run after adding more legacy content.
 *
 * Usage (from backend/):
 *   npx ts-node --transpile-only src/scripts/backfill-images.ts
 *   npx ts-node --transpile-only src/scripts/backfill-images.ts --dry-run
 */

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

import prisma from '../utils/prisma';
import { generateDerivatives, isImageProcessingAvailable } from '../utils/image';

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const dryRun = process.argv.includes('--dry-run');

/** Map a stored URL like /uploads/guides/x.png to its absolute path on disk. */
function toAbsolutePath(url: string): string | null {
    if (!url || url.startsWith('http')) return null; // external URLs are not ours to touch
    if (!url.startsWith('/uploads/')) return null;
    return path.join(uploadDir, url.replace('/uploads/', ''));
}

/** The URL prefix a stored URL lives under, e.g. /uploads/guides */
function urlPrefixOf(url: string): string {
    return url.substring(0, url.lastIndexOf('/'));
}

function alreadyOptimized(url: string | null | undefined): boolean {
    return !!url && url.toLowerCase().endsWith('.webp');
}

async function backfillGuideImages() {
    const images = await prisma.guideImage.findMany();
    let converted = 0;
    let skipped = 0;

    for (const image of images) {
        const needsDisplay = !alreadyOptimized(image.imageUrl);
        const needsThumb = !(image as any).thumbUrl;

        if (!needsDisplay && !needsThumb) {
            skipped++;
            continue;
        }

        const absPath = toAbsolutePath(image.imageUrl);
        if (!absPath || !fs.existsSync(absPath)) {
            console.warn(`  ⚠️  GuideImage ${image.id}: source missing (${image.imageUrl}) — skipped`);
            skipped++;
            continue;
        }

        const before = fs.statSync(absPath).size;
        console.log(`  → GuideImage ${image.id}: ${path.basename(absPath)} (${(before / 1024).toFixed(0)}KB)`);

        if (dryRun) { converted++; continue; }

        const derivatives = await generateDerivatives(absPath, urlPrefixOf(image.imageUrl));
        if (!derivatives) {
            console.warn(`  ⚠️  GuideImage ${image.id}: derivative generation failed — left unchanged`);
            skipped++;
            continue;
        }

        await prisma.guideImage.update({
            where: { id: image.id },
            data: {
                imageUrl: derivatives.displayUrl,
                thumbUrl: derivatives.thumbUrl,
            } as any,
        });

        const after = fs.statSync(path.join(uploadDir, derivatives.displayUrl.replace('/uploads/', ''))).size;
        console.log(`    ✓ ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB display + thumbnail`);
        converted++;
    }

    return { converted, skipped, total: images.length };
}

async function backfillCourseThumbnails() {
    const courses = await prisma.course.findMany({
        where: { thumbnail: { not: null } },
        select: { id: true, title: true, thumbnail: true },
    });

    let converted = 0;
    let skipped = 0;

    for (const course of courses) {
        const thumbnail = course.thumbnail as string;

        if (alreadyOptimized(thumbnail)) { skipped++; continue; }

        const absPath = toAbsolutePath(thumbnail);
        if (!absPath) { skipped++; continue; } // external/Unsplash URL — not ours
        if (!fs.existsSync(absPath)) {
            console.warn(`  ⚠️  Course ${course.id}: source missing (${thumbnail}) — skipped`);
            skipped++;
            continue;
        }

        const before = fs.statSync(absPath).size;
        console.log(`  → Course "${course.title}": ${path.basename(absPath)} (${(before / 1024).toFixed(0)}KB)`);

        if (dryRun) { converted++; continue; }

        const derivatives = await generateDerivatives(absPath, urlPrefixOf(thumbnail));
        if (!derivatives) {
            console.warn(`  ⚠️  Course ${course.id}: derivative generation failed — left unchanged`);
            skipped++;
            continue;
        }

        await prisma.course.update({
            where: { id: course.id },
            data: { thumbnail: derivatives.displayUrl },
        });

        const after = fs.statSync(path.join(uploadDir, derivatives.displayUrl.replace('/uploads/', ''))).size;
        console.log(`    ✓ ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`);
        converted++;
    }

    return { converted, skipped, total: courses.length };
}

async function main() {
    console.log(`\n📸 Image backfill${dryRun ? ' (DRY RUN — nothing will be written)' : ''}`);
    console.log(`   Upload directory: ${uploadDir}\n`);

    if (!isImageProcessingAvailable()) {
        console.error('❌ sharp is not available — cannot generate derivatives.');
        console.error('   Run "npm install sharp" in the backend directory first.');
        process.exit(1);
    }

    console.log('Guide images:');
    const guides = await backfillGuideImages();
    console.log(`  ${guides.converted} converted, ${guides.skipped} skipped, ${guides.total} total\n`);

    console.log('Course thumbnails:');
    const thumbs = await backfillCourseThumbnails();
    console.log(`  ${thumbs.converted} converted, ${thumbs.skipped} skipped, ${thumbs.total} total\n`);

    console.log('✅ Backfill complete.');
    console.log('   Originals were left on disk; delete them once the site looks correct.\n');
}

main()
    .catch((err) => {
        console.error('❌ Backfill failed:', err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
