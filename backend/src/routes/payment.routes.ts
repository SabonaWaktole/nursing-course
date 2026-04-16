import { Router } from 'express';
import { createCheckoutSession, verifyPayment } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Create a Stripe Checkout Session for a paid course
router.post('/create-checkout-session', authenticate, createCheckoutSession);

// Verify payment after Stripe redirects back
router.get('/verify', authenticate, verifyPayment);

export default router;
