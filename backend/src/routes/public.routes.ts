import { Router } from 'express';
import { getLandingStats } from '../controllers/public.controller';

const router = Router();

router.get('/stats', getLandingStats);

export default router;
