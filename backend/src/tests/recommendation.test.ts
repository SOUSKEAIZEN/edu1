import { test } from 'node:test';
import assert from 'node:assert';
import { RecommendationEngine, RecommendationInput } from '../services/recommendation.service';

function createMockInput(): RecommendationInput {
  return {
    analytics: {
      academic: { overallAverage: 85, recentAverage: 85, historicalAverage: 85, improvementRate: 0 },
      attendance: { overallAttendance: 95, recentAttendance: 95, attendanceTrend: 0, missedSessionStreak: 0, totalSessions: 50 },
      tasks: { completionRate: 100, overdueTasks: 0, totalTasks: 10 },
      goals: { progressPercentage: 50, totalMilestones: 4 }
    },
    deficits: [],
    tasks: [],
    resources: []
  };
}

test('Recommendation Engine - Overdue Task Prioritization', (t) => {
  const input = createMockInput();
  input.tasks = [
    { id: '1', title: 'Math Homework', dueDate: new Date(Date.now() - 86400000), isOverdue: true }, // 1 day ago
    { id: '2', title: 'Science Project', dueDate: new Date(Date.now() + 86400000), isOverdue: false } // 1 day from now
  ];
  
  const recs = RecommendationEngine.generate(input);
  
  assert.strictEqual(recs.length, 2);
  // Overdue task should be Priority 1
  assert.strictEqual(recs[0].title, 'Complete overdue task: Math Homework');
  assert.strictEqual(recs[0].priority, 1);
  
  // Imminent task should be Priority 2
  assert.strictEqual(recs[1].title, 'Start working on: Science Project');
  assert.strictEqual(recs[1].priority, 2);
});

test('Recommendation Engine - Academic Deficits with Resource Mapping', (t) => {
  const input = createMockInput();
  input.deficits = [
    { subjectId: 'cs101', subjectName: 'Intro to CS', averageScore: 45 }, // Failing (< 50)
    { subjectId: 'math101', subjectName: 'Calculus', averageScore: 55 } // Struggling (< 60)
  ];
  input.resources = [
    { subjectId: 'cs101', title: 'CS Basics', url: 'http://example.com/cs' }
  ];

  const recs = RecommendationEngine.generate(input);
  
  assert.strictEqual(recs.length, 2);
  
  // Failing CS should be Priority 1 and suggest the mapped resource
  const csRec = recs.find(r => r.relatedSubjectId === 'cs101');
  assert.ok(csRec);
  assert.strictEqual(csRec.priority, 1);
  assert.strictEqual(csRec.action, 'REVIEW_RESOURCE:http://example.com/cs');

  // Calculus should be Priority 2 and suggest mentor since no resource is mapped
  const mathRec = recs.find(r => r.relatedSubjectId === 'math101');
  assert.ok(mathRec);
  assert.strictEqual(mathRec.priority, 2);
  assert.strictEqual(mathRec.action, 'SCHEDULE_MENTOR_MEETING');
});

test('Recommendation Engine - Attendance Risk Escalation', (t) => {
  const input = createMockInput();
  input.analytics.attendance.missedSessionStreak = 3;
  input.analytics.attendance.overallAttendance = 70;

  const recs = RecommendationEngine.generate(input);
  assert.strictEqual(recs.length, 1);
  assert.strictEqual(recs[0].priority, 1);
  assert.strictEqual(recs[0].action, 'CONTACT_MENTOR');
});

test('Recommendation Engine - Priority Sorting & Effort Quick Wins', (t) => {
  const input = createMockInput();
  
  // Add a priority 1 attendance issue (Effort: 15m)
  input.analytics.attendance.overallAttendance = 60; 
  
  // Add a priority 1 overdue task (Effort: 60m)
  input.tasks = [
    { id: '1', title: 'Task', dueDate: new Date(Date.now() - 1000), isOverdue: true }
  ];

  const recs = RecommendationEngine.generate(input);
  
  // Both are Priority 1. The 15m effort should be sorted BEFORE the 60m effort (Quick Wins first)
  assert.strictEqual(recs[0].action, 'CONTACT_MENTOR');
  assert.strictEqual(recs[0].estimatedEffortMinutes, 15);
  
  assert.strictEqual(recs[1].action, 'SUBMIT_TASK');
  assert.strictEqual(recs[1].estimatedEffortMinutes, 60);
});
