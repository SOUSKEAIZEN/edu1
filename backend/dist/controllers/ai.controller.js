"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const AIPipeline_1 = require("../services/ai/AIPipeline");
const ConversationService_1 = require("../services/ai/ConversationService");
const pipeline = new AIPipeline_1.AIPipeline();
class AIController {
    static async createConversation(req, res) {
        try {
            const userId = req.user.user_id;
            const { title, mode } = req.body;
            const conv = await ConversationService_1.ConversationService.createConversation(userId, title, mode);
            res.json(conv);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async getConversations(req, res) {
        try {
            const userId = req.user.user_id;
            const convs = await ConversationService_1.ConversationService.getConversations(userId);
            res.json(convs);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async getHistory(req, res) {
        try {
            const conversationId = req.params.conversationId;
            const history = await ConversationService_1.ConversationService.getMessages(conversationId);
            res.json(history);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async renameConversation(req, res) {
        try {
            const conversationId = req.params.conversationId;
            const { title } = req.body;
            const conv = await ConversationService_1.ConversationService.renameConversation(conversationId, title);
            res.json(conv);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async deleteConversation(req, res) {
        try {
            const conversationId = req.params.conversationId;
            await ConversationService_1.ConversationService.deleteConversation(conversationId);
            res.json({ success: true });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async askMentor(req, res) {
        try {
            const userId = req.user.user_id;
            const { query, mode, conversationId } = req.body;
            if (!query || !conversationId)
                throw new Error('Query and conversationId are required');
            const result = await pipeline.processQuery(userId, conversationId, query, mode);
            res.json(result);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async streamMentor(req, res) {
        try {
            const userId = req.user.user_id;
            const { query, mode, conversationId } = req.query;
            if (!query || !conversationId)
                return res.status(400).json({ error: 'Query and conversationId are required' });
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            const stream = pipeline.streamQuery(userId, conversationId, query, mode);
            for await (const chunk of stream) {
                res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            }
            res.write(`data: [DONE]\n\n`);
            res.end();
        }
        catch (e) {
            res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
            res.end();
        }
    }
    static async submitFeedback(req, res) {
        try {
            const messageId = req.params.messageId;
            const { rating, comment } = req.body; // 1 for thumbs up, -1 for thumbs down
            const feedback = await ConversationService_1.ConversationService.submitFeedback(messageId, rating, comment);
            res.json(feedback);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}
exports.AIController = AIController;
