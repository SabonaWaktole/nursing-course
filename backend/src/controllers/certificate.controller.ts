import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import QRCode from 'qrcode';
import prisma from '../utils/prisma';
import { createInstructorNotification } from '../utils/notificationHelper';

/* ═══════════════════════════════════════════
   PDF FONTS — loaded once, not per request
   ═══════════════════════════════════════════
   registerFont(name, path) re-reads and re-parses the TTF from disk on every call.
   Certificate rendering is the most expensive thing this API does, so the font bytes
   are read once at startup and handed to pdfkit as Buffers instead.
*/
const FONT_DIR = path.join(__dirname, '..', 'fonts');

function loadFont(file: string): Buffer | null {
    try {
        return fs.readFileSync(path.join(FONT_DIR, file));
    } catch {
        console.warn(`⚠️ Certificate font missing: ${file} — falling back to a built-in font.`);
        return null;
    }
}

const GREAT_VIBES = loadFont('GreatVibes-Regular.ttf');
const PLAYFAIR_ITALIC = loadFont('PlayfairDisplay-Italic.ttf');

/* ═══════════════════════════════════════════
   RENDERED PDF CACHE
   ═══════════════════════════════════════════
   A certificate is a snapshot: the org details, director, course title and hours are
   copied onto the row when it is issued. So the same certificate renders byte-identical
   every time, and re-rendering it on every download is pure waste.

   The cache key includes every field the PDF draws, so an admin editing the certificate
   number or changing its status produces a new key and a fresh render automatically.
*/
const pdfCacheDir = path.join(
    process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
    'certificates'
);

try {
    if (!fs.existsSync(pdfCacheDir)) fs.mkdirSync(pdfCacheDir, { recursive: true });
} catch (err: any) {
    console.warn(`⚠️ Could not create certificate cache dir: ${err.message}`);
}

function certificateCacheKey(certificate: any): string {
    const material = JSON.stringify([
        certificate.uniqueId,
        certificate.certificateNumber,
        certificate.status,
        certificate.hoursAttended,
        certificate.courseTitle,
        certificate.organizationName,
        certificate.organizationAddress,
        certificate.organizationPhone,
        certificate.directorName,
        certificate.directorTitle,
        certificate.providerId,
        certificate.issuedAt,
        certificate.user?.name,
        certificate.course?.title,
    ]);
    return crypto.createHash('sha1').update(material).digest('hex').slice(0, 16);
}

// Generate certificate when student passes
export const generateCertificate = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const courseId = req.params.courseId as string;

        // Check if user passed ALL final exams (quizzes with moduleId: null)
        const finalExams = await prisma.quiz.findMany({
            where: { courseId: courseId, moduleId: null },
            select: { id: true }
        });

        if (finalExams.length === 0) {
            return res.status(400).json({ message: 'No final exams found for this course.' });
        }

        const passedFinalExams = await prisma.result.findMany({
            where: {
                userId,
                passed: true,
                quiz: { courseId: courseId, moduleId: null }
            },
            select: { quizId: true },
            distinct: ['quizId']
        });

        const allPassed = finalExams.every(exam =>
            passedFinalExams.some(pe => pe.quizId === exam.id)
        );

        if (!allPassed) {
            return res.status(400).json({ message: 'You must pass ALL final exams in this course to get a certificate' });
        }

        // Check if certificate already exists
        const existing = await prisma.certificate.findFirst({
            where: { userId, courseId: courseId },
        });
        if (existing) {
            return res.json(existing);
        }

        // Fetch course details and admin settings for a snapshot
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        let settings = await prisma.adminSettings.findUnique({ where: { id: 'singleton' } });
        if (!settings) {
            settings = await prisma.adminSettings.create({ data: { id: 'singleton' } });
        }

        // Create certificate record
        const certificate = await prisma.certificate.create({
            data: { 
                userId, 
                courseId: courseId,
                hoursAttended: course?.hours || 0,
                courseTitle: course?.title,
                organizationName: settings.organizationName,
                organizationAddress: settings.organizationAddress,
                organizationPhone: settings.organizationPhone,
                directorName: settings.directorName,
                directorTitle: settings.directorTitle,
                providerId: settings.providerId
            },
        });

        // Send completion notification to the assigned instructor (or all admins if unassigned)
        try {
            const student = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
            await createInstructorNotification(courseId, {
                title: 'Course Completed',
                message: `${student?.name || 'A student'} has completed "${course?.title}" and requested a certificate.`,
                type: 'COURSE_COMPLETED',
            });
        } catch (notifErr) {
            console.warn('Failed to create completion notification:', notifErr);
        }

        res.status(201).json(certificate);
    } catch (error: any) {
        console.error('generateCertificate error:', error);
        res.status(500).json({ message: 'Error generating certificate' });
    }
};

