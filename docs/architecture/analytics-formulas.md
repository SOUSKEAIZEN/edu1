# Analytics Engine Formulas

## 1. Academic Metrics
- **Subject Average:** `Sum(Marks Obtained) / Sum(Max Marks) * 100` for a specific subject.
- **Overall Average (GPA Proxy):** `Sum(Marks Obtained * Weightage) / Sum(Max Marks * Weightage)` across all assessments.
- **Recent Average:** Average of the last 5 assessments or assessments within the last 30 days.
- **Historical Average:** Average of assessments prior to the last 30 days.
- **Improvement Rate:** `Recent Average - Historical Average`. Positive means improving, negative means declining.
- **Performance Variance:** Standard deviation of the last 10 assessment percentage scores. High variance indicates erratic performance.

## 2. Attendance Metrics
- **Overall Attendance:** `(Total Present + Total Late) / Total Sessions * 100`.
- **Recent Attendance (Velocity):** Attendance percentage over the last 14 days. 
- **Attendance Trend:** `Recent Attendance - Overall Attendance`.
- **Missed-session Streak:** Current consecutive `ABSENT` count looking backwards from the most recent session.

## 3. Tasks & Goals
- **Task Completion Rate:** `Completed Tasks / (Completed + Pending + Overdue Tasks) * 100`.
- **Missed Deadlines:** Count of tasks where `status != 'COMPLETED'` and `due_date < NOW()`.
- **Goal Progress:** `Completed Milestones / Total Milestones * 100` for active goals.

## 4. Engagement
- **Engagement Score:** A weighted heuristic based on task submission promptness (submitted before deadline = +1, on deadline = 0, late = -1) and proactive goal setting (number of active goals). 

## 5. Refresh Strategy
Calculations are extremely heavy if run synchronously. 
**Strategy:**
- We utilize the `student_metric_snapshots` table.
- A background cron job runs nightly to calculate these exact formulas and `INSERT` a daily snapshot.
- APIs read the *latest* snapshot. If the `calculated_at` (i.e., `created_at` of the snapshot) is older than 24 hours, the system can trigger an on-demand async recalculation while serving the stale data, or compute the delta on the fly.
