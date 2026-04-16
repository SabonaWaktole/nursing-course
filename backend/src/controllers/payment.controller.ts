import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../utils/prisma';
import { createInstructorNotification } from '../utils/notificationHelper';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-03-25.dahlia',
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * POST /api/payments/create-checkout-session
 * Creates a Stripe Checkout Session for a paid course.
 * Returns the session URL to redirect the student to.
 */
export const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ message: 'courseId is required' });
        }

        // 1. Fetch the course
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, title: true, price: true, description: true },
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (!course.price || course.price <= 0) {
            return res.status(400).json({ message: 'This course is free. Use the enroll endpoint instead.' });
        }

        // 2. Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // 3. Check if there's already a completed payment (e.g., user paid but enrollment failed)
        const existingPayment = await (prisma as any).payment.findFirst({
            where: { userId, courseId, status: 'COMPLETED' },
        });

        if (existingPayment) {
            // Payment exists but enrollment doesn't — create enrollment now
            const enrollment = await prisma.enrollment.create({
                data: { userId, courseId },
            });

            return res.json({
                enrolled: true,
                message: 'You already paid for this course. Enrollment created.',
                enrollment,
            });
        }

        // 4. Check ALL existing PENDING payments — verify with Stripe if any were actually paid
        const pendingPayments = await (prisma as any).payment.findMany({
            where: { userId, courseId, status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
        });

        for (const pending of pendingPayments) {
            try {
                const existingSession = await stripe.checkout.sessions.retrieve(pending.stripeSessionId);

                // If this session was already paid (user closed browser after paying)
                if (existingSession.payment_status === 'paid') {
                    // Mark as completed
                    await (prisma as any).payment.update({
                        where: { id: pending.id },
                        data: {
                            status: 'COMPLETED',
                            stripePaymentId: existingSession.payment_intent as string || null,
                        },
                    });

                    // Create enrollment
                    const enrollment = await prisma.enrollment.create({
                        data: { userId, courseId },
                    });

                    // Send notification
                    try {
                        const student = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
                        await createInstructorNotification(courseId, {
                            title: 'New Enrollment (Paid)',
                            message: `${student?.name || 'A student'} has enrolled in "${course.title}" via Stripe payment.`,
                            type: 'ENROLLMENT',
                        });
                    } catch (notifErr) {
                        console.warn('Failed to create enrollment notification:', notifErr);
                    }

                    // Mark all other pending payments for this course as FAILED
                    await (prisma as any).payment.updateMany({
                        where: { userId, courseId, status: 'PENDING', id: { not: pending.id } },
                        data: { status: 'FAILED' },
                    });

                    return res.json({
                        enrolled: true,
                        message: 'Your previous payment was found. Enrollment created.',
                        enrollment,
                    });
                }

                // If session is still open, reuse it
                if (existingSession.status === 'open' && existingSession.url) {
                    return res.json({ sessionUrl: existingSession.url });
                }

                // Session expired or otherwise not usable — mark as failed
                await (prisma as any).payment.update({
                    where: { id: pending.id },
                    data: { status: 'FAILED' },
                });
            } catch {
                // Session doesn't exist on Stripe anymore — mark as failed
                await (prisma as any).payment.update({
                    where: { id: pending.id },
                    data: { status: 'FAILED' },
                });
            }
        }

        // 5. Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: course.title,
                            description: course.description?.substring(0, 200) || undefined,
                        },
                        unit_amount: Math.round(course.price * 100), // Stripe uses cents
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId,
                courseId,
            },
            success_url: `${FRONTEND_URL}/courses/${courseId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/courses/${courseId}?payment=cancelled`,
        });

        // 6. Save the payment record
        await (prisma as any).payment.create({
            data: {
                userId,
                courseId,
                stripeSessionId: session.id,
                amount: course.price,
                currency: 'usd',
                status: 'PENDING',
            },
        });

        res.json({ sessionUrl: session.url });
    } catch (error: any) {
        console.error('createCheckoutSession error:', error);
        res.status(500).json({ message: 'Error creating checkout session', details: error?.message });
    }
};

/**
 * GET /api/payments/verify?session_id=xxx
 * Called after Stripe redirects the student back.
 * Verifies the payment with Stripe and creates the enrollment if paid.
 */
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const sessionId = req.query.session_id as string;

        if (!sessionId) {
            return res.status(400).json({ message: 'session_id is required' });
        }

        // 1. Find the payment record
        const payment = await (prisma as any).payment.findUnique({
            where: { stripeSessionId: sessionId },
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Security: Ensure the payment belongs to this user
        if (payment.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // 2. If already completed, check enrollment exists
        if (payment.status === 'COMPLETED') {
            const enrollment = await prisma.enrollment.findUnique({
                where: { userId_courseId: { userId, courseId: payment.courseId } },
            });
            return res.json({ enrolled: !!enrollment, payment: { status: payment.status } });
        }

        // 3. Verify with Stripe directly
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            // Update payment record
            await (prisma as any).payment.update({
                where: { id: payment.id },
                data: {
                    status: 'COMPLETED',
                    stripePaymentId: session.payment_intent as string || null,
                },
            });

            // Create enrollment (idempotent — check first)
            const existingEnrollment = await prisma.enrollment.findUnique({
                where: { userId_courseId: { userId, courseId: payment.courseId } },
            });

            if (!existingEnrollment) {
                await prisma.enrollment.create({
                    data: { userId, courseId: payment.courseId },
                });

                // Send notification
                try {
                    const course = await prisma.course.findUnique({
                        where: { id: payment.courseId },
                        select: { title: true },
                    });
                    const student = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { name: true },
                    });
                    if (course) {
                        await createInstructorNotification(payment.courseId, {
                            title: 'New Enrollment (Paid)',
                            message: `${student?.name || 'A student'} has enrolled in "${course.title}" via Stripe payment.`,
                            type: 'ENROLLMENT',
                        });
                    }
                } catch (notifErr) {
                    console.warn('Failed to create enrollment notification:', notifErr);
                }
            }

            return res.json({ enrolled: true, payment: { status: 'COMPLETED' } });
        } else if (session.status === 'expired') {
            await (prisma as any).payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' },
            });
            return res.json({ enrolled: false, payment: { status: 'FAILED' } });
        }

        // Payment still pending
        return res.json({ enrolled: false, payment: { status: payment.status } });
    } catch (error: any) {
        console.error('verifyPayment error:', error);
        res.status(500).json({ message: 'Error verifying payment', details: error?.message });
    }
};
