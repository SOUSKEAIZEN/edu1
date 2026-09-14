import { query } from '../../db';
import { EmailProvider, DevelopmentEmailProvider } from './EmailProvider';

export class NotificationWorker {
  private emailProvider: EmailProvider;

  constructor(provider?: EmailProvider) {
    this.emailProvider = provider || new DevelopmentEmailProvider();
  }

  async processOutbox() {
    // 1. Fetch pending events (limit to prevent memory overload)
    // Using FOR UPDATE SKIP LOCKED for concurrent worker safety
    const client = await (await import('../../db')).getClient();
    try {
      await client.query('BEGIN');
      
      const res = await client.query(`
        SELECT * FROM outbox_events 
        WHERE status = 'PENDING' 
        ORDER BY created_at ASC 
        LIMIT 50 
        FOR UPDATE SKIP LOCKED
      `);

      const events = res.rows;
      if (events.length === 0) {
        await client.query('ROLLBACK');
        return 0;
      }

      for (const event of events) {
        try {
          await this.handleEvent(event.type, event.payload);
          await client.query(`UPDATE outbox_events SET status = 'COMPLETED', processed_at = NOW() WHERE id = $1`, [event.id]);
        } catch (error: any) {
          console.error(`[Worker] Failed event ${event.id}:`, error.message);
          await client.query(`UPDATE outbox_events SET status = 'FAILED' WHERE id = $1`, [event.id]);
        }
      }

      await client.query('COMMIT');
      return events.length;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  private async handleEvent(type: string, payload: any) {
    // Basic routing logic
    if (type === 'ATTENDANCE_CONCERN') {
      await this.emailProvider.sendEmail({
        to: payload.studentEmail,
        subject: 'Attendance Concern',
        body: `Your attendance has dropped. Please review.`
      });
      
      // We would also insert an IN_APP notification here securely
      await query(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, $2, $3, $4)
      `, [payload.studentUserId, 'Attendance Concern', 'Your attendance requires attention.', type]);
    }
    // Handle other types...
  }
}
