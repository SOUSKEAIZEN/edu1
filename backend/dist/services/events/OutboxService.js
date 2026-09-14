"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxService = void 0;
const db_1 = require("../../db");
class OutboxService {
    /**
     * Ensure outbox_events table exists. Usually done in migrations.
     */
    static async init() {
        await (0, db_1.query)(`
      CREATE TABLE IF NOT EXISTS outbox_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        payload JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP WITH TIME ZONE
      )
    `);
    }
    /**
     * Dispatch an event transactionally
     */
    static async dispatchEvent(client, type, payload) {
        await client.query(`INSERT INTO outbox_events (type, payload) VALUES ($1, $2)`, [type, JSON.stringify(payload)]);
    }
}
exports.OutboxService = OutboxService;
