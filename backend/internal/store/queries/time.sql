-- name: GetTime :one
SELECT 
    t.id, 
    t.swimmer_id, 
    t.meet_id, 
    t.event, 
    t.time_ms, 
    t.event_date,
    t.notes, 
    t.created_at, 
    t.updated_at
FROM times t
WHERE t.id = $1;

-- name: GetTimeWithMeet :one
SELECT 
    t.id, 
    t.swimmer_id, 
    t.meet_id, 
    t.event, 
    t.time_ms, 
    t.event_date,
    t.notes, 
    t.created_at, 
    t.updated_at,
    m.name AS meet_name,
    m.city AS meet_city,
    m.start_date AS meet_start_date,
    m.end_date AS meet_end_date,
    m.course_type AS meet_course_type
FROM times t
JOIN meets m ON m.id = t.meet_id
WHERE t.id = $1;

-- name: ListTimes :many
SELECT 
    t.id, 
    t.swimmer_id, 
    t.meet_id, 
    t.event, 
    t.time_ms, 
    t.event_date,
    t.notes, 
    t.created_at, 
    t.updated_at,
    m.name AS meet_name,
    m.city AS meet_city,
    m.start_date AS meet_start_date,
    m.end_date AS meet_end_date,
    m.course_type AS meet_course_type
FROM times t
JOIN meets m ON m.id = t.meet_id
WHERE t.swimmer_id = $1
  AND ($2::varchar = '' OR m.course_type = $2)
  AND ($3::varchar = '' OR t.event = $3)
  AND ($4::uuid = '00000000-0000-0000-0000-000000000000' OR t.meet_id = $4)
ORDER BY COALESCE(t.event_date, m.start_date) DESC, t.event
LIMIT $5 OFFSET $6;

-- name: CountTimes :one
SELECT COUNT(*) FROM times t
JOIN meets m ON m.id = t.meet_id
WHERE t.swimmer_id = $1
  AND ($2::varchar = '' OR m.course_type = $2)
  AND ($3::varchar = '' OR t.event = $3)
  AND ($4::uuid = '00000000-0000-0000-0000-000000000000' OR t.meet_id = $4);

-- name: CreateTime :one
INSERT INTO times (swimmer_id, meet_id, event, time_ms, event_date, notes)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, swimmer_id, meet_id, event, time_ms, event_date, notes, created_at, updated_at;

-- name: UpdateTime :one
UPDATE times
SET meet_id = $2, event = $3, time_ms = $4, event_date = $5, notes = $6
WHERE id = $1
RETURNING id, swimmer_id, meet_id, event, time_ms, event_date, notes, created_at, updated_at;

-- name: DeleteTime :exec
DELETE FROM times
WHERE id = $1;

-- name: DeleteTimesByMeet :exec
DELETE FROM times
WHERE meet_id = $1;

-- name: ListTimesByMeet :many
SELECT 
    t.id, 
    t.swimmer_id, 
    t.meet_id, 
    t.event, 
    t.time_ms, 
    t.event_date,
    t.notes, 
    t.created_at, 
    t.updated_at
FROM times t
WHERE t.meet_id = $1
ORDER BY COALESCE(t.event_date, (SELECT start_date FROM meets WHERE id = t.meet_id)), t.event, t.time_ms;

-- name: GetPersonalBests :many
-- Returns the fastest time for each event for a swimmer in a specific course type
SELECT DISTINCT ON (t.event)
    t.id,
    t.swimmer_id,
    t.meet_id,
    t.event,
    t.time_ms,
    t.event_date,
    t.notes,
    t.created_at,
    t.updated_at,
    m.name AS meet_name,
    m.start_date AS meet_date
FROM times t
JOIN meets m ON m.id = t.meet_id
WHERE t.swimmer_id = $1
  AND m.course_type = $2
ORDER BY t.event, t.time_ms ASC, COALESCE(t.event_date, m.start_date) DESC;

-- name: GetPersonalBestForEvent :one
-- Returns the fastest time for a specific event
SELECT 
    t.id,
    t.swimmer_id,
    t.meet_id,
    t.event,
    t.time_ms,
    t.event_date,
    t.notes,
    t.created_at,
    t.updated_at,
    m.name AS meet_name,
    m.start_date AS meet_date
FROM times t
JOIN meets m ON m.id = t.meet_id
WHERE t.swimmer_id = $1
  AND m.course_type = $2
  AND t.event = $3
ORDER BY t.time_ms ASC, COALESCE(t.event_date, m.start_date) DESC
LIMIT 1;

-- name: IsPersonalBest :one
-- Check if a given time is faster than all existing times for this event/course
SELECT NOT EXISTS (
    SELECT 1 FROM times t
    JOIN meets m ON m.id = t.meet_id
    WHERE t.swimmer_id = $1
      AND m.course_type = $2
      AND t.event = $3
      AND t.time_ms <= $4
      AND t.id != $5
) AS is_pb;

-- name: CountTimesByEvent :many
-- Returns count of times per event for a swimmer
SELECT event, COUNT(*)::int AS count
FROM times t
JOIN meets m ON m.id = t.meet_id
WHERE t.swimmer_id = $1
  AND ($2::varchar = '' OR m.course_type = $2)
GROUP BY event
ORDER BY event;

-- name: GetTotalTimeCount :one
SELECT COUNT(*)::int FROM times
WHERE swimmer_id = $1;

-- name: GetTotalMeetCount :one
SELECT COUNT(DISTINCT meet_id)::int FROM times
WHERE swimmer_id = $1;

-- name: EventExistsForMeet :one
-- Check if an event already exists for a specific meet and swimmer
SELECT EXISTS (
    SELECT 1 FROM times
    WHERE swimmer_id = $1
      AND meet_id = $2
      AND event = $3
) AS exists;

-- name: GetProgressData :many
-- Returns time progression for a specific event over time
-- Used for progress charts visualization
SELECT
    t.id,
    t.meet_id,
    t.time_ms,
    COALESCE(t.event_date, m.start_date) AS date,
    m.name AS meet_name,
    t.event,
    -- Check if this time is the personal best (fastest time for this event/course)
    (t.time_ms = (
        SELECT MIN(t2.time_ms)
        FROM times t2
        JOIN meets m2 ON m2.id = t2.meet_id
        WHERE t2.swimmer_id = t.swimmer_id
          AND m2.course_type = m.course_type
          AND t2.event = t.event
    )) AS is_pb
FROM times t
JOIN meets m ON m.id = t.meet_id
WHERE t.swimmer_id = $1
  AND m.course_type = $2
  AND t.event = $3
  AND ($4::date IS NULL OR COALESCE(t.event_date, m.start_date) >= $4)
  AND ($5::date IS NULL OR COALESCE(t.event_date, m.start_date) <= $5)
ORDER BY COALESCE(t.event_date, m.start_date) ASC, t.time_ms ASC;
