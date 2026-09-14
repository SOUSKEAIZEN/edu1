"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const ContextBuilder_1 = require("../services/ai/ContextBuilder");
const analytics_service_1 = require("../services/analytics.service");
(0, node_test_1.test)('AI Context Engine - Intent Detection', (t) => {
    node_assert_1.default.strictEqual(ContextBuilder_1.ContextBuilder.detectIntent("Why are my marks dropping?"), 'ACADEMIC_QUERY');
    node_assert_1.default.strictEqual(ContextBuilder_1.ContextBuilder.detectIntent("What is my current GPA?"), 'ACADEMIC_QUERY');
    node_assert_1.default.strictEqual(ContextBuilder_1.ContextBuilder.detectIntent("How many classes was I absent for?"), 'ATTENDANCE_QUERY');
    node_assert_1.default.strictEqual(ContextBuilder_1.ContextBuilder.detectIntent("What homework is due tomorrow?"), 'TASK_QUERY');
    node_assert_1.default.strictEqual(ContextBuilder_1.ContextBuilder.detectIntent("How do I stay motivated?"), 'GENERAL_MENTORING');
});
(0, node_test_1.test)('AI Context Engine - Context Slicing', async (t) => {
    // Mock AnalyticsService.getStudentAnalytics
    node_test_1.mock.method(analytics_service_1.AnalyticsService, 'getStudentAnalytics', async () => {
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
    const academicContext = await ContextBuilder_1.ContextBuilder.buildContext('user-uuid-1', "Why are my marks dropping?");
    const types = academicContext.map(c => c.type);
    node_assert_1.default.ok(types.includes('ACADEMIC_PERFORMANCE'));
    node_assert_1.default.ok(types.includes('ACADEMIC_RISK'));
    node_assert_1.default.ok(types.includes('GOALS'));
    node_assert_1.default.strictEqual(types.includes('ATTENDANCE_RECORD'), false);
    node_assert_1.default.strictEqual(types.includes('TASK_BACKLOG'), false);
    // Verify Metadata exists
    node_assert_1.default.strictEqual(academicContext[0].metadata.source, 'AnalyticsEngine.Academic');
    node_assert_1.default.strictEqual(typeof academicContext[0].metadata.freshnessMinutes, 'number');
    // Restore mock
    node_test_1.mock.restoreAll();
});
