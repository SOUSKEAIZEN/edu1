"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const attendance_service_1 = require("../services/attendance.service");
const tasks_service_1 = require("../services/tasks.service");
(0, node_test_1.test)('Domain Validation - Attendance Record', (t) => {
    // Invalid status
    node_assert_1.default.throws(() => {
        attendance_service_1.RecordAttendanceSchema.parse({
            enrollment_id: '123e4567-e89b-12d3-a456-426614174000',
            status: 'INVALID_STATUS'
        });
    }, /Invalid option/);
    // Valid
    const valid = attendance_service_1.RecordAttendanceSchema.parse({
        enrollment_id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'PRESENT'
    });
    node_assert_1.default.strictEqual(valid.status, 'PRESENT');
});
(0, node_test_1.test)('Domain Validation - Goals', (t) => {
    node_assert_1.default.throws(() => {
        tasks_service_1.GoalSchema.parse({
            student_user_id: 'not-uuid',
            title: ''
        });
    }, /Invalid UUID/);
    const valid = tasks_service_1.GoalSchema.parse({
        student_user_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Achieve 90%'
    });
    node_assert_1.default.strictEqual(valid.title, 'Achieve 90%');
});
