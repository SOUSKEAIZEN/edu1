"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const academic_service_1 = require("../services/academic.service");
(0, node_test_1.test)('AcademicService.createAssessment validation', async (t) => {
    // Test invalid weightage
    node_assert_1.default.throws(() => {
        academic_service_1.CreateAssessmentSchema.parse({
            name: 'Midterm',
            type: 'EXAM',
            max_marks: 100,
            weightage: 150 // Invalid: max 100
        });
    }, /Too big: expected number to be <=100/);
    // Test valid payload
    const validData = academic_service_1.CreateAssessmentSchema.parse({
        name: 'Final',
        type: 'EXAM',
        max_marks: 100,
        weightage: 50
    });
    node_assert_1.default.strictEqual(validData.name, 'Final');
});
