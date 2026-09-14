"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// Student endpoints
router.get('/students/me/analytics', (0, rbac_1.requireRole)(['STUDENT']), analytics_controller_1.AnalyticsController.getMyAnalytics);
// Mentor endpoints
router.get('/mentors/students/:studentId/analytics', (0, rbac_1.requireRole)(['MENTOR', 'ADMIN']), analytics_controller_1.AnalyticsController.getStudentAnalyticsForMentor);
exports.default = router;
