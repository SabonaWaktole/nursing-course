import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { createInstructorNotification } from '../utils/notificationHelper';
// IDE Refresh Poke 2


export const getAllCourses = async (req: Request, res: Response) => {
    try {
        const courses = await prisma.course.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                thumbnail: true,
                price: true,
                hours: true,
                category: true,
                createdAt: true,
                instructorId: true,
                instructor: { select: { id: true, name: true } },
                _count: { select: { modules: true, quizzes: true, enrollments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(courses);
    } catch (error: any) {
        console.error('getAllCourses error:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
};

export const getCourseById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
                    include: {
                        lessons: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
                        quizzes: {
                            orderBy: { createdAt: 'asc' },
                            include: { _count: { select: { questions: true } } }
                        },
                    },
                },
                quizzes: {
                    where: { moduleId: null },
                    orderBy: { createdAt: 'asc' },
                    include: { _count: { select: { questions: true } } }
                },
                instructor: { select: { id: true, name: true } },
                _count: { select: { enrollments: true } },
            },
        });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error: any) {
        console.error('getCourseById error:', error);
        res.status(500).json({ message: 'Error fetching course' });
    }
};

export const createCourse = async (req: Request, res: Response) => {
    try {
        const { title, description, price, hours, thumbnail, category, tags, instructorId: bodyInstructorId } = req.body;
        // Use body instructorId if provided, otherwise null (unassigned)
        const instructorId = (bodyInstructorId && bodyInstructorId !== 'unassigned') ? bodyInstructorId : null;

        const course = await prisma.course.create({
            data: {
                title,
                description,
                price: parseFloat(price) || 0,
                hours: parseInt(hours) || 0,
                thumbnail,
                category: category || null,
                tags: Array.isArray(tags) && tags.length > 0 ? tags : null,
                instructorId,
            },
        });
        res.status(201).json(course);
    } catch (error: any) {
        require('fs').appendFileSync('app-error.log', '\nCREATE ERROR: ' + (error?.stack || error?.message || error) + '\n');
        console.error('======== CREATE COURSE FATAL ERROR ========');
        console.error(error);
        console.error('===========================================');
        res.status(500).json({ message: 'Error creating course', details: error?.message || String(error) });
    }
};

export const updateCourse = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { title, description, price, hours, thumbnail, category, tags, instructorId: bodyInstructorId } = req.body;

        const parsedPrice = price !== undefined && price !== null && price !== '' ? parseFloat(price.toString()) : undefined;
        const parsedHours = hours !== undefined && hours !== null && hours !== '' ? parseInt(hours.toString()) : undefined;

        // Resolve instructorId: 'unassigned' or empty string => null
        let instructorId: string | null | undefined = undefined;
        if (bodyInstructorId !== undefined) {
            instructorId = (bodyInstructorId && bodyInstructorId !== 'unassigned') ? bodyInstructorId : null;
        }

        const course = await prisma.course.update({
            where: { id },
            data: { 
                title, 
                description, 
                price: parsedPrice, 
                hours: parsedHours,
                thumbnail, 
                ...(category !== undefined ? { category: category || null } : {}),
                ...(instructorId !== undefined ? { instructorId } : {}),
                ...(tags !== undefined ? { tags: Array.isArray(tags) && tags.length > 0 ? tags : null } : {}),
            },
        });
        res.json(course);
    } catch (error: any) {
        require('fs').appendFileSync('app-error.log', '\nUPDATE ERROR: ' + (error?.stack || error?.message || error) + '\n');
        console.error('======== UPDATE COURSE FATAL ERROR ========');
        console.error(error);
        console.error('===========================================');
        res.status(500).json({ message: 'Error updating course', details: error?.message || String(error) });
    }
};

