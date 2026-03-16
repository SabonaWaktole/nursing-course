import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Only admins can view and update settings
router.get('/', authenticate, requireAdmin, getSettings);
router.put('/', authenticate, requireAdmin, updateSettings);

export default router;
