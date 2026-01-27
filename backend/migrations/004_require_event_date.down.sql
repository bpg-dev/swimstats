-- Remove NOT NULL constraint from event_date
ALTER TABLE times ALTER COLUMN event_date DROP NOT NULL;