export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        // Find all quizzes in this course to delete related Results
        const quizzes = await prisma.quiz.findMany({
            where: { courseId: id },
            select: { id: true }
        });
        const quizIds = quizzes.map(q => q.id);

        // Delete related records manually inside a transaction because Enrollment
        // and Result models do not have onDelete: Cascade in schema.prisma
        await prisma.$transaction([
            prisma.result.deleteMany({
                where: { quizId: { in: quizIds } }
            }),
            prisma.enrollment.deleteMany({
                where: { courseId: id }
            }),
            prisma.course.delete({
                where: { id }
            })
        ]);

        res.json({ message: 'Course deleted' });
    } catch (error: any) {
        console.error('deleteCourse error:', error);
        res.status(500).json({ message: 'Error deleting course' });
    }
};

// Modules
export const addModule = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.courseId as string;
        const { title } = req.body;

        // Auto-order: count existing modules
        const count = await prisma.module.count({ where: { courseId } });

        const mod = await prisma.module.create({
            data: { title, courseId, order: count + 1 },
        });
        res.status(201).json(mod);
    } catch (error: any) {
        console.error('addModule error:', error);
        res.status(500).json({ message: 'Error adding module' });
    }
};

export const deleteModule = async (req: Request, res: Response) => {
    try {
        const moduleId = req.params.moduleId as string;
        await prisma.module.delete({ where: { id: moduleId } });
        res.json({ message: 'Module deleted' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting module' });
    }
};

// Lessons (under modules)
export const addLesson = async (req: Request, res: Response) => {
    try {
        const moduleId = req.params.moduleId as string;
        const { title, description, videoUrl, materialUrl } = req.body;

        // Auto-order
        const count = await prisma.lesson.count({ where: { moduleId } });

        const lesson = await prisma.lesson.create({
            data: { title, description, videoUrl, materialUrl, moduleId, order: count + 1 },
        });
        res.status(201).json(lesson);
    } catch (error: any) {
        console.error('addLesson error:', error);
        res.status(500).json({ message: 'Error adding lesson' });
    }
};

export const updateLesson = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.lessonId as string;
        const { title, description, videoUrl, materialUrl, videoFirst } = req.body;

        const lesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: { 
                title, 
                description, 
                videoUrl, 
                materialUrl,
                ...(videoFirst !== undefined && { videoFirst })
            },
        });
        res.json(lesson);
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating lesson' });
    }
};

export const deleteLesson = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.lessonId as string;
        await prisma.lesson.delete({ where: { id: lessonId } });
        res.json({ message: 'Lesson deleted' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting lesson' });
    }
};

// Enrollment
export const enrollInCourse = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const courseId = req.params.courseId as string;

        const existing = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
        if (existing) return res.status(400).json({ message: 'Already enrolled' });

        const enrollment = await prisma.enrollment.create({
            data: { userId, courseId: courseId },
        });

        // Send enrollment notification to the assigned instructor (or all admins if unassigned)
        try {
            const course = await prisma.course.findUnique({ where: { id: courseId }, select: { title: true } });
            const student = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
            if (course) {
                await createInstructorNotification(courseId, {
                    title: 'New Enrollment',
                    message: `${student?.name || 'A student'} has enrolled in "${course.title}".`,
                    type: 'ENROLLMENT',
                });
            }
        } catch (notifErr) {
            console.warn('Failed to create enrollment notification:', notifErr);
        }

        res.status(201).json(enrollment);
    } catch (error: any) {
        console.error('enrollInCourse error:', error);
        res.status(500).json({ message: 'Error enrolling in course' });
    }
};

export const getMyEnrollments = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        instructor: { select: { name: true } },
                        modules: {
                            select: {
                                _count: { select: { lessons: true } }
                            }
                        },
                        _count: { select: { quizzes: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate total lessons from modules
        const results = enrollments.map(en => {
            const totalLessons = en.course.modules.reduce((acc, mod) => acc + mod._count.lessons, 0);
            return {
                ...en,
                course: {
                    ...en.course,
                    _count: {
                        ...en.course._count,
                        lessons: totalLessons
                    }
                }
            };
        });

        res.json(results);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching enrollments' });
    }
};

