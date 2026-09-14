exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE student_profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
      enrollment_date DATE,
      status VARCHAR(50) DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE student_preferences (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE UNIQUE,
      communication_preference VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE mentor_profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
      specialization VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE mentor_student_assignments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      mentor_id UUID REFERENCES mentor_profiles(id) ON DELETE CASCADE,
      student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
      assigned_at TIMESTAMPTZ DEFAULT NOW(),
      unassigned_at TIMESTAMPTZ,
      UNIQUE(mentor_id, student_id)
    );

    CREATE TABLE subjects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
      code VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      credits INTEGER NOT NULL CHECK (credits > 0),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE subject_offerings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
      semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
      instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(subject_id, semester_id)
    );

    CREATE TABLE enrollments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
      offering_id UUID REFERENCES subject_offerings(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'ENROLLED',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(student_id, offering_id)
    );

    CREATE TABLE assessments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      offering_id UUID REFERENCES subject_offerings(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      max_marks NUMERIC(5,2) NOT NULL CHECK (max_marks > 0),
      weightage NUMERIC(5,2) NOT NULL CHECK (weightage >= 0 AND weightage <= 100),
      due_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE assessment_results (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
      enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
      marks_obtained NUMERIC(5,2) NOT NULL CHECK (marks_obtained >= 0),
      feedback TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(assessment_id, enrollment_id)
    );

    -- Ensure marks obtained do not exceed max_marks (requires a trigger or we rely on application logic, but since requirements say "Marks must never exceed assessment maximum marks", we can add a check constraint if we denormalize, but since they are in different tables, we use a trigger).
    
    CREATE OR REPLACE FUNCTION check_marks_obtained() RETURNS TRIGGER AS $$
    DECLARE
      max_m NUMERIC;
    BEGIN
      SELECT max_marks INTO max_m FROM assessments WHERE id = NEW.assessment_id;
      IF NEW.marks_obtained > max_m THEN
        RAISE EXCEPTION 'Marks obtained (%s) exceed maximum marks (%s)', NEW.marks_obtained, max_m;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_check_marks
      BEFORE INSERT OR UPDATE ON assessment_results
      FOR EACH ROW EXECUTE FUNCTION check_marks_obtained();

  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TRIGGER IF EXISTS trigger_check_marks ON assessment_results;
    DROP FUNCTION IF EXISTS check_marks_obtained;
    DROP TABLE assessment_results CASCADE;
    DROP TABLE assessments CASCADE;
    DROP TABLE enrollments CASCADE;
    DROP TABLE subject_offerings CASCADE;
    DROP TABLE subjects CASCADE;
    DROP TABLE mentor_student_assignments CASCADE;
    DROP TABLE mentor_profiles CASCADE;
    DROP TABLE student_preferences CASCADE;
    DROP TABLE student_profiles CASCADE;
  `);
};
