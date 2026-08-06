import { Router, Request, Response, NextFunction } from 'express';
import { upload, thumbnailUpload, uploadVideo, uploadMaterial, uploadThumbnail, uploadCourseFolderFiles } from '../controllers/upload.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

/**
 * The global socket timeout is deliberately short (see server.ts) so stalled
 * connections stop holding process slots. Large media uploads are the one case
 * that legitimately needs longer, so the old 2-hour budget is restored here only.
 */
const allowLongUpload = (req: Request, _res: Response, next: NextFunction) => {
    req.setTimeout(2 * 60 * 60 * 1000); // 2 hours
    next();
};

router.post('/video', authenticate, requireAdmin, allowLongUpload, upload.single('video'), uploadVideo);
router.post('/material', authenticate, requireAdmin, allowLongUpload, upload.single('material'), uploadMaterial);
router.post('/thumbnail', authenticate, requireAdmin, thumbnailUpload.single('thumbnail'), uploadThumbnail);
router.post('/course-folder', authenticate, requireAdmin, allowLongUpload, upload.array('files', 500), uploadCourseFolderFiles);

export default router;