// Download certificate as PDF
export const downloadCertificate = async (req: Request, res: Response) => {
    try {
        const certificateId = req.params.certificateId as string;

        const cert = await prisma.certificate.findUnique({
            where: { id: certificateId },
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true } },
            },
        });
        const certificate = cert as any;

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        const filename = `certificate-${certificate.uniqueId}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        // Serve a previously rendered copy when nothing about the certificate has changed.
        const cacheKey = certificateCacheKey(certificate);
        const cachePath = path.join(pdfCacheDir, `${certificate.uniqueId}-${cacheKey}.pdf`);

        if (fs.existsSync(cachePath)) {
            res.setHeader('X-PDF-Cache', 'HIT');
            res.setHeader('Cache-Control', 'private, max-age=86400');
            fs.createReadStream(cachePath).pipe(res);
            return;
        }

        res.setHeader('X-PDF-Cache', 'MISS');
        res.setHeader('Cache-Control', 'private, max-age=86400');

        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
        });

        // Collect the output instead of piping straight to the response, so the finished
        // bytes can be both sent and written to the cache.
        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => {
            const pdf = Buffer.concat(chunks);
            res.end(pdf);
            // Persist for next time. Written via a temp file + rename so a crash midway
            // can never leave a truncated PDF that would be served as a cache hit.
            const tmp = `${cachePath}.${process.pid}.tmp`;
            fs.promises
                .writeFile(tmp, pdf)
                .then(() => fs.promises.rename(tmp, cachePath))
                .catch((err) => {
                    console.warn('Could not cache certificate PDF:', err.message);
                    fs.promises.unlink(tmp).catch(() => { });
                });
        });

        // Fonts come from preloaded buffers (see top of file), with graceful fallback to
        // built-ins if the postbuild font copy did not run.
        let titleFont = 'Times-Italic';
        let courseTitleFont = 'Times-Italic';
        let scriptFont = 'Times-Italic';

        if (GREAT_VIBES) {
            doc.registerFont('GreatVibes', GREAT_VIBES);
            scriptFont = 'GreatVibes';
        }
        if (PLAYFAIR_ITALIC) {
            doc.registerFont('PlayfairItalic', PLAYFAIR_ITALIC);
            titleFont = 'PlayfairItalic';
            courseTitleFont = 'PlayfairItalic';
        }

        const W = doc.page.width;   // 842
        const H = doc.page.height;  // 595

        // Colors matching the redesigned frontend certificate
        const dark = '#1e293b';        // slate-800
        const slate700 = '#334155';
        const slate400 = '#94a3b8';
        const slate300 = '#cbd5e1';
        const courseBlue = '#5a8fa8';  // muted blue for course title
        const qrBlue = '#4a8da8';     // QR code color
        const borderColor = '#e2e8f0';

        // Triangle accent colors (matching SVG in frontend)
        const tri1 = '#c8dce8';
        const tri2 = '#b4cede';
        const tri3 = '#a0bfd4';
        const tri4 = '#8db3c9';

        // Fallback info for old certificates without snapshot data
        const title = certificate.courseTitle || certificate.course.title;
        let orgName = certificate.organizationName;
        let orgAddress = certificate.organizationAddress;
        let orgPhone = certificate.organizationPhone;
        let dirName = certificate.directorName;
        let dirTitle = certificate.directorTitle;
        let provId = certificate.providerId;

        if (!orgName || !dirName) {
            // Try to fetch live settings for fallback on missing fields
            const liveSettings = await prisma.adminSettings.findUnique({ where: { id: 'singleton' } });
            if (liveSettings) {
                if (!orgName) orgName = liveSettings.organizationName;
                if (!orgAddress) orgAddress = liveSettings.organizationAddress;
                if (!orgPhone) orgPhone = liveSettings.organizationPhone;
                if (!dirName) dirName = liveSettings.directorName;
                if (!dirTitle) dirTitle = liveSettings.directorTitle;
                if (!provId) provId = liveSettings.providerId;
            }
        }

        // ============ BACKGROUND ============
        doc.rect(0, 0, W, H).fill('#ffffff');

        // ============ SUBTLE OUTER BORDER ============
        doc.lineWidth(0.5);
        doc.rect(0, 0, W, H).strokeOpacity(0.3).stroke(borderColor);
        doc.strokeOpacity(1);

        // ============ GEOMETRIC TRIANGLES — TOP LEFT ============
        // Large faint triangle
        doc.save();
        doc.opacity(0.25);
        doc.moveTo(0, 0).lineTo(240, 0).lineTo(0, 220).closePath().fill(tri1);
        doc.restore();
        // Medium triangle
        doc.save();
        doc.opacity(0.20);
        doc.moveTo(0, 0).lineTo(180, 0).lineTo(0, 160).closePath().fill(tri2);
        doc.restore();
        // Small darker triangle
        doc.save();
        doc.opacity(0.22);
        doc.moveTo(0, 0).lineTo(110, 0).lineTo(0, 100).closePath().fill(tri3);
        doc.restore();
        // Tiny accent triangle
        doc.save();
        doc.opacity(0.18);
        doc.moveTo(0, 0).lineTo(55, 0).lineTo(0, 50).closePath().fill(tri4);
        doc.restore();

        // ============ SUBTLE BOTTOM-RIGHT TRIANGLES ============
        doc.save();
        doc.opacity(0.12);
        doc.moveTo(W, H).lineTo(W, H - 80).lineTo(W - 80, H).closePath().fill(tri1);
        doc.restore();
        doc.save();
        doc.opacity(0.10);
        doc.moveTo(W, H).lineTo(W, H - 50).lineTo(W - 60, H).closePath().fill(tri2);
        doc.restore();

        // ============ ORG INFO — TOP LEFT ============
        const topY = 40;
        const leftX = 50;

        if (orgName) {
            doc.font('Helvetica-Bold').fontSize(13).fillColor(dark)
                .text(orgName, leftX, topY);
        }
        if (orgAddress) {
            doc.font('Helvetica').fontSize(9).fillColor(slate400)
                .text(orgAddress, leftX, topY + 18);
        }
        if (provId) {
            doc.font('Helvetica').fontSize(9).fillColor(slate400)
                .text(`Provider ID: ${provId}`, leftX, topY + 30);
        }

        // ============ CERTIFICATE TITLE ============
        const titleY = 105;
        doc.font(titleFont).fontSize(32).fillColor(dark)
            .text('Certificate of Completion', 0, titleY, { align: 'center' });

        // ============ "THIS IS TO CERTIFY THAT" ============
        const certifyY = titleY + 55;
        doc.font('Helvetica').fontSize(9).fillColor(slate400)
            .text('THIS IS TO CERTIFY THAT', 0, certifyY, {
                align: 'center', characterSpacing: 3,
            });

        // ============ STUDENT NAME ============
        const nameY = certifyY + 25;
        doc.font(scriptFont).fontSize(44).fillColor(dark)
            .text(certificate.user.name || 'Student', 0, nameY, { align: 'center' });

        // ============ "HAS SUCCESSFULLY COMPLETED..." ============
        const completedY = nameY + 65;
        doc.font('Helvetica').fontSize(9).fillColor(slate400)
            .text('HAS SUCCESSFULLY COMPLETED THE TRAINING PROGRAM', 0, completedY, {
                align: 'center', characterSpacing: 2,
            });

        // ============ COURSE TITLE ============
        const courseY = completedY + 22;
        doc.font(courseTitleFont).fontSize(20).fillColor(courseBlue)
            .text(title, 100, courseY, {
                align: 'center', width: W - 200,
            });

        // ============ BOTTOM SECTION: DATE | QR CODE | SIGNATURE ============
        const bottomY = H - 150;

        // --- Date (left) ---
        const dateStr = certificate.issuedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const dateLeftX = 60;
        const dateWidth = 200;
        doc.font(titleFont).fontSize(13).fillColor(slate700)
            .text(dateStr, dateLeftX, bottomY, { width: dateWidth, align: 'center' });
        doc.moveTo(dateLeftX, bottomY + 20).lineTo(dateLeftX + dateWidth, bottomY + 20)
            .lineWidth(0.5).stroke(slate300);
        doc.font('Helvetica').fontSize(7).fillColor(slate400)
            .text('DATE ISSUED', dateLeftX, bottomY + 27, {
                width: dateWidth, align: 'center', characterSpacing: 2,
            });

        // --- QR Code (center) ---
        const baseUrl = process.env.NODE_ENV === 'production'
            ? process.env.FRONTEND_URL || 'https://cnaceus.excelcommunityliving.website'
            : 'http://localhost:3000';

        const verifyUrl = `${baseUrl}/certificate/verify/${certificate.uniqueId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 80, color: { dark: qrBlue, light: '#ffffff' } });

        const cx = W / 2;
        doc.image(qrCodeDataUrl, cx - 40, bottomY - 20, { width: 80 });
        doc.font('Helvetica-Bold').fontSize(7).fillColor(qrBlue)
            .text('SCAN TO VERIFY', cx - 50, bottomY + 65, { width: 100, align: 'center', characterSpacing: 1 });

        // --- Signature (right) ---
        const sigRightX = W - 280;
        const sigWidth = 220;
        if (dirName) {
            doc.font(scriptFont).fontSize(24).fillColor(slate700)
                .text(dirName, sigRightX, bottomY - 5, { width: sigWidth, align: 'center' });
        }
        doc.moveTo(sigRightX, bottomY + 20).lineTo(sigRightX + sigWidth, bottomY + 20)
            .lineWidth(0.5).stroke(slate300);
        if (dirTitle) {
            doc.font('Helvetica').fontSize(7).fillColor(slate400)
                .text(dirTitle.toUpperCase(), sigRightX, bottomY + 27, {
                    width: sigWidth, align: 'center', characterSpacing: 1.5,
                });
        }

        // ============ FOOTER: RETENTION & CREDENTIAL ID ============
        const footerText = "This record shall be retained by CNA or HHA employer for (4) years starting from the date of enrollment.";
        doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(slate400)
            .text(footerText, 0, H - 50, { align: 'center', width: W });

        doc.font('Courier').fontSize(7).fillColor(slate300)
            .text(`Credential ID: ${certificate.uniqueId}  •  ${orgName || ''}`,
                0, H - 36, { align: 'center', width: W });

        doc.end();
    } catch (error: any) {
        console.error('downloadCertificate error:', error);
        res.status(500).json({ message: 'Error downloading certificate' });
    }
};

