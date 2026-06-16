import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { createInstructorNotification } from '../utils/notificationHelper';

// Create quiz for a course
export const createQuiz = async (req: Request, res: Response) => {
    try {
        const { courseId, title, passingScore, questions, moduleId } = req.body;

        // Validation for missing correct answers (from TXT upload)
        if (questions && questions.some((q: any) => q.correctAnswer === -1 || q.correctAnswer === undefined || q.correctAnswer === null)) {
            return res.status(400).json({ message: 'All questions must have a valid correct answer selected.' });
        }

        const quiz = await prisma.quiz.create({
            data: {
                courseId,
                moduleId: moduleId || null,
                title,
                passingScore: passingScore || 50,
                questions: {
                    create: questions.map((q: any) => ({
                        text: q.text,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                    })),
                },
            },
            include: { questions: true },
        });
        res.status(201).json(quiz);
    } catch (error: any) {
        console.error('createQuiz error:', error);
        res.status(500).json({ message: 'Error creating quiz' });
    }
};

// Get quiz with questions (hide correct answers for students)
export const getQuiz = async (req: Request, res: Response) => {
    try {
        const quizId = req.params.quizId as string;
        const userRole = (req as any).user?.role;
        const userId = (req as any).user?.userId;

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: true,
                course: { select: { title: true, price: true } },
            },
        });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        // Check paid access for students
        if (userRole === 'STUDENT' && (quiz as any).course.price && (quiz as any).course.price > 0) {
            const payment = await (prisma as any).payment.findFirst({
                where: { userId, courseId: quiz.courseId, status: 'COMPLETED' }
            });
            if (!payment) {
                return res.status(403).json({ message: 'Paid access required to view this assessment.' });
            }
        }

        // Hide correct answers for students
        if (userRole !== 'ADMIN') {
            const sanitized = {
                ...quiz,
                questions: (quiz as any).questions.map((q: any) => ({
                    id: q.id,
                    text: q.text,
                    options: q.options,
                    quizId: q.quizId,
                })),
            };
            return res.json(sanitized);
        }

        res.json(quiz);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching quiz' });
    }
};

