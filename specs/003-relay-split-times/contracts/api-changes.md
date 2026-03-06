# API Contract Changes: Relay Split Times

## Overview

No new endpoints are added. Existing endpoints are extended to support split event codes. All changes are backward compatible.

## Modified Endpoints

### POST /api/v1/times

**Change**: Accepts split event codes (`50FRS`, `100FRS`, `200FRS`, `50BKS`, `100BKS`) in the `event` field.

**Request** (unchanged structure, new valid values):
```json
{
  "meet_id": "uuid",
  "event": "100FRS",
  "time_ms": 63500,
  "event_date": "2026-03-15",
  "notes": "Relay leadoff split"
}
```

**Response**: Same as existing (returns created time record).

**Validation**:
- Event must be in expanded `ValidEventCodes` (22 codes)
- One-event-per-meet applies per exact code: `100FR` and `100FRS` can coexist at the same meet
- Two `100FRS` at the same meet → 409 Conflict with `DUPLICATE_EVENT`

---

### POST /api/v1/times/batch

**Change**: Same as single creation — accepts split event codes in the batch.

**Validation**:
- No duplicate event codes within the batch (including splits)
- Both `100FR` and `100FRS` in the same batch → allowed
- Two `100FRS` in the same batch → 400 Bad Request

---

### GET /api/v1/personal-bests?course_type={25m|50m}

**Change**: Response includes merged PBs where split times compete with base event times.

**Response** (extended with `is_from_split` field):
```json
{
  "course_type": "25m",
  "personal_bests": [
    {
      "event": "100FR",
      "time_ms": 63500,
      "time_formatted": "1:03.50",
      "time_id": "uuid",
      "meet": "Spring Meet 2026",
      "date": "Mar 15, 2026",
      "is_from_split": true
    },
    {
      "event": "200FR",
      "time_ms": 145000,
      "time_formatted": "2:25.00",
      "time_id": "uuid",
      "meet": "Winter Meet 2025",
      "date": "Dec 1, 2025",
      "is_from_split": false
    }
  ]
}
```

**Key behavior**:
- PBs are returned keyed by **base event** codes only (never `100FRS`)
- If the split time is faster, `is_from_split` is `true` and the `time_id` points to the split time record
- If no individual time exists but a split does, the split is the PB with `is_from_split: true`

---

### GET /api/v1/comparisons?course_type={25m|50m}&standard_id={uuid}

**Change**: Uses merged PBs (including splits) for comparison. Response gains `is_from_split` field.

**Response** (extended):
```json
{
  "comparisons": [
    {
      "event": "100FR",
      "swimmer_time_ms": 63500,
      "swimmer_time_formatted": "1:03.50",
      "standard_time_ms": 62000,
      "standard_time_formatted": "1:02.00",
      "difference_ms": 1500,
      "difference_formatted": "+1.50",
      "percentage": 2.42,
      "status": "almost",
      "is_from_split": true,
      "meet_name": "Spring Meet 2026",
      "date": "Mar 15, 2026"
    }
  ]
}
```

---

### GET /api/v1/progress/{event}?course_type={25m|50m}

**Change**: Returns times for both the base event and its split variant (if one exists).

**Request**: Same as existing. The `{event}` parameter accepts **base event codes only** (e.g., `100FR`, not `100FRS`).

**Response** (extended with `is_split` field on data points):
```json
{
  "event": "100FR",
  "data": [
    {
      "id": "uuid",
      "meet_id": "uuid",
      "time_ms": 65320,
      "date": "2026-01-15",
      "meet_name": "Winter Meet",
      "event": "100FR",
      "is_pb": false,
      "is_split": false
    },
    {
      "id": "uuid",
      "meet_id": "uuid",
      "time_ms": 63500,
      "date": "2026-03-15",
      "meet_name": "Spring Meet",
      "event": "100FRS",
      "is_pb": true,
      "is_split": true
    }
  ]
}
```

**Key behavior**:
- Requesting progress for `100FR` returns both `100FR` and `100FRS` times
- The `is_pb` calculation considers both base and split times together
- The `event` field in each data point indicates whether the time is from a split
- `is_split` is a convenience boolean derived from the event code

---

### GET /api/v1/times

**Change**: Split event codes appear in results. Filter by event uses exact match.

- `?event=100FR` → returns only `100FR` times
- `?event=100FRS` → returns only `100FRS` times
- No filter → returns all times including splits

---

### GET /api/v1/data/export

**Change**: Split event codes appear in exported times (e.g., `"event": "100FRS"`).

### POST /api/v1/data/import/preview and POST /api/v1/data/import

**Change**: Accepts split event codes in imported data.

## Unchanged Endpoints

- `GET /api/v1/health`, `GET /api/health`
- `GET /api/v1/auth/me`
- `GET|PUT /api/v1/swimmer`
- `GET|POST /api/v1/meets`, `GET|PUT|DELETE /api/v1/meets/{id}`
- `PUT|DELETE /api/v1/times/{id}`
- `GET|POST /api/v1/standards`, `POST /api/v1/standards/import/*`
- `GET|PUT|DELETE /api/v1/standards/{id}`, `PUT /api/v1/standards/{id}/times`
