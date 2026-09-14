-- Evaluation Framework Schema

CREATE TABLE IF NOT EXISTS ai_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_case_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- FACTUALITY, HALLUCINATION, PRIVACY, INJECTION, ACADEMIC_INTEGRITY
  prompt_version VARCHAR(50) NOT NULL,
  model_version VARCHAR(50) NOT NULL,
  input_text TEXT NOT NULL,
  expected_behavior TEXT NOT NULL,
  actual_output TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  evaluation_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendation_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recommendation_id UUID NOT NULL,
  student_id UUID NOT NULL,
  is_accepted BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  user_rating INTEGER, -- 1-5 usefulness
  pre_intervention_score DECIMAL,
  post_intervention_score DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
