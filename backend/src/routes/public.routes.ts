import { Router } from 'express';
import { getLandingStats } from '../controllers/public.controller';
import { publicCache } from '../middleware/cache.middleware';

const router = Router();

router.get('/stats', publicCache(300), getLandingStats);

export default router;
