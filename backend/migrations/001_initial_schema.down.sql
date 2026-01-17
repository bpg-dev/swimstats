-- 001_initial_schema.down.sql

DROP TRIGGER IF EXISTS standard_times_updated_at ON standard_times;
DROP TRIGGER IF EXISTS time_standards_updated_at ON time_standards;
DROP TRIGGER IF EXISTS times_updated_at ON times;
DROP TRIGGER IF EXISTS meets_updated_at ON meets;
DROP TRIGGER IF EXISTS swimmers_updated_at ON swimmers;

DROP TABLE IF EXISTS standard_times;
DROP TABLE IF EXISTS time_standards;
DROP TABLE IF EXISTS times;
DROP TABLE IF EXISTS meets;
DROP TABLE IF EXISTS swimmers;

DROP FUNCTION IF EXISTS update_updated_at();

DROP EXTENSION IF EXISTS "uuid-ossp";
