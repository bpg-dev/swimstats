-- name: GetStandardTime :one
SELECT id, standard_id, event, age_group, time_ms, created_at, updated_at
FROM standard_times
WHERE id = $1;

-- name: ListStandardTimes :many
SELECT id, standard_id, event, age_group, time_ms, created_at, updated_at
FROM standard_times
WHERE standard_id = $1
ORDER BY 
    CASE event
        WHEN '50FR' THEN 1 WHEN '100FR' THEN 2 WHEN '200FR' THEN 3 WHEN '400FR' THEN 4 WHEN '800FR' THEN 5 WHEN '1500FR' THEN 6
        WHEN '50BK' THEN 7 WHEN '100BK' THEN 8 WHEN '200BK' THEN 9
        WHEN '50BR' THEN 10 WHEN '100BR' THEN 11 WHEN '200BR' THEN 12
        WHEN '50FL' THEN 13 WHEN '100FL' THEN 14 WHEN '200FL' THEN 15
        WHEN '200IM' THEN 16 WHEN '400IM' THEN 17
        ELSE 99
    END,
    CASE age_group
        WHEN '10U' THEN 1 WHEN '11-12' THEN 2 WHEN '13-14' THEN 3 WHEN '15-17' THEN 4 WHEN 'OPEN' THEN 5
        ELSE 99
    END;

-- name: GetStandardTimeForEventAndAge :one
SELECT id, standard_id, event, age_group, time_ms, created_at, updated_at
FROM standard_times
WHERE standard_id = $1 AND event = $2 AND age_group = $3;

-- name: CreateStandardTime :one
INSERT INTO standard_times (standard_id, event, age_group, time_ms)
VALUES ($1, $2, $3, $4)
RETURNING id, standard_id, event, age_group, time_ms, created_at, updated_at;

-- name: UpdateStandardTime :one
UPDATE standard_times
SET event = $2, age_group = $3, time_ms = $4
WHERE id = $1
RETURNING id, standard_id, event, age_group, time_ms, created_at, updated_at;

-- name: DeleteStandardTime :exec
DELETE FROM standard_times
WHERE id = $1;

-- name: DeleteStandardTimesByStandardID :exec
DELETE FROM standard_times
WHERE standard_id = $1;

-- name: UpsertStandardTime :one
INSERT INTO standard_times (standard_id, event, age_group, time_ms)
VALUES ($1, $2, $3, $4)
ON CONFLICT (standard_id, event, age_group) 
DO UPDATE SET time_ms = EXCLUDED.time_ms
RETURNING id, standard_id, event, age_group, time_ms, created_at, updated_at;