export const updateProgress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const courseId = req.params.courseId as string;
        const { progress } = req.body;

        const enrollment = await prisma.enrollment.update({
            where: { userId_courseId: { userId, courseId } },
            data: {
                progress: Math.min(100, Math.max(0, parseInt(progress))),
                completed: parseInt(progress) >= 100,
            },
        });

        // Log activity
        try {
            await (prisma as any).activityLog.create({
                data: { userId, type: 'PROGRESS_UPDATE', courseId },
            });
        } catch {}

        res.json(enrollment);
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating progress' });
    }
};

// Weekly activity + learning streak
export const getMyActivity = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        // Get the start of the current week (Monday)
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - diffToMonday);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        // Fetch this week's activity logs
        const logs = await (prisma as any).activityLog.findMany({
            where: {
                userId,
                createdAt: { gte: weekStart, lt: weekEnd },
            },
            select: { createdAt: true },
        });

        // Count events per day-of-week (Mon=0 .. Sun=6)
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];
        logs.forEach((log) => {
            const d = log.createdAt.getDay(); // 0=Sun
            const idx = d === 0 ? 6 : d - 1; // Map to Mon=0 .. Sun=6
            dayCounts[idx]++;
        });

        // Normalize to percentages (0-100) relative to max day
        const maxCount = Math.max(...dayCounts, 1);
        const weeklyActivity = dayCounts.map((c) =>
            Math.round((c / maxCount) * 100)
        );

        // Calculate streak: consecutive days with >= 1 activity going backwards from today
        let streak = 0;
        const checkDate = new Date(now);
        checkDate.setHours(0, 0, 0, 0);

        // Check if there's any activity today first
        const todayEnd = new Date(checkDate);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const todayCount = await (prisma as any).activityLog.count({
            where: {
                userId,
                createdAt: { gte: checkDate, lt: todayEnd },
            },
        });

        if (todayCount > 0) {
            streak = 1;
            // Now check previous days
            let prevDate = new Date(checkDate);
            prevDate.setDate(prevDate.getDate() - 1);

            for (let i = 0; i < 365; i++) {
                const dayEnd = new Date(prevDate);
                dayEnd.setDate(dayEnd.getDate() + 1);

                const count = await (prisma as any).activityLog.count({
                    where: {
                        userId,
                        createdAt: { gte: prevDate, lt: dayEnd },
                    },
                });

                if (count > 0) {
                    streak++;
                    prevDate.setDate(prevDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        res.json({ weeklyActivity, streak });
    } catch (error: any) {
        console.error('getMyActivity error:', error);
        res.status(500).json({ message: 'Error fetching activity' });
    }
};

// Reorder modules within a course
export const reorderModules = async (req: Request, res: Response) => {
    try {
        const { orderedIds } = req.body; // string[]
        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return res.status(400).json({ message: 'orderedIds array is required' });
        }

        await prisma.$transaction(
            orderedIds.map((id: string, index: number) =>
                prisma.module.update({ where: { id }, data: { order: index + 1 } })
            )
        );

        res.json({ message: 'Modules reordered' });
    } catch (error: any) {
        console.error('reorderModules error:', error);
        res.status(500).json({ message: 'Error reordering modules' });
    }
};

// Reorder lessons within a module
export const reorderLessons = async (req: Request, res: Response) => {
    try {
        const { orderedIds } = req.body; // string[]
        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return res.status(400).json({ message: 'orderedIds array is required' });
        }

        await prisma.$transaction(
            orderedIds.map((id: string, index: number) =>
                prisma.lesson.update({ where: { id }, data: { order: index + 1 } })
            )
        );

        res.json({ message: 'Lessons reordered' });
    } catch (error: any) {
        console.error('reorderLessons error:', error);
        res.status(500).json({ message: 'Error reordering lessons' });
    }
};

