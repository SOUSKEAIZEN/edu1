import { Request, Response } from 'express';
import { AIPipeline } from '../services/ai/AIPipeline';
import { ConversationService } from '../services/ai/ConversationService';

const pipeline = new AIPipeline();

export class AIController {
  
  static async createConversation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const { title, mode } = req.body;
      const conv = await ConversationService.createConversation(userId, title, mode);
      res.json(conv);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async getConversations(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const convs = await ConversationService.getConversations(userId);
      res.json(convs);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async getHistory(req: Request, res: Response) {
    try {
      const conversationId = req.params.conversationId as string;
      const history = await ConversationService.getMessages(conversationId);
      res.json(history);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async renameConversation(req: Request, res: Response) {
    try {
      const conversationId = req.params.conversationId as string;
      const { title } = req.body;
      const conv = await ConversationService.renameConversation(conversationId, title);
      res.json(conv);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async deleteConversation(req: Request, res: Response) {
    try {
      const conversationId = req.params.conversationId as string;
      await ConversationService.deleteConversation(conversationId);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async askMentor(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const { query, mode, conversationId } = req.body;
      
      if (!query || !conversationId) throw new Error('Query and conversationId are required');

      const result = await pipeline.processQuery(userId, conversationId, query, mode);
      res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async streamMentor(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const { query, mode, conversationId } = req.query;
      
      if (!query || !conversationId) return res.status(400).json({ error: 'Query and conversationId are required' });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = pipeline.streamQuery(userId, conversationId as string, query as string, mode as any);
      
      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (e: any) { 
      res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
      res.end();
    }
  }

  static async submitFeedback(req: Request, res: Response) {
    try {
      const messageId = req.params.messageId as string;
      const { rating, comment } = req.body; // 1 for thumbs up, -1 for thumbs down
      const feedback = await ConversationService.submitFeedback(messageId, rating, comment);
      res.json(feedback);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }
}
