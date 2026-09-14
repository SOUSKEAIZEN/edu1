import { test, mock } from 'node:test';
import assert from 'node:assert';
import { ProfilesService } from '../services/profiles.service';
import { AcademicService } from '../services/academic.service';
import { AIController } from '../controllers/ai.controller';
import { MentorController } from '../controllers/mentor.controller';
import { DocumentPipeline } from '../services/rag/DocumentPipeline';
import * as db from '../db';

// Simple Express Res Mock
const mockRes = () => {
  const res: any = {};
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.json = (data: any) => { res.data = data; return res; };
  return res;
};

test('E2E - Student Workflow Simulation', async (t) => {
  // Simulate Auth -> AI Chat -> Analytics
  
  mock.method(db, 'query', async (sql: string, params: any[]) => {
    if (sql.includes('ai_conversations')) return { rows: [{ id: 'conv-123' }] };
    if (sql.includes('student_profiles')) return { rows: [{ id: 'student-profile-123' }] };
    if (sql.includes('ai_messages')) return { rows: [{ id: 'msg-123', role: 'user', content: 'hello' }] };
    return { rows: [] };
  });

  const req = {
    user: { user_id: 'student-user-uuid', role: 'STUDENT' },
    body: { query: 'Hello AI', mode: 'LEARN', conversationId: 'conv-123' }
  } as any;
  const res = mockRes();

  // 1. AI Chat Request
  await AIController.askMentor(req, res);
  assert.strictEqual(res.statusCode, undefined); // 200 OK implied if no error
  assert.ok(res.data);
  assert.strictEqual(res.data.intent, 'GENERAL_MENTORING');

  mock.restoreAll();
});

test('E2E - Mentor Workflow Simulation', async (t) => {
  mock.method(db, 'query', async (sql: string, params: any[]) => {
    if (sql.includes('mentor_profiles') && !sql.includes('mentor_interventions')) return { rows: [{ id: 'mentor-profile-123' }] };
    if (sql.includes('mentor_student_assignments')) return { rows: [{ id: 'assignment-123' }] }; // Authorized
    if (sql.includes('system_audit_logs')) return { rows: [] };
    if (sql.includes('student_metric_snapshots')) return { rows: [{ gpa: 3.5, attendance_rate: 90 }] };
    if (sql.includes('risk_snapshots')) return { rows: [{ overall_risk_score: 40 }] };
    if (sql.includes('mentor_interventions')) return { rows: [{ id: 'intervention-123', type: 'NUDGE', status: 'PENDING' }] };
    return { rows: [] };
  });

  const req = {
    user: { user_id: 'mentor-user-uuid', role: 'MENTOR' },
    params: { studentProfileId: 'student-profile-123' },
    body: { type: 'NUDGE', description: 'Reminder about assignment' }
  } as any;
  const res = mockRes();

  // 1. Fetch Student Brief
  await MentorController.getStudentBrief(req, res);
  assert.ok(res.data.structured_brief);

  // 2. Create Intervention
  await MentorController.recordIntervention(req, res);
  console.log('RES.DATA IS:', res.data);
  assert.strictEqual(res.data.status, 'PENDING');

  mock.restoreAll();
});

test('E2E - Admin Workflow Simulation (RAG Upload)', async (t) => {
  mock.method(db, 'query', async (sql: string, params: any[]) => {
    if (sql.includes('documents')) return { rows: [{ id: 'doc-123' }] };
    if (sql.includes('document_versions')) return { rows: [{ id: 'version-123' }] };
    if (sql.includes('document_chunks')) return { rows: [] };
    return { rows: [] };
  });

  const pipeline = new DocumentPipeline({
    embed: async () => Array(1536).fill(0.1),
    generate: async () => ({ content: '', tokensUsed: 0 }),
    stream: async function* () {}
  });

  const result = await pipeline.processDocument("This is a syllabus.", {
    title: "CS101 Syllabus",
    source: "Admin Upload",
    uploader_id: "admin-uuid",
    document_type: "SYLLABUS"
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.docId, 'doc-123');
  
  mock.restoreAll();
});
