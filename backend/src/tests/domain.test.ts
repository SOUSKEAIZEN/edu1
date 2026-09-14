import { test } from 'node:test';
import assert from 'node:assert';
import { RecordAttendanceSchema } from '../services/attendance.service';
import { GoalSchema } from '../services/tasks.service';

test('Domain Validation - Attendance Record', (t) => {
  // Invalid status
  assert.throws(() => {
    RecordAttendanceSchema.parse({
      enrollment_id: '123e4567-e89b-12d3-a456-426614174000',
      status: 'INVALID_STATUS'
    });
  }, /Invalid option/);

  // Valid
  const valid = RecordAttendanceSchema.parse({
    enrollment_id: '123e4567-e89b-12d3-a456-426614174000',
    status: 'PRESENT'
  });
  assert.strictEqual(valid.status, 'PRESENT');
});

test('Domain Validation - Goals', (t) => {
  assert.throws(() => {
    GoalSchema.parse({
      student_user_id: 'not-uuid',
      title: ''
    });
  }, /Invalid UUID/);
  
  const valid = GoalSchema.parse({
    student_user_id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Achieve 90%'
  });
  assert.strictEqual(valid.title, 'Achieve 90%');
});
