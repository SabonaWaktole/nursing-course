import { Router } from 'express';
import { getGuideImages, uploadGuideImage, updateGuideImage, reorderGuideImages, deleteGuideImage, guideUpload } from '../controllers/guide.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', getGuideImages);

// Admin only
router.post('/', authenticate, requireAdmin, guideUpload.single('image'), uploadGuideImage);
router.put('/reorder', authenticate, requireAdmin, reorderGuideImages);
router.put('/:id', authenticate, requireAdmin, updateGuideImage);
router.delete('/:id', authenticate, requireAdmin, deleteGuideImage);

export default router;
