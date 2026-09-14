import { query } from '../../db';

export class ConversationService {
  
  static async createConversation(studentUserId: string, title: string = 'New Conversation', mode: string = 'LEARN') {
    // Get profile id
    const profileRes = await query('SELECT id FROM student_profiles WHERE user_id = $1', [studentUserId]);
    if (profileRes.rows.length === 0) throw new Error('Profile not found');
    
    const res = await query(
      `INSERT INTO ai_conversations (student_id, title) VALUES ($1, $2) RETURNING *`,
      [profileRes.rows[0].id, title]
    );
    return res.rows[0];
  }

  static async getConversations(studentUserId: string) {
    const res = await query(`
      SELECT c.* 
      FROM ai_conversations c
      JOIN student_profiles sp ON c.student_id = sp.id
      WHERE sp.user_id = $1
      ORDER BY c.updated_at DESC
    `, [studentUserId]);
    return res.rows;
  }

  static async renameConversation(conversationId: string, title: string) {
    const res = await query(`UPDATE ai_conversations SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [title, conversationId]);
    return res.rows[0];
  }

  static async deleteConversation(conversationId: string) {
    await query(`DELETE FROM ai_conversations WHERE id = $1`, [conversationId]);
    return { success: true };
  }

  static async getMessages(conversationId: string) {
    const res = await query(`SELECT * FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC`, [conversationId]);
    return res.rows;
  }

  static async addMessage(conversationId: string, role: 'user' | 'assistant', content: string, tokensUsed = 0) {
    const res = await query(
      `INSERT INTO ai_messages (conversation_id, role, content, tokens_used) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [conversationId, role, content, tokensUsed]
    );
    await query(`UPDATE ai_conversations SET updated_at = NOW() WHERE id = $1`, [conversationId]);
    return res.rows[0];
  }

  static async submitFeedback(messageId: string, rating: number, comment?: string) {
    const res = await query(
      `INSERT INTO ai_response_feedback (message_id, rating, comment)
       VALUES ($1, $2, $3) RETURNING *`,
      [messageId, rating, comment || null]
    );
    return res.rows[0];
  }
}
