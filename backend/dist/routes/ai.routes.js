"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
// Rate limiting specifically for AI requests to prevent abuse and control costs
const aiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // limit each IP to 50 AI requests per hour
    message: { error: 'You have reached your AI interaction limit for this hour. Please try again later.' }
});
router.use(auth_1.authMiddleware);
// Conversations
router.post('/conversations', (0, rbac_1.requireRole)(['STUDENT']), ai_controller_1.AIController.createConversation);
router.get('/conversations', (0, rbac_1.requireRole)(['STUDENT']), ai_controller_1.AIController.getConversations);
router.get('/conversations/:conversationId', (0, rbac_1.requireRole)(['STUDENT']), ai_controller_1.AIController.getHistory);
router.put('/conversations/:conversationId', (0, rbac_1.requireRole)(['STUDENT']), ai_controller_1.AIController.renameConversation);
router.delete('/conversations/:conversationId', (0, rbac_1.requireRole)(['STUDENT']), ai_controller_1.AIController.deleteConversation);
// Messaging
router.post('/mentor/ask', (0, rbac_1.requireRole)(['STUDENT']), aiLimiter, ai_controller_1.AIController.askMentor);
router.get('/mentor/stream', (0, rbac_1.requireRole)(['STUDENT']), aiLimiter, ai_controller_1.AIController.streamMentor);
// Feedback
router.post('/messages/:messageId/feedback', (0, rbac_1.requireRole)(['STUDENT']), ai_controller_1.AIController.submitFeedback);
exports.default = router;
