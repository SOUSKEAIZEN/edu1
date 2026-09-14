import { AnalyticsData } from './risk-engine/RiskCalculator';

export interface RecommendationInput {
  analytics: AnalyticsData;
  deficits: {
    subjectId: string;
    subjectName: string;
    averageScore: number;
  }[];
  tasks: {
    id: string;
    title: string;
    dueDate: Date | null;
    isOverdue: boolean;
  }[];
  resources: {
    subjectId: string;
    title: string;
    url: string;
  }[];
}

export interface Recommendation {
  title: string;
  reason: string;
  priority: number; // 1 (Highest) to 5 (Lowest)
  action: string;
  estimatedEffortMinutes: number;
  relatedSubjectId?: string;
  source: 'SYSTEM' | 'AI' | 'MENTOR';
  expirationDate?: Date;
}

export class RecommendationEngine {
  static generate(input: RecommendationInput): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const now = new Date();

    // 1. Overdue Tasks (Highest Urgency, High Impact)
    input.tasks.forEach(task => {
      if (task.isOverdue) {
        recommendations.push({
          title: `Complete overdue task: ${task.title}`,
          reason: 'This task is past its deadline and impacting your deadline risk score.',
          priority: 1,
          action: 'SUBMIT_TASK',
          estimatedEffortMinutes: 60,
          source: 'SYSTEM',
          expirationDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
        });
      } else if (task.dueDate && task.dueDate.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000) {
        // Due within 3 days
        recommendations.push({
          title: `Start working on: ${task.title}`,
          reason: 'The deadline for this task is approaching within 3 days.',
          priority: 2,
          action: 'START_TASK',
          estimatedEffortMinutes: 120,
          source: 'SYSTEM',
          expirationDate: task.dueDate
        });
      }
    });

    // 2. Academic Deficits (High Impact)
    input.deficits.forEach(deficit => {
      if (deficit.averageScore < 60) {
        // Find a matching resource
        const resource = input.resources.find(r => r.subjectId === deficit.subjectId);
        
        recommendations.push({
          title: `Review core concepts for ${deficit.subjectName}`,
          reason: `Your average score in this subject is ${deficit.averageScore}%, indicating a need for review.`,
          priority: deficit.averageScore < 50 ? 1 : 2, // Escalated priority if failing
          action: resource ? `REVIEW_RESOURCE:${resource.url}` : 'SCHEDULE_MENTOR_MEETING',
          estimatedEffortMinutes: 90,
          relatedSubjectId: deficit.subjectId,
          source: 'SYSTEM',
          expirationDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
        });
      }
    });

    // 3. Attendance Drops
    if (input.analytics.attendance.overallAttendance < 75 || input.analytics.attendance.missedSessionStreak >= 2) {
      recommendations.push({
        title: 'Review attendance standing',
        reason: 'Your attendance has dropped below institutional thresholds or you have missed consecutive sessions.',
        priority: 1,
        action: 'CONTACT_MENTOR',
        estimatedEffortMinutes: 15,
        source: 'SYSTEM'
      });
    }

    // 4. Goals (Low urgency, Medium impact)
    if (input.analytics.goals.totalMilestones > 0 && input.analytics.goals.progressPercentage < 20) {
      recommendations.push({
        title: 'Update goal milestones',
        reason: 'You have active goals but progress is currently low. Breaking them down into smaller tasks might help.',
        priority: 3,
        action: 'REVIEW_GOALS',
        estimatedEffortMinutes: 30,
        source: 'SYSTEM'
      });
    }

    // Sort by Priority (1 is highest) and then by effort (quick wins first)
    recommendations.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.estimatedEffortMinutes - b.estimatedEffortMinutes;
    });

    return recommendations;
  }
}
