import { test, mock } from 'node:test';
import assert from 'node:assert';
import { OutboxService } from '../services/events/OutboxService';
import { NotificationWorker } from '../services/notifications/NotificationWorker';
import * as db from '../db';

test('Reliability - Transactional Outbox Worker', async (t) => {
  // Mock DB for Outbox
  mock.method(db, 'getClient', async () => ({
    query: async (sql: string, params: any[]) => {
      if (sql.includes('SELECT * FROM outbox_events')) {
        return { rows: [{ id: 'evt-1', type: 'ATTENDANCE_CONCERN', payload: { studentEmail: 'test@example.com' } }] };
      }
      return { rows: [] };
    },
    release: () => {}
  }));
  
  mock.method(db, 'query', async () => ({ rows: [] }));

  let emailSentTo = '';
  const mockEmailProvider = {
    sendEmail: async (payload: any) => { emailSentTo = payload.to; }
  };

  const worker = new NotificationWorker(mockEmailProvider);
  const processed = await worker.processOutbox();
  
  assert.strictEqual(processed, 1);
  assert.strictEqual(emailSentTo, 'test@example.com');
  
  mock.restoreAll();
});
