"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicService = exports.RecordMarkSchema = exports.CreateAssessmentSchema = void 0;
const db_1 = require("../db");
const zod_1 = require("zod");
// Validations
exports.CreateAssessmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    type: zod_1.z.enum(['EXAM', 'ASSIGNMENT', 'QUIZ', 'PROJECT']),
    max_marks: zod_1.z.number().positive(),
    weightage: zod_1.z.number().min(0).max(100),
    due_date: zod_1.z.string().optional()
});
exports.RecordMarkSchema = zod_1.z.object({
    enrollment_id: zod_1.z.string().uuid(),
    marks_obtained: zod_1.z.number().min(0),
    feedback: zod_1.z.string().optional()
});
class AcademicService {
    // --- SUBJECTS & ENROLLMENTS ---
    static async getStudentSubjects(studentUserId, semesterId) {
        let sql = `
      SELECT s.id as subject_id, s.code, s.name, s.credits, so.id as offering_id, e.id as enrollment_id, sem.name as semester_name
      FROM enrollments e
      JOIN subject_offerings so ON e.offering_id = so.id
      JOIN subjects s ON so.subject_id = s.id
      JOIN semesters sem ON so.semester_id = sem.id
      JOIN student_profiles sp ON e.student_id = sp.id
      WHERE sp.user_id = $1
    `;
        const params = [studentUserId];
        if (semesterId) {
            sql += ` AND so.semester_id = $2`;
            params.push(semesterId);
        }
        const res = await (0, db_1.query)(sql, params);
        return res.rows;
    }
    // --- ASSESSMENTS & MARKS ---
    static async createAssessment(offeringId, data) {
        const res = await (0, db_1.query)(`INSERT INTO assessments (offering_id, name, type, max_marks, weightage, due_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [offeringId, data.name, data.type, data.max_marks, data.weightage, data.due_date || null]);
        return res.rows[0];
    }
    static async recordMark(assessmentId, data) {
        // Validate marks do not exceed max_marks (handled by DB trigger, but we validate here for clean errors)
        const assessRes = await (0, db_1.query)('SELECT max_marks FROM assessments WHERE id = $1', [assessmentId]);
        if (assessRes.rows.length === 0)
            throw new Error('Assessment not found');
        if (data.marks_obtained > assessRes.rows[0].max_marks)
            throw new Error('Marks cannot exceed maximum marks');
        const res = await (0, db_1.query)(`INSERT INTO assessment_results (assessment_id, enrollment_id, marks_obtained, feedback)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (assessment_id, enrollment_id) 
       DO UPDATE SET marks_obtained = $3, feedback = $4, updated_at = NOW()
       RETURNING *`, [assessmentId, data.enrollment_id, data.marks_obtained, data.feedback || null]);
        // Audit log (assuming user triggering this is logged in controller, but for now system log)
        await (0, db_1.query)(`
      INSERT INTO system_audit_logs (user_id, action, resource, resource_id, ip_address)
      VALUES ($1, 'UPDATE_MARK', 'ASSESSMENT_RESULT', $2, 'SYSTEM_INTERNAL')
    `, [data.enrollment_id, res.rows[0].id]);
        return res.rows[0];
    }
    static async getStudentMarks(studentUserId, offeringId) {
        const res = await (0, db_1.query)(`SELECT a.name, a.max_marks, a.weightage, ar.marks_obtained, ar.feedback,
        ROUND((ar.marks_obtained / a.max_marks) * 100, 2) as percentage
       FROM assessment_results ar
       JOIN assessments a ON ar.assessment_id = a.id
       JOIN enrollments e ON ar.enrollment_id = e.id
       JOIN student_profiles sp ON e.student_id = sp.id
       WHERE sp.user_id = $1 AND a.offering_id = $2`, [studentUserId, offeringId]);
        return res.rows;
    }
}
exports.AcademicService = AcademicService;
