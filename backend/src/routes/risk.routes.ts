import { Router } from 'express';
import { RiskController } from '../controllers/risk.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware);

router.post('/jobs/risk', requireRole(['ADMIN']), RiskController.triggerBatch);
router.get('/students/:studentId/risk', requireRole(['ADMIN', 'MENTOR']), RiskController.getStudentRisk);

export default router;
