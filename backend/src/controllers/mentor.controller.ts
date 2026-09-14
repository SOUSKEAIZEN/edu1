
import { Request, Response } from 'express';
import { ProfilesService } from '../services/profiles.service';
import { AcademicService, RecordMarkSchema } from '../services/academic.service';
import { MentorDashboardService } from '../services/mentor/MentorDashboardService';
import { StudentBriefService } from '../services/mentor/StudentBriefService';
import { InterventionService } from '../services/mentor/InterventionService';

export class MentorController {
  
  // Existing Phase 3 logic
  static async getAssignedStudents(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const students = await ProfilesService.getMentorAssignedStudents(userId);
      res.json(students);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async recordMarkForStudent(req: Request, res: Response) {
    try {
      const assessmentId = req.params.assessmentId as string;
      const parsed = RecordMarkSchema.parse(req.body);
      const result = await AcademicService.recordMark(assessmentId, parsed);
      res.json(result);
    } catch (e: any) { res.status(400).json({ error: e.errors || e.message }); }
  }

  // New Phase 10 Logic
  static async getDashboardMetrics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const metrics = await MentorDashboardService.getDashboardMetrics(userId);
      res.json(metrics);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async getStudentTable(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const table = await MentorDashboardService.getStudentTable(userId);
      res.json(table);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  static async getStudentBrief(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const studentProfileId = req.params.studentProfileId as string;
      const brief = await StudentBriefService.generateBrief(userId, studentProfileId);
      res.json(brief);
    } catch (e: any) { res.status(403).json({ error: e.message }); }
  }

  static async addNote(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const studentProfileId = req.params.studentProfileId as string;
      const { content, isPrivate } = req.body;
      const note = await InterventionService.addNote(userId, studentProfileId, content, isPrivate);
      res.json(note);
    } catch (e: any) { res.status(403).json({ error: e.message }); }
  }

  static async recordIntervention(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const studentProfileId = req.params.studentProfileId as string;
      const { type, description, followUpDate, expectedOutcome } = req.body;
      const intervention = await InterventionService.recordIntervention(userId, studentProfileId, type, description, followUpDate, expectedOutcome);
      res.json(intervention);
    } catch (e: any) { res.status(403).json({ error: e.message }); }
  }

  static async updateOutcome(req: Request, res: Response) {
    try {
      const userId = (req as any).user.user_id;
      const interventionId = req.params.interventionId as string;
      const { actualOutcome, status } = req.body;
      const outcome = await InterventionService.updateOutcome(interventionId, userId, actualOutcome, status);
      res.json(outcome);
    } catch (e: any) { res.status(403).json({ error: e.message }); }
  }
}
