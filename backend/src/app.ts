import { ENV } from './env';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { loggerMiddleware } from './middleware/logger';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import mentorRoutes from './routes/mentor.routes';
import academicRoutes from './routes/academic.routes';
import analyticsRoutes from './routes/analytics.routes';
import riskRoutes from './routes/risk.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app = express();

// Security middlewares
app.use(loggerMiddleware);
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', riskRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;

// Demo RBAC routes
import { authMiddleware } from './middleware/auth';
import { requireRole } from './middleware/rbac';

app.get('/api/student-data', authMiddleware, requireRole(['STUDENT']), (req, res) => {
  res.json({ message: 'Student data accessed' });
});

app.get('/api/mentor-data', authMiddleware, requireRole(['MENTOR']), (req, res) => {
  res.json({ message: 'Mentor data accessed' });
});

app.get('/api/admin-data', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  res.json({ message: 'Admin data accessed' });
});
