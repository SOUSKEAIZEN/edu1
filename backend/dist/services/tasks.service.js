"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksGoalsService = exports.GoalSchema = exports.TaskSchema = void 0;
const db_1 = require("../db");
const zod_1 = require("zod");
exports.TaskSchema = zod_1.z.object({
    assignee_id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    due_date: zod_1.z.string().optional(),
});
exports.GoalSchema = zod_1.z.object({
    student_user_id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    target_date: zod_1.z.string().optional(),
});
class TasksGoalsService {
    // --- TASKS ---
    static async createTask(creatorId, data) {
        const res = await (0, db_1.query)(`INSERT INTO tasks (creator_id, assignee_id, title, description, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [creatorId, data.assignee_id, data.title, data.description || null, data.due_date || null]);
        return res.rows[0];
    }
    static async submitTask(taskId, content) {
        const res = await (0, db_1.query)(`INSERT INTO task_submissions (task_id, content) VALUES ($1, $2) RETURNING *`, [taskId, content]);
        await (0, db_1.query)(`UPDATE tasks SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1`, [taskId]);
        return res.rows[0];
    }
    static async getTasksForUser(userId) {
        const res = await (0, db_1.query)(`SELECT * FROM tasks WHERE assignee_id = $1 ORDER BY due_date ASC`, [userId]);
        return res.rows;
    }
    // --- GOALS ---
    static async createGoal(data) {
        // Get student profile id
        const profileRes = await (0, db_1.query)('SELECT id FROM student_profiles WHERE user_id = $1', [data.student_user_id]);
        if (profileRes.rows.length === 0)
            throw new Error('Student profile not found');
        const res = await (0, db_1.query)(`INSERT INTO goals (student_id, title, description, target_date)
       VALUES ($1, $2, $3, $4) RETURNING *`, [profileRes.rows[0].id, data.title, data.description || null, data.target_date || null]);
        return res.rows[0];
    }
    static async getGoalsForStudent(studentUserId) {
        const profileRes = await (0, db_1.query)('SELECT id FROM student_profiles WHERE user_id = $1', [studentUserId]);
        if (profileRes.rows.length === 0)
            return [];
        const res = await (0, db_1.query)(`
      SELECT g.*, 
        (SELECT json_agg(m.*) FROM goal_milestones m WHERE m.goal_id = g.id) as milestones
      FROM goals g WHERE student_id = $1`, [profileRes.rows[0].id]);
        return res.rows;
    }
}
exports.TasksGoalsService = TasksGoalsService;
