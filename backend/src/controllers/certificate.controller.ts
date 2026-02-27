import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import QRCode from 'qrcode';
import prisma from '../utils/prisma';

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

        // Create certificate record
        const certificate = await prisma.certificate.create({
            data: { userId, courseId: courseId },
        });

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

        const navy = '#1e3a5f';
        const dark = '#1e293b';
        const slate700 = '#334155';
        const slate500 = '#64748b';
        const slate400 = '#94a3b8';
        const borderLight = '#e2e8f0';
        const badgeBg = '#eff6ff';
        const blue100 = '#dbeafe';

        // ============ BACKGROUND ============
        doc.rect(0, 0, W, H).fill('#ffffff');

        // ============ DECORATIVE DOUBLE BORDER ============
        // Outer: thick navy double-style border (matches border-[3px] border-double border-blue-900/20)
        doc.lineWidth(3);
        doc.rect(18, 18, W - 36, H - 36).strokeOpacity(0.2).stroke(navy);
        doc.strokeOpacity(1);
        // Inner: thin subtle border (matches border border-blue-900/10)
        doc.lineWidth(0.75);
        doc.rect(28, 28, W - 56, H - 56).strokeOpacity(0.1).stroke(navy);
        doc.strokeOpacity(1);

        // ============ CORNER GRADIENT ACCENTS ============
        // Top-left (matches from-blue-600/10)
        doc.save();
        doc.opacity(0.08);
        doc.moveTo(18, 18).lineTo(150, 18).lineTo(18, 150).closePath().fill(navy);
        doc.restore();
        // Bottom-right
        doc.save();
        doc.opacity(0.08);
        doc.moveTo(W - 18, H - 18).lineTo(W - 150, H - 18).lineTo(W - 18, H - 150).closePath().fill(navy);
        doc.restore();

        // ============ HEADER: CAREACADEMY BRANDING ============
        const topY = 52;
        // Medical icon + "CareAcademy" (matches text-blue-900 text-4xl + text-xl font-bold)
        doc.font('Helvetica-Bold').fontSize(14).fillColor(navy)
            .text('✚  CareAcademy', 0, topY, { align: 'center' });

        // ============ TITLE (serif, matching font-serif font-bold) ============
        doc.font('Times-Bold').fontSize(26).fillColor(dark)
            .text('Certified Nursing Assistant', 0, topY + 30, { align: 'center' });
        // Subtitle (matches text-xl md:text-2xl font-semibold text-slate-700)
        doc.font('Times-Roman').fontSize(17).fillColor(slate700)
            .text('(CNA) Completion Certificate', 0, topY + 60, { align: 'center' });

        // ============ DECORATIVE LINE (matches h-1 w-24 bg-blue-900 rounded-full) ============
        const lineY = topY + 88;
        doc.save();
        doc.roundedRect(W / 2 - 48, lineY, 96, 4, 2).fill(navy);
        doc.restore();

        // ============ "THIS IS TO CERTIFY THAT" ============
        // Matches text-slate-500 text-lg uppercase tracking-widest font-medium
        doc.font('Helvetica').fontSize(11).fillColor(slate500)
            .text('THIS IS TO CERTIFY THAT', 0, lineY + 22, {
                align: 'center', characterSpacing: 4,
            });

        // ============ STUDENT NAME (Great Vibes cursive) ============
        // Matches style={{ fontFamily: "'Great Vibes', cursive" }} text-5xl md:text-7xl
        doc.font('GreatVibes').fontSize(48).fillColor(dark)
            .text(certificate.user.name || 'Student', 0, lineY + 46, { align: 'center' });

        // ============ UNDERLINE BELOW NAME ============
        // Matches w-1/3 h-px bg-slate-200
        const nameUnderY = lineY + 102;
        doc.moveTo(W / 2 - 120, nameUnderY).lineTo(W / 2 + 120, nameUnderY)
            .lineWidth(0.5).stroke(borderLight);

        // ============ "HAS SUCCESSFULLY COMPLETED..." ============
        // Matches text-slate-500 text-base uppercase tracking-widest font-medium
        doc.font('Helvetica').fontSize(10).fillColor(slate500)
            .text('HAS SUCCESSFULLY COMPLETED THE STATE-APPROVED TRAINING PROGRAM FOR', 0, nameUnderY + 14, {
                align: 'center', characterSpacing: 2,
            });

        // ============ COURSE TITLE ============
        // Matches text-2xl md:text-3xl font-bold text-blue-900
        doc.font('Helvetica-Bold').fontSize(22).fillColor(navy)
            .text(certificate.course.title, 80, nameUnderY + 38, {
                align: 'center', width: W - 160,
            });

        // ============ AUTHENTICATED BADGE ============
        // Matches bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg
        const badgeY = nameUnderY + 76;
        const badgeW = 220;
        const badgeH = 26;
        const badgeX = W / 2 - badgeW / 2;
        doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 6).fill(badgeBg);
        doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 6).lineWidth(0.5).stroke(blue100);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(navy)
            .text('✓  Authenticated Record', badgeX, badgeY + 8, {
                width: badgeW, align: 'center',
            });

        // ============ BOTTOM SECTION: DATE | SEAL | SIGNATURE ============
        const bottomY = H - 120;

        // --- Date (left) ---
        // Matches text-lg font-semibold text-slate-800
        const dateStr = certificate.issuedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        doc.font('Helvetica-Bold').fontSize(13).fillColor(dark)
            .text(dateStr, 60, bottomY, { width: 200, align: 'center' });
        // Underline (matches border-b border-slate-300)
        doc.moveTo(60, bottomY + 20).lineTo(260, bottomY + 20).lineWidth(0.5).stroke('#cbd5e1');
        // Label (matches text-xs uppercase tracking-wider text-slate-500 font-medium)
        doc.font('Helvetica').fontSize(7).fillColor(slate500)
            .text('DATE ISSUED', 60, bottomY + 26, {
                width: 200, align: 'center', characterSpacing: 2,
            });

        // --- Seal (center) ---
        // Generate QR code for verification
        const verifyUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/certificate/verify/${certificate.uniqueId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 90, color: { dark: navy, light: '#ffffff' } });

        const cx = W / 2;
        const cy = bottomY; // Place QR code above text

        // Add QR code image
        doc.image(qrCodeDataUrl, cx - 45, cy - 20, { width: 90 });
        
        // "Registry Verified" text below QR code
        doc.font('Helvetica-Bold').fontSize(8).fillColor(navy)
            .text('SCAN TO VERIFY', cx - 50, cy + 75, { width: 100, align: 'center', characterSpacing: 1 });

        // --- Signature (right) ---
        // Matches Great Vibes cursive: style={{ fontFamily: "'Great Vibes'" }} text-4xl text-slate-800 -rotate-2
        doc.font('GreatVibes').fontSize(22).fillColor(dark)
            .text('Sarah Jenkins, RN', W - 280, bottomY - 5, { width: 220, align: 'center' });
        // Underline (matches border-b border-slate-300)
        doc.moveTo(W - 280, bottomY + 20).lineTo(W - 60, bottomY + 20).lineWidth(0.5).stroke('#cbd5e1');
        // Label (matches text-xs uppercase tracking-wider text-slate-500 font-medium)
        doc.font('Helvetica').fontSize(7).fillColor(slate500)
            .text('DIRECTOR OF NURSING', W - 280, bottomY + 26, {
                width: 220, align: 'center', characterSpacing: 2,
            });

        // ============ FOOTER: CREDENTIAL ID ============
        // Matches font-mono text-[10px] text-slate-400
        doc.font('Courier').fontSize(8).fillColor(slate400)
            .text(`Credential ID: ${certificate.uniqueId}  •  Verify at careacademy.com/verify`,
                0, H - 42, { align: 'center', width: W });

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
                course: { select: { title: true } },
            },
        });
        const certificate = cert as any;

        if (!certificate) {
            return res.status(404).json({ valid: false, message: 'Certificate not found' });
        }

        res.json({
            valid: true,
            certificate: {
                uniqueId: certificate.uniqueId,
                studentName: certificate.user.name,
                courseName: certificate.course.title,
                issuedAt: certificate.issuedAt,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error verifying certificate' });
    }
};
