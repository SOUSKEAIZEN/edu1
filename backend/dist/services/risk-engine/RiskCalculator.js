"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskCalculator = void 0;
class RiskCalculator {
    static calculate(data, rules, version = 'v1') {
        let overallScore = 0;
        const factors = [];
        let confidence = 1.0;
        const dimensions = {
            academic: 0,
            attendance: 0,
            engagement: 0,
            deadline: 0,
            goal: 0
        };
        // 1. Academic Risk
        if (data.academic.overallAverage === null) {
            confidence -= 0.3; // Sparse data penalty
        }
        else {
            if (data.academic.overallAverage < rules.academic.minimumPassingAverage) {
                dimensions.academic += 40;
                factors.push({
                    type: 'ACADEMIC',
                    description: `Overall average (${data.academic.overallAverage}%) is below institutional minimum (${rules.academic.minimumPassingAverage}%)`,
                    severity: 'HIGH'
                });
            }
            if (data.academic.improvementRate <= -rules.academic.suddenDropThreshold) {
                dimensions.academic += 30;
                factors.push({
                    type: 'ACADEMIC',
                    description: `Sudden academic drop detected: ${Math.abs(data.academic.improvementRate)}% decline`,
                    severity: 'HIGH'
                });
            }
            else if (data.academic.improvementRate < 0) {
                dimensions.academic += 10;
                factors.push({
                    type: 'ACADEMIC',
                    description: `Gradual academic decline: ${Math.abs(data.academic.improvementRate)}% drop`,
                    severity: 'MEDIUM'
                });
            }
        }
        // 2. Attendance Risk
        if (data.attendance.totalSessions === 0 && data.attendance.overallAttendance === 100) {
            confidence -= 0.2;
        }
        else {
            if (data.attendance.overallAttendance < rules.attendance.institutionalMinimum) {
                dimensions.attendance += 40;
                factors.push({
                    type: 'ATTENDANCE',
                    description: `Attendance (${data.attendance.overallAttendance}%) is below threshold (${rules.attendance.institutionalMinimum}%)`,
                    severity: 'HIGH'
                });
            }
            if (data.attendance.attendanceTrend <= -rules.attendance.suddenDropThreshold) {
                dimensions.attendance += 30;
                factors.push({
                    type: 'ATTENDANCE',
                    description: `Attendance velocity dropped significantly by ${Math.abs(data.attendance.attendanceTrend)}%`,
                    severity: 'HIGH'
                });
            }
            if (data.attendance.missedSessionStreak >= 3) {
                dimensions.attendance += 20;
                factors.push({
                    type: 'ATTENDANCE',
                    description: `Consecutive missed session streak: ${data.attendance.missedSessionStreak}`,
                    severity: 'MEDIUM'
                });
            }
        }
        // 3. Deadline Risk
        if (data.tasks.overdueTasks >= rules.deadlines.maxOverdueAllowed) {
            dimensions.deadline += 25;
            factors.push({
                type: 'DEADLINE',
                description: `Student has ${data.tasks.overdueTasks} overdue tasks`,
                severity: 'MEDIUM'
            });
        }
        // 4. Goal Risk
        if (data.goals.totalMilestones > 0 && data.goals.progressPercentage < rules.goals.minimumProgressExpected) {
            dimensions.goal += 15;
            factors.push({
                type: 'GOAL',
                description: `Goal progress is critically low (${data.goals.progressPercentage}%)`,
                severity: 'LOW'
            });
        }
        else if (data.goals.totalMilestones === 0) {
            confidence -= 0.1;
            dimensions.engagement += 10;
        }
        // 5. Aggregate Risk
        overallScore = (dimensions.academic * 0.4) + (dimensions.attendance * 0.3) + (dimensions.deadline * 0.15) + (dimensions.goal * 0.1) + (dimensions.engagement * 0.05);
        // Normalize overallScore out of 100
        overallScore = Math.min(100, Math.max(0, overallScore * (1 / 0.8))); // Roughly scaled
        let level = 'STABLE';
        if (overallScore > 70)
            level = 'CRITICAL';
        else if (overallScore > 40)
            level = 'ATTENTION';
        else if (overallScore > 20)
            level = 'MONITOR';
        return {
            overallScore: Number(overallScore.toFixed(2)),
            level,
            dimensionScores: dimensions,
            confidence: Number(Math.max(0, confidence).toFixed(2)),
            factors,
            rules_version: version,
            calculated_at: new Date().toISOString()
        };
    }
}
exports.RiskCalculator = RiskCalculator;
