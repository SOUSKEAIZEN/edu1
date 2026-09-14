import { query } from '../db';

export class AnalyticsService {
  
  /**
   * Calculates all metrics for a given student in real-time or fetches from snapshots.
   */
  static async getStudentAnalytics(studentUserId: string) {
    // We expect the student_profile_id. 
    const profileRes = await query('SELECT id FROM student_profiles WHERE user_id = $1', [studentUserId]);
    if (profileRes.rows.length === 0) throw new Error('Student profile not found');
    const studentId = profileRes.rows[0].id;

    return await this.calculateAnalytics(studentId);
  }

  static async getStudentAnalyticsByProfileId(studentId: string) {
    return await this.calculateAnalytics(studentId);
  }

  private static async calculateAnalytics(studentId: string) {
    // In a real system, these would be heavily cached or read from materialized views.
    
    // 1. ACADEMIC METRICS
    const academicRes = await query(`
      SELECT 
        a.id, 
        a.max_marks, 
        a.weightage, 
        ar.marks_obtained,
        ar.created_at as date
      FROM assessment_results ar
      JOIN assessments a ON ar.assessment_id = a.id
      JOIN enrollments e ON ar.enrollment_id = e.id
      WHERE e.student_id = $1
      ORDER BY ar.created_at DESC
    `, [studentId]);

    const assessments = academicRes.rows.map(r => ({
      ...r,
      percentage: (Number(r.marks_obtained) / Number(r.max_marks)) * 100,
      weight: Number(r.weightage)
    }));

    let overallSum = 0;
    let weightSum = 0;
    assessments.forEach(a => {
      overallSum += (a.percentage * a.weight);
      weightSum += a.weight;
    });
    
    const overallAverage = weightSum > 0 ? (overallSum / weightSum) : null;
    
    // Recent vs Historical (using array slice for MVP, could use 30-day window)
    const recentAssessments = assessments.slice(0, 5);
    const historicalAssessments = assessments.slice(5);

    const calcAvg = (arr: any[]) => arr.length > 0 ? (arr.reduce((acc, a) => acc + a.percentage, 0) / arr.length) : null;
    const recentAverage = calcAvg(recentAssessments);
    const historicalAverage = calcAvg(historicalAssessments);
    const improvementRate = (recentAverage !== null && historicalAverage !== null) ? (recentAverage - historicalAverage) : 0;

    // Variance
    let variance = null;
    if (recentAssessments.length > 1 && recentAverage !== null) {
      const sqDiffs = recentAssessments.map(a => Math.pow(a.percentage - recentAverage, 2));
      variance = sqDiffs.reduce((a, b) => a + b, 0) / sqDiffs.length;
    }

    // 2. ATTENDANCE METRICS
    const attendanceRes = await query(`
      SELECT status, asess.date
      FROM attendance_records ar
      JOIN attendance_sessions asess ON ar.session_id = asess.id
      JOIN enrollments e ON ar.enrollment_id = e.id
      WHERE e.student_id = $1
      ORDER BY asess.date DESC
    `, [studentId]);

    const attRecords = attendanceRes.rows;
    let presentCount = 0;
    let recentPresentCount = 0;
    let streak = 0;
    let streakBroken = false;

    const RECENT_DAYS = 14;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RECENT_DAYS);

    attRecords.forEach(r => {
      const isPresent = r.status === 'PRESENT' || r.status === 'LATE';
      if (isPresent) presentCount++;
      
      const recordDate = new Date(r.date);
      if (recordDate >= cutoffDate && isPresent) {
        recentPresentCount++;
      }

      // Streak calculation (consecutive absences)
      if (!streakBroken) {
        if (!isPresent && r.status === 'ABSENT') {
          streak++;
        } else if (isPresent) {
          streakBroken = true;
        }
      }
    });

    const totalSessions = attRecords.length;
    const recentTotal = attRecords.filter(r => new Date(r.date) >= cutoffDate).length;
    
    const overallAttendance = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 100;
    const recentAttendance = recentTotal > 0 ? (recentPresentCount / recentTotal) * 100 : overallAttendance;
    const attendanceTrend = recentAttendance - overallAttendance;

    // 3. TASKS
    const tasksRes = await query(`
      SELECT status, due_date FROM tasks 
      WHERE assignee_id = (SELECT user_id FROM student_profiles WHERE id = $1)
    `, [studentId]);
    
    const tasks = tasksRes.rows;
    let completed = 0;
    let overdue = 0;
    const now = new Date();

    tasks.forEach(t => {
      if (t.status === 'COMPLETED') completed++;
      else if (t.due_date && new Date(t.due_date) < now) overdue++;
    });
    const taskCompletionRate = tasks.length > 0 ? (completed / tasks.length) * 100 : 100;

    // 4. GOALS
    const goalsRes = await query(`
      SELECT gm.is_completed 
      FROM goal_milestones gm
      JOIN goals g ON gm.goal_id = g.id
      WHERE g.student_id = $1
    `, [studentId]);

    const milestones = goalsRes.rows;
    const completedMilestones = milestones.filter(m => m.is_completed).length;
    const goalProgress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

    const data = {
      academic: {
        overallAverage: overallAverage !== null ? Number(overallAverage.toFixed(2)) : null,
        recentAverage: recentAverage !== null ? Number(recentAverage.toFixed(2)) : null,
        historicalAverage: historicalAverage !== null ? Number(historicalAverage.toFixed(2)) : null,
        improvementRate: Number(improvementRate.toFixed(2)),
        performanceVariance: variance !== null ? Number(variance.toFixed(2)) : null,
        trendDirection: improvementRate > 0 ? 'UP' : improvementRate < 0 ? 'DOWN' : 'FLAT'
      },
      attendance: {
        overallAttendance: Number(overallAttendance.toFixed(2)),
        recentAttendance: Number(recentAttendance.toFixed(2)),
        attendanceTrend: Number(attendanceTrend.toFixed(2)),
        missedSessionStreak: streak,
        totalSessions: totalSessions,
        trendDirection: attendanceTrend > 0 ? 'UP' : attendanceTrend < 0 ? 'DOWN' : 'FLAT'
      },
      tasks: {
        completionRate: Number(taskCompletionRate.toFixed(2)),
        overdueTasks: overdue,
        totalTasks: tasks.length
      },
      goals: {
        progressPercentage: Number(goalProgress.toFixed(2)),
        totalMilestones: milestones.length,
        completedMilestones
      },
      calculated_at: new Date().toISOString()
    };

    // Store a snapshot for historical trend mapping
    await this.snapshotMetrics(studentId, data);
    return data;
  }

  private static async snapshotMetrics(studentId: string, data: any) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    // Insert or ignore if snapshot already exists for today
    await query(`
      INSERT INTO student_metric_snapshots (student_id, gpa, attendance_rate, snapshot_date)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (student_id, snapshot_date) DO NOTHING
    `, [studentId, data.academic.overallAverage, data.attendance.overallAttendance, today]);
  }
}
