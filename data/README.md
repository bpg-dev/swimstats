# Time Standards Data

This directory contains time standards in JSON format for import into SwimStats.

## Available Standards

| File | Source | Season | Gender | Course |
|------|--------|--------|--------|--------|
| `swim-ontario-2025-2026-female-sc.json` | Swim Ontario | 2025-2026 | Female | Short Course (25m) |
| `swim-ontario-2025-2026-female-lc.json` | Swim Ontario | 2025-2026 | Female | Long Course (50m) |
| `swimming-canada-2026-2028-female-sc.json` | Swimming Canada | 2026-2028 | Female | Short Course (25m) |
| `swimming-canada-2026-2028-female-lc.json` | Swimming Canada | 2026-2028 | Female | Long Course (50m) |

### Swim Ontario Standards (per file)
- **OSC** - Ontario Swimming Championships
- **OAG** - Ontario Age Group

### Swimming Canada Standards
- **Short Course (25m)**: Usport SCM, Canadian Open SCM
- **Long Course (50m)**: Trials Senior, Trials Junior, Canadian Open LCM

## File Naming Convention

```
{source}-{season}-{gender}-{course}.json
```

Examples:
- `swim-ontario-2025-2026-female-sc.json` - Swim Ontario 2025-2026 Female Short Course
- `swim-ontario-2025-2026-female-lc.json` - Swim Ontario 2025-2026 Female Long Course
- `swimming-canada-2026-2028-female-sc.json` - Swimming Canada 2026-2028 Female Short Course

## JSON Format

```json
{
  "season": "2025-2026",
  "source": "Swim Ontario",
  "course_type": "25m",           // "25m" for short course, "50m" for long course
  "gender": "female",             // "female" or "male"
  "standards": {
    "OSC": {                      // Standard code (used as identifier)
      "name": "Ontario Swimming Championships (SC)",
      "description": "Optional description"
    },
    "OAG": {
      "name": "Ontario Age Group (SC)",
      "description": "Optional description"
    }
  },
  "age_groups": ["11U", "12", "13U", "14", "15", "16", "17O"],
  "times": {
    "50FR": {                     // Event code
      "11U": { "OSC": "0:31.38", "OAG": "0:32.16" },
      "12":  { "OSC": "0:29.86", "OAG": "0:30.61" },
      // ... more age groups
    },
    // ... more events
  }
}
```

## Event Codes

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

## Age Group Codes

| Code | Description | Maps To |
|------|-------------|---------|
| 10U | 10 & Under | 10U |
| 11U | 11 & Under | 10U |
| 12 | 12 years old | 11-12 |
| 13U | 13 & Under | 13-14 |
| 14 | 14 years old | 13-14 |
| 15 | 15 years old | 15-17 |
| 16 | 16 years old | 15-17 |
| 17O | 17 & Over (Open) | OPEN |
| OPEN | Open (any age) | OPEN |

**Note**: The backend automatically maps JSON age groups to internal codes (10U, 11-12, 13-14, 15-17, OPEN).

## Time Format

Times should be in the format:
- `"M:SS.ss"` for times >= 1 minute (e.g., `"1:05.32"`, `"10:25.17"`)
- `"S.ss"` or `"SS.ss"` for times < 1 minute (e.g., `"0:31.38"` or `"31.38"`)
- `null` for events without a standard time

## Importing Standards

### Via API

```bash
curl -X POST http://localhost:8080/api/v1/standards/import/json \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @data/swim-ontario-2025-2026-female-sc.json
```

Response:
```json
{
  "standards": [...],
  "imported": 2,
  "skipped": 0,
  "errors": []
}
```

### Via UI

1. Go to **Standards** page
2. Click **Import JSON** button
3. Select a JSON file
4. Preview the standards to be imported
5. Click **Import** to create the standards

### Notes

- Each standard code in the file (e.g., OSC, OAG) creates a separate standard in the database
- Standards with duplicate names are skipped (use errors array to see which)
- Invalid times or events are reported in the errors array but don't block import
