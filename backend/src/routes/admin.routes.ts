import { Router } from 'express';
import { getDashboardStats, getAllUsers, getAllCertificates, deleteUser, createUser, approveCertificate, revokeCertificate, updateCertificate, getNotifications, markNotificationRead, markAllNotificationsRead, clearAllNotifications } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { withConcurrencyLimit } from '../utils/concurrency';

const router = Router();

router.get('/dashboard', authenticate, requireAdmin, withConcurrencyLimit(3), getDashboardStats);
router.get('/users', authenticate, requireAdmin, getAllUsers);
router.post('/users', authenticate, requireAdmin, createUser);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);
router.get('/certificates', authenticate, requireAdmin, getAllCertificates);
router.patch('/certificates/:id/status', authenticate, requireAdmin, approveCertificate);
router.patch('/certificates/:id/revoke', authenticate, requireAdmin, revokeCertificate);
router.put('/certificates/:id', authenticate, requireAdmin, updateCertificate);
router.get('/notifications', authenticate, getNotifications);
router.patch('/notifications/read-all', authenticate, markAllNotificationsRead);
router.delete('/notifications', authenticate, clearAllNotifications);
router.patch('/notifications/:id/read', authenticate, markNotificationRead);

export default router;
