import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const [
            totalUsers, prevUsers,
            totalCourses, prevCourses,
            totalEnrollments, prevEnrollments,
            totalCertificates, prevCertificates,
            recentEnrollments,
            allResults
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { createdAt: { lt: thirtyDaysAgo } } }),

            prisma.course.count(),
            prisma.course.count({ where: { createdAt: { lt: thirtyDaysAgo } } }),

            prisma.enrollment.count(),
            prisma.enrollment.count({ where: { createdAt: { lt: thirtyDaysAgo } } }),

            prisma.certificate.count(),
            prisma.certificate.count({ where: { issuedAt: { lt: thirtyDaysAgo } } }),

            prisma.enrollment.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true, email: true } },
                    course: { select: { title: true } },
                },
            }),
            prisma.result.findMany({
                select: { score: true, passed: true }
            })
        ]);

        const calculateTrend = (total: number, prev: number) => {
            if (prev === 0) return total > 0 ? 100 : 0;
            return Math.round(((total - prev) / prev) * 100);
        };

        const totalScore = allResults.reduce((acc, r) => acc + r.score, 0);
        const avgScore = allResults.length > 0 ? Math.round(totalScore / allResults.length) : 0;
        const passRate = allResults.length > 0 ? Math.round((allResults.filter(r => r.passed).length / allResults.length) * 100) : 0;

        res.json({
            stats: {
                totalUsers,
                totalCourses,
                totalEnrollments,
                totalCertificates,
                trends: {
                    users: calculateTrend(totalUsers, prevUsers),
                    courses: calculateTrend(totalCourses, prevCourses),
                    enrollments: calculateTrend(totalEnrollments, prevEnrollments),
                    certificates: calculateTrend(totalCertificates, prevCertificates),
                },
                analytics: {
                    avgScore,
                    passRate,
                    totalExams: allResults.length,
                    passedExams: allResults.filter(r => r.passed).length
                }
            },
            recentEnrollments,
        });
    } catch (error: any) {
        console.error('Dashboard stats error:', error);
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

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        // Prevent admin from deleting themselves
        if ((req as any).user?.userId === id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        // Manually delete related records to avoid foreign key constraints
        // since onDelete: Cascade isn't set for User relations
        await prisma.$transaction([
            prisma.result.deleteMany({ where: { userId: id } }),
            prisma.enrollment.deleteMany({ where: { userId: id } }),
            prisma.certificate.deleteMany({ where: { userId: id } }),
            // Delete the user
            prisma.user.delete({ where: { id } }),
        ]);

        res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('deleteUser error:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};
