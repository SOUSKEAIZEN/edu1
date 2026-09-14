"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskController = void 0;
const RiskScheduler_1 = require("../services/risk-engine/RiskScheduler");
const db_1 = require("../db");
class RiskController {
    static async triggerBatch(req, res) {
        try {
            // In production, this pushes to a queue. For MVP, we run sync/async inline.
            RiskScheduler_1.RiskScheduler.processAllStudents().catch(console.error);
            res.json({ message: 'Risk engine batch job triggered in background' });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async getStudentRisk(req, res) {
        try {
            const studentId = req.params.studentId;
            const riskRes = await (0, db_1.query)(`
        SELECT * FROM risk_snapshots 
        WHERE student_id = $1 
        ORDER BY snapshot_date DESC LIMIT 1
      `, [studentId]);
            if (riskRes.rows.length === 0)
                return res.json({ message: 'No risk profile computed yet' });
            res.json(riskRes.rows[0]);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}
exports.RiskController = RiskController;
