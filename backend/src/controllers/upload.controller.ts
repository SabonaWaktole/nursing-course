import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Use UPLOAD_DIR env variable for persistent storage outside deployment directory
// In production (Hostinger): set UPLOAD_DIR=/home/user/uploads
// In development: defaults to ./uploads (relative to project root)
export const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// Ensure upload directories exist
const folders = ['videos', 'materials', 'thumbnails', 'guides'];
folders.forEach(folder => {
    const dir = path.join(uploadDir, folder);
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        console.log(`✅ Upload directory ready: ${dir}`);
    } catch (err: any) {
        console.error(`⚠️ Could not create upload directory ${dir}: ${err.message}`);
        console.error('Please create this directory manually on the server.');
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'materials';
        if (file.fieldname === 'video') folder = 'videos';
        if (file.fieldname === 'thumbnail') folder = 'thumbnails';
        cb(null, path.join(uploadDir, folder));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 50000 * 1024 * 1024 }, // 50GB limit
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (file.fieldname === 'video') {
            const allowed = ['.mp4', '.webm', '.mov', '.avi'];
            if (allowed.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid video format') as any);
            }
        } else if (file.fieldname === 'thumbnail') {
            const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
            if (allowed.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid image format') as any);
            }
        } else {
            const allowed = ['.pdf', '.doc', '.docx', '.zip', '.ppt', '.pptx'];
            if (allowed.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file format') as any);
            }
        }
    },
});

export const uploadVideo = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        // Return relative path from root
        const fileUrl = `/uploads/videos/${req.file.filename}`;
        res.json({ url: fileUrl, filename: req.file.originalname });
    } catch (error: any) {
        console.error('File upload error:', error);
        res.status(500).json({ message: 'Error uploading video', error: error.message });
    }
};

export const uploadMaterial = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const fileUrl = `/uploads/materials/${req.file.filename}`;
        res.json({ url: fileUrl, filename: req.file.originalname });
    } catch (error: any) {
        console.error('File upload error:', error);
        res.status(500).json({ message: 'Error uploading material', error: error.message });
    }
};

export const uploadThumbnail = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const fileUrl = `/uploads/thumbnails/${req.file.filename}`;
        res.json({ url: fileUrl, filename: req.file.originalname });
    } catch (error: any) {
        console.error('File upload error:', error);
        res.status(500).json({ message: 'Error uploading thumbnail', error: error.message });
    }
};
