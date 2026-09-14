import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware);

// Student endpoints
router.get('/students/me/analytics', requireRole(['STUDENT']), AnalyticsController.getMyAnalytics);

// Mentor endpoints
router.get('/mentors/students/:studentId/analytics', requireRole(['MENTOR', 'ADMIN']), AnalyticsController.getStudentAnalyticsForMentor);

export default router;
