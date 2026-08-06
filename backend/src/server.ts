import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import quizRoutes from './routes/quiz.routes';
import certificateRoutes from './routes/certificate.routes';
import adminRoutes from './routes/admin.routes';
import uploadRoutes from './routes/upload.routes';
import publicRoutes from './routes/public.routes';
import settingRoutes from './routes/setting.routes';
import paymentRoutes from './routes/payment.routes';
import guideRoutes from './routes/guide.routes';
import prisma from './utils/prisma';

const app = express();
const PORT = process.env.PORT || 4000;

// Trust proxy for Hostinger/Load Balancers
app.set('trust proxy', 1);

const allowedOrigins = [
  'https://cnaceus.excelcommunityliving.website',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://nursing-course.vercel.app',
  'https://excel-community-living.vercel.app'
];

const isDev = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, callback) => {
    // In development, allow all origins to avoid CORS blocking local testing.
    if (isDev) {
      return callback(null, true);
    }

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || origin.includes('excelcommunityliving.website')) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

import { handleWebhook } from './controllers/payment.controller';

// ⚠️ Stripe webhook MUST be registered BEFORE express.json() — it needs the raw body
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// gzip/deflate every response above the default 1KB threshold. Registered after the
// Stripe webhook (which needs its raw body untouched) and before the routes.
app.use(compression());

// 2MB is ample: every file upload goes through multer as multipart, so the largest
// JSON body is a parsed quiz's question array.
app.use(express.json({ limit: '2mb' }));

// Serve uploaded files from persistent upload directory.
// Filenames are content-unique (`Date.now()-random.ext`) and files are never rewritten
// in place, so they can be cached indefinitely. This was previously the express.static
// default of max-age=0, which forced a revalidation round trip for every image, PDF and
// video on every page view.
const serveUploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(serveUploadDir, {
  maxAge: '1y',
  immutable: true,
}));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Excel Community Living Inc API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/guide', guideRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong' });
});

async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    // In production, we might want to retry or alert, but for now we log and exit
    // process.exit(1); 
  }
}

const server = app.listen(PORT, async () => {
  await checkDatabaseConnection();
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Socket *inactivity* timeouts. Previously 2 hours globally, which let stalled or
// abandoned connections (crawlers, dropped mobile clients) hold a process slot almost
// indefinitely — the main cause of sustained, rather than spiky, process counts.
// Streaming a large video keeps resetting this, so playback is unaffected.
// Large uploads restore the 2-hour budget per-route via allowLongUpload in upload.routes.ts.
server.timeout = 120000;          // 2 minutes of inactivity
server.keepAliveTimeout = 125000; // slightly longer than timeout
server.headersTimeout = 130000;   // slightly longer than keepAliveTimeout

// --- Crash diagnostics -----------------------------------------------------
// Pure logging additions to help identify what's causing Hostinger restarts.
// Nothing here changes exit codes, timing, or control flow.

function formatMemory(mem: NodeJS.MemoryUsage) {
  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)}MB`;
  return {
    rss: mb(mem.rss),
    heapTotal: mb(mem.heapTotal),
    heapUsed: mb(mem.heapUsed),
    external: mb(mem.external),
  };
}

function logDiagnostic(label: string, extra?: Record<string, unknown>) {
  console.log(`[diag] ${label}`, {
    pid: process.pid,
    uptimeSec: process.uptime().toFixed(1),
    memory: formatMemory(process.memoryUsage()),
    ...extra,
  });
}

logDiagnostic('process started');

const memoryLogInterval = setInterval(() => {
  logDiagnostic('memory snapshot');
}, 60000);
memoryLogInterval.unref();

process.on('exit', (code) => {
  logDiagnostic('process exit', { exitCode: code });
});

// Log-and-survive instead of letting Node hard-crash the process on a single
// bad request/promise. An abrupt crash skips the shutdown drain below and is
// what was producing runaway process/thread counts under the host's supervisor.
process.on('unhandledRejection', (reason: unknown) => {
  logDiagnostic('unhandledRejection', {
    reason: reason instanceof Error ? { message: reason.message, stack: reason.stack } : reason,
  });
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logDiagnostic('uncaughtException', { message: err.message, stack: err.stack });
  console.error('Uncaught Exception:', err);
});

// Single graceful-shutdown path: stop accepting new connections, let in-flight
// requests finish, disconnect Prisma, then exit. A timeout forces exit if
// something (e.g. a stalled upload) never drains.
let isShuttingDown = false;
const gracefulShutdown = (signal: string) => {
  logDiagnostic(`signal ${signal}`, { alreadyShuttingDown: isShuttingDown });
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received: closing server...`);

  const forceExit = setTimeout(() => {
    console.error('Graceful shutdown timed out, forcing exit.');
    process.exit(1);
  }, 15000);
  forceExit.unref();

  server.close(async (err) => {
    if (err) console.error('Error closing HTTP server:', err);
    try {
      await prisma.$disconnect();
      console.log('🔌 Prisma disconnected.');
    } catch (e) {
      console.error('Error disconnecting Prisma:', e);
    }
    clearTimeout(forceExit);
    process.exit(err ? 1 : 0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
