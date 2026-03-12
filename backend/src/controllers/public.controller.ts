import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getLandingStats = async (req: Request, res: Response) => {
    try {
        const [totalStudents, totalEnrollments, totalCertificates] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.enrollment.count(),
            prisma.certificate.count() // Could filter by APPROVED if required
        ]);

        // Calculate a proxy completion rate:
        // Assume completion = certificates issued / total enrollments
        // Cap it around 94-98% for marketing realism if there's minimal data,
        // or just calculate the real ratio. With no data, default to 0.
        let completionRate = 0;
        if (totalEnrollments > 0) {
            completionRate = Math.round((totalCertificates / totalEnrollments) * 100);
        }

        res.json({
            students: totalStudents,
            completionRate: completionRate,
            clinics: totalCertificates, // Using certificates as a proxy for clinic/partner success
            rating: "4.9/5" // Hardcoded generic rating 
        });
    } catch (error: any) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({ message: 'Error fetching stats', details: error.message });
    }
};
