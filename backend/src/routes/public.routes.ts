import { Router } from 'express';
import { getLandingStats } from '../controllers/public.controller';
import { publicCache, responseCache } from '../middleware/cache.middleware';

const router = Router();

// Landing stats are three COUNT(*) queries whose result barely moves; 5 minutes of
// staleness is invisible to visitors and removes the queries almost entirely.
router.get('/stats', publicCache(300), responseCache(300), getLandingStats);

export default router;
