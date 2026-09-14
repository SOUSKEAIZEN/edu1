import { test, mock } from 'node:test';
import assert from 'node:assert';
import { ContextBuilder } from '../services/ai/ContextBuilder';
import { AnalyticsService } from '../services/analytics.service';

test('AI Context Engine - Intent Detection', (t) => {
  assert.strictEqual(ContextBuilder.detectIntent("Why are my marks dropping?"), 'ACADEMIC_QUERY');
  assert.strictEqual(ContextBuilder.detectIntent("What is my current GPA?"), 'ACADEMIC_QUERY');
  assert.strictEqual(ContextBuilder.detectIntent("How many classes was I absent for?"), 'ATTENDANCE_QUERY');
  assert.strictEqual(ContextBuilder.detectIntent("What homework is due tomorrow?"), 'TASK_QUERY');
  assert.strictEqual(ContextBuilder.detectIntent("How do I stay motivated?"), 'GENERAL_MENTORING');
});

test('AI Context Engine - Context Slicing', async (t) => {
  // Mock AnalyticsService.getStudentAnalytics
  mock.method(AnalyticsService, 'getStudentAnalytics', async () => {
    return {
      academic: { overallAverage: 80, recentAverage: 75, historicalAverage: 82, improvementRate: -7 },
      attendance: { overallAttendance: 90, recentAttendance: 90, attendanceTrend: 0, missedSessionStreak: 0, totalSessions: 10 },
      tasks: { completionRate: 100, overdueTasks: 0, totalTasks: 5 },
      goals: { progressPercentage: 50, totalMilestones: 2 },
      calculated_at: new Date().toISOString()
    };
  });

  // Query: "Why are my marks dropping?" -> Intent: ACADEMIC_QUERY
  // Should include ACADEMIC_PERFORMANCE, ACADEMIC_RISK, GOALS. 
  // Should NOT include ATTENDANCE_RECORD or TASK_BACKLOG.
  const academicContext = await ContextBuilder.buildContext('user-uuid-1', "Why are my marks dropping?");
  
  const types = academicContext.map(c => c.type);
  assert.ok(types.includes('ACADEMIC_PERFORMANCE'));
  assert.ok(types.includes('ACADEMIC_RISK'));
  assert.ok(types.includes('GOALS'));
  
  assert.strictEqual(types.includes('ATTENDANCE_RECORD'), false);
  assert.strictEqual(types.includes('TASK_BACKLOG'), false);
  
  // Verify Metadata exists
  assert.strictEqual(academicContext[0].metadata.source, 'AnalyticsEngine.Academic');
  assert.strictEqual(typeof academicContext[0].metadata.freshnessMinutes, 'number');

  // Restore mock
  mock.restoreAll();
});
