import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function runSeed() {
  await client.connect();
  console.log('Connected to DB for seeding...');

  try {
    await client.query('BEGIN');

    // 1. Roles
    const rolesRes = await client.query(`
      INSERT INTO roles (name, description) VALUES
      ('ADMIN', 'System Administrator'),
      ('MENTOR', 'Academic Mentor'),
      ('STUDENT', 'Enrolled Student')
      RETURNING id, name;
    `);
    const roles = Object.fromEntries(rolesRes.rows.map(r => [r.name, r.id]));

    // 2. Institution
    const instRes = await client.query(`
      INSERT INTO institutions (name, type) VALUES ('Global Tech University', 'UNIVERSITY') RETURNING id;
    `);
    const instId = instRes.rows[0].id;

    // 3. Departments
    const deptRes = await client.query(`
      INSERT INTO departments (institution_id, name) VALUES ($1, 'Computer Science') RETURNING id;
    `, [instId]);
    const deptId = deptRes.rows[0].id;

    // 4. Programs
    const progRes = await client.query(`
      INSERT INTO programs (department_id, name, level) VALUES ($1, 'BSc Computer Science', 'UNDERGRADUATE') RETURNING id;
    `, [deptId]);
    const progId = progRes.rows[0].id;

    // 5. Academic Year & Semester
    const yearRes = await client.query(`
      INSERT INTO academic_years (institution_id, name, start_date, end_date, is_current) 
      VALUES ($1, '2026-2027', '2026-09-01', '2027-06-30', TRUE) RETURNING id;
    `, [instId]);
    
    const semRes = await client.query(`
      INSERT INTO semesters (academic_year_id, name, start_date, end_date) 
      VALUES ($1, 'Fall 2026', '2026-09-01', '2026-12-20') RETURNING id;
    `, [yearRes.rows[0].id]);
    const semId = semRes.rows[0].id;

    // 6. Users (Mentors & Students)
    const mentorRes = await client.query(`
      INSERT INTO users (email, first_name, last_name, role_id) 
      VALUES ('dr.smith@globaltech.edu', 'Alan', 'Smith', $1) RETURNING id;
    `, [roles['MENTOR']]);
    const mentorUserId = mentorRes.rows[0].id;

    const studentRes = await client.query(`
      INSERT INTO users (email, first_name, last_name, role_id) 
      VALUES ('jdoe@student.globaltech.edu', 'Jane', 'Doe', $1) RETURNING id;
    `, [roles['STUDENT']]);
    const studentUserId = studentRes.rows[0].id;

    // 7. Profiles
    const mentorProfileRes = await client.query(`
      INSERT INTO mentor_profiles (user_id, department_id, specialization) 
      VALUES ($1, $2, 'Software Engineering') RETURNING id;
    `, [mentorUserId, deptId]);

    const studentProfileRes = await client.query(`
      INSERT INTO student_profiles (user_id, program_id, enrollment_date) 
      VALUES ($1, $2, '2025-09-01') RETURNING id;
    `, [studentUserId, progId]);
    const studentId = studentProfileRes.rows[0].id;

    // 8. Assignments
    await client.query(`
      INSERT INTO mentor_student_assignments (mentor_id, student_id) VALUES ($1, $2);
    `, [mentorProfileRes.rows[0].id, studentId]);

    // 9. Subjects & Offerings
    const subRes = await client.query(`
      INSERT INTO subjects (program_id, code, name, credits) 
      VALUES ($1, 'CS101', 'Introduction to Programming', 4) RETURNING id;
    `, [progId]);
    
    const offeringRes = await client.query(`
      INSERT INTO subject_offerings (subject_id, semester_id, instructor_id) 
      VALUES ($1, $2, $3) RETURNING id;
    `, [subRes.rows[0].id, semId, mentorUserId]);
    const offeringId = offeringRes.rows[0].id;

    // 10. Enrollments
    const enrollRes = await client.query(`
      INSERT INTO enrollments (student_id, offering_id) VALUES ($1, $2) RETURNING id;
    `, [studentId, offeringId]);
    const enrollId = enrollRes.rows[0].id;

    // 11. Assessments & Results
    const assessRes = await client.query(`
      INSERT INTO assessments (offering_id, name, type, max_marks, weightage) 
      VALUES ($1, 'Midterm Exam', 'EXAM', 100, 30) RETURNING id;
    `, [offeringId]);
    
    await client.query(`
      INSERT INTO assessment_results (assessment_id, enrollment_id, marks_obtained, feedback) 
      VALUES ($1, $2, 85.5, 'Good progress.')
    `, [assessRes.rows[0].id, enrollId]);

    // 12. Attendance
    const sessRes = await client.query(`
      INSERT INTO attendance_sessions (offering_id, date, start_time, end_time, type) 
      VALUES ($1, '2026-09-15', '10:00:00', '11:30:00', 'LECTURE') RETURNING id;
    `, [offeringId]);

    await client.query(`
      INSERT INTO attendance_records (session_id, enrollment_id, status) 
      VALUES ($1, $2, 'PRESENT');
    `, [sessRes.rows[0].id, enrollId]);

    // 13. Tasks & Goals
    const taskRes = await client.query(`
      INSERT INTO tasks (creator_id, assignee_id, title, description, status) 
      VALUES ($1, $2, 'Submit Project Proposal', 'Draft the initial architecture document.', 'PENDING') RETURNING id;
    `, [mentorUserId, studentUserId]);

    const goalRes = await client.query(`
      INSERT INTO goals (student_id, title, description) 
      VALUES ($1, 'Achieve Deans List', 'Maintain GPA above 3.8') RETURNING id;
    `, [studentId]);

    await client.query(`
      INSERT INTO goal_milestones (goal_id, title, is_completed) 
      VALUES ($1, 'Score >90 in CS101 Midterm', FALSE);
    `, [goalRes.rows[0].id]);

    await client.query('COMMIT');
    console.log('Seed data inserted successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
  } finally {
    await client.end();
  }
}

runSeed();
