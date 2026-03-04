import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import quizRoutes from './routes/quiz.routes';
import certificateRoutes from './routes/certificate.routes';
import adminRoutes from './routes/admin.routes';
import uploadRoutes from './routes/upload.routes';
import prisma from './utils/prisma';

const app = express();
const PORT = process.env.PORT || 4000;

// Trust proxy for Hostinger/Load Balancers
app.set('trust proxy', 1);

const allowedOrigins = [
  'https://cnaceus.excelcommunityliving.website',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Excelcommunity Living Inc API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

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

app.listen(PORT, async () => {
  await checkDatabaseConnection();
  console.log(`🚀 Server is running on port ${PORT}`);
});
