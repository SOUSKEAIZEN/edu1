exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE attendance_sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      offering_id UUID REFERENCES subject_offerings(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      type VARCHAR(50) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      CHECK (start_time < end_time)
    );

    CREATE TABLE attendance_records (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
      enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(session_id, enrollment_id)
    );

    CREATE TABLE tasks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
      assignee_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      due_date TIMESTAMPTZ,
      status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE task_submissions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
      content TEXT,
      submitted_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE task_feedback (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      submission_id UUID REFERENCES task_submissions(id) ON DELETE CASCADE,
      reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
      feedback TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE goals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      target_date DATE,
      status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'ABANDONED')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE goal_milestones (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      is_completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE learning_resources (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      url TEXT,
      type VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE learning_sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
      resource_id UUID REFERENCES learning_resources(id) ON DELETE SET NULL,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE topic_progress (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
      subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
      topic_name VARCHAR(255) NOT NULL,
      proficiency_level NUMERIC(3,2) CHECK (proficiency_level >= 0 AND proficiency_level <= 1),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(student_id, subject_id, topic_name)
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE topic_progress CASCADE;
    DROP TABLE learning_sessions CASCADE;
    DROP TABLE learning_resources CASCADE;
    DROP TABLE goal_milestones CASCADE;
    DROP TABLE goals CASCADE;
    DROP TABLE task_feedback CASCADE;
    DROP TABLE task_submissions CASCADE;
    DROP TABLE tasks CASCADE;
    DROP TABLE attendance_records CASCADE;
    DROP TABLE attendance_sessions CASCADE;
  `);
};
