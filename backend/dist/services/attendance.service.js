"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = exports.RecordAttendanceSchema = void 0;
const db_1 = require("../db");
const zod_1 = require("zod");
exports.RecordAttendanceSchema = zod_1.z.object({
    enrollment_id: zod_1.z.string().uuid(),
    status: zod_1.z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    notes: zod_1.z.string().optional()
});
class AttendanceService {
    static async recordAttendance(sessionId, records) {
        // In production, we'd use a transaction or pg-format for bulk insert. For MVP, loop with transaction.
        const client = await (await Promise.resolve().then(() => __importStar(require('../db')))).getClient();
        try {
            await client.query('BEGIN');
            for (const rec of records) {
                await client.query(`INSERT INTO attendance_records (session_id, enrollment_id, status, notes)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (session_id, enrollment_id) 
           DO UPDATE SET status = $3, notes = $4, updated_at = NOW()`, [sessionId, rec.enrollment_id, rec.status, rec.notes || null]);
            }
            // Audit log
            await client.query(`
        INSERT INTO system_audit_logs (user_id, action, resource, resource_id, ip_address)
        VALUES ($1, 'BULK_UPDATE_ATTENDANCE', 'ATTENDANCE_SESSION', $2, 'SYSTEM_INTERNAL')
      `, [sessionId, sessionId]);
            await client.query('COMMIT');
            return { success: true };
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    }
    static async getStudentAttendanceTrend(studentUserId, offeringId) {
        let sql = `
      SELECT ar.status, COUNT(ar.id) as count
      FROM attendance_records ar
      JOIN attendance_sessions asess ON ar.session_id = asess.id
      JOIN enrollments e ON ar.enrollment_id = e.id
      JOIN student_profiles sp ON e.student_id = sp.id
      WHERE sp.user_id = $1
    `;
        const params = [studentUserId];
        if (offeringId) {
            sql += ` AND asess.offering_id = $2`;
            params.push(offeringId);
        }
        sql += ` GROUP BY ar.status`;
        const res = await (0, db_1.query)(sql, params);
        let total = 0;
        let present = 0;
        const stats = res.rows.map(r => {
            const c = parseInt(r.count, 10);
            total += c;
            if (r.status === 'PRESENT' || r.status === 'LATE')
                present += c;
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
exports.AttendanceService = AttendanceService;
