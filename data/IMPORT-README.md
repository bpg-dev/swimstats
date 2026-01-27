# Swimmer Data Import

This directory contains templates and instructions for importing your swimmer's actual competition data.

## Quick Start

1. **Reset the database** (if needed):

   ```bash
   ./scripts/reset-database.sh
   ```

2. **Create your import file**:
   - Copy `swimmer-import-template.json` to create your own file (e.g., `my-swimmer-2025.json`)
   - Fill in your swimmer's information and meet results

3. **Import the data** (once implemented):

   ```bash
   # Via API endpoint
   curl -X POST http://localhost:8080/api/v1/import \
     -H "Content-Type: application/json" \
     -d @data/my-swimmer-2025.json

   # Or via frontend UI (Settings page)
   ```

## Import Format

### Swimmer Profile

```json
{
  "swimmer": {
    "name": "Jane Doe",           // Full name
    "birth_date": "2010-03-15",   // YYYY-MM-DD format
    "gender": "female"            // "female" or "male"
  }
}
```

### Meets and Times

```json
{
  "meets": [
    {
      "name": "City Championships 2025",      // Meet name
      "city": "Toronto",                      // City
      "country": "Canada",                    // Country
      "start_date": "2025-11-15",            // YYYY-MM-DD
      "end_date": "2025-11-17",              // YYYY-MM-DD (same as start for single-day)
      "course_type": "25m",                   // "25m" or "50m"
      "times": [                              // Array of swim times from this meet
        {
          "event": "50FR",                    // Event code (see below)
          "time": "28.45",                    // Time in MM:SS.HH or SS.HH format
          "event_date": "2025-11-15",        // Date of this specific event
          "notes": "Heat 3, Lane 4"          // Optional notes
        }
      ]
    }
  ]
}
```

### Event Codes

Use these standard event codes:

**Freestyle (FR)**:

- `50FR`, `100FR`, `200FR`, `400FR`, `800FR`, `1500FR`

**Backstroke (BK)**:

- `50BK`, `100BK`, `200BK`

**Breaststroke (BR)**:

- `50BR`, `100BR`, `200BR`

**Butterfly (FL)**:

- `50FL`, `100FL`, `200FL`

**Individual Medley (IM)**:

- `200IM`, `400IM`

### Time Format

Times can be entered in two formats:

- **Seconds only**: `28.45` (for events under 1 minute)
- **Minutes:Seconds**: `1:02.34` or `2:18.67`

The system will automatically convert to milliseconds for storage.

### Import Behavior

- **Creates swimmer profile** if it doesn't exist
- **Updates swimmer profile** if it already exists (based on name match)
- **Creates new meets** with all associated times
- **Prevents duplicate events** per meet (one event per meet rule)
- **Automatically calculates** personal bests after import

### Tips for Preparing Your Data

1. **Start small**: Import one or two recent meets first to verify everything works
2. **One file per season**: You can create separate files like `swimmer-2024-short-course.json` and `swimmer-2024-long-course.json`
3. **Check event dates**: Make sure each `event_date` falls within the meet's `start_date` to `end_date` range
4. **Course type matters**: Keep 25m and 50m meets separate - they're tracked independently
5. **Notes are optional**: Leave `notes` as empty string `""` if you don't have notes for a swim

### Example: Real Import File

```json
{
  "swimmer": {
    "name": "Sarah Smith",
    "birth_date": "2011-08-22",
    "gender": "female"
  },
  "meets": [
    {
      "name": "Fall Invitational 2025",
      "city": "Mississauga",
      "country": "Canada",
      "start_date": "2025-10-20",
      "end_date": "2025-10-22",
      "course_type": "25m",
      "times": [
        { "event": "50FR", "time": "29.12", "event_date": "2025-10-20", "notes": "" },
        { "event": "100FR", "time": "1:04.56", "event_date": "2025-10-21", "notes": "PB!" },
        { "event": "50BK", "time": "32.78", "event_date": "2025-10-21", "notes": "" },
        { "event": "100BK", "time": "1:12.34", "event_date": "2025-10-22", "notes": "Finals" }
      ]
    }
  ]
}
```

### Validation

The import will fail if:

- Birth date is in an invalid format
- Gender is not "female" or "male"
- Course type is not "25m" or "50m"
- Event code is not recognized
- Time format is invalid
- Event date is outside meet date range
- Duplicate event at same meet (you can only have one 50FR per meet)

## Next Steps

After importing your data:

1. Navigate to **Personal Bests** to see your fastest times
2. Go to **Standards** to import time standards (Swimming Canada, Swim Ontario)
3. Visit **Compare** to see how your times stack up against standards
4. Check **All Times** to browse your complete history by event
