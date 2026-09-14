"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentBriefService = void 0;
const analytics_service_1 = require("../analytics.service");
const RiskCalculator_1 = require("../risk-engine/RiskCalculator");
const RiskRules_1 = require("../risk-engine/RiskRules");
const LLMProvider_1 = require("../ai/LLMProvider");
const db_1 = require("../../db");
class StudentBriefService {
    static llm = new LLMProvider_1.OpenAIProvider();
    static async generateBrief(mentorUserId, studentProfileId) {
        // 1. Privacy Check & Audit Log
        const assignRes = await (0, db_1.query)(`
      SELECT mp.id as mentor_id FROM mentor_student_assignments msa
      JOIN mentor_profiles mp ON msa.mentor_id = mp.id
      WHERE mp.user_id = $1 AND msa.student_id = $2 AND msa.unassigned_at IS NULL
    `, [mentorUserId, studentProfileId]);
        if (assignRes.rows.length === 0)
            throw new Error('Unauthorized profile access');
        await (0, db_1.query)(`
      INSERT INTO system_audit_logs (user_id, action, resource, resource_id, ip_address)
      VALUES ($1, 'VIEW_BRIEF', 'STUDENT_PROFILE', $2, 'SYSTEM_INTERNAL')
    `, [mentorUserId, studentProfileId]);
        // 2. Fetch determininstic data
        const analytics = await analytics_service_1.AnalyticsService.getStudentAnalyticsByProfileId(studentProfileId);
        const risk = RiskCalculator_1.RiskCalculator.calculate(analytics, RiskRules_1.defaultRulesV1);
        // 3. Construct System Prompt for AI Assisted Brief
        const prompt = `
You are the AI Assistant for human academic mentors.
Generate a strictly formatted structured brief for a student based ONLY on the provided deterministic data.

FORMAT REQUIRED:
### Current status
### Recent changes
### Strengths
### Concerns
### Evidence
### Suggested action
### Confidence

DATA:
Academic: ${JSON.stringify(analytics.academic)}
Attendance: ${JSON.stringify(analytics.attendance)}
Tasks: ${JSON.stringify(analytics.tasks)}
Risk Factors: ${JSON.stringify(risk.factors)}
Risk Score: ${risk.overallScore}

Do not invent any data. Be concise.
`;
        // 4. Generate Brief
        const response = await this.llm.generate([{ role: 'system', content: prompt }]);
        return {
            structured_brief: response.content,
            raw_risk_score: risk.overallScore,
            confidence: risk.confidence,
            generated_at: new Date().toISOString()
        };
    }
}
exports.StudentBriefService = StudentBriefService;
