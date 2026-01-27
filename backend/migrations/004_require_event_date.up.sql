-- Backfill NULL event_dates with the meet's start_date
UPDATE times t
SET event_date = m.start_date
FROM meets m
WHERE t.meet_id = m.id
  AND t.event_date IS NULL;

-- Add NOT NULL constraint to event_date
ALTER TABLE times ALTER COLUMN event_date SET NOT NULL;
