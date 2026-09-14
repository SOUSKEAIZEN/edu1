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
exports.NotificationWorker = void 0;
const db_1 = require("../../db");
const EmailProvider_1 = require("./EmailProvider");
class NotificationWorker {
    emailProvider;
    constructor(provider) {
        this.emailProvider = provider || new EmailProvider_1.DevelopmentEmailProvider();
    }
    async processOutbox() {
        // 1. Fetch pending events (limit to prevent memory overload)
        // Using FOR UPDATE SKIP LOCKED for concurrent worker safety
        const client = await (await Promise.resolve().then(() => __importStar(require('../../db')))).getClient();
        try {
            await client.query('BEGIN');
            const res = await client.query(`
        SELECT * FROM outbox_events 
        WHERE status = 'PENDING' 
        ORDER BY created_at ASC 
        LIMIT 50 
        FOR UPDATE SKIP LOCKED
      `);
            const events = res.rows;
            if (events.length === 0) {
                await client.query('ROLLBACK');
                return 0;
            }
            for (const event of events) {
                try {
                    await this.handleEvent(event.type, event.payload);
                    await client.query(`UPDATE outbox_events SET status = 'COMPLETED', processed_at = NOW() WHERE id = $1`, [event.id]);
                }
                catch (error) {
                    console.error(`[Worker] Failed event ${event.id}:`, error.message);
                    await client.query(`UPDATE outbox_events SET status = 'FAILED' WHERE id = $1`, [event.id]);
                }
            }
            await client.query('COMMIT');
            return events.length;
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async handleEvent(type, payload) {
        // Basic routing logic
        if (type === 'ATTENDANCE_CONCERN') {
            await this.emailProvider.sendEmail({
                to: payload.studentEmail,
                subject: 'Attendance Concern',
                body: `Your attendance has dropped. Please review.`
            });
            // We would also insert an IN_APP notification here securely
            await (0, db_1.query)(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, $2, $3, $4)
      `, [payload.studentUserId, 'Attendance Concern', 'Your attendance requires attention.', type]);
        }
        // Handle other types...
    }
}
exports.NotificationWorker = NotificationWorker;
