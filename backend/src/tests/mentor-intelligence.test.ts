import { test, mock } from 'node:test';
import assert from 'node:assert';
import { InterventionService } from '../services/mentor/InterventionService';
import { StudentBriefService } from '../services/mentor/StudentBriefService';
import * as db from '../db';

test('Mentor Intelligence - Privacy Boundary Enforcement', async (t) => {
  // Mock DB to simulate student NOT assigned to mentor
  mock.method(db, 'query', async (sql: string, params: any[]) => {
    if (sql.includes('mentor_student_assignments')) {
      return { rows: [] }; // Unauthorized
    }
    return { rows: [] };
  });

  try {
    await InterventionService.addNote('mentor-1', 'student-1', 'Test note', true);
    assert.fail('Should have thrown unauthorized error');
  } catch (e: any) {
    assert.strictEqual(e.message, 'Unauthorized profile access');
  }

  try {
    await StudentBriefService.generateBrief('mentor-1', 'student-1');
    assert.fail('Should have thrown unauthorized error');
  } catch (e: any) {
    assert.strictEqual(e.message, 'Unauthorized profile access');
  }

  mock.restoreAll();
});

test('Mentor Intelligence - Intervention Outcome Tracking', async (t) => {
  // Mock DB for successful assignment
  let lastSql = '';
  mock.method(db, 'query', async (sql: string, params: any[]) => {
    lastSql = sql;
    if (sql.includes('UPDATE mentor_interventions')) {
      return { rows: [{ id: 'intervention-1', actual_outcome: 'Student improved attendance', status: 'SUCCESS' }] };
    }
    return { rows: [{ id: 'mock-id' }] };
  });

  const outcome = await InterventionService.updateOutcome('intervention-1', 'mentor-1', 'Student improved attendance', 'SUCCESS');
  
  assert.strictEqual(outcome.status, 'SUCCESS');
  assert.strictEqual(outcome.actual_outcome, 'Student improved attendance');
  
  mock.restoreAll();
});
