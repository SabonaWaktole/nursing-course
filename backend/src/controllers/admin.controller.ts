import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [totalUsers, totalCourses, totalEnrollments, totalCertificates, recentEnrollments] =
            await Promise.all([
                prisma.user.count(),
                prisma.course.count(),
                prisma.enrollment.count(),
                prisma.certificate.count(),
                prisma.enrollment.findMany({
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { name: true, email: true } },
                        course: { select: { title: true } },
                    },
                }),
            ]);

        res.json({
            stats: { totalUsers, totalCourses, totalEnrollments, totalCertificates },
            recentEnrollments,
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                _count: { select: { enrollments: true, certificates: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

export const getAllCertificates = async (req: Request, res: Response) => {
    try {
        const certificates = await prisma.certificate.findMany({
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true } },
            },
            orderBy: { issuedAt: 'desc' },
        });
        res.json(certificates);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching certificates' });
    }
};
