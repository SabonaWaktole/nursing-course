import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { supabase } from '../utils/supabase';

// Use memory storage to access file buffer for Supabase upload
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'video') {
            const allowed = ['.mp4', '.webm', '.mov', '.avi'];
            const ext = path.extname(file.originalname).toLowerCase();
            if (allowed.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid video format'));
            }
        } else if (file.fieldname === 'thumbnail') {
            const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
            const ext = path.extname(file.originalname).toLowerCase();
            if (allowed.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid image format'));
            }
        } else {
            const allowed = ['.pdf', '.doc', '.docx', '.zip', '.ppt', '.pptx'];
            const ext = path.extname(file.originalname).toLowerCase();
            if (allowed.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file format'));
            }
        }
    },
});

const uploadToSupabase = async (file: Express.Multer.File, folder: 'videos' | 'materials' | 'thumbnails'): Promise<string> => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}${path.extname(file.originalname)}`;
    const filePath = `${folder}/${filename}`;

    const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) {
        throw error;
    }

    const { data: publicUrlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
};

export const uploadVideo = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const publicUrl = await uploadToSupabase(req.file, 'videos');

        res.json({ url: publicUrl, filename: req.file.originalname });
    } catch (error: any) {
        console.error('Supabase upload error:', error);
        res.status(500).json({ message: 'Error uploading video to storage', error: error.message });
    }
};

export const uploadMaterial = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const publicUrl = await uploadToSupabase(req.file, 'materials');

        res.json({ url: publicUrl, filename: req.file.originalname });
    } catch (error: any) {
        console.error('Supabase upload error:', error);
        res.status(500).json({ message: 'Error uploading material to storage', error: error.message });
    }
};

export const uploadThumbnail = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const publicUrl = await uploadToSupabase(req.file, 'thumbnails');

        res.json({ url: publicUrl, filename: req.file.originalname });
    } catch (error: any) {
        console.error('Supabase upload error:', error);
        res.status(500).json({ message: 'Error uploading thumbnail to storage', error: error.message });
    }
};
