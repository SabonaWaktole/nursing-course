import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import QRCode from 'qrcode';
import prisma from '../utils/prisma';
import { createInstructorNotification } from '../utils/notificationHelper';

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

        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.uniqueId}.pdf`);
        doc.pipe(res);

        // Register fonts
        const greatVibesPath = path.join(__dirname, '..', 'fonts', 'GreatVibes-Regular.ttf');
        doc.registerFont('GreatVibes', greatVibesPath);

        // Try to register Playfair Display italic; fall back to Times-Italic
        const playfairItalicPath = path.join(__dirname, '..', 'fonts', 'PlayfairDisplay-Italic.ttf');
        let titleFont = 'Times-Italic';
        let courseTitleFont = 'Times-Italic';
        try {
            doc.registerFont('PlayfairItalic', playfairItalicPath);
            titleFont = 'PlayfairItalic';
            courseTitleFont = 'PlayfairItalic';
        } catch (e) {
            // Playfair not available, use Times-Italic
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
        doc.font('GreatVibes').fontSize(44).fillColor(dark)
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
            doc.font('GreatVibes').fontSize(24).fillColor(slate700)
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

        const certificates = await prisma.certificate.findMany({
            where: { userId },
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

        if (!certificate || certificate.status !== 'APPROVED') {
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
