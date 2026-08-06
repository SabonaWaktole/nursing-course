import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Batch 1: Core counts (lightweight, safe to parallelize within a small batch)
        const [totalUsers, totalCourses, totalEnrollments, totalCertificates] =
            await Promise.all([
                prisma.user.count(),
                prisma.course.count(),
                prisma.enrollment.count(),
                prisma.certificate.count(),
            ]);

        // Batch 2: Trend counts + heavier data (separate batch to limit peak connections)
        //
        // Quiz analytics are computed in the database. This previously loaded every Result
        // row ever recorded into Node memory just to derive an average and a pass rate —
        // an unbounded query that grew linearly forever.
        const [prevUsers, prevCourses, prevEnrollments, prevCertificates, recentEnrollments, resultStats, passedExams] =
            await Promise.all([
                prisma.user.count({ where: { createdAt: { lt: thirtyDaysAgo } } }),
                prisma.course.count({ where: { createdAt: { lt: thirtyDaysAgo } } }),
                prisma.enrollment.count({ where: { createdAt: { lt: thirtyDaysAgo } } }),
                prisma.certificate.count({ where: { issuedAt: { lt: thirtyDaysAgo } } }),
                prisma.enrollment.findMany({
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { name: true, email: true } },
                        course: { select: { title: true } },
                    },
                }),
                prisma.result.aggregate({ _avg: { score: true }, _count: true }),
                prisma.result.count({ where: { passed: true } }),
            ]);

        const calculateTrend = (total: number, prev: number) => {
            if (prev === 0) return total > 0 ? 100 : 0;
            return Math.round(((total - prev) / prev) * 100);
        };

        const totalExams = resultStats._count;
        const avgScore = Math.round(resultStats._avg.score ?? 0);
        const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

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
                    totalExams,
                    passedExams
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
        const adminId = (req as any).user?.userId;
        const certificates = await prisma.certificate.findMany({
            where: {
                course: {
                    OR: [
                        { instructorId: adminId },
                        { instructorId: null },
                    ],
                },
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                course: { select: { id: true, title: true, instructorId: true, instructor: { select: { id: true, name: true } } } },
            },
            orderBy: { issuedAt: 'desc' },
        });
        res.json(certificates);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching certificates' });
    }
};

export const approveCertificate = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status } = req.body; // 'APPROVED' or 'REJECTED'

        const p = prisma as any;
        const adminId = (req as any).user?.userId;

        // Authorization check: admin must be assigned to the course, or course must be unassigned
        const certCheck = await prisma.certificate.findUnique({
            where: { id },
            include: { course: { select: { instructorId: true } } },
        });
        if (!certCheck) return res.status(404).json({ message: 'Certificate not found' });
        if (certCheck.course.instructorId && certCheck.course.instructorId !== adminId) {
            return res.status(403).json({ message: 'You are not authorized to manage certificates for this course.' });
        }

        const result = await p.$transaction(async (tx: any) => {
            const dataToUpdate: any = { status };
            
            if (status === 'APPROVED' && adminId) {
                const approvingAdmin = await tx.user.findUnique({ where: { id: adminId } });
                if (approvingAdmin?.directorName) {
                    dataToUpdate.directorName = approvingAdmin.directorName;
                }
                if (approvingAdmin?.directorTitle) {
                    dataToUpdate.directorTitle = approvingAdmin.directorTitle;
                }
            }

            const cert = await tx.certificate.update({
                where: { id },
                data: dataToUpdate,
                include: { user: true, course: true }
            });

            if (status === 'APPROVED') {
                await tx.enrollment.updateMany({
                    where: {
                        userId: cert.userId,
                        courseId: cert.courseId
                    },
                    data: {
                        progress: 100,
                        completed: true
                    }
                });
            } else if (status === 'REJECTED') {
                await tx.enrollment.updateMany({
                    where: {
                        userId: cert.userId,
                        courseId: cert.courseId
                    },
                    data: {
                        progress: 0,
                        completed: false
                    }
                });
            }

            const courseTitle = cert.course?.title || 'your course';

            // Notify user
            await tx.notification.create({
                data: {
                    userId: cert.userId,
                    title: status === 'APPROVED' ? 'Certificate Approved!' : 'Certificate Rejected',
                    message: status === 'APPROVED'
                        ? `Congratulations! Your certificate for "${courseTitle}" has been approved.`
                        : `We couldn't approve your certificate for "${courseTitle}". Please contact support for details.`,
                    type: status === 'APPROVED' ? 'CERT_APPROVED' : 'CERT_REJECTED'
                }
            });

            return cert;
        });

        res.json(result);
    } catch (error: any) {
        console.error('approveCertificate error:', error);
        res.status(500).json({ message: 'Error updating certificate status' });
    }
};

