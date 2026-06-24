import { Router } from 'express';
import { upload, uploadVideo, uploadMaterial, uploadThumbnail, uploadCourseFolderFiles } from '../controllers/upload.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/video', authenticate, requireAdmin, upload.single('video'), uploadVideo);
router.post('/material', authenticate, requireAdmin, upload.single('material'), uploadMaterial);
router.post('/thumbnail', authenticate, requireAdmin, upload.single('thumbnail'), uploadThumbnail);
router.post('/course-folder', authenticate, requireAdmin, upload.array('files', 500), uploadCourseFolderFiles);

export default router;

