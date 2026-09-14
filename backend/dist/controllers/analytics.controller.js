"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
const db_1 = require("../db");
class AnalyticsController {
    static async getMyAnalytics(req, res) {
        try {
            const userId = req.user.user_id;
            const analytics = await analytics_service_1.AnalyticsService.getStudentAnalytics(userId);
            res.json(analytics);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async getStudentAnalyticsForMentor(req, res) {
        try {
            const mentorUserId = req.user.user_id;
            const targetStudentProfileId = req.params.studentId;
            // Verify Mentor is assigned to this student
            const assignRes = await (0, db_1.query)(`
        SELECT msa.id 
        FROM mentor_student_assignments msa
        JOIN mentor_profiles mp ON msa.mentor_id = mp.id
        WHERE mp.user_id = $1 AND msa.student_id = $2 AND msa.unassigned_at IS NULL
      `, [mentorUserId, targetStudentProfileId]);
            if (assignRes.rows.length === 0) {
                return res.status(403).json({ error: 'Unauthorized: Student not assigned to you' });
            }
            const analytics = await analytics_service_1.AnalyticsService.getStudentAnalyticsByProfileId(targetStudentProfileId);
            res.json(analytics);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}
exports.AnalyticsController = AnalyticsController;
