"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentorDashboardService = void 0;
const db_1 = require("../../db");
class MentorDashboardService {
    static async getDashboardMetrics(mentorUserId) {
        const profileRes = await (0, db_1.query)('SELECT id FROM mentor_profiles WHERE user_id = $1', [mentorUserId]);
        if (profileRes.rows.length === 0)
            throw new Error('Mentor profile not found');
        const mentorId = profileRes.rows[0].id;
        // Get basic stats
        const metricsRes = await (0, db_1.query)(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN rs.overall_risk_score > 70 THEN 1 END) as high_priority,
        COUNT(CASE WHEN rs.overall_risk_score > 40 AND rs.overall_risk_score <= 70 THEN 1 END) as requiring_attention
      FROM mentor_student_assignments msa
      JOIN student_profiles sp ON msa.student_id = sp.id
      LEFT JOIN LATERAL (
        SELECT overall_risk_score FROM risk_snapshots 
        WHERE student_id = sp.id ORDER BY snapshot_date DESC LIMIT 1
      ) rs ON true
      WHERE msa.mentor_id = $1 AND msa.unassigned_at IS NULL
    `, [mentorId]);
        // Get intervention follow-ups
        const followUpRes = await (0, db_1.query)(`
      SELECT COUNT(*) as pending_follow_ups
      FROM mentor_interventions mi
      WHERE mi.mentor_id = $1 AND mi.follow_up_date <= NOW() AND mi.status = 'PENDING'
    `, [mentorId]);
        return {
            totalStudents: parseInt(metricsRes.rows[0].total_students || '0'),
            highPriority: parseInt(metricsRes.rows[0].high_priority || '0'),
            requiringAttention: parseInt(metricsRes.rows[0].requiring_attention || '0'),
            pendingFollowUps: parseInt(followUpRes.rows[0].pending_follow_ups || '0')
        };
    }
    static async getStudentTable(mentorUserId) {
        const profileRes = await (0, db_1.query)('SELECT id FROM mentor_profiles WHERE user_id = $1', [mentorUserId]);
        const mentorId = profileRes.rows[0].id;
        const res = await (0, db_1.query)(`
      SELECT 
        sp.id as student_profile_id,
        u.first_name,
        u.last_name,
        sms.gpa as academic_trend,
        sms.attendance_rate as attendance,
        rs.overall_risk_score as risk_score,
        (SELECT MAX(created_at) FROM mentor_interventions WHERE student_id = sp.id AND mentor_id = $1) as last_interaction
      FROM mentor_student_assignments msa
      JOIN student_profiles sp ON msa.student_id = sp.id
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN LATERAL (
        SELECT gpa, attendance_rate FROM student_metric_snapshots 
        WHERE student_id = sp.id ORDER BY snapshot_date DESC LIMIT 1
      ) sms ON true
      LEFT JOIN LATERAL (
        SELECT overall_risk_score FROM risk_snapshots 
        WHERE student_id = sp.id ORDER BY snapshot_date DESC LIMIT 1
      ) rs ON true
      WHERE msa.mentor_id = $1 AND msa.unassigned_at IS NULL
      ORDER BY rs.overall_risk_score DESC NULLS LAST
    `, [mentorId]);
        return res.rows;
    }
}
exports.MentorDashboardService = MentorDashboardService;