// Submit quiz answers
export const submitQuiz = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const quizId = req.params.quizId as string;
        const { answers } = req.body; // { questionId: selectedIndex }

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true },
        });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let correctCount = 0;
        const totalQuestions = (quiz as any).questions.length;

        (quiz as any).questions.forEach((question: any) => {
            if (answers[question.id] === question.correctAnswer) {
                correctCount++;
            }
        });

        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        const passed = score >= quiz.passingScore;

        const result = await prisma.result.create({
            data: {
                userId,
                quizId: quizId,
                score,
                passed,
            },
        });

        // Log activity for weekly stats & streak
        try {
            await (prisma as any).activityLog.create({
                data: { userId, type: 'QUIZ_SUBMIT', courseId: quiz.courseId },
            });
        } catch {}

        // Check if course is fully completed (passed all exams)
        let courseCompleted = false;
        let nextExamId: string | undefined = undefined;

        if (passed) {
            const allExams = await prisma.quiz.findMany({
                where: { courseId: quiz.courseId },
                select: { id: true, moduleId: true },
                orderBy: { createdAt: 'asc' }
            });

            if (allExams.length > 0) {
                const passedExams = await prisma.result.findMany({
                    where: { userId, passed: true, quiz: { courseId: quiz.courseId } },
                    select: { quizId: true },
                    distinct: ['quizId']
                });

                const passedExamIds = new Set(passedExams.map(pe => pe.quizId));
                courseCompleted = allExams.every(exam => passedExamIds.has(exam.id));
                
                // Only suggest next FINAL exam if we are currently taking a FINAL exam
                // For module quizzes, we want to route back to the course to find the next module
                if (!courseCompleted && !quiz.moduleId) {
                    // Find the next unpassed final exam in the sequence
                    const nextExam = allExams.find(exam => !exam.moduleId && !passedExamIds.has(exam.id));
                    if (nextExam) {
                        nextExamId = nextExam.id;
                    }
                }
            }
        }

        // Auto-generate certificate if course is fully completed
        let certificateId: string | undefined = undefined;
        let certificateUniqueId: string | undefined = undefined;
        let certificateStatus: string | undefined = undefined;

        if (courseCompleted) {
            // Check if certificate already exists
            const existingCert = await prisma.certificate.findFirst({
                where: { userId, courseId: quiz.courseId },
            });
            if (existingCert) {
                certificateId = existingCert.id;
                certificateUniqueId = existingCert.uniqueId;
                certificateStatus = existingCert.status;
                
                // If it was rejected/revoked, resetting it to PENDING for re-approval
                if (existingCert.status === 'REJECTED') {
                    await prisma.certificate.update({
                        where: { id: existingCert.id },
                        data: { status: 'PENDING' }
                    });
                    certificateStatus = 'PENDING';
                    
                    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
                    const course = await prisma.course.findUnique({ where: { id: quiz.courseId }, select: { title: true } });
                    
                    await createInstructorNotification(quiz.courseId, {
                        title: 'Certificate Re-approval Required',
                        message: `${user?.name || 'A student'} has re-completed "${course?.title}" and is waiting for certificate re-approval.`,
                        type: 'EXAM_COMPLETED',
                    });
                }
            } else {
                const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
                const course = await prisma.course.findUnique({ where: { id: quiz.courseId }, select: { title: true, hours: true } });

                // Fetch admin settings for certificate snapshot data
                let settings = await prisma.adminSettings.findUnique({ where: { id: 'singleton' } });
                if (!settings) {
                    settings = await prisma.adminSettings.create({ data: { id: 'singleton' } });
                }

                const newCert = await (prisma.certificate as any).create({
                    data: {
                        userId,
                        courseId: quiz.courseId,
                        status: 'PENDING',
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

                // Create notification for assigned instructor (or all admins)
                await createInstructorNotification(quiz.courseId, {
                    title: 'Certificate Approval Required',
                    message: `${user?.name || 'A student'} has completed "${course?.title}" and is waiting for certificate approval.`,
                    type: 'EXAM_COMPLETED',
                });

                certificateId = newCert.id;
                certificateUniqueId = newCert.uniqueId;
                certificateStatus = 'PENDING';
            }

            // Also set progress to 100%
            try {
                await prisma.enrollment.updateMany({
                    where: { userId, courseId: quiz.courseId },
                    data: { progress: 100, completed: true },
                });
            } catch { }
        }

        res.json({
            result,
            totalQuestions,
            correctAnswers: correctCount,
            score,
            passed,
            passingScore: quiz.passingScore,
            courseCompleted,
            nextExamId,
            certificateId,
            certificateUniqueId,
            certificateStatus,
        });
    } catch (error: any) {
        console.error('submitQuiz error:', error);
        res.status(500).json({ message: 'Error submitting quiz' });
    }
};

// Get quiz results for a user
export const getMyResults = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        const results = await prisma.result.findMany({
            where: { userId },
            include: {
                quiz: {
                    include: { course: { select: { id: true, title: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching results' });
    }
};

// Get all results (admin)
export const getAllResults = async (req: Request, res: Response) => {
    try {
        const results = await prisma.result.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                quiz: {
                    include: { course: { select: { id: true, title: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching results' });
    }
};

// Add questions to existing quiz
export const addQuestion = async (req: Request, res: Response) => {
    try {
        const quizId = req.params.quizId as string;
        const { text, options, correctAnswer } = req.body;

        const question = await prisma.question.create({
            data: { text, options, correctAnswer, quizId: quizId },
        });
        res.status(201).json(question);
    } catch (error: any) {
        res.status(500).json({ message: 'Error adding question' });
    }
};

export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        const questionId = req.params.questionId as string;
        await prisma.question.delete({ where: { id: questionId } });
        res.json({ message: 'Question deleted' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting question' });
    }
};

export const updateQuiz = async (req: Request, res: Response) => {
    try {
        const quizId = req.params.quizId as string;
        const { title, passingScore, questions } = req.body;

        // Validation for missing correct answers
        if (questions && questions.some((q: any) => q.correctAnswer === -1 || q.correctAnswer === undefined || q.correctAnswer === null)) {
            return res.status(400).json({ message: 'All questions must have a valid correct answer selected.' });
        }

        // Transaction to ensure atomic update
        const quiz = await prisma.$transaction(async (tx) => {
            // Update basic info
            const updated = await tx.quiz.update({
                where: { id: quizId },
                data: {
                    title,
                    passingScore: parseInt(passingScore),
                },
            });

            // Replace questions (simplest approach for full sync)
            if (questions && questions.length > 0) {
                // Delete existing
                await tx.question.deleteMany({ where: { quizId } });

                // Create new
                await tx.question.createMany({
                    data: questions.map((q: any) => ({
                        quizId,
                        text: q.text,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                    })),
                });
            }

            return updated;
        });

        res.json(quiz);
    } catch (error: any) {
        console.error('updateQuiz error:', error);
        res.status(500).json({ message: 'Error updating quiz' });
    }
};

export const deleteQuiz = async (req: Request, res: Response) => {
    try {
        const quizId = req.params.quizId as string;

        // Transaction to ensure cleanup
        await prisma.$transaction(async (tx) => {
            // Delete related results first (due to missing Cascade in schema)
            await tx.result.deleteMany({ where: { quizId } });

            // Delete the quiz (Questions will cascade)
            await tx.quiz.delete({ where: { id: quizId } });
        });

        res.json({ message: 'Quiz deleted' });
    } catch (error: any) {
        console.error('deleteQuiz error:', error);
        res.status(500).json({ message: 'Error deleting quiz' });
    }
};
