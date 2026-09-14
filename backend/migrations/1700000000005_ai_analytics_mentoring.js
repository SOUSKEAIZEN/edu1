exports.up = (pgm) => {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS vector;

    CREATE TABLE ai_conversations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255),
      started_at TIMESTAMPTZ DEFAULT NOW(),
      last_active_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE ai_messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
      sender VARCHAR(20) NOT NULL CHECK (sender IN ('USER', 'AI', 'SYSTEM')),
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE ai_context_records (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      message_id UUID REFERENCES ai_messages(id) ON DELETE CASCADE,
      context_data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE ai_response_feedback (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      message_id UUID REFERENCES ai_messages(id) ON DELETE CASCADE UNIQUE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comments TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE documents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
      status VARCHAR(50) DEFAULT 'PROCESSING',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE document_versions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      storage_url TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(document_id, version_number)
    );

    CREATE TABLE document_chunks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      version_id UUID REFERENCES document_versions(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      embedding vector(1536), -- Assumes pgvector is available
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE student_metric_snapshots (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
      gpa NUMERIC(4,2),
      attendance_rate NUMERIC(5,2),
      snapshot_date DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(student_id, snapshot_date)
    );

    CREATE TABLE risk_snapshots (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
      overall_risk_score NUMERIC(5,2) NOT NULL,
      academic_risk NUMERIC(5,2),
      attendance_risk NUMERIC(5,2),
      engagement_risk NUMERIC(5,2),
      confidence_score NUMERIC(5,2),
      contributing_factors JSONB,
      snapshot_date DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(student_id, snapshot_date)
    );

    CREATE TABLE recommendations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
      source VARCHAR(50) NOT NULL CHECK (source IN ('AI', 'MENTOR', 'SYSTEM')),
      type VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'PENDING',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE mentor_notes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      mentor_id UUID REFERENCES mentor_profiles(id) ON DELETE CASCADE,
      student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      is_private BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE mentor_interventions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      mentor_id UUID REFERENCES mentor_profiles(id) ON DELETE CASCADE,
      student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
      trigger_source VARCHAR(100),
      issue_description TEXT NOT NULL,
      action_taken TEXT NOT NULL,
      expected_outcome TEXT,
      follow_up_date DATE,
      status VARCHAR(50) DEFAULT 'OPEN',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE intervention_outcomes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      intervention_id UUID REFERENCES mentor_interventions(id) ON DELETE CASCADE UNIQUE,
      actual_outcome TEXT NOT NULL,
      success_rating INTEGER CHECK (success_rating >= 1 AND success_rating <= 5),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE notification_preferences (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      email_enabled BOOLEAN DEFAULT TRUE,
      push_enabled BOOLEAN DEFAULT TRUE,
      in_app_enabled BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE audit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(255) NOT NULL,
      entity_type VARCHAR(100),
      entity_id UUID,
      old_values JSONB,
      new_values JSONB,
      ip_address VARCHAR(45),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE security_events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      event_type VARCHAR(100) NOT NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      details JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Common Indexes
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_enrollments_student ON enrollments(student_id);
    CREATE INDEX idx_assessment_results_enrollment ON assessment_results(enrollment_id);
    CREATE INDEX idx_attendance_records_enrollment ON attendance_records(enrollment_id);
    CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
    CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE security_events CASCADE;
    DROP TABLE audit_logs CASCADE;
    DROP TABLE notification_preferences CASCADE;
    DROP TABLE notifications CASCADE;
    DROP TABLE intervention_outcomes CASCADE;
    DROP TABLE mentor_interventions CASCADE;
    DROP TABLE mentor_notes CASCADE;
    DROP TABLE recommendations CASCADE;
    DROP TABLE risk_snapshots CASCADE;
    DROP TABLE student_metric_snapshots CASCADE;
    DROP TABLE document_chunks CASCADE;
    DROP TABLE document_versions CASCADE;
    DROP TABLE documents CASCADE;
    DROP TABLE ai_response_feedback CASCADE;
    DROP TABLE ai_context_records CASCADE;
    DROP TABLE ai_messages CASCADE;
    DROP TABLE ai_conversations CASCADE;
  `);
};
