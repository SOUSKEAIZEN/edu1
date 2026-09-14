"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const academic_controller_1 = require("../controllers/academic.controller");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
// Mix of Admin, Mentor, and Student endpoints with specific RBAC per route
router.use(auth_1.authMiddleware);
// Assessments (Mentors/Admins can create)
router.post('/offerings/:offeringId/assessments', (0, rbac_1.requireRole)(['MENTOR', 'ADMIN']), academic_controller_1.AcademicController.createAssessment);
// Attendance (Mentors can record)
router.post('/attendance/sessions/:sessionId/records', (0, rbac_1.requireRole)(['MENTOR']), academic_controller_1.AcademicController.recordAttendance);
// Resources (Mentors/Admins can add)
router.post('/resources', (0, rbac_1.requireRole)(['MENTOR', 'ADMIN']), academic_controller_1.AcademicController.addResource);
// Tasks
router.post('/tasks', (0, rbac_1.requireRole)(['MENTOR', 'ADMIN']), academic_controller_1.AcademicController.createTask);
router.post('/tasks/:taskId/submit', (0, rbac_1.requireRole)(['STUDENT']), academic_controller_1.AcademicController.submitTask);
// Goals (Mentors/Students can create)
router.post('/goals', (0, rbac_1.requireRole)(['STUDENT', 'MENTOR']), academic_controller_1.AcademicController.createGoal);
exports.default = router;
