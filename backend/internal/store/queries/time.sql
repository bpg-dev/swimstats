-- name: GetTime :one
SELECT 
    t.id, 
    t.swimmer_id, 
    t.meet_id, 
    t.event, 
    t.time_ms, 
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
    t.notes, 
    t.created_at, 
    t.updated_at,
    m.name AS meet_name,
    m.city AS meet_city,
    m.date AS meet_date,
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
    t.notes, 
    t.created_at, 
    t.updated_at,
    m.name AS meet_name,
    m.city AS meet_city,
    m.date AS meet_date,
    m.course_type AS meet_course_type
FROM times t
JOIN meets m ON m.id = t.meet_id
WHERE t.swimmer_id = $1
  AND ($2::varchar = '' OR m.course_type = $2)
  AND ($3::varchar = '' OR t.event = $3)
  AND ($4::uuid = '00000000-0000-0000-0000-000000000000' OR t.meet_id = $4)
ORDER BY m.date DESC, t.event
LIMIT $5 OFFSET $6;

-- name: CountTimes :one
SELECT COUNT(*) FROM times t
JOIN meets m ON m.id = t.meet_id
WHERE t.swimmer_id = $1
  AND ($2::varchar = '' OR m.course_type = $2)
  AND ($3::varchar = '' OR t.event = $3)
  AND ($4::uuid = '00000000-0000-0000-0000-000000000000' OR t.meet_id = $4);

-- name: CreateTime :one
INSERT INTO times (swimmer_id, meet_id, event, time_ms, notes)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, swimmer_id, meet_id, event, time_ms, notes, created_at, updated_at;

-- name: UpdateTime :one
UPDATE times
SET meet_id = $2, event = $3, time_ms = $4, notes = $5
WHERE id = $1
RETURNING id, swimmer_id, meet_id, event, time_ms, notes, created_at, updated_at;

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
    t.notes, 
    t.created_at, 
    t.updated_at
FROM times t
WHERE t.meet_id = $1
ORDER BY t.event, t.time_ms;

-- name: GetPersonalBests :many
-- Returns the fastest time for each event for a swimmer in a specific course type
SELECT DISTINCT ON (t.event)
    t.id,
    t.swimmer_id,
    t.meet_id,
    t.event,
    t.time_ms,
    t.notes,
    t.created_at,
    t.updated_at,
    m.name AS meet_name,
    m.date AS meet_date
FROM times t
JOIN meets m ON m.id = t.meet_id
WHERE t.swimmer_id = $1
  AND m.course_type = $2
ORDER BY t.event, t.time_ms ASC, m.date DESC;

-- name: GetPersonalBestForEvent :one
-- Returns the fastest time for a specific event
SELECT 
    t.id,
    t.swimmer_id,
    t.meet_id,
    t.event,
    t.time_ms,
    t.notes,
    t.created_at,
    t.updated_at,
    m.name AS meet_name,
    m.date AS meet_date
FROM times t
JOIN meets m ON m.id = t.meet_id
WHERE t.swimmer_id = $1
  AND m.course_type = $2
  AND t.event = $3
ORDER BY t.time_ms ASC, m.date DESC
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
-- Check if an event already exists for a specific meet
SELECT EXISTS (
    SELECT 1 FROM times
    WHERE meet_id = $1 AND event = $2
) AS exists;
