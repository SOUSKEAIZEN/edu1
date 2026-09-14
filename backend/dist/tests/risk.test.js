"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const RiskCalculator_1 = require("../services/risk-engine/RiskCalculator");
const RiskRules_1 = require("../services/risk-engine/RiskRules");
function createMockData(overrides) {
    return {
        academic: { overallAverage: 85, recentAverage: 85, historicalAverage: 85, improvementRate: 0 },
        attendance: { overallAttendance: 95, recentAttendance: 95, attendanceTrend: 0, missedSessionStreak: 0, totalSessions: 50 },
        tasks: { completionRate: 100, overdueTasks: 0, totalTasks: 10 },
        goals: { progressPercentage: 50, totalMilestones: 4 },
        ...overrides
    };
}
(0, node_test_1.test)('Risk Engine - Stable Student', (t) => {
    const data = createMockData({});
    const risk = RiskCalculator_1.RiskCalculator.calculate(data, RiskRules_1.defaultRulesV1);
    node_assert_1.default.strictEqual(risk.level, 'STABLE');
    node_assert_1.default.strictEqual(risk.factors.length, 0);
    node_assert_1.default.strictEqual(risk.confidence, 1.0);
});
(0, node_test_1.test)('Risk Engine - Declining Student (Academic)', (t) => {
    const data = createMockData({
        academic: { overallAverage: 60, recentAverage: 40, historicalAverage: 80, improvementRate: -40 }
    });
    const risk = RiskCalculator_1.RiskCalculator.calculate(data, RiskRules_1.defaultRulesV1);
    node_assert_1.default.ok(risk.overallScore >= 15); // Should trigger at least Monitor or Attention
    node_assert_1.default.ok(risk.factors.some(f => f.description.includes('Sudden academic drop')));
});
(0, node_test_1.test)('Risk Engine - Missing/Sparse Data', (t) => {
    const data = createMockData({
        academic: { overallAverage: null, recentAverage: null, historicalAverage: null, improvementRate: 0 },
        goals: { progressPercentage: 0, totalMilestones: 0 },
        attendance: { overallAttendance: 100, recentAttendance: 100, attendanceTrend: 0, missedSessionStreak: 0, totalSessions: 0 }
    });
    const risk = RiskCalculator_1.RiskCalculator.calculate(data, RiskRules_1.defaultRulesV1);
    node_assert_1.default.ok(risk.confidence < 0.6); // Penalized heavily for missing academic and goal data
});
(0, node_test_1.test)('Risk Engine - Sudden Attendance Drop', (t) => {
    const data = createMockData({
        attendance: { overallAttendance: 90, recentAttendance: 60, attendanceTrend: -30, missedSessionStreak: 4, totalSessions: 30 }
    });
    const risk = RiskCalculator_1.RiskCalculator.calculate(data, RiskRules_1.defaultRulesV1);
    node_assert_1.default.ok(risk.factors.some(f => f.type === 'ATTENDANCE' && f.severity === 'HIGH'));
    node_assert_1.default.ok(risk.factors.some(f => f.type === 'ATTENDANCE' && f.severity === 'MEDIUM')); // Streak
});
(0, node_test_1.test)('Risk Engine - Conflicting Indicators (High Academic, Poor Attendance & Overdue tasks)', (t) => {
    const data = createMockData({
        academic: { overallAverage: 95, recentAverage: 98, historicalAverage: 92, improvementRate: 6 },
        attendance: { overallAttendance: 65, recentAttendance: 65, attendanceTrend: 0, missedSessionStreak: 0, totalSessions: 20 },
        tasks: { completionRate: 50, overdueTasks: 5, totalTasks: 10 }
    });
    const risk = RiskCalculator_1.RiskCalculator.calculate(data, RiskRules_1.defaultRulesV1);
    node_assert_1.default.ok(risk.factors.some(f => f.type === 'ATTENDANCE'));
    node_assert_1.default.ok(risk.factors.some(f => f.type === 'DEADLINE'));
    // Score should be elevated despite good academics
    node_assert_1.default.ok(risk.overallScore >= 18);
});
