import { Router } from 'express';
import {
    generateCertificate,
    downloadCertificate,
    getMyCertificates,
    verifyCertificate,
} from '../controllers/certificate.controller';
import { authenticate } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// Public - verify
router.get('/verify/:uniqueId', rateLimit({ limit: 30, windowSeconds: 60, scope: 'cert-verify' }), verifyCertificate);

// Student
router.post('/generate/:courseId', authenticate, generateCertificate);

/**
 * ⚠️ Intentionally unauthenticated: the frontend opens this in a new tab via
 * window.open(), which cannot attach an Authorization header. The certificate id is a
 * UUID so it is unguessable, but it is not a secret either.
 *
 * This is the most expensive endpoint in the API — it renders an A4 PDF plus a QR code
 * — so it gets the tightest limit. The controller also caches rendered PDFs to disk, so
 * repeat downloads of an unchanged certificate cost a file read instead of a re-render.
 *
 * The proper fix is a short-lived signed download token, which changes the frontend
 * download flow; left as a follow-up rather than bundled in here.
 */
router.get(
    '/download/:certificateId',
    rateLimit({ limit: 10, windowSeconds: 60, scope: 'cert-download' }),
    downloadCertificate
);

router.get('/my', authenticate, getMyCertificates);

export default router;
