# Data Model: Swim Progress Tracker

**Phase**: 1 - Design
**Date**: 2026-01-17

## Entity Relationship Diagram

```text
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Swimmer   │       │    Meet     │       │    Time     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ name        │       │ name        │       │ swimmer_id  │──┐
│ birth_date  │       │ city        │       │ meet_id     │──┼─┐
│ gender      │       │ country     │       │ event       │  │ │
│ created_at  │       │ date        │       │ time_ms     │  │ │
│ updated_at  │       │ course_type │       │ notes       │  │ │
└─────────────┘       │ created_at  │       │ created_at  │  │ │
      │               │ updated_at  │       │ updated_at  │  │ │
      │               └─────────────┘       └─────────────┘  │ │
      │                     │                     │          │ │
      └─────────────────────┴─────────────────────┴──────────┘ │
                                                               │
┌─────────────────┐       ┌─────────────────┐                  │
│  TimeStandard   │       │  StandardTime   │                  │
├─────────────────┤       ├─────────────────┤                  │
│ id (PK)         │       │ id (PK)         │                  │
│ name            │       │ standard_id     │──────────────────┘
│ description     │       │ event           │
│ course_type     │       │ age_group       │
│ is_preloaded    │       │ time_ms         │
│ created_at      │       │ created_at      │
│ updated_at      │       │ updated_at      │
└─────────────────┘       └─────────────────┘
```

## Entities

### Swimmer

The athlete being tracked. Single swimmer initially, model supports multiple.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Swimmer's full name |
| birth_date | DATE | NOT NULL | Date of birth (for age calculations) |
| gender | VARCHAR(10) | NOT NULL, CHECK(gender IN ('female', 'male')) | Gender for standards matching |
| threshold_percent | DECIMAL(5,2) | NOT NULL, DEFAULT 3.0, CHECK(0-100) | "Almost there" threshold percentage |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update time |

**Validation Rules**:
- name: 1-255 characters, non-empty after trim
- birth_date: Must be in the past, reasonable range (not before 1990)
- gender: Must be 'female' or 'male' (matches swimming standards categories)

### Meet

A swimming competition or time trial event.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Meet name (e.g., "Ontario Championships") |
| city | VARCHAR(255) | NOT NULL | City where meet was held |
| country | VARCHAR(100) | NOT NULL, DEFAULT 'Canada' | Country |
| date | DATE | NOT NULL | Date of the meet |
| course_type | VARCHAR(3) | NOT NULL, CHECK(course_type IN ('25m', '50m')) | Pool length |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update time |

**Validation Rules**:
- name: 1-255 characters, non-empty after trim
- city: 1-255 characters
- country: 1-100 characters, defaults to 'Canada'
- date: Valid date, typically not in the future
- course_type: Must be '25m' or '50m'

**Indexes**:
- `idx_meets_course_type` on (course_type)
- `idx_meets_date` on (date)

### Time

A recorded swim performance at a specific meet.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| swimmer_id | UUID | FK → Swimmer, NOT NULL | The swimmer |
| meet_id | UUID | FK → Meet, NOT NULL | The meet where time was recorded |
| event | VARCHAR(50) | NOT NULL | Event code (e.g., '100FR', '200IM') |
| time_ms | INTEGER | NOT NULL, CHECK(time_ms > 0) | Time in milliseconds |
| notes | TEXT | NULL | Optional notes (heat, final, etc.) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update time |

**Event Codes**:
| Code | Event |
|------|-------|
| 50FR | 50m Freestyle |
| 100FR | 100m Freestyle |
| 200FR | 200m Freestyle |
| 400FR | 400m Freestyle |
| 800FR | 800m Freestyle |
| 1500FR | 1500m Freestyle |
| 50BK | 50m Backstroke |
| 100BK | 100m Backstroke |
| 200BK | 200m Backstroke |
| 50BR | 50m Breaststroke |
| 100BR | 100m Breaststroke |
| 200BR | 200m Breaststroke |
| 50FL | 50m Butterfly |
| 100FL | 100m Butterfly |
| 200FL | 200m Butterfly |
| 200IM | 200m Individual Medley |
| 400IM | 400m Individual Medley |

**Validation Rules**:
- event: Must be valid event code from list above
- time_ms: Positive integer (e.g., 65320 = 1:05.32)
- notes: Optional, max 1000 characters

**Indexes**:
- `idx_times_swimmer_id` on (swimmer_id)
- `idx_times_meet_id` on (meet_id)
- `idx_times_event` on (event)
- `idx_times_swimmer_event` on (swimmer_id, event) -- for PB queries

### TimeStandard

A named collection of qualifying times (e.g., "Swimming Canada Provincial 2026").

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(255) | NOT NULL, UNIQUE | Standard name |
| description | TEXT | NULL | Optional description |
| course_type | VARCHAR(3) | NOT NULL, CHECK(course_type IN ('25m', '50m')) | Which course this applies to |
| is_preloaded | BOOLEAN | NOT NULL, DEFAULT FALSE | True if system-provided standard |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update time |

**Validation Rules**:
- name: 1-255 characters, unique
- course_type: Must be '25m' or '50m'

**Indexes**:
- `idx_standards_course_type` on (course_type)

### StandardTime

