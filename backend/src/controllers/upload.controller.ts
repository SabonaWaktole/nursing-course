import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
import prisma from '../utils/prisma';
import { generateDerivatives } from '../utils/image';

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
            const allowed = ['.pdf', '.doc', '.docx', '.zip', '.ppt', '.pptx', '.txt'];
            if (allowed.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file format') as any);
            }
        }
    },
});

// Thumbnails get their own multer instance so images are not covered by the
// multi-gigabyte video limit above. They are resized on upload regardless.
export const thumbnailUpload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid image format') as any);
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

        // Store the resized WebP as the course thumbnail. The field still holds a plain
        // URL string, so every existing consumer keeps working — the file is just smaller.
        const derivatives = await generateDerivatives(req.file.path, '/uploads/thumbnails');
        const fileUrl = derivatives?.displayUrl ?? `/uploads/thumbnails/${req.file.filename}`;

        res.json({ url: fileUrl, filename: req.file.originalname });
    } catch (error: any) {
        console.error('File upload error:', error);
        res.status(500).json({ message: 'Error uploading thumbnail', error: error.message });
    }
};

// Helper: humanize a filename into a lesson title
// "10_understanding-medication-side-effects.txt" → "Understanding Medication Side Effects"
function humanizeFilename(filename: string): string {
    // Remove extension
    let name = path.basename(filename, path.extname(filename));
    // Remove leading number prefix (e.g. "10_" or "3_")
    name = name.replace(/^\d+[_-]/, '');
    // Replace hyphens and underscores with spaces
    name = name.replace(/[-_]/g, ' ');
    // Title case
    name = name.replace(/\b\w/g, (c) => c.toUpperCase());
    return name.trim();
}

// Extract numeric prefix for ordering (e.g. "10_something.txt" → 10)
function extractOrder(filename: string): number {
    const basename = path.basename(filename);
    const match = basename.match(/^(\d+)[_-]/);
    return match ? parseInt(match[1], 10) : 9999;
}

// Check if a filename should be treated as a link file (contains 'link')
function isLinkFile(filename: string): boolean {
    const basename = path.basename(filename, path.extname(filename)).toLowerCase();
    return basename.includes('link');
}

// Check if a filename should be treated as a youtube link file
// Must: contain 'video' in the name AND NOT be an actual video file (.mp4, .webm, etc.)
function isYoutubeLinkFile(filename: string): boolean {
    const basename = path.basename(filename, path.extname(filename)).toLowerCase();
    const isActualVideo = /\.(mp4|webm|mov|mkv|avi)$/i.test(filename);
    return basename.includes('video') && !isActualVideo;
}

// Check if a filename is an actual video file
function isActualVideoFile(filename: string): boolean {
    return /\.(mp4|webm|mov|mkv|avi)$/i.test(filename);
}

// Extract text from a PDF by decompressing FlateDecode streams
function extractTextFromPdf(buffer: Buffer): string {
    const parts: string[] = [];
    // Find all stream...endstream blocks in the PDF
    const raw = buffer.toString('latin1');
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;
    while ((match = streamRegex.exec(raw)) !== null) {
        try {
            // Convert the latin1 string back to a buffer for decompression
            const streamBytes = Buffer.from(match[1], 'latin1');
            const decompressed = zlib.inflateSync(streamBytes);
            parts.push(decompressed.toString('utf8'));
        } catch {
            // Not all streams are FlateDecode — skip ones that fail
        }
    }
    return parts.join('\n');
}

// YouTube URL regex — requires https:// prefix
const YOUTUBE_REGEX = /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi;

// Extract all YouTube URLs from any file (text, PDF, etc.)
function extractUrlsFromFile(filePath: string): string[] {
    try {
        const buffer = fs.readFileSync(filePath);
        let textContent = '';

        // Check if file is a PDF (starts with %PDF)
        const isPdf = buffer.length > 4 && buffer.toString('ascii', 0, 5) === '%PDF-';

        if (isPdf) {
            console.log(`[BULK UPLOAD]   Detected PDF — decompressing streams...`);
            textContent = extractTextFromPdf(buffer);
            console.log(`[BULK UPLOAD]   Decompressed PDF text (first 500 chars): "${textContent.substring(0, 500)}"`);
        } else {
            // Plain text file — read as utf8
            textContent = buffer.toString('utf8');
        }

        // Search for YouTube URLs
        const matches = [...textContent.matchAll(YOUTUBE_REGEX)];
        const urls = matches.map(m => `https://www.youtube.com/watch?v=${m[1]}`);
        // Deduplicate
        return [...new Set(urls)];
    } catch (e) {
        console.error(`[BULK UPLOAD]   ERROR extracting URLs: ${e}`);
        return [];
    }
}

