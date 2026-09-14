import { Request, Response } from 'express';
import { AcademicService, CreateAssessmentSchema } from '../services/academic.service';
import { ResourcesService, ResourceSchema } from '../services/resources.service';
import { AttendanceService, RecordAttendanceSchema } from '../services/attendance.service';
import { TasksGoalsService, TaskSchema, GoalSchema } from '../services/tasks.service';
import { z } from 'zod';

export class AcademicController {
  
  // Assessments
  static async createAssessment(req: Request, res: Response) {
    try {
      const offeringId = req.params.offeringId as string;
      const parsed = CreateAssessmentSchema.parse(req.body);
      const assessment = await AcademicService.createAssessment(offeringId, parsed);
      res.json(assessment);
    } catch (e: any) { res.status(400).json({ error: e.errors || e.message }); }
  }

  // Attendance
  static async recordAttendance(req: Request, res: Response) {
    try {
      const sessionId = req.params.sessionId as string;
      const parsed = z.array(RecordAttendanceSchema).parse(req.body);
      await AttendanceService.recordAttendance(sessionId, parsed);
      res.json({ success: true });
    } catch (e: any) { res.status(400).json({ error: e.errors || e.message }); }
  }

  // Resources
  static async addResource(req: Request, res: Response) {
    try {
      const parsed = ResourceSchema.parse(req.body);
      const resource = await ResourcesService.addResource(parsed);
      res.json(resource);
    } catch (e: any) { res.status(400).json({ error: e.errors || e.message }); }
  }

  // Tasks
  static async createTask(req: Request, res: Response) {
    try {
      const creatorId = (req as any).user.user_id;
      const parsed = TaskSchema.parse(req.body);
      const task = await TasksGoalsService.createTask(creatorId, parsed);
      res.json(task);
    } catch (e: any) { res.status(400).json({ error: e.errors || e.message }); }
  }

  static async submitTask(req: Request, res: Response) {
    try {
      const taskId = req.params.taskId as string;
      const { content } = req.body;
      if (!content) throw new Error('Content is required');
      const submission = await TasksGoalsService.submitTask(taskId, content);
      res.json(submission);
    } catch (e: any) { res.status(400).json({ error: e.errors || e.message }); }
  }

  // Goals
  static async createGoal(req: Request, res: Response) {
    try {
      const parsed = GoalSchema.parse(req.body);
      const goal = await TasksGoalsService.createGoal(parsed);
      res.json(goal);
    } catch (e: any) { res.status(400).json({ error: e.errors || e.message }); }
  }
}
