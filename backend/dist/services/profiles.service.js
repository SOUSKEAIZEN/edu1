"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilesService = void 0;
const db_1 = require("../db");
class ProfilesService {
    static async getStudentProfile(studentUserId) {
        const res = await (0, db_1.query)(`
      SELECT sp.*, u.first_name, u.last_name, u.email, p.name as program_name
      FROM student_profiles sp
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN programs p ON sp.program_id = p.id
      WHERE u.id = $1
    `, [studentUserId]);
        if (res.rows.length === 0)
            throw new Error('Profile not found');
        return res.rows[0];
    }
    static async getMentorAssignedStudents(mentorUserId) {
        const res = await (0, db_1.query)(`
      SELECT sp.id as student_profile_id, u.id as student_user_id, u.first_name, u.last_name, u.email
      FROM mentor_student_assignments msa
      JOIN mentor_profiles mp ON msa.mentor_id = mp.id
      JOIN student_profiles sp ON msa.student_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE mp.user_id = $1 AND msa.unassigned_at IS NULL
    `, [mentorUserId]);
        return res.rows;
    }
}
exports.ProfilesService = ProfilesService;
