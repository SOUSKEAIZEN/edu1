import { query } from '../../db';

export class InterventionService {
  
  static async addNote(mentorUserId: string, studentProfileId: string, content: string, isPrivate: boolean = true) {
    await this.verifyAssignment(mentorUserId, studentProfileId);
    
    const res = await query(`
      INSERT INTO mentor_notes (mentor_id, student_id, content, is_private)
      VALUES (
        (SELECT id FROM mentor_profiles WHERE user_id = $1),
        $2, $3, $4
      ) RETURNING *
    `, [mentorUserId, studentProfileId, content, isPrivate]);
    return res.rows[0];
  }

  static async recordIntervention(
    mentorUserId: string, 
    studentProfileId: string, 
    type: 'MESSAGE' | 'NUDGE' | 'TASK' | 'MEETING',
    description: string,
    followUpDate?: string,
    expectedOutcome?: string
  ) {
    await this.verifyAssignment(mentorUserId, studentProfileId);

    const res = await query(`
      INSERT INTO mentor_interventions (mentor_id, student_id, type, description, follow_up_date, expected_outcome, status)
      VALUES (
        (SELECT id FROM mentor_profiles WHERE user_id = $1),
        $2, $3, $4, $5, $6, 'PENDING'
      ) RETURNING *
    `, [mentorUserId, studentProfileId, type, description, followUpDate || null, expectedOutcome || null]);

    // Audit log
    await query(`
      INSERT INTO system_audit_logs (user_id, action, resource, resource_id, ip_address)
      VALUES ($1, 'CREATE_INTERVENTION', 'STUDENT_PROFILE', $2, 'SYSTEM_INTERNAL')
    `, [mentorUserId, studentProfileId]);

    return res.rows[0];
  }

  static async updateOutcome(interventionId: string, mentorUserId: string, actualOutcome: string, status: 'SUCCESS' | 'FAILED' | 'PENDING') {
    const res = await query(`
      UPDATE mentor_interventions 
      SET actual_outcome = $1, status = $2, updated_at = NOW()
      WHERE id = $3 AND mentor_id = (SELECT id FROM mentor_profiles WHERE user_id = $4)
      RETURNING *
    `, [actualOutcome, status, interventionId, mentorUserId]);
    
    if (res.rows.length === 0) throw new Error('Intervention not found or unauthorized');
    return res.rows[0];
  }

  private static async verifyAssignment(mentorUserId: string, studentProfileId: string) {
    const assignRes = await query(`
      SELECT msa.id FROM mentor_student_assignments msa
      JOIN mentor_profiles mp ON msa.mentor_id = mp.id
      WHERE mp.user_id = $1 AND msa.student_id = $2 AND msa.unassigned_at IS NULL
    `, [mentorUserId, studentProfileId]);
    
    if (assignRes.rows.length === 0) throw new Error('Unauthorized profile access');
  }
}
