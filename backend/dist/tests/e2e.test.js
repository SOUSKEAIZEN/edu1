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
const ai_controller_1 = require("../controllers/ai.controller");
const mentor_controller_1 = require("../controllers/mentor.controller");
const DocumentPipeline_1 = require("../services/rag/DocumentPipeline");
const db = __importStar(require("../db"));
// Simple Express Res Mock
const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.data = data; return res; };
    return res;
};
(0, node_test_1.test)('E2E - Student Workflow Simulation', async (t) => {
    // Simulate Auth -> AI Chat -> Analytics
    node_test_1.mock.method(db, 'query', async (sql, params) => {
        if (sql.includes('ai_conversations'))
            return { rows: [{ id: 'conv-123' }] };
        if (sql.includes('student_profiles'))
            return { rows: [{ id: 'student-profile-123' }] };
        if (sql.includes('ai_messages'))
            return { rows: [{ id: 'msg-123', role: 'user', content: 'hello' }] };
        return { rows: [] };
    });
    const req = {
        user: { user_id: 'student-user-uuid', role: 'STUDENT' },
        body: { query: 'Hello AI', mode: 'LEARN', conversationId: 'conv-123' }
    };
    const res = mockRes();
    // 1. AI Chat Request
    await ai_controller_1.AIController.askMentor(req, res);
    node_assert_1.default.strictEqual(res.statusCode, undefined); // 200 OK implied if no error
    node_assert_1.default.ok(res.data);
    node_assert_1.default.strictEqual(res.data.intent, 'GENERAL_MENTORING');
    node_test_1.mock.restoreAll();
});
(0, node_test_1.test)('E2E - Mentor Workflow Simulation', async (t) => {
    node_test_1.mock.method(db, 'query', async (sql, params) => {
        if (sql.includes('mentor_profiles') && !sql.includes('mentor_interventions'))
            return { rows: [{ id: 'mentor-profile-123' }] };
        if (sql.includes('mentor_student_assignments'))
            return { rows: [{ id: 'assignment-123' }] }; // Authorized
        if (sql.includes('system_audit_logs'))
            return { rows: [] };
        if (sql.includes('student_metric_snapshots'))
            return { rows: [{ gpa: 3.5, attendance_rate: 90 }] };
        if (sql.includes('risk_snapshots'))
            return { rows: [{ overall_risk_score: 40 }] };
        if (sql.includes('mentor_interventions'))
            return { rows: [{ id: 'intervention-123', type: 'NUDGE', status: 'PENDING' }] };
        return { rows: [] };
    });
    const req = {
        user: { user_id: 'mentor-user-uuid', role: 'MENTOR' },
        params: { studentProfileId: 'student-profile-123' },
        body: { type: 'NUDGE', description: 'Reminder about assignment' }
    };
    const res = mockRes();
    // 1. Fetch Student Brief
    await mentor_controller_1.MentorController.getStudentBrief(req, res);
    node_assert_1.default.ok(res.data.structured_brief);
    // 2. Create Intervention
    await mentor_controller_1.MentorController.recordIntervention(req, res);
    console.log('RES.DATA IS:', res.data);
    node_assert_1.default.strictEqual(res.data.status, 'PENDING');
    node_test_1.mock.restoreAll();
});
(0, node_test_1.test)('E2E - Admin Workflow Simulation (RAG Upload)', async (t) => {
    node_test_1.mock.method(db, 'query', async (sql, params) => {
        if (sql.includes('documents'))
            return { rows: [{ id: 'doc-123' }] };
        if (sql.includes('document_versions'))
            return { rows: [{ id: 'version-123' }] };
        if (sql.includes('document_chunks'))
            return { rows: [] };
        return { rows: [] };
    });
    const pipeline = new DocumentPipeline_1.DocumentPipeline({
        embed: async () => Array(1536).fill(0.1),
        generate: async () => ({ content: '', tokensUsed: 0 }),
        stream: async function* () { }
    });
    const result = await pipeline.processDocument("This is a syllabus.", {
        title: "CS101 Syllabus",
        source: "Admin Upload",
        uploader_id: "admin-uuid",
        document_type: "SYLLABUS"
    });
    node_assert_1.default.strictEqual(result.success, true);
    node_assert_1.default.strictEqual(result.docId, 'doc-123');
    node_test_1.mock.restoreAll();
});
