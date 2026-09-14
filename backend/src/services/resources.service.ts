import { query } from '../db';
import { z } from 'zod';

export const ResourceSchema = z.object({
  subject_id: z.string().uuid(),
  title: z.string().min(1),
  url: z.string().url().optional(),
  type: z.enum(['DOCUMENT', 'VIDEO', 'LINK', 'BOOK'])
});

export class ResourcesService {
  static async addResource(data: z.infer<typeof ResourceSchema>) {
    const res = await query(
      `INSERT INTO learning_resources (subject_id, title, url, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.subject_id, data.title, data.url || null, data.type]
    );
    return res.rows[0];
  }

  static async getResourcesForSubject(subjectId: string) {
    const res = await query(
      `SELECT * FROM learning_resources WHERE subject_id = $1 ORDER BY created_at DESC`,
      [subjectId]
    );
    return res.rows;
  }
}
