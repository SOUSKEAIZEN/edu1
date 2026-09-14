"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskScheduler = void 0;
const db_1 = require("../../db");
const analytics_service_1 = require("../analytics.service");
const RiskCalculator_1 = require("./RiskCalculator");
const RiskRules_1 = require("./RiskRules");
/**
 * Designed to be executed via a standard job worker (e.g. BullMQ, Celery equivalent)
 * Currently exposes a processAllStudents() method which can be called by a cron
 * or manually triggered by an admin.
 */
class RiskScheduler {
    static async processAllStudents() {
        console.log('[RiskScheduler] Starting background risk calculation job...');
        const studentsRes = await (0, db_1.query)('SELECT id, user_id FROM student_profiles WHERE status = $1', ['ACTIVE']);
        const students = studentsRes.rows;
        let processed = 0;
        let failed = 0;
        for (const student of students) {
            try {
                // Fetch raw analytics deterministic data
                const analyticsData = await analytics_service_1.AnalyticsService.getStudentAnalytics(student.user_id);
                // Calculate risk
                const riskProfile = RiskCalculator_1.RiskCalculator.calculate(analyticsData, RiskRules_1.defaultRulesV1, 'v1');
                // Persist to materialized snapshot table
                await this.persistRiskSnapshot(student.id, riskProfile);
                processed++;
            }
            catch (error) {
                console.error(`[RiskScheduler] Failed to process student ${student.id}:`, error);
                failed++;
            }
        }
        console.log(`[RiskScheduler] Job completed. Processed: ${processed}, Failed: ${failed}`);
        return { processed, failed };
    }
    static async persistRiskSnapshot(studentProfileId, riskProfile) {
        const today = new Date().toISOString().split('T')[0];
        await (0, db_1.query)(`
      INSERT INTO risk_snapshots 
      (student_id, overall_risk_score, academic_risk, attendance_risk, engagement_risk, confidence_score, contributing_factors, snapshot_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (student_id, snapshot_date) 
      DO UPDATE SET 
        overall_risk_score = $2,
        academic_risk = $3,
        attendance_risk = $4,
        engagement_risk = $5,
        confidence_score = $6,
        contributing_factors = $7,
        created_at = NOW()
    `, [
            studentProfileId,
            riskProfile.overallScore,
            riskProfile.dimensionScores.academic,
            riskProfile.dimensionScores.attendance,
            riskProfile.dimensionScores.engagement,
            riskProfile.confidence,
            JSON.stringify(riskProfile.factors),
            today
        ]);
    }
}
exports.RiskScheduler = RiskScheduler;
