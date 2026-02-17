import { Router } from 'express';
import {
    generateCertificate,
    downloadCertificate,
    getMyCertificates,
    verifyCertificate,
} from '../controllers/certificate.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public - verify
router.get('/verify/:uniqueId', verifyCertificate);

// Student
router.post('/generate/:courseId', authenticate, generateCertificate);
router.get('/download/:certificateId', downloadCertificate);
router.get('/my', authenticate, getMyCertificates);

export default router;
