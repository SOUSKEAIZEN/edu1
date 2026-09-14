"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mentor_controller_1 = require("../controllers/mentor.controller");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware, (0, rbac_1.requireRole)(['MENTOR', 'ADMIN']));
// Legacy
router.get('/students', mentor_controller_1.MentorController.getAssignedStudents);
router.post('/assessments/:assessmentId/marks', mentor_controller_1.MentorController.recordMarkForStudent);
// Phase 10
router.get('/dashboard/metrics', mentor_controller_1.MentorController.getDashboardMetrics);
router.get('/dashboard/table', mentor_controller_1.MentorController.getStudentTable);
router.get('/students/:studentProfileId/brief', mentor_controller_1.MentorController.getStudentBrief);
router.post('/students/:studentProfileId/notes', mentor_controller_1.MentorController.addNote);
router.post('/students/:studentProfileId/interventions', mentor_controller_1.MentorController.recordIntervention);
router.put('/interventions/:interventionId/outcome', mentor_controller_1.MentorController.updateOutcome);
exports.default = router;
