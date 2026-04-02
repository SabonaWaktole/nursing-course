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

        // Register Great Vibes font for cursive text
        const fontPath = path.join(__dirname, '..', 'fonts', 'GreatVibes-Regular.ttf');
        doc.registerFont('GreatVibes', fontPath);

        const W = doc.page.width;   // 842
        const H = doc.page.height;  // 595

        // Theme colors matching the website
        const primary = '#0db9f2';     // --color-primary (teal/cyan)
        const primaryDark = '#0a96c5'; // darker shade for accents
        const dark = '#1e293b';        // slate-800
        const slate700 = '#334155';
        const slate500 = '#64748b';
        const slate400 = '#94a3b8';
        const borderLight = '#e2e8f0';
        const badgeBg = '#f0f9ff';     // primary/5 equivalent
        const badgeBorder = '#bae6fd';  // primary/20 equivalent

        // Fallback info for old certificates without snapshot data
        const title = certificate.courseTitle || certificate.course.title;
        let orgName = certificate.organizationName;
        let orgAddress = certificate.organizationAddress;
        let orgPhone = certificate.organizationPhone;
        let dirName = certificate.directorName;
        let dirTitle = certificate.directorTitle;
        let provId = certificate.providerId;

        if (!orgName) {
            // Try to fetch live settings for fallback
            const liveSettings = await prisma.adminSettings.findUnique({ where: { id: 'singleton' } });
            if (liveSettings) {
                orgName = liveSettings.organizationName;
                orgAddress = liveSettings.organizationAddress;
                orgPhone = liveSettings.organizationPhone;
                dirName = liveSettings.directorName;
                dirTitle = liveSettings.directorTitle;
                provId = liveSettings.providerId;
            } else {
                orgName = 'Excelcommunity Living Inc';
                dirName = 'Administrator';
                dirTitle = 'Program Director';
            }
        }

        // ============ BACKGROUND ============
        doc.rect(0, 0, W, H).fill('#ffffff');

        // ============ DECORATIVE DOUBLE BORDER ============
        doc.lineWidth(3);
        doc.rect(18, 18, W - 36, H - 36).strokeOpacity(0.2).stroke(primary);
        doc.strokeOpacity(1);
        doc.lineWidth(0.75);
        doc.rect(28, 28, W - 56, H - 56).strokeOpacity(0.1).stroke(primary);
        doc.strokeOpacity(1);

        // ============ CORNER GRADIENT ACCENTS ============
        doc.save();
        doc.opacity(0.08);
        doc.moveTo(18, 18).lineTo(150, 18).lineTo(18, 150).closePath().fill(primary);
        doc.restore();
        doc.save();
        doc.opacity(0.08);
        doc.moveTo(W - 18, H - 18).lineTo(W - 150, H - 18).lineTo(W - 18, H - 150).closePath().fill(primary);
        doc.restore();

        // ============ HEADER: BRANDING & ORG INFO ============
        const topY = 40;
        doc.font('Helvetica-Bold').fontSize(14).fillColor(primary)
            .text(`✚  ${orgName}`, 0, topY, { align: 'center' });
        
        let orgDetails = '';
        if (orgAddress) orgDetails += orgAddress;
        if (orgPhone) orgDetails += orgDetails ? ` | ${orgPhone}` : orgPhone;
        if (provId) orgDetails += orgDetails ? ` | ID: ${provId}` : `ID: ${provId}`;
        
        if (orgDetails) {
            doc.font('Helvetica').fontSize(9).fillColor(slate500)
                .text(orgDetails, 0, topY + 18, { align: 'center' });
        }

        // ============ TITLE ============
        doc.font('Times-Bold').fontSize(26).fillColor(dark)
            .text('Certificate of Completion', 0, topY + 40, { align: 'center' });
        
        if (certificate.certificateNumber) {
            doc.font('Times-Roman').fontSize(14).fillColor(primaryDark)
                .text(`Certificate No: ${certificate.certificateNumber}`, 0, topY + 70, { align: 'center' });
        }

        // ============ DECORATIVE LINE ============
        const lineY = topY + 95;
        doc.save();
        doc.roundedRect(W / 2 - 48, lineY, 96, 4, 2).fill(primary);
        doc.restore();

        // ============ "THIS IS TO CERTIFY THAT" ============
        doc.font('Helvetica').fontSize(11).fillColor(slate500)
            .text('THIS IS TO CERTIFY THAT', 0, lineY + 22, {
                align: 'center', characterSpacing: 4,
            });

        // ============ STUDENT NAME ============
        doc.font('GreatVibes').fontSize(40).fillColor(dark)
            .text(certificate.user.name || 'Student', 0, lineY + 42, { align: 'center' });

        // ============ UNDERLINE BELOW NAME ============
        const nameUnderY = lineY + 95;
        doc.moveTo(W / 2 - 120, nameUnderY).lineTo(W / 2 + 120, nameUnderY)
            .lineWidth(0.5).stroke(borderLight);

        // ============ "HAS SUCCESSFULLY COMPLETED..." ============
        doc.font('Helvetica').fontSize(10).fillColor(slate500)
            .text('HAS SUCCESSFULLY COMPLETED THE TRAINING PROGRAM FOR', 0, nameUnderY + 12, {
                align: 'center', characterSpacing: 2,
            });

        // ============ COURSE TITLE ============
        doc.font('Helvetica-Bold').fontSize(20).fillColor(primary)
            .text(title, 80, nameUnderY + 30, {
                align: 'center', width: W - 160,
            });
            
        // ============ HOURS ============
        if (certificate.hoursAttended) {
            doc.font('Helvetica').fontSize(10).fillColor(slate700)
                .text(`Total Hours: ${certificate.hoursAttended}`, 0, nameUnderY + 58, { align: 'center' });
        }

        // ============ AUTHENTICATED BADGE ============
        const badgeY = nameUnderY + 75;
        const badgeW = 200;
        const badgeH = 24;
        const badgeX = W / 2 - badgeW / 2;
        doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 6).fill(badgeBg);
        doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 6).lineWidth(0.5).stroke(badgeBorder);
        doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryDark)
            .text('✓  Authenticated Record', badgeX, badgeY + 7, {
                width: badgeW, align: 'center',
            });

        // ============ BOTTOM SECTION: DATE | SEAL | SIGNATURE ============
        const bottomY = H - 125;

        // --- Date (left) ---
        const dateStr = certificate.issuedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        doc.font('Helvetica-Bold').fontSize(13).fillColor(dark)
            .text(dateStr, 60, bottomY, { width: 200, align: 'center' });
        doc.moveTo(60, bottomY + 20).lineTo(260, bottomY + 20).lineWidth(0.5).stroke('#cbd5e1');
        doc.font('Helvetica').fontSize(7).fillColor(slate500)
            .text('DATE ISSUED', 60, bottomY + 26, {
                width: 200, align: 'center', characterSpacing: 2,
            });

        // --- Seal (center) ---
        const baseUrl = process.env.NODE_ENV === 'production'
            ? process.env.FRONTEND_URL || 'https://cnaceus.excelcommunityliving.website'
            : 'http://localhost:3000';

        const verifyUrl = `${baseUrl}/certificate/verify/${certificate.uniqueId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 80, color: { dark: primaryDark, light: '#ffffff' } });

        const cx = W / 2;
        const cy = bottomY;
        doc.image(qrCodeDataUrl, cx - 40, cy - 20, { width: 80 });
        doc.font('Helvetica-Bold').fontSize(7).fillColor(primaryDark)
            .text('SCAN TO VERIFY', cx - 50, cy + 65, { width: 100, align: 'center', characterSpacing: 1 });

        // --- Signature (right) ---
        doc.font('GreatVibes').fontSize(22).fillColor(dark)
            .text(dirName || 'Administrator', W - 280, bottomY - 5, { width: 220, align: 'center' });
        doc.moveTo(W - 280, bottomY + 20).lineTo(W - 60, bottomY + 20).lineWidth(0.5).stroke('#cbd5e1');
        doc.font('Helvetica').fontSize(7).fillColor(slate500)
            .text((dirTitle || 'PROGRAM DIRECTOR').toUpperCase(), W - 280, bottomY + 26, {
                width: 220, align: 'center', characterSpacing: 2,
            });

        // ============ FOOTER: RETENTION & CREDENTIAL ID ============
        const footerText = "This record shall be retained by CNA or HHA for period of four (4) years starting from the date of enrollment.";
        doc.font('Helvetica-Oblique').fontSize(8).fillColor(primaryDark)
            .text(footerText, 0, H - 55, { align: 'center', width: W });

        doc.font('Courier').fontSize(8).fillColor(slate400)
            .text(`Credential ID: ${certificate.uniqueId}  •  ${orgName}`,
                0, H - 40, { align: 'center', width: W });

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

        if (!certificate) {
            return res.status(404).json({ valid: false, message: 'Certificate not found' });
        }

        let orgName = certificate.organizationName;
        let orgAddress = certificate.organizationAddress;
        let orgPhone = certificate.organizationPhone;
        let dirName = certificate.directorName;
        let dirTitle = certificate.directorTitle;
        let provId = certificate.providerId;

        if (!orgName) {
            const liveSettings = await prisma.adminSettings.findUnique({ where: { id: 'singleton' } });
            if (liveSettings) {
                orgName = liveSettings.organizationName;
                orgAddress = liveSettings.organizationAddress;
                orgPhone = liveSettings.organizationPhone;
                dirName = liveSettings.directorName;
                dirTitle = liveSettings.directorTitle;
                provId = liveSettings.providerId;
            } else {
                orgName = 'Excelcommunity Living Inc';
                dirName = 'Administrator';
                dirTitle = 'Program Director';
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
