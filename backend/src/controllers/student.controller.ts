import { Request, Response } from 'express';
import { ProfilesService } from '../services/profiles.service';
import { AcademicService } from '../services/academic.service';
import { AttendanceService } from '../services/attendance.service';
import { TasksGoalsService } from '../services/tasks.service';

export class StudentController {
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id; // from session auth
      const profile = await ProfilesService.getStudentProfile(userId);
      res.json(profile);
    } catch (e: any) { res.status(404).json({ error: e.message }); }
  }

  static async getSubjects(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const subjects = await AcademicService.getStudentSubjects(userId);
      res.json(subjects);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async getMarks(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const offeringId = req.params.offeringId as string;
      const marks = await AcademicService.getStudentMarks(userId, offeringId);
      res.json(marks);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async getAttendanceTrend(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const trend = await AttendanceService.getStudentAttendanceTrend(userId);
      res.json(trend);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async getTasks(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const tasks = await TasksGoalsService.getTasksForUser(userId);
      res.json(tasks);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async getGoals(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const goals = await TasksGoalsService.getGoalsForStudent(userId);
      res.json(goals);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }
}
