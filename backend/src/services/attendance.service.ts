import { query } from '../db';
import { z } from 'zod';

export const RecordAttendanceSchema = z.object({
  enrollment_id: z.string().uuid(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  notes: z.string().optional()
});

export class AttendanceService {
  
  static async recordAttendance(sessionId: string, records: z.infer<typeof RecordAttendanceSchema>[]) {
    // In production, we'd use a transaction or pg-format for bulk insert. For MVP, loop with transaction.
    const client = await (await import('../db')).getClient();
    try {
      await client.query('BEGIN');
      for (const rec of records) {
        await client.query(
          `INSERT INTO attendance_records (session_id, enrollment_id, status, notes)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (session_id, enrollment_id) 
           DO UPDATE SET status = $3, notes = $4, updated_at = NOW()`,
          [sessionId, rec.enrollment_id, rec.status, rec.notes || null]
        );
      }
      // Audit log
      await client.query(`
        INSERT INTO system_audit_logs (user_id, action, resource, resource_id, ip_address)
        VALUES ($1, 'BULK_UPDATE_ATTENDANCE', 'ATTENDANCE_SESSION', $2, 'SYSTEM_INTERNAL')
      `, [sessionId, sessionId]);
      await client.query('COMMIT');
      return { success: true };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async getStudentAttendanceTrend(studentUserId: string, offeringId?: string) {
    let sql = `
      SELECT ar.status, COUNT(ar.id) as count
      FROM attendance_records ar
      JOIN attendance_sessions asess ON ar.session_id = asess.id
      JOIN enrollments e ON ar.enrollment_id = e.id
      JOIN student_profiles sp ON e.student_id = sp.id
      WHERE sp.user_id = $1
    `;
    const params: any[] = [studentUserId];
    if (offeringId) {
      sql += ` AND asess.offering_id = $2`;
      params.push(offeringId);
    }
    sql += ` GROUP BY ar.status`;
    
    const res = await query(sql, params);
    
    let total = 0;
    let present = 0;
    const stats = res.rows.map(r => {
      const c = parseInt(r.count, 10);
      total += c;
      if (r.status === 'PRESENT' || r.status === 'LATE') present += c;
      return { status: r.status, count: c };
    });
    
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
    
    return {
      stats,
      total_sessions: total,
      attendance_percentage: Number(percentage)
    };
  }
}
