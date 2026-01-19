-- 002_multiday_meets.up.sql
-- Support for multi-day meets and event dates

-- Rename date to start_date in meets table
ALTER TABLE meets RENAME COLUMN date TO start_date;

-- Add end_date column (defaults to start_date for existing single-day meets)
ALTER TABLE meets ADD COLUMN end_date DATE;
UPDATE meets SET end_date = start_date;
ALTER TABLE meets ALTER COLUMN end_date SET NOT NULL;

-- Add constraint to ensure end_date >= start_date
ALTER TABLE meets ADD CONSTRAINT meets_date_range_valid CHECK (end_date >= start_date);

-- Add event_date to times table (the specific day the event was swum)
ALTER TABLE times ADD COLUMN event_date DATE;

-- Update index for date range queries
DROP INDEX IF EXISTS idx_meets_date;
CREATE INDEX idx_meets_start_date ON meets(start_date);
CREATE INDEX idx_meets_end_date ON meets(end_date);

-- Add index for times event_date
CREATE INDEX idx_times_event_date ON times(event_date);
