import { Router } from 'express';
import { getDashboardStats, getAllUsers, getAllCertificates } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', authenticate, requireAdmin, getDashboardStats);
router.get('/users', authenticate, requireAdmin, getAllUsers);
router.get('/certificates', authenticate, requireAdmin, getAllCertificates);

export default router;
