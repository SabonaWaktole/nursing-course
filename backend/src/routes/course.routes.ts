import { Router } from 'express';
import { withConcurrencyLimit } from '../utils/concurrency';
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    addModule,
    updateModule,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson,
    enrollInCourse,
    getMyEnrollments,
    updateProgress,
    getMyActivity,
    reorderModules,
    reorderLessons,
    moveMaterial,
    removeMaterial,
    reorderPdfs,
} from '../controllers/course.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { publicCache, responseCache } from '../middleware/cache.middleware';

const router = Router();

// Public. responseCache sits before the concurrency limiter so a cache hit never
// consumes one of its slots.
router.get('/', publicCache(300), responseCache(60), withConcurrencyLimit(5), getAllCourses);

// Student (must be before /:id to prevent "my" matching as courseId)
router.get('/my/enrollments', authenticate, getMyEnrollments);
router.get('/my/activity', authenticate, withConcurrencyLimit(3), getMyActivity);

router.get('/:id', getCourseById);
router.post('/:courseId/enroll', authenticate, enrollInCourse);
router.put('/:courseId/progress', authenticate, updateProgress);

// Admin - Courses
router.post('/', authenticate, requireAdmin, createCourse);
router.put('/:id', authenticate, requireAdmin, updateCourse);
router.delete('/:id', authenticate, requireAdmin, deleteCourse);

// Admin - Modules
router.post('/:courseId/modules', authenticate, requireAdmin, addModule);
router.put('/:courseId/modules/reorder', authenticate, requireAdmin, reorderModules);
router.put('/modules/:moduleId', authenticate, requireAdmin, updateModule);
router.delete('/modules/:moduleId', authenticate, requireAdmin, deleteModule);

// Admin - Lessons (under modules)
router.post('/modules/:moduleId/lessons', authenticate, requireAdmin, addLesson);
router.put('/modules/:moduleId/lessons/reorder', authenticate, requireAdmin, reorderLessons);
router.put('/lessons/move-material', authenticate, requireAdmin, moveMaterial);
router.put('/lessons/:lessonId/remove-material', authenticate, requireAdmin, removeMaterial);
router.put('/lessons/:lessonId/reorder-pdfs', authenticate, requireAdmin, reorderPdfs);
router.put('/lessons/:lessonId', authenticate, requireAdmin, updateLesson);
router.delete('/lessons/:lessonId', authenticate, requireAdmin, deleteLesson);

export default router;
