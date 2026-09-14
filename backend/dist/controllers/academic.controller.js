"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicController = void 0;
const academic_service_1 = require("../services/academic.service");
const resources_service_1 = require("../services/resources.service");
const attendance_service_1 = require("../services/attendance.service");
const tasks_service_1 = require("../services/tasks.service");
const zod_1 = require("zod");
class AcademicController {
    // Assessments
    static async createAssessment(req, res) {
        try {
            const offeringId = req.params.offeringId;
            const parsed = academic_service_1.CreateAssessmentSchema.parse(req.body);
            const assessment = await academic_service_1.AcademicService.createAssessment(offeringId, parsed);
            res.json(assessment);
        }
        catch (e) {
            res.status(400).json({ error: e.errors || e.message });
        }
    }
    // Attendance
    static async recordAttendance(req, res) {
        try {
            const sessionId = req.params.sessionId;
            const parsed = zod_1.z.array(attendance_service_1.RecordAttendanceSchema).parse(req.body);
            await attendance_service_1.AttendanceService.recordAttendance(sessionId, parsed);
            res.json({ success: true });
        }
        catch (e) {
            res.status(400).json({ error: e.errors || e.message });
        }
    }
    // Resources
    static async addResource(req, res) {
        try {
            const parsed = resources_service_1.ResourceSchema.parse(req.body);
            const resource = await resources_service_1.ResourcesService.addResource(parsed);
            res.json(resource);
        }
        catch (e) {
            res.status(400).json({ error: e.errors || e.message });
        }
    }
    // Tasks
    static async createTask(req, res) {
        try {
            const creatorId = req.user.user_id;
            const parsed = tasks_service_1.TaskSchema.parse(req.body);
            const task = await tasks_service_1.TasksGoalsService.createTask(creatorId, parsed);
            res.json(task);
        }
        catch (e) {
            res.status(400).json({ error: e.errors || e.message });
        }
    }
    static async submitTask(req, res) {
        try {
            const taskId = req.params.taskId;
            const { content } = req.body;
            if (!content)
                throw new Error('Content is required');
            const submission = await tasks_service_1.TasksGoalsService.submitTask(taskId, content);
            res.json(submission);
        }
        catch (e) {
            res.status(400).json({ error: e.errors || e.message });
        }
    }
    // Goals
    static async createGoal(req, res) {
        try {
            const parsed = tasks_service_1.GoalSchema.parse(req.body);
            const goal = await tasks_service_1.TasksGoalsService.createGoal(parsed);
            res.json(goal);
        }
        catch (e) {
            res.status(400).json({ error: e.errors || e.message });
        }
    }
}
exports.AcademicController = AcademicController;
