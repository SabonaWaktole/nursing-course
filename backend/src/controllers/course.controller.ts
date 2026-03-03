import { Request, Response } from 'express';
import prisma from '../utils/prisma';
// IDE Refresh Poke


export const getAllCourses = async (req: Request, res: Response) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
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

export const getPlatformStats = async (req: Request, res: Response) => {
    try {
        const [totalStudents, allEnrollments, totalReviews] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.enrollment.findMany({ select: { completed: true } }),
            prisma.course.count() // Fallback since there are no actual reviews
        ]);

        const completedEnrollments = allEnrollments.filter(e => e.completed).length;
        const completionRate = allEnrollments.length > 0
            ? Math.round((completedEnrollments / allEnrollments.length) * 100)
            : 0;

        res.json({
            activeStudents: totalStudents,
            completionRate: completionRate,
            partnerClinics: 200, // Hardcoded for now
            averageRating: 4.9 // Hardcoded for now
        });
    } catch (error: any) {
        console.error('getPlatformStats error:', error);
        res.status(500).json({ message: 'Error fetching platform stats' });
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
        const { title, description, price, thumbnail, category, tags } = req.body;
        const instructorId = (req as any).user.userId;

        const course = await prisma.course.create({
            data: {
                title,
                description,
                price: parseFloat(price) || 0,
                thumbnail,
                category,
                tags: Array.isArray(tags) ? tags : [],
                instructorId,
            },
        });
        res.status(201).json(course);
    } catch (error: any) {
        console.error('createCourse error:', error);
        res.status(500).json({ message: 'Error creating course' });
    }
};

export const updateCourse = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { title, description, price, thumbnail, category, tags } = req.body;

        const course = await prisma.course.update({
            where: { id },
            data: { title, description, price: price ? parseFloat(price) : undefined, thumbnail, category, tags: Array.isArray(tags) ? tags : undefined },
        });
        res.json(course);
    } catch (error: any) {
        console.error('updateCourse error:', error);
        res.status(500).json({ message: 'Error updating course' });
    }
};

export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.course.delete({ where: { id } });
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
        const { title, description, videoUrl, materialUrl } = req.body;

        const lesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: { title, description, videoUrl, materialUrl },
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
        res.json(enrollment);
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating progress' });
    }
};
