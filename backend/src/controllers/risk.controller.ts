import { Request, Response } from 'express';
import { RiskScheduler } from '../services/risk-engine/RiskScheduler';
import { query } from '../db';

export class RiskController {
  static async triggerBatch(req: Request, res: Response) {
    try {
      // In production, this pushes to a queue. For MVP, we run sync/async inline.
      RiskScheduler.processAllStudents().catch(console.error);
      res.json({ message: 'Risk engine batch job triggered in background' });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async getStudentRisk(req: Request, res: Response) {
    try {
      const studentId = req.params.studentId as string;
      const riskRes = await query(`
        SELECT * FROM risk_snapshots 
        WHERE student_id = $1 
        ORDER BY snapshot_date DESC LIMIT 1
      `, [studentId]);

      if (riskRes.rows.length === 0) return res.json({ message: 'No risk profile computed yet' });
      res.json(riskRes.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }
}
