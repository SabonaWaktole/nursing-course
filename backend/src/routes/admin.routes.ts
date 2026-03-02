import { Router } from 'express';
import { getDashboardStats, getAllUsers, getAllCertificates, deleteUser, createUser, approveCertificate, revokeCertificate, getNotifications, markNotificationRead } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', authenticate, requireAdmin, getDashboardStats);
router.get('/users', authenticate, requireAdmin, getAllUsers);
router.post('/users', authenticate, requireAdmin, createUser);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);
router.get('/certificates', authenticate, requireAdmin, getAllCertificates);
router.patch('/certificates/:id/status', authenticate, requireAdmin, approveCertificate);
router.patch('/certificates/:id/revoke', authenticate, requireAdmin, revokeCertificate);
router.get('/notifications', authenticate, getNotifications);
router.patch('/notifications/:id/read', authenticate, markNotificationRead);

export default router;
