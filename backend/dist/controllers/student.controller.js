"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const profiles_service_1 = require("../services/profiles.service");
const academic_service_1 = require("../services/academic.service");
const attendance_service_1 = require("../services/attendance.service");
const tasks_service_1 = require("../services/tasks.service");
class StudentController {
    static async getProfile(req, res) {
        try {
            const userId = req.user.user_id; // from session auth
            const profile = await profiles_service_1.ProfilesService.getStudentProfile(userId);
            res.json(profile);
        }
        catch (e) {
            res.status(404).json({ error: e.message });
        }
    }
    static async getSubjects(req, res) {
        try {
            const userId = req.user.user_id;
            const subjects = await academic_service_1.AcademicService.getStudentSubjects(userId);
            res.json(subjects);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async getMarks(req, res) {
        try {
            const userId = req.user.user_id;
            const offeringId = req.params.offeringId;
            const marks = await academic_service_1.AcademicService.getStudentMarks(userId, offeringId);
            res.json(marks);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async getAttendanceTrend(req, res) {
        try {
            const userId = req.user.user_id;
            const trend = await attendance_service_1.AttendanceService.getStudentAttendanceTrend(userId);
            res.json(trend);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async getTasks(req, res) {
        try {
            const userId = req.user.user_id;
            const tasks = await tasks_service_1.TasksGoalsService.getTasksForUser(userId);
            res.json(tasks);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static async getGoals(req, res) {
        try {
            const userId = req.user.user_id;
            const goals = await tasks_service_1.TasksGoalsService.getGoalsForStudent(userId);
            res.json(goals);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}
exports.StudentController = StudentController;
