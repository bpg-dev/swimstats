-- 002_multiday_meets.down.sql
-- Revert multi-day meets support

-- Drop indexes
DROP INDEX IF EXISTS idx_times_event_date;
DROP INDEX IF EXISTS idx_meets_end_date;
DROP INDEX IF EXISTS idx_meets_start_date;

-- Remove event_date from times
ALTER TABLE times DROP COLUMN IF EXISTS event_date;

-- Remove constraint and end_date from meets
ALTER TABLE meets DROP CONSTRAINT IF EXISTS meets_date_range_valid;
ALTER TABLE meets DROP COLUMN IF EXISTS end_date;

-- Rename start_date back to date
ALTER TABLE meets RENAME COLUMN start_date TO date;

-- Recreate original index
CREATE INDEX idx_meets_date ON meets(date);
