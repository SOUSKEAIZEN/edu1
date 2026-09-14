import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { query } from '../db';

export class AnalyticsController {
  static async getMyAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const analytics = await AnalyticsService.getStudentAnalytics(userId);
      res.json(analytics);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async getStudentAnalyticsForMentor(req: Request, res: Response) {
    try {
      const mentorUserId = (req as any).user.user_id;
      const targetStudentProfileId = req.params.studentId as string;

      // Verify Mentor is assigned to this student
      const assignRes = await query(`
        SELECT msa.id 
        FROM mentor_student_assignments msa
        JOIN mentor_profiles mp ON msa.mentor_id = mp.id
        WHERE mp.user_id = $1 AND msa.student_id = $2 AND msa.unassigned_at IS NULL
      `, [mentorUserId, targetStudentProfileId]);

      if (assignRes.rows.length === 0) {
        return res.status(403).json({ error: 'Unauthorized: Student not assigned to you' });
      }

      const analytics = await AnalyticsService.getStudentAnalyticsByProfileId(targetStudentProfileId);
      res.json(analytics);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }
}