Individual qualifying times within a standard.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| standard_id | UUID | FK → TimeStandard, NOT NULL | Parent standard |
| event | VARCHAR(50) | NOT NULL | Event code |
| age_group | VARCHAR(20) | NOT NULL | Age group code |
| time_ms | INTEGER | NOT NULL, CHECK(time_ms > 0) | Qualifying time in ms |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update time |

**Age Group Codes**:
| Code | Description |
|------|-------------|
| 10U | 10 & Under |
| 11-12 | 11-12 years |
| 13-14 | 13-14 years |
| 15-17 | 15-17 years |
| OPEN | Senior/Open |

**Validation Rules**:
- event: Must be valid event code
- age_group: Must be valid age group code
- time_ms: Positive integer
- Unique constraint on (standard_id, event, age_group)

**Indexes**:
- `idx_standard_times_standard_id` on (standard_id)
- `idx_standard_times_event_age` on (event, age_group)
- Unique index on (standard_id, event, age_group)

## Derived Data

### Personal Best

Personal bests are **computed at query time**, not stored. This ensures consistency when times are added/edited/deleted.

**Query Logic**:
```sql
SELECT DISTINCT ON (t.event)
  t.event,
  t.time_ms,
  t.id as time_id,
  m.date,
  m.name as meet_name
FROM times t
JOIN meets m ON t.meet_id = m.id
WHERE t.swimmer_id = $1
  AND m.course_type = $2
ORDER BY t.event, t.time_ms ASC, m.date DESC;
```

### Age at Competition

Calculated using Swimming Canada rules: age as of December 31 of competition year.

**Calculation**:
```go
func AgeAtCompetition(birthDate, meetDate time.Time) int {
    competitionYear := meetDate.Year()
    dec31 := time.Date(competitionYear, 12, 31, 0, 0, 0, 0, time.UTC)
    age := dec31.Year() - birthDate.Year()
    if dec31.YearDay() < birthDate.YearDay() {
        age--
    }
    return age
}
```

### Age Group from Age

```go
func AgeGroupFromAge(age int) string {
    switch {
    case age <= 10:
        return "10U"
    case age <= 12:
        return "11-12"
    case age <= 14:
        return "13-14"
    case age <= 17:
        return "15-17"
    default:
        return "OPEN"
    }
}
```

## Time Formatting

### Storage → Display

```go
func FormatTime(ms int) string {
    totalSeconds := ms / 1000
    hundredths := (ms % 1000) / 10
    minutes := totalSeconds / 60
    seconds := totalSeconds % 60
    
    if minutes == 0 {
        return fmt.Sprintf("%d.%02d", seconds, hundredths)
    }
    return fmt.Sprintf("%d:%02d.%02d", minutes, seconds, hundredths)
}
```

### Display → Storage

```go
func ParseTime(s string) (int, error) {
    // Handles: "28.45", "1:05.32", "16:42.18"
    // Returns milliseconds
}
```

## Database Migrations

### Migration 001: Initial Schema

```sql
-- 001_initial_schema.up.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE swimmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('female', 'male')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE meets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Canada',
    date DATE NOT NULL,
    course_type VARCHAR(3) NOT NULL CHECK (course_type IN ('25m', '50m')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meets_course_type ON meets(course_type);
CREATE INDEX idx_meets_date ON meets(date);

CREATE TABLE times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    swimmer_id UUID NOT NULL REFERENCES swimmers(id) ON DELETE CASCADE,
    meet_id UUID NOT NULL REFERENCES meets(id) ON DELETE CASCADE,
    event VARCHAR(50) NOT NULL,
    time_ms INTEGER NOT NULL CHECK (time_ms > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_times_swimmer_id ON times(swimmer_id);
CREATE INDEX idx_times_meet_id ON times(meet_id);
CREATE INDEX idx_times_event ON times(event);
CREATE INDEX idx_times_swimmer_event ON times(swimmer_id, event);

CREATE TABLE time_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    course_type VARCHAR(3) NOT NULL CHECK (course_type IN ('25m', '50m')),
    is_preloaded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_standards_course_type ON time_standards(course_type);

CREATE TABLE standard_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_id UUID NOT NULL REFERENCES time_standards(id) ON DELETE CASCADE,
    event VARCHAR(50) NOT NULL,
    age_group VARCHAR(20) NOT NULL,
    time_ms INTEGER NOT NULL CHECK (time_ms > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (standard_id, event, age_group)
);

CREATE INDEX idx_standard_times_standard_id ON standard_times(standard_id);
CREATE INDEX idx_standard_times_event_age ON standard_times(event, age_group);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER swimmers_updated_at BEFORE UPDATE ON swimmers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER meets_updated_at BEFORE UPDATE ON meets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER times_updated_at BEFORE UPDATE ON times
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER time_standards_updated_at BEFORE UPDATE ON time_standards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER standard_times_updated_at BEFORE UPDATE ON standard_times
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

```sql
-- 001_initial_schema.down.sql

DROP TABLE IF EXISTS standard_times;
DROP TABLE IF EXISTS time_standards;
DROP TABLE IF EXISTS times;
DROP TABLE IF EXISTS meets;
DROP TABLE IF EXISTS swimmers;
DROP FUNCTION IF EXISTS update_updated_at();
```
