import { Router } from 'express';
import { AcademicController } from '../controllers/academic.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// Mix of Admin, Mentor, and Student endpoints with specific RBAC per route
router.use(authMiddleware);

// Assessments (Mentors/Admins can create)
router.post('/offerings/:offeringId/assessments', requireRole(['MENTOR', 'ADMIN']), AcademicController.createAssessment);

// Attendance (Mentors can record)
router.post('/attendance/sessions/:sessionId/records', requireRole(['MENTOR']), AcademicController.recordAttendance);

// Resources (Mentors/Admins can add)
router.post('/resources', requireRole(['MENTOR', 'ADMIN']), AcademicController.addResource);

// Tasks
router.post('/tasks', requireRole(['MENTOR', 'ADMIN']), AcademicController.createTask);
router.post('/tasks/:taskId/submit', requireRole(['STUDENT']), AcademicController.submitTask);

// Goals (Mentors/Students can create)
router.post('/goals', requireRole(['STUDENT', 'MENTOR']), AcademicController.createGoal);

export default router;
