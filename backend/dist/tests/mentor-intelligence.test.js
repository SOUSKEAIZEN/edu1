"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const InterventionService_1 = require("../services/mentor/InterventionService");
const StudentBriefService_1 = require("../services/mentor/StudentBriefService");
const db = __importStar(require("../db"));
(0, node_test_1.test)('Mentor Intelligence - Privacy Boundary Enforcement', async (t) => {
    // Mock DB to simulate student NOT assigned to mentor
    node_test_1.mock.method(db, 'query', async (sql, params) => {
        if (sql.includes('mentor_student_assignments')) {
            return { rows: [] }; // Unauthorized
        }
        return { rows: [] };
    });
    try {
        await InterventionService_1.InterventionService.addNote('mentor-1', 'student-1', 'Test note', true);
        node_assert_1.default.fail('Should have thrown unauthorized error');
    }
    catch (e) {
        node_assert_1.default.strictEqual(e.message, 'Unauthorized profile access');
    }
    try {
        await StudentBriefService_1.StudentBriefService.generateBrief('mentor-1', 'student-1');
        node_assert_1.default.fail('Should have thrown unauthorized error');
    }
    catch (e) {
        node_assert_1.default.strictEqual(e.message, 'Unauthorized profile access');
    }
    node_test_1.mock.restoreAll();
});
(0, node_test_1.test)('Mentor Intelligence - Intervention Outcome Tracking', async (t) => {
    // Mock DB for successful assignment
    let lastSql = '';
    node_test_1.mock.method(db, 'query', async (sql, params) => {
        lastSql = sql;
        if (sql.includes('UPDATE mentor_interventions')) {
            return { rows: [{ id: 'intervention-1', actual_outcome: 'Student improved attendance', status: 'SUCCESS' }] };
        }
        return { rows: [{ id: 'mock-id' }] };
    });
    const outcome = await InterventionService_1.InterventionService.updateOutcome('intervention-1', 'mentor-1', 'Student improved attendance', 'SUCCESS');
    node_assert_1.default.strictEqual(outcome.status, 'SUCCESS');
    node_assert_1.default.strictEqual(outcome.actual_outcome, 'Student improved attendance');
    node_test_1.mock.restoreAll();
});
