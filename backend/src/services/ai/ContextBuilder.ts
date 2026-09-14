import { AnalyticsService } from '../analytics.service';
import { RecommendationEngine } from '../recommendation.service';
import { RiskCalculator } from '../risk-engine/RiskCalculator';
import { defaultRulesV1 } from '../risk-engine/RiskRules';

export type Intent = 'ACADEMIC_QUERY' | 'ATTENDANCE_QUERY' | 'TASK_QUERY' | 'GENERAL_MENTORING' | 'UNKNOWN';

export interface ContextItem {
  type: string;
  data: any;
  metadata: {
    source: string;
    timestamp: string;
    freshnessMinutes: number;
    permissionScope: 'STUDENT_ONLY' | 'MENTOR_ONLY' | 'ALL';
  };
}

export class ContextBuilder {
  
  static detectIntent(query: string): Intent {
    const q = query.toLowerCase();
    if (q.includes('mark') || q.includes('grade') || q.includes('gpa') || q.includes('failing')) return 'ACADEMIC_QUERY';
    if (q.includes('attendance') || q.includes('absent') || q.includes('missed class')) return 'ATTENDANCE_QUERY';
    if (q.includes('task') || q.includes('deadline') || q.includes('due') || q.includes('homework')) return 'TASK_QUERY';
    return 'GENERAL_MENTORING';
  }

  static async buildContext(studentUserId: string, query: string): Promise<ContextItem[]> {
    const intent = this.detectIntent(query);
    const context: ContextItem[] = [];
    const now = new Date();

    // In a real implementation, we would selectively query the DB based on intent.
    // For this architectural design, we fetch the unified analytics payload and filter what we send to the LLM.
    const analytics = await AnalyticsService.getStudentAnalytics(studentUserId);

    const createMetadata = (source: string) => ({
      source,
      timestamp: analytics.calculated_at,
      freshnessMinutes: Math.floor((now.getTime() - new Date(analytics.calculated_at).getTime()) / 60000),
      permissionScope: 'STUDENT_ONLY' as const
    });

    // We only attach context based on Intent to minimize token usage and hallucination risk
    if (intent === 'ACADEMIC_QUERY' || intent === 'GENERAL_MENTORING') {
      context.push({
        type: 'ACADEMIC_PERFORMANCE',
        data: analytics.academic,
        metadata: createMetadata('AnalyticsEngine.Academic')
      });
      // Generate risk profile for academic to understand if they are in danger
      const risk = RiskCalculator.calculate(analytics, defaultRulesV1);
      context.push({
        type: 'ACADEMIC_RISK',
        data: risk.factors.filter(f => f.type === 'ACADEMIC'),
        metadata: createMetadata('RiskEngine.Academic')
      });
    }

    if (intent === 'ATTENDANCE_QUERY' || intent === 'GENERAL_MENTORING') {
      context.push({
        type: 'ATTENDANCE_RECORD',
        data: analytics.attendance,
        metadata: createMetadata('AnalyticsEngine.Attendance')
      });
    }

    if (intent === 'TASK_QUERY' || intent === 'GENERAL_MENTORING') {
      context.push({
        type: 'TASK_BACKLOG',
        data: analytics.tasks,
        metadata: createMetadata('AnalyticsEngine.Tasks')
      });
    }
    
    // Always attach goals if available
    context.push({
      type: 'GOALS',
      data: analytics.goals,
      metadata: createMetadata('AnalyticsEngine.Goals')
    });

    return context;
  }
}
