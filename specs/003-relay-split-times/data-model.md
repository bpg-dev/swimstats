# Data Model: Relay Split Times

## Event Code Extensions

### New Event Constants

| Code | Display Name | Base Event | Stroke |
|------|-------------|------------|--------|
| `50FRS` | 50m Freestyle Split | `50FR` | Freestyle |
| `100FRS` | 100m Freestyle Split | `100FR` | Freestyle |
| `200FRS` | 200m Freestyle Split | `200FR` | Freestyle |
| `50BKS` | 50m Backstroke Split | `50BK` | Backstroke |
| `100BKS` | 100m Backstroke Split | `100BK` | Backstroke |

### Event Code Categories

```
AllEventCodes (22 total)
├── IndividualEventCodes (17) — the original events, used for comparison/standard display
│   ├── 50FR, 100FR, 200FR, 400FR, 800FR, 1500FR
│   ├── 50BK, 100BK, 200BK
│   ├── 50BR, 100BR, 200BR
│   ├── 50FL, 100FL, 200FL
│   └── 200IM, 400IM
└── SplitEventCodes (5) — relay leadoff split variants
    ├── 50FRS, 100FRS, 200FRS
    └── 50BKS, 100BKS
```

### Helper Methods on EventCode

| Method | Returns | Example |
|--------|---------|---------|
| `IsSplit()` | `bool` | `EventCode("100FRS").IsSplit()` → `true` |
| `BaseEvent()` | `EventCode` | `EventCode("100FRS").BaseEvent()` → `"100FR"` |
| `SplitVariant()` | `EventCode, bool` | `EventCode("100FR").SplitVariant()` → `"100FRS", true` |
| `IsValid()` | `bool` | Validates against all 22 codes |
| `Description()` | `string` | `"100m Freestyle Split"` |
| `Stroke()` | `string` | Same stroke as base event |

### Validation Rules

- `IsSplit()`: Returns true if event code is in `SplitEventCodes`
- `BaseEvent()`: For split events, returns the base event (strip trailing `S`). For non-split events, returns itself.
- `SplitVariant()`: Returns the split variant if one exists for this base event. Returns `("", false)` for events that cannot have splits (400FR, 800FR, etc.).
- Split-eligible base events: `50FR`, `100FR`, `200FR`, `50BK`, `100BK` (exactly 5)

## Database Schema

### No Migration Required

The existing `times` table schema accommodates split event codes without changes:

```sql
-- Existing schema (no changes)
CREATE TABLE times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    swimmer_id UUID NOT NULL REFERENCES swimmers(id),
    meet_id UUID NOT NULL REFERENCES meets(id),
    event VARCHAR(50) NOT NULL,  -- stores "100FRS" etc.
    time_ms INTEGER NOT NULL CHECK (time_ms > 0),
    event_date DATE,
    notes TEXT,
    ...
);
```

### Uniqueness Model

The one-event-per-meet rule uses exact event code matching (`EventExistsForMeet` query):
- `100FR` and `100FRS` are **different** event codes → both can exist at the same meet
- Two `100FRS` entries at the same meet → rejected (duplicate)
- This is the desired behavior per FR-003 and FR-004

## Personal Best Aggregation

### PB Merge Logic (Backend Service Layer)

```
Input:  Raw PBs from database (one per event code per course)
        e.g., {100FR: 65000ms, 100FRS: 63500ms, 200FR: 145000ms}

Process: For each split PB, compare with base event PB:
         - If split is faster → use split as the merged PB, mark is_from_split=true
         - If base is faster → keep base PB, mark is_from_split=false
         - If only split exists → use split, mark is_from_split=true
         - If only base exists → keep base, mark is_from_split=false

Output: Merged PBs keyed by BASE event code only
        e.g., {100FR: 63500ms (from_split=true), 200FR: 145000ms (from_split=false)}
```

### API Response Extension

The `PersonalBest` response object gains one new field:

```json
{
  "event": "100FR",
  "time_ms": 63500,
  "time_formatted": "1:03.50",
  "time_id": "uuid",
  "meet": "Spring Meet 2026",
  "date": "2026-03-15",
  "is_from_split": true
}
```

## Comparison Integration

Standards exist only for base events. The comparison service:
1. Fetches raw PBs (base + split events)
2. Merges split PBs into base event PBs (keeping faster)
3. Iterates `IndividualEventCodes` (17 base events) for comparison
4. Each comparison uses the merged PB (which may be from a split)

## Progress Data

The progress endpoint accepts base event codes. The query fetches times for both the base event and its split variant:

```
GET /api/v1/progress/100FR → returns times for both 100FR and 100FRS
```

Each data point includes the `event` field so the frontend can distinguish and render split data points with a different visual marker.

## Export/Import

- **Export**: Split event codes (e.g., `100FRS`) are exported as-is in the `event` field
- **Import**: The importer validates against `domain.IsValidEvent()` (replaces hardcoded map), accepting split codes
- **Backward compat**: Old exports without splits import normally
- **No format_version change**: The JSON structure is unchanged; only new event code values appear
