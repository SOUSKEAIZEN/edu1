import { test, mock } from 'node:test';
import assert from 'node:assert';
import { AcademicService, CreateAssessmentSchema } from '../services/academic.service';
import * as db from '../db';

test('AcademicService.createAssessment validation', async (t) => {
  // Test invalid weightage
  assert.throws(() => {
    CreateAssessmentSchema.parse({
      name: 'Midterm',
      type: 'EXAM',
      max_marks: 100,
      weightage: 150 // Invalid: max 100
    });
  }, /Too big: expected number to be <=100/);

  // Test valid payload
  const validData = CreateAssessmentSchema.parse({
    name: 'Final',
    type: 'EXAM',
    max_marks: 100,
    weightage: 50
  });
  assert.strictEqual(validData.name, 'Final');
});
