"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcesService = exports.ResourceSchema = void 0;
const db_1 = require("../db");
const zod_1 = require("zod");
exports.ResourceSchema = zod_1.z.object({
    subject_id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1),
    url: zod_1.z.string().url().optional(),
    type: zod_1.z.enum(['DOCUMENT', 'VIDEO', 'LINK', 'BOOK'])
});
class ResourcesService {
    static async addResource(data) {
        const res = await (0, db_1.query)(`INSERT INTO learning_resources (subject_id, title, url, type)
       VALUES ($1, $2, $3, $4) RETURNING *`, [data.subject_id, data.title, data.url || null, data.type]);
        return res.rows[0];
    }
    static async getResourcesForSubject(subjectId) {
        const res = await (0, db_1.query)(`SELECT * FROM learning_resources WHERE subject_id = $1 ORDER BY created_at DESC`, [subjectId]);
        return res.rows;
    }
}
exports.ResourcesService = ResourcesService;
