
import { Router } from 'express';
import { MentorController } from '../controllers/mentor.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware, requireRole(['MENTOR', 'ADMIN']));

// Legacy
router.get('/students', MentorController.getAssignedStudents);
router.post('/assessments/:assessmentId/marks', MentorController.recordMarkForStudent);

// Phase 10
router.get('/dashboard/metrics', MentorController.getDashboardMetrics);
router.get('/dashboard/table', MentorController.getStudentTable);
router.get('/students/:studentProfileId/brief', MentorController.getStudentBrief);
router.post('/students/:studentProfileId/notes', MentorController.addNote);
router.post('/students/:studentProfileId/interventions', MentorController.recordIntervention);
router.put('/interventions/:interventionId/outcome', MentorController.updateOutcome);

export default router;
