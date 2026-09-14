import { query } from '../db';
import { z } from 'zod';

export const TaskSchema = z.object({
  assignee_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: z.string().optional(),
});

export const GoalSchema = z.object({
  student_user_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  target_date: z.string().optional(),
});

export class TasksGoalsService {
  
  // --- TASKS ---
  
  static async createTask(creatorId: string, data: z.infer<typeof TaskSchema>) {
    const res = await query(
      `INSERT INTO tasks (creator_id, assignee_id, title, description, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [creatorId, data.assignee_id, data.title, data.description || null, data.due_date || null]
    );
    return res.rows[0];
  }

  static async submitTask(taskId: string, content: string) {
    const res = await query(
      `INSERT INTO task_submissions (task_id, content) VALUES ($1, $2) RETURNING *`,
      [taskId, content]
    );
    await query(`UPDATE tasks SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1`, [taskId]);
    return res.rows[0];
  }

  static async getTasksForUser(userId: string) {
    const res = await query(`SELECT * FROM tasks WHERE assignee_id = $1 ORDER BY due_date ASC`, [userId]);
    return res.rows;
  }

  // --- GOALS ---

  static async createGoal(data: z.infer<typeof GoalSchema>) {
    // Get student profile id
    const profileRes = await query('SELECT id FROM student_profiles WHERE user_id = $1', [data.student_user_id]);
    if (profileRes.rows.length === 0) throw new Error('Student profile not found');
    
    const res = await query(
      `INSERT INTO goals (student_id, title, description, target_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [profileRes.rows[0].id, data.title, data.description || null, data.target_date || null]
    );
    return res.rows[0];
  }

  static async getGoalsForStudent(studentUserId: string) {
    const profileRes = await query('SELECT id FROM student_profiles WHERE user_id = $1', [studentUserId]);
    if (profileRes.rows.length === 0) return [];
    
    const res = await query(`
      SELECT g.*, 
        (SELECT json_agg(m.*) FROM goal_milestones m WHERE m.goal_id = g.id) as milestones
      FROM goals g WHERE student_id = $1`, 
      [profileRes.rows[0].id]
    );
    return res.rows;
  }
}
