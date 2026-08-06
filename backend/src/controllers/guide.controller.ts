import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../utils/prisma';
import { generateDerivatives } from '../utils/image';
import { invalidateResponseCache } from '../middleware/cache.middleware';

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const guidesDir = path.join(uploadDir, 'guides');

// Multer config for guide images
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, guidesDir),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const guideUpload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB — screenshots are resized on upload anyway
    fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid image format. Allowed: jpg, jpeg, png, webp, gif') as any);
        }
    }
});

// Public: Get all guide images ordered by `order`
export const getGuideImages = async (_req: Request, res: Response) => {
    try {
        const images = await prisma.guideImage.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(images);
    } catch (error: any) {
        console.error('getGuideImages error:', error);
        res.status(500).json({ message: 'Error fetching guide images' });
    }
};

// Admin: Upload a new guide image
export const uploadGuideImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

        const { title = '', description = '' } = req.body;

        // Get the next order value
        const maxOrder = await prisma.guideImage.aggregate({ _max: { order: true } });
        const nextOrder = (maxOrder._max.order ?? -1) + 1;

        // Resize once here rather than letting the Next.js optimizer re-encode the
        // original on every cold cache. Falls back to the original if sharp is missing.
        const derivatives = await generateDerivatives(req.file.path, '/uploads/guides');

        const imageUrl = derivatives?.displayUrl ?? `/uploads/guides/${req.file.filename}`;
        const thumbUrl = derivatives?.thumbUrl ?? null;

        const image = await prisma.guideImage.create({
            data: {
                imageUrl,
                thumbUrl,
                title,
                description,
                order: nextOrder
            }
        });

        invalidateResponseCache('/api/guide');
        res.json(image);
    } catch (error: any) {
        console.error('uploadGuideImage error:', error);
        res.status(500).json({ message: 'Error uploading guide image', details: error.message });
    }
};

// Admin: Update title/description of a guide image
export const updateGuideImage = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { title, description } = req.body;

        const image = await prisma.guideImage.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description })
            }
        });

        invalidateResponseCache('/api/guide');
        res.json(image);
    } catch (error: any) {
        console.error('updateGuideImage error:', error);
        res.status(500).json({ message: 'Error updating guide image' });
    }
};

// Admin: Reorder guide images
export const reorderGuideImages = async (req: Request, res: Response) => {
    try {
        const { orderedIds } = req.body;

        if (!Array.isArray(orderedIds)) {
            return res.status(400).json({ message: 'orderedIds must be an array' });
        }

        // Batch update order
        await prisma.$transaction(
            orderedIds.map((id: string, index: number) =>
                prisma.guideImage.update({
                    where: { id },
                    data: { order: index }
                })
            )
        );

        const images = await prisma.guideImage.findMany({ orderBy: { order: 'asc' } });
        invalidateResponseCache('/api/guide');
        res.json(images);
    } catch (error: any) {
        console.error('reorderGuideImages error:', error);
        res.status(500).json({ message: 'Error reordering guide images' });
    }
};

// Admin: Delete a guide image
export const deleteGuideImage = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const image = await prisma.guideImage.findUnique({ where: { id } });
        if (!image) return res.status(404).json({ message: 'Guide image not found' });

        // Delete from database
        await prisma.guideImage.delete({ where: { id } });

        // Remove the display image, its thumbnail, and any retained original from disk
        const urls = [image.imageUrl, (image as any).thumbUrl].filter(Boolean) as string[];
        for (const url of urls) {
            const filePath = path.join(uploadDir, url.replace('/uploads/', ''));
            try {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (err) {
                console.warn('Could not delete guide image file:', filePath);
            }

            // The pre-resize original is kept alongside the derivative for re-derivation;
            // sweep any sibling that shares the base name.
            const dir = path.dirname(filePath);
            const base = path.basename(filePath).replace(/(-sm|-lg)?\.webp$/, '');
            try {
                for (const sibling of fs.readdirSync(dir)) {
                    if (sibling.startsWith(base + '.') || sibling.startsWith(base + '-')) {
                        try { fs.unlinkSync(path.join(dir, sibling)); } catch { }
                    }
                }
            } catch { }
        }

        invalidateResponseCache('/api/guide');
        res.json({ message: 'Guide image deleted' });
    } catch (error: any) {
        console.error('deleteGuideImage error:', error);
        res.status(500).json({ message: 'Error deleting guide image' });
    }
};
