exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE institutions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE departments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE programs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      level VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE academic_years (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
      name VARCHAR(50) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_current BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      CHECK (start_date < end_date)
    );

    CREATE TABLE semesters (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
      name VARCHAR(50) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      CHECK (start_date < end_date)
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE semesters CASCADE;
    DROP TABLE academic_years CASCADE;
    DROP TABLE programs CASCADE;
    DROP TABLE departments CASCADE;
    DROP TABLE institutions CASCADE;
  `);
};
