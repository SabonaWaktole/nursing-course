import { Router } from 'express';
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    addModule,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson,
    enrollInCourse,
    getMyEnrollments,
    updateProgress,
} from '../controllers/course.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Student
router.post('/:courseId/enroll', authenticate, enrollInCourse);
router.get('/my/enrollments', authenticate, getMyEnrollments);
router.put('/:courseId/progress', authenticate, updateProgress);

// Admin - Courses
router.post('/', authenticate, requireAdmin, createCourse);
router.put('/:id', authenticate, requireAdmin, updateCourse);
router.delete('/:id', authenticate, requireAdmin, deleteCourse);

// Admin - Modules
router.post('/:courseId/modules', authenticate, requireAdmin, addModule);
router.delete('/modules/:moduleId', authenticate, requireAdmin, deleteModule);

// Admin - Lessons (under modules)
router.post('/modules/:moduleId/lessons', authenticate, requireAdmin, addLesson);
router.put('/lessons/:lessonId', authenticate, requireAdmin, updateLesson);
router.delete('/lessons/:lessonId', authenticate, requireAdmin, deleteLesson);

export default router;
