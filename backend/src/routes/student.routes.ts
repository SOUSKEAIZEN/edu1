import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware, requireRole(['STUDENT']));

router.get('/profile', StudentController.getProfile);
router.get('/subjects', StudentController.getSubjects);
router.get('/offerings/:offeringId/marks', StudentController.getMarks);
router.get('/attendance-trend', StudentController.getAttendanceTrend);
router.get('/tasks', StudentController.getTasks);
router.get('/goals', StudentController.getGoals);

export default router;
