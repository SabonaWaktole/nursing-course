import { Router } from 'express';
import { getDashboardStats, getAllUsers, getAllCertificates, deleteUser } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', authenticate, requireAdmin, getDashboardStats);
router.get('/users', authenticate, requireAdmin, getAllUsers);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);
router.get('/certificates', authenticate, requireAdmin, getAllCertificates);

export default router;
