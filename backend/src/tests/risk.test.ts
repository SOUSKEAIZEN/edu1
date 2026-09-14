import { test } from 'node:test';
import assert from 'node:assert';
import { RiskCalculator, AnalyticsData } from '../services/risk-engine/RiskCalculator';
import { defaultRulesV1 } from '../services/risk-engine/RiskRules';

function createMockData(overrides: Partial<AnalyticsData>): AnalyticsData {
  return {
    academic: { overallAverage: 85, recentAverage: 85, historicalAverage: 85, improvementRate: 0 },
    attendance: { overallAttendance: 95, recentAttendance: 95, attendanceTrend: 0, missedSessionStreak: 0, totalSessions: 50 },
    tasks: { completionRate: 100, overdueTasks: 0, totalTasks: 10 },
    goals: { progressPercentage: 50, totalMilestones: 4 },
    ...overrides
  };
}

test('Risk Engine - Stable Student', (t) => {
  const data = createMockData({});
  const risk = RiskCalculator.calculate(data, defaultRulesV1);
  assert.strictEqual(risk.level, 'STABLE');
  assert.strictEqual(risk.factors.length, 0);
  assert.strictEqual(risk.confidence, 1.0);
});

test('Risk Engine - Declining Student (Academic)', (t) => {
  const data = createMockData({
    academic: { overallAverage: 60, recentAverage: 40, historicalAverage: 80, improvementRate: -40 }
  });
  const risk = RiskCalculator.calculate(data, defaultRulesV1);
  assert.ok(risk.overallScore >= 15); // Should trigger at least Monitor or Attention
  assert.ok(risk.factors.some(f => f.description.includes('Sudden academic drop')));
});

test('Risk Engine - Missing/Sparse Data', (t) => {
  const data = createMockData({
    academic: { overallAverage: null, recentAverage: null, historicalAverage: null, improvementRate: 0 },
    goals: { progressPercentage: 0, totalMilestones: 0 },
    attendance: { overallAttendance: 100, recentAttendance: 100, attendanceTrend: 0, missedSessionStreak: 0, totalSessions: 0 }
  });
  const risk = RiskCalculator.calculate(data, defaultRulesV1);
  assert.ok(risk.confidence < 0.6); // Penalized heavily for missing academic and goal data
});

test('Risk Engine - Sudden Attendance Drop', (t) => {
  const data = createMockData({
    attendance: { overallAttendance: 90, recentAttendance: 60, attendanceTrend: -30, missedSessionStreak: 4, totalSessions: 30 }
  });
  const risk = RiskCalculator.calculate(data, defaultRulesV1);
  assert.ok(risk.factors.some(f => f.type === 'ATTENDANCE' && f.severity === 'HIGH'));
  assert.ok(risk.factors.some(f => f.type === 'ATTENDANCE' && f.severity === 'MEDIUM')); // Streak
});

test('Risk Engine - Conflicting Indicators (High Academic, Poor Attendance & Overdue tasks)', (t) => {
  const data = createMockData({
    academic: { overallAverage: 95, recentAverage: 98, historicalAverage: 92, improvementRate: 6 },
    attendance: { overallAttendance: 65, recentAttendance: 65, attendanceTrend: 0, missedSessionStreak: 0, totalSessions: 20 },
    tasks: { completionRate: 50, overdueTasks: 5, totalTasks: 10 }
  });
  const risk = RiskCalculator.calculate(data, defaultRulesV1);
  assert.ok(risk.factors.some(f => f.type === 'ATTENDANCE'));
  assert.ok(risk.factors.some(f => f.type === 'DEADLINE'));
  // Score should be elevated despite good academics
  assert.ok(risk.overallScore >= 18);
});
