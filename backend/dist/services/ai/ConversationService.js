"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const db_1 = require("../../db");
class ConversationService {
    static async createConversation(studentUserId, title = 'New Conversation', mode = 'LEARN') {
        // Get profile id
        const profileRes = await (0, db_1.query)('SELECT id FROM student_profiles WHERE user_id = $1', [studentUserId]);
        if (profileRes.rows.length === 0)
            throw new Error('Profile not found');
        const res = await (0, db_1.query)(`INSERT INTO ai_conversations (student_id, title) VALUES ($1, $2) RETURNING *`, [profileRes.rows[0].id, title]);
        return res.rows[0];
    }
    static async getConversations(studentUserId) {
        const res = await (0, db_1.query)(`
      SELECT c.* 
      FROM ai_conversations c
      JOIN student_profiles sp ON c.student_id = sp.id
      WHERE sp.user_id = $1
      ORDER BY c.updated_at DESC
    `, [studentUserId]);
        return res.rows;
    }
    static async renameConversation(conversationId, title) {
        const res = await (0, db_1.query)(`UPDATE ai_conversations SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [title, conversationId]);
        return res.rows[0];
    }
    static async deleteConversation(conversationId) {
        await (0, db_1.query)(`DELETE FROM ai_conversations WHERE id = $1`, [conversationId]);
        return { success: true };
    }
    static async getMessages(conversationId) {
        const res = await (0, db_1.query)(`SELECT * FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC`, [conversationId]);
        return res.rows;
    }
    static async addMessage(conversationId, role, content, tokensUsed = 0) {
        const res = await (0, db_1.query)(`INSERT INTO ai_messages (conversation_id, role, content, tokens_used) 
       VALUES ($1, $2, $3, $4) RETURNING *`, [conversationId, role, content, tokensUsed]);
        await (0, db_1.query)(`UPDATE ai_conversations SET updated_at = NOW() WHERE id = $1`, [conversationId]);
        return res.rows[0];
    }
    static async submitFeedback(messageId, rating, comment) {
        const res = await (0, db_1.query)(`INSERT INTO ai_response_feedback (message_id, rating, comment)
       VALUES ($1, $2, $3) RETURNING *`, [messageId, rating, comment || null]);
        return res.rows[0];
    }
}
exports.ConversationService = ConversationService;
