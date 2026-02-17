import { Router } from 'express';
import {
    createQuiz,
    getQuiz,
    submitQuiz,
    getMyResults,
    getAllResults,
    addQuestion,
    deleteQuestion,
    updateQuiz,
    deleteQuiz,
} from '../controllers/quiz.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Student
router.get('/:quizId', authenticate, getQuiz);
router.post('/:quizId/submit', authenticate, submitQuiz);
router.get('/results/me', authenticate, getMyResults);

// Admin
router.post('/', authenticate, requireAdmin, createQuiz);
router.put('/:quizId', authenticate, requireAdmin, updateQuiz);
router.delete('/:quizId', authenticate, requireAdmin, deleteQuiz);
router.post('/:quizId/questions', authenticate, requireAdmin, addQuestion);
router.delete('/questions/:questionId', authenticate, requireAdmin, deleteQuestion);
router.get('/results/all', authenticate, requireAdmin, getAllResults);

export default router;
