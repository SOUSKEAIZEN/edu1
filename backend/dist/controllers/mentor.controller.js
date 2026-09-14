"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentorController = void 0;
const profiles_service_1 = require("../services/profiles.service");
const academic_service_1 = require("../services/academic.service");
const MentorDashboardService_1 = require("../services/mentor/MentorDashboardService");
const StudentBriefService_1 = require("../services/mentor/StudentBriefService");
const InterventionService_1 = require("../services/mentor/InterventionService");
class MentorController {
    // Existing Phase 3 logic
    static async getAssignedStudents(req, res) {
        try {
            const userId = req.user.user_id;
            const students = await profiles_service_1.ProfilesService.getMentorAssignedStudents(userId);
            res.json(students);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async recordMarkForStudent(req, res) {
        try {
            const assessmentId = req.params.assessmentId;
            const parsed = academic_service_1.RecordMarkSchema.parse(req.body);
            const result = await academic_service_1.AcademicService.recordMark(assessmentId, parsed);
            res.json(result);
        }
        catch (e) {
            res.status(400).json({ error: e.errors || e.message });
        }
    }
    // New Phase 10 Logic
    static async getDashboardMetrics(req, res) {
        try {
            const userId = req.user.user_id;
            const metrics = await MentorDashboardService_1.MentorDashboardService.getDashboardMetrics(userId);
            res.json(metrics);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async getStudentTable(req, res) {
        try {
            const userId = req.user.user_id;
            const table = await MentorDashboardService_1.MentorDashboardService.getStudentTable(userId);
            res.json(table);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async getStudentBrief(req, res) {
        try {
            const userId = req.user.user_id;
            const studentProfileId = req.params.studentProfileId;
            const brief = await StudentBriefService_1.StudentBriefService.generateBrief(userId, studentProfileId);
            res.json(brief);
        }
        catch (e) {
            res.status(403).json({ error: e.message });
        }
    }
    static async addNote(req, res) {
        try {
            const userId = req.user.user_id;
            const studentProfileId = req.params.studentProfileId;
            const { content, isPrivate } = req.body;
            const note = await InterventionService_1.InterventionService.addNote(userId, studentProfileId, content, isPrivate);
            res.json(note);
        }
        catch (e) {
            res.status(403).json({ error: e.message });
        }
    }
    static async recordIntervention(req, res) {
        try {
            const userId = req.user.user_id;
            const studentProfileId = req.params.studentProfileId;
            const { type, description, followUpDate, expectedOutcome } = req.body;
            const intervention = await InterventionService_1.InterventionService.recordIntervention(userId, studentProfileId, type, description, followUpDate, expectedOutcome);
            res.json(intervention);
        }
        catch (e) {
            res.status(403).json({ error: e.message });
        }
    }
    static async updateOutcome(req, res) {
        try {
            const userId = req.user.user_id;
            const interventionId = req.params.interventionId;
            const { actualOutcome, status } = req.body;
            const outcome = await InterventionService_1.InterventionService.updateOutcome(interventionId, userId, actualOutcome, status);
            res.json(outcome);
        }
        catch (e) {
            res.status(403).json({ error: e.message });
        }
    }
}
exports.MentorController = MentorController;
