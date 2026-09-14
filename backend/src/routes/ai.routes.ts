import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting specifically for AI requests to prevent abuse and control costs
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 AI requests per hour
  message: { error: 'You have reached your AI interaction limit for this hour. Please try again later.' }
});

router.use(authMiddleware);

// Conversations
router.post('/conversations', requireRole(['STUDENT']), AIController.createConversation);
router.get('/conversations', requireRole(['STUDENT']), AIController.getConversations);
router.get('/conversations/:conversationId', requireRole(['STUDENT']), AIController.getHistory);
router.put('/conversations/:conversationId', requireRole(['STUDENT']), AIController.renameConversation);
router.delete('/conversations/:conversationId', requireRole(['STUDENT']), AIController.deleteConversation);

// Messaging
router.post('/mentor/ask', requireRole(['STUDENT']), aiLimiter, AIController.askMentor);
router.get('/mentor/stream', requireRole(['STUDENT']), aiLimiter, AIController.streamMentor);

// Feedback
router.post('/messages/:messageId/feedback', requireRole(['STUDENT']), AIController.submitFeedback);

export default router;