export const revokeCertificate = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const adminId = (req as any).user?.userId;

        // Ensure Prisma client is typed as any to bypass mismatch issues
        const p = prisma as any;

        // Get the cert details before making changes
        const cert = await p.certificate.findUnique({
            where: { id },
            include: { course: true }
        });

        if (!cert) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        // Authorization check: admin must be assigned to the course, or course must be unassigned
        if (cert.course?.instructorId && cert.course.instructorId !== adminId) {
            return res.status(403).json({ message: 'You are not authorized to manage certificates for this course.' });
        }

        // Wrap inside a transaction for DB safety
        const result = await p.$transaction(async (tx: any) => {
            // 1. Mark certificate as REJECTED
            const updatedCert = await tx.certificate.update({
                where: { id },
                data: { status: 'REJECTED' }
            });

            // 2. Reset the user's progress for this specific course to 0% and completed=false
            await tx.enrollment.updateMany({
                where: {
                    userId: cert.userId,
                    courseId: cert.courseId
                },
                data: {
                    progress: 0,
                    completed: false
                }
            });

            // 3. Create a notification for the student
            const courseTitle = cert.course?.title || 'a recent course';
            await tx.notification.create({
                data: {
                    userId: cert.userId,
                    title: 'Certificate Revoked',
                    message: `Your certificate for "${courseTitle}" has been revoked by an administrator. Your course progress has been reset to 0% so you may retake it.`,
                    type: 'CERT_REVOKED'
                }
            });

            return updatedCert;
        });

        res.json(result);
    } catch (error: any) {
        console.error('revokeCertificate error:', error);
        res.status(500).json({ message: 'Error revoking certificate', error: error.message });
    }
};

export const updateCertificate = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { certificateNumber } = req.body;
        const adminId = (req as any).user?.userId;

        // Authorization check
        const certCheck = await prisma.certificate.findUnique({
            where: { id },
            include: { course: { select: { instructorId: true } } },
        });
        if (!certCheck) return res.status(404).json({ message: 'Certificate not found' });
        if (certCheck.course.instructorId && certCheck.course.instructorId !== adminId) {
            return res.status(403).json({ message: 'You are not authorized to manage certificates for this course.' });
        }

        const cert = await prisma.certificate.update({
            where: { id },
            data: { certificateNumber }
        });

        res.json(cert);
    } catch (error: any) {
        console.error('updateCertificate error:', error);
        res.status(500).json({ message: 'Error updating certificate' });
    }
};

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        // Each user only sees notifications addressed specifically to them.
        // Instructor-scoped notifications are created per-user by the notificationHelper.
        const notifications = await (prisma as any).notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        res.json(notifications);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

export const markNotificationRead = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await (prisma as any).notification.update({
            where: { id },
            data: { read: true }
        });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: 'Error marking notification as read' });
    }
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        await (prisma as any).notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: 'Error marking all notifications as read' });
    }
};

export const clearAllNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        await (prisma as any).notification.deleteMany({
            where: { userId }
        });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: 'Error clearing notifications' });
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

export const createUser = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const { hashPassword } = await import('../utils/hash');
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || email.split('@')[0],
                role: role === 'ADMIN' ? 'ADMIN' : 'STUDENT',
            },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });

        res.status(201).json(user);
    } catch (error: any) {
        console.error('createUser error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};