// Get user's certificates
export const getMyCertificates = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const siteNumberHeader = req.headers['x-site-number'];
        const siteFilter = siteNumberHeader ? parseInt(siteNumberHeader as string) : undefined;

        const certificates = await prisma.certificate.findMany({
            where: {
                userId,
                ...(siteFilter ? { course: { siteNumber: siteFilter } } : {}),
            },
            include: {
                course: { select: { id: true, title: true } },
            },
            orderBy: { issuedAt: 'desc' },
        });
        res.json(certificates);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching certificates' });
    }
};

// Verify certificate (public)
export const verifyCertificate = async (req: Request, res: Response) => {
    try {
        const uniqueId = req.params.uniqueId as string;

        const cert = await prisma.certificate.findUnique({
            where: { uniqueId },
            include: {
                user: { select: { name: true } },
                course: { select: { title: true, hours: true } },
            },
        });
        const certificate = cert as any;

        if (!certificate) {
            return res.status(404).json({ valid: false, message: 'Certificate not found' });
        }

        if (certificate.status === 'PENDING') {
            return res.json({ valid: false, status: 'PENDING', message: 'Certificate is awaiting admin approval' });
        }

        if (certificate.status !== 'APPROVED') {
            return res.status(404).json({ valid: false, message: 'Certificate not found or invalid' });
        }

        let orgName = certificate.organizationName;
        let orgAddress = certificate.organizationAddress;
        let orgPhone = certificate.organizationPhone;
        let dirName = certificate.directorName;
        let dirTitle = certificate.directorTitle;
        let provId = certificate.providerId;

        if (!orgName || !dirName) {
            const liveSettings = await prisma.adminSettings.findUnique({ where: { id: 'singleton' } });
            if (liveSettings) {
                if (!orgName) orgName = liveSettings.organizationName;
                if (!orgAddress) orgAddress = liveSettings.organizationAddress;
                if (!orgPhone) orgPhone = liveSettings.organizationPhone;
                if (!dirName) dirName = liveSettings.directorName;
                if (!dirTitle) dirTitle = liveSettings.directorTitle;
                if (!provId) provId = liveSettings.providerId;
            }
        }

        res.json({
            valid: true,
            certificate: {
                uniqueId: certificate.uniqueId,
                studentName: certificate.user.name,
                courseName: certificate.courseTitle || certificate.course?.title,
                issuedAt: certificate.issuedAt,
                certificateNumber: certificate.certificateNumber,
                hoursAttended: certificate.hoursAttended || certificate.course?.hours,
                organizationName: orgName,
                organizationAddress: orgAddress,
                organizationPhone: orgPhone,
                directorName: dirName,
                directorTitle: dirTitle,
                providerId: provId
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error verifying certificate' });
    }
};
