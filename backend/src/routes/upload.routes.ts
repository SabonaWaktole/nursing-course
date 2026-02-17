import { Router } from 'express';
import { upload, uploadVideo, uploadMaterial } from '../controllers/upload.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/video', authenticate, requireAdmin, upload.single('video'), uploadVideo);
router.post('/material', authenticate, requireAdmin, upload.single('material'), uploadMaterial);

export default router;