export const uploadCourseFolderFiles = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const courseTitle = req.body.courseTitle;
        const siteNumber = req.body.siteNumber ? parseInt(req.body.siteNumber) : 1;

        if (!courseTitle) {
            return res.status(400).json({ message: 'courseTitle is required' });
        }

        const validFiles: Express.Multer.File[] = [];

        files.forEach(f => {
            if (isLinkFile(f.originalname)) {
                // Ignore it and remove from disk
                try { fs.unlinkSync(f.path); } catch {}
            } else {
                validFiles.push(f);
            }
        });

        validFiles.sort((a, b) => extractOrder(a.originalname) - extractOrder(b.originalname));

        if (validFiles.length === 0) {
            return res.status(400).json({ message: 'No valid lesson files found' });
        }

        // Create the course
        const course = await prisma.course.create({
            data: {
                title: courseTitle,
                description: `Course imported from folder: ${courseTitle}`,
                price: 0,
                credit: 0,
                hours: 0,
                siteNumber,
            },
        });

        // Create a single module
        const mod = await prisma.module.create({
            data: {
                title: courseTitle,
                courseId: course.id,
                order: 1,
            },
        });

        // Create lessons
        const lessons = [];
        let orderCounter = 1;
        
        for (const file of validFiles) {
            console.log(`[BULK UPLOAD] Processing file: "${file.originalname}" (saved as: "${file.filename}", path: "${file.path}")`);
            console.log(`[BULK UPLOAD]   isYoutubeLinkFile: ${isYoutubeLinkFile(file.originalname)}, isActualVideoFile: ${isActualVideoFile(file.originalname)}`);
            
            if (isYoutubeLinkFile(file.originalname)) {
                // Read file content and log it for debugging
                let fileContent = '';
                try {
                    fileContent = fs.readFileSync(file.path, 'utf8');
                    console.log(`[BULK UPLOAD]   File content (first 500 chars): "${fileContent.substring(0, 500)}"`);
                } catch (readErr) {
                    console.error(`[BULK UPLOAD]   ERROR reading file: ${readErr}`);
                }
                
                const urls = extractUrlsFromFile(file.path);
                console.log(`[BULK UPLOAD]   Extracted ${urls.length} YouTube URLs: ${JSON.stringify(urls)}`);
                
                const baseTitle = humanizeFilename(file.originalname) === 'Video' ? 'Video Lesson' : humanizeFilename(file.originalname);
                
                if (urls.length === 0) {
                    // No YouTube URLs found — create a lesson with the raw file content as description
                    console.log(`[BULK UPLOAD]   WARNING: No YouTube URLs found in video file. Creating lesson with raw content.`);
                    // Try to find ANY URL in the content as a fallback
                    const anyUrlRegex = /(https?:\/\/[^\s<>"']+)/gi;
                    const anyUrls = [...fileContent.matchAll(anyUrlRegex)].map(m => m[1]);
                    console.log(`[BULK UPLOAD]   Fallback URLs found: ${JSON.stringify(anyUrls)}`);
                    
                    if (anyUrls.length > 0) {
                        // Use the first URL found as youtubeUrl anyway (best effort)
                        for (const url of anyUrls) {
                            const lesson = await prisma.lesson.create({
                                data: {
                                    title: baseTitle,
                                    youtubeUrl: url,
                                    moduleId: mod.id,
                                    order: orderCounter++,
                                },
                            });
                            lessons.push(lesson);
                        }
                    } else {
                        // Truly nothing found — create a placeholder lesson
                        const lesson = await prisma.lesson.create({
                            data: {
                                title: baseTitle,
                                description: `Video file detected but no URL could be extracted. Raw content: ${fileContent.substring(0, 200)}`,
                                moduleId: mod.id,
                                order: orderCounter++,
                            },
                        });
                        lessons.push(lesson);
                    }
                } else {
                    let index = 1;
                    for (const url of urls) {
                        const title = urls.length > 1 ? `${baseTitle} Part ${index++}` : baseTitle;
                        const lesson = await prisma.lesson.create({
                            data: {
                                title,
                                youtubeUrl: url,
                                moduleId: mod.id,
                                order: orderCounter++,
                            },
                        });
                        lessons.push(lesson);
                    }
                }
                // Delete the text file from disk since we only need the URLs
                try { fs.unlinkSync(file.path); } catch {}
            } else if (isActualVideoFile(file.originalname)) {
                const title = humanizeFilename(file.originalname);
                const videoUrl = `/uploads/materials/${file.filename}`;
                
                const lesson = await prisma.lesson.create({
                    data: {
                        title,
                        videoUrl,
                        moduleId: mod.id,
                        order: orderCounter++,
                    },
                });
                lessons.push(lesson);
            } else {
                const title = humanizeFilename(file.originalname);
                const materialUrl = `/uploads/materials/${file.filename}`;
                
                const lesson = await prisma.lesson.create({
                    data: {
                        title,
                        materialUrl,
                        moduleId: mod.id,
                        order: orderCounter++,
                    },
                });
                lessons.push(lesson);
            }
        }

        res.status(201).json({
            message: `Course created with ${lessons.length} lessons`,
            course: {
                ...course,
                modules: [{ ...mod, lessons }],
            }
        });
    } catch (error: any) {
        console.error('uploadCourseFolderFiles error:', error);
        res.status(500).json({ message: 'Error creating course from folder', error: error.message });
    }
};
