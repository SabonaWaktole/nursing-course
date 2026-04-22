import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../utils/prisma';

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
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
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

        const imageUrl = `/uploads/guides/${req.file.filename}`;

        const image = await prisma.guideImage.create({
            data: {
                imageUrl,
                title,
                description,
                order: nextOrder
            }
        });

        res.json(image);
    } catch (error: any) {
        console.error('uploadGuideImage error:', error);
        res.status(500).json({ message: 'Error uploading guide image', details: error.message });
    }
};

// Admin: Update title/description of a guide image
export const updateGuideImage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const image = await prisma.guideImage.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description })
            }
        });

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
        res.json(images);
    } catch (error: any) {
        console.error('reorderGuideImages error:', error);
        res.status(500).json({ message: 'Error reordering guide images' });
    }
};

// Admin: Delete a guide image
export const deleteGuideImage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const image = await prisma.guideImage.findUnique({ where: { id } });
        if (!image) return res.status(404).json({ message: 'Guide image not found' });

        // Delete from database
        await prisma.guideImage.delete({ where: { id } });

        // Try to delete the file from disk
        if (image.imageUrl) {
            const filePath = path.join(uploadDir, image.imageUrl.replace('/uploads/', ''));
            try {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (err) {
                console.warn('Could not delete guide image file:', filePath);
            }
        }

        res.json({ message: 'Guide image deleted' });
    } catch (error: any) {
        console.error('deleteGuideImage error:', error);
        res.status(500).json({ message: 'Error deleting guide image' });
    }
};
