-- name: GetSwimmer :one
SELECT id, name, birth_date, gender, created_at, updated_at
FROM swimmers
WHERE id = $1;

-- name: GetSwimmerByUserID :one
-- In a multi-user scenario, this would filter by user_id
-- For single-user MVP, just return the first swimmer
SELECT id, name, birth_date, gender, created_at, updated_at
FROM swimmers
LIMIT 1;

-- name: CreateSwimmer :one
INSERT INTO swimmers (name, birth_date, gender)
VALUES ($1, $2, $3)
RETURNING id, name, birth_date, gender, created_at, updated_at;

-- name: UpdateSwimmer :one
UPDATE swimmers
SET name = $2, birth_date = $3, gender = $4
WHERE id = $1
RETURNING id, name, birth_date, gender, created_at, updated_at;

-- name: DeleteSwimmer :exec
DELETE FROM swimmers
WHERE id = $1;

-- name: ListSwimmers :many
SELECT id, name, birth_date, gender, created_at, updated_at
FROM swimmers
ORDER BY name;

-- name: CountSwimmers :one
SELECT COUNT(*) FROM swimmers;