// Move a specific PDF (materialUrl) from one lesson to another atomically
// Supports comma-separated multi-PDF in materialUrl
export const movePdf = async (req: Request, res: Response) => {
    try {
        const { sourceLessonId, targetLessonId, pdfUrl } = req.body;

        if (!sourceLessonId || !targetLessonId || !pdfUrl) {
            return res.status(400).json({ message: 'sourceLessonId, targetLessonId, and pdfUrl are required' });
        }

        if (sourceLessonId === targetLessonId) {
            return res.status(400).json({ message: 'Source and target lessons must be different' });
        }

        // Fetch both lessons
        const [sourceLesson, targetLesson] = await Promise.all([
            prisma.lesson.findUnique({ where: { id: sourceLessonId }, select: { materialUrl: true } }),
            prisma.lesson.findUnique({ where: { id: targetLessonId }, select: { id: true, materialUrl: true } }),
        ]);

        if (!sourceLesson || !sourceLesson.materialUrl) {
            return res.status(404).json({ message: 'Source lesson has no PDF to move' });
        }
        if (!targetLesson) {
            return res.status(404).json({ message: 'Target lesson not found' });
        }

        // Remove the specific pdfUrl from source's comma-separated list
        const sourcePdfs = sourceLesson.materialUrl.split(',').filter(Boolean);
        const newSourcePdfs = sourcePdfs.filter(u => u.trim() !== pdfUrl.trim());
        const newSourceUrl = newSourcePdfs.length > 0 ? newSourcePdfs.join(',') : null;

        // Append to target's comma-separated list
        const targetPdfs = targetLesson.materialUrl ? targetLesson.materialUrl.split(',').filter(Boolean) : [];
        targetPdfs.push(pdfUrl.trim());
        const newTargetUrl = targetPdfs.join(',');

        // Atomically update both lessons
        await prisma.$transaction([
            prisma.lesson.update({
                where: { id: sourceLessonId },
                data: { materialUrl: newSourceUrl },
            }),
            prisma.lesson.update({
                where: { id: targetLessonId },
                data: { materialUrl: newTargetUrl },
            }),
        ]);

        res.json({ message: 'PDF moved successfully', materialUrl: pdfUrl });
    } catch (error: any) {
        console.error('movePdf error:', error);
        res.status(500).json({ message: 'Error moving PDF' });
    }
};

// Remove a specific material (video or pdf) from a lesson
export const removeMaterial = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.lessonId as string;
        const { type, url } = req.body; // type: 'video' | 'pdf'

        if (!type || !['video', 'pdf'].includes(type)) {
            return res.status(400).json({ message: 'type must be "video" or "pdf"' });
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { videoUrl: true, materialUrl: true },
        });

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        if (type === 'video') {
            await prisma.lesson.update({
                where: { id: lessonId },
                data: { videoUrl: null },
            });
        } else {
            // Remove specific PDF from comma-separated list
            if (!url) {
                return res.status(400).json({ message: 'url is required for pdf removal' });
            }
            const pdfs = (lesson.materialUrl || '').split(',').filter(Boolean);
            const newPdfs = pdfs.filter(u => u.trim() !== url.trim());
            const newMaterialUrl = newPdfs.length > 0 ? newPdfs.join(',') : null;

            await prisma.lesson.update({
                where: { id: lessonId },
                data: { materialUrl: newMaterialUrl },
            });
        }

        res.json({ message: `${type === 'video' ? 'Video' : 'PDF'} removed successfully` });
    } catch (error: any) {
        console.error('removeMaterial error:', error);
        res.status(500).json({ message: 'Error removing material' });
    }
};

// Reorder PDFs within a lesson
export const reorderPdfs = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.lessonId as string;
        const { orderedUrls } = req.body; // string[]

        if (!Array.isArray(orderedUrls) || orderedUrls.length === 0) {
            return res.status(400).json({ message: 'orderedUrls array is required' });
        }

        const newMaterialUrl = orderedUrls.map((u: string) => u.trim()).filter(Boolean).join(',');

        await prisma.lesson.update({
            where: { id: lessonId },
            data: { materialUrl: newMaterialUrl || null },
        });

        res.json({ message: 'PDFs reordered successfully' });
    } catch (error: any) {
        console.error('reorderPdfs error:', error);
        res.status(500).json({ message: 'Error reordering PDFs' });
    }
};
