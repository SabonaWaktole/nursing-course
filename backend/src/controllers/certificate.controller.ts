import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
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
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.uniqueId}.pdf`);
        doc.pipe(res);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // Border
        doc.rect(30, 30, pageWidth - 60, pageHeight - 60).stroke('#4F46E5');
        doc.rect(35, 35, pageWidth - 70, pageHeight - 70).stroke('#4F46E5');

        // Header
        doc.fontSize(14).fillColor('#4F46E5').text('CNA PRO', 0, 70, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(36).fillColor('#1e293b').text('Certificate of Completion', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(14).fillColor('#64748b').text('This is to certify that', { align: 'center' });
        doc.moveDown(0.5);

        // Student name
        doc.fontSize(32).fillColor('#4F46E5').text(certificate.user.name || 'Student', { align: 'center' });
        doc.moveDown(0.5);

        // Course
        doc.fontSize(14).fillColor('#64748b').text('has successfully completed the course', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(24).fillColor('#1e293b').text(certificate.course.title, { align: 'center' });
        doc.moveDown(1);

        // Details
        doc.fontSize(11).fillColor('#94a3b8')
            .text(`Certificate ID: ${certificate.uniqueId}`, { align: 'center' });
        doc.text(`Issued: ${certificate.issuedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });

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
