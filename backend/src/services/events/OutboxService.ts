import { getClient, query } from '../../db';

export type EventType = 
  | 'MENTOR_MESSAGE'
  | 'TASK_DEADLINE'
  | 'ATTENDANCE_CONCERN'
  | 'RISK_CHANGE'
  | 'INTERVENTION_FOLLOWUP'
  | 'GOAL_MILESTONE'
  | 'ASSESSMENT_DEADLINE';

export class OutboxService {
  
  /**
   * Ensure outbox_events table exists. Usually done in migrations.
   */
  static async init() {
    await query(`
      CREATE TABLE IF NOT EXISTS outbox_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        payload JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP WITH TIME ZONE
      )
    `);
  }

  /**
   * Dispatch an event transactionally
   */
  static async dispatchEvent(client: any, type: EventType, payload: any) {
    await client.query(
      `INSERT INTO outbox_events (type, payload) VALUES ($1, $2)`,
      [type, JSON.stringify(payload)]
    );
  }
}
