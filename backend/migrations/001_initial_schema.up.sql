-- 001_initial_schema.up.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE swimmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('female', 'male')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE meets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Canada',
    date DATE NOT NULL,
    course_type VARCHAR(3) NOT NULL CHECK (course_type IN ('25m', '50m')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meets_course_type ON meets(course_type);
CREATE INDEX idx_meets_date ON meets(date);

CREATE TABLE times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    swimmer_id UUID NOT NULL REFERENCES swimmers(id) ON DELETE CASCADE,
    meet_id UUID NOT NULL REFERENCES meets(id) ON DELETE CASCADE,
    event VARCHAR(50) NOT NULL,
    time_ms INTEGER NOT NULL CHECK (time_ms > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_times_swimmer_id ON times(swimmer_id);
CREATE INDEX idx_times_meet_id ON times(meet_id);
CREATE INDEX idx_times_event ON times(event);
CREATE INDEX idx_times_swimmer_event ON times(swimmer_id, event);

CREATE TABLE time_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    course_type VARCHAR(3) NOT NULL CHECK (course_type IN ('25m', '50m')),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('female', 'male')),
    is_preloaded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_standards_course_type ON time_standards(course_type);
CREATE INDEX idx_standards_gender ON time_standards(gender);

CREATE TABLE standard_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_id UUID NOT NULL REFERENCES time_standards(id) ON DELETE CASCADE,
    event VARCHAR(50) NOT NULL,
    age_group VARCHAR(20) NOT NULL,
    time_ms INTEGER NOT NULL CHECK (time_ms > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (standard_id, event, age_group)
);

CREATE INDEX idx_standard_times_standard_id ON standard_times(standard_id);
CREATE INDEX idx_standard_times_event_age ON standard_times(event, age_group);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER swimmers_updated_at BEFORE UPDATE ON swimmers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER meets_updated_at BEFORE UPDATE ON meets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER times_updated_at BEFORE UPDATE ON times
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER time_standards_updated_at BEFORE UPDATE ON time_standards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER standard_times_updated_at BEFORE UPDATE ON standard_times
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
