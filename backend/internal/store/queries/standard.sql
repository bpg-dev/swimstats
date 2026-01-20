-- name: GetStandard :one
SELECT id, name, description, course_type, gender, is_preloaded, created_at, updated_at
FROM time_standards
WHERE id = $1;

-- name: ListStandards :many
SELECT id, name, description, course_type, gender, is_preloaded, created_at, updated_at
FROM time_standards
WHERE ($1::varchar = '' OR course_type = $1)
  AND ($2::varchar = '' OR gender = $2)
ORDER BY is_preloaded DESC, name ASC;

-- name: CreateStandard :one
INSERT INTO time_standards (name, description, course_type, gender, is_preloaded)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, name, description, course_type, gender, is_preloaded, created_at, updated_at;

-- name: UpdateStandard :one
UPDATE time_standards
SET name = $2, description = $3, course_type = $4, gender = $5
WHERE id = $1
RETURNING id, name, description, course_type, gender, is_preloaded, created_at, updated_at;

-- name: DeleteStandard :exec
DELETE FROM time_standards
WHERE id = $1;

-- name: StandardExists :one
SELECT EXISTS(SELECT 1 FROM time_standards WHERE id = $1);

-- name: StandardNameExists :one
SELECT EXISTS(SELECT 1 FROM time_standards WHERE name = $1 AND id != $2);
