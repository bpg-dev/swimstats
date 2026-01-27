# Swimmer Data Import Guide

This guide explains how to import swimmer data into SwimStats.

## Import Methods

SwimStats provides two ways to import data:

1. **In-App Import** (Recommended) - Import via the Settings page with preview and confirmation
2. **CLI Scripts** - Command-line scripts for automation and advanced use cases

---

## In-App Import (Recommended)

### Export Your Data

1. Navigate to **Settings** (gear icon in navigation)
2. Click **Export Data**
3. A timestamped JSON file will download (e.g., `swimstats-export-2026-01-20.json`)

### Import Data

1. Navigate to **Settings**
2. Click **Import Data**
3. Select your JSON file
4. **Preview**: Review what will be imported and what will be deleted
5. **Confirm**: Click "Import" to proceed

### Import Behavior

The import uses **replace mode**:
- If your file includes `swimmer`, it replaces the existing swimmer profile
- If your file includes `meets`, ALL existing meets and times are deleted first
- If your file includes `standards`, all custom standards are deleted first (pre-loaded standards are kept)

### Preview Screen

Before importing, you'll see:
- What will be created (swimmer, meets count, times count, standards count)
- What will be deleted (existing meets, times, custom standards)
- Warnings for destructive operations

---

## CLI Import (Advanced)

For automation, initial setup, or importing historical data.

### 1. Clean the Database

Reset the database to a fresh state:

```bash
./scripts/reset-database.sh
```

This will:
- Stop and remove all Docker containers
- Delete the PostgreSQL volume (removing all data)
- Start PostgreSQL again
- Run migrations to create fresh tables

### 2. Prepare Your Import File

1. Copy the template:
   ```bash
   cp data/swimmer-import-template.json data/my-swimmer.json
   ```

2. Edit `data/my-swimmer.json` with your swimmer's actual data:
   - Swimmer profile (name, birth date, gender)
   - Meets with their times

See `data/IMPORT-README.md` for the complete format specification.

### 3. Start the Backend

```bash
cd backend
ENV=development go run ./cmd/server
```

The API will be available at `http://localhost:8080`.

### 4. Import Your Data

```bash
./scripts/test-import.sh data/my-swimmer.json
```

Or use curl directly:

```bash
curl -X POST http://localhost:8080/api/v1/data/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-token" \
  -d @data/my-swimmer.json
```

### 5. Verify the Import

Start the frontend and verify your data:

```bash
cd frontend
npm run dev
```

Then navigate to:
- **Home** - See your swimmer profile
- **Personal Bests** - Check fastest times were calculated correctly
- **All Times** - Browse complete time history
- **Meets** - View all imported meets

## Import File Format

### Complete Example

```json
{
  "swimmer": {
    "name": "Jane Doe",
    "birth_date": "2012-05-14",
    "gender": "female"
  },
  "meets": [
    {
      "name": "Fall Classic 2025",
      "city": "Toronto",
      "country": "Canada",
      "start_date": "2025-10-12",
      "end_date": "2025-10-14",
      "course_type": "25m",
      "times": [
        {
          "event": "50FR",
          "time": "30.12",
          "event_date": "2025-10-12",
          "notes": "Heat 2, Lane 5"
        },
        {
          "event": "100FR",
          "time": "1:07.45",
          "event_date": "2025-10-13",
          "notes": "Finals - PB!"
        }
      ]
    }
  ]
}
```

### Field Reference

| Field | Type | Required | Format | Example |
|-------|------|----------|--------|---------|
| `swimmer.name` | string | ✅ | Full name | "Jane Doe" |
| `swimmer.birth_date` | string | ✅ | YYYY-MM-DD | "2012-05-14" |
| `swimmer.gender` | string | ✅ | "female" or "male" | "female" |
| `swimmer.threshold_percent` | number | ❌ | "Almost there" threshold (0-100) | 5.0 (default: 3.0) |
| `meet.name` | string | ✅ | Meet name | "Fall Classic 2025" |
| `meet.city` | string | ✅ | City name | "Toronto" |
| `meet.country` | string | ✅ | Country | "Canada" |
| `meet.start_date` | string | ✅ | YYYY-MM-DD | "2025-10-12" |
| `meet.end_date` | string | ✅ | YYYY-MM-DD | "2025-10-14" |
| `meet.course_type` | string | ✅ | "25m" or "50m" | "25m" |
| `time.event` | string | ✅ | Event code | "50FR", "100BK", etc. |
| `time.time` | string | ✅ | MM:SS.HH or SS.HH | "1:07.45" or "30.12" |
| `time.event_date` | string | ✅ | YYYY-MM-DD | "2025-10-13" |
| `time.notes` | string | ❌ | Optional notes | "Heat 2, Lane 5" |

### Valid Event Codes

**Freestyle (FR)**: `50FR`, `100FR`, `200FR`, `400FR`, `800FR`, `1500FR`
**Backstroke (BK)**: `50BK`, `100BK`, `200BK`
**Breaststroke (BR)**: `50BR`, `100BR`, `200BR`
**Butterfly (FL)**: `50FL`, `100FL`, `200FL`
**Individual Medley (IM)**: `200IM`, `400IM`

## Import Behavior

✅ **Creates swimmer** if none exists
✅ **Updates swimmer** if one already exists (based on being the first/only swimmer)
✅ **Creates all meets** with their associated times
✅ **Prevents duplicates** - skips times if the event already exists for that meet
✅ **Auto-calculates** personal bests after import
✅ **Validates** all data before inserting

## Response Format

### Success Response

```json
{
  "success": true,
  "swimmer_id": "123e4567-e89b-12d3-a456-426614174000",
  "swimmer_name": "Jane Doe",
  "meets_created": 3,
  "times_created": 15,
  "skipped_times": 0
}
```

### Partial Success (with skipped duplicates)

```json
{
  "success": true,
  "swimmer_id": "123e4567-e89b-12d3-a456-426614174000",
  "swimmer_name": "Jane Doe",
  "meets_created": 2,
  "times_created": 8,
  "skipped_times": 2,
  "skipped_reason": [
    "Meet Fall Classic 2025 (ID: ...): 2 duplicate event(s) skipped"
  ]
}
```

### Error Response

```json
{
  "success": false,
  "meets_created": 0,
  "times_created": 0,
  "errors": [
    "Swimmer validation failed: gender must be 'female' or 'male', got: invalid",
    "Meet 2 (City Champs) validation failed: invalid start_date format"
  ]
}
```

## Tips for Preparing Your Data

### 1. Organize by Season

Create separate files for different seasons or course types:
- `my-swimmer-2024-short-course.json`
- `my-swimmer-2024-long-course.json`
- `my-swimmer-2025-short-course.json`

### 2. Start Small

Import one or two recent meets first to verify everything works, then import historical data.

### 3. Handle Multi-Day Meets

For multi-day meets, specify the full date range:

```json
{
  "start_date": "2025-11-15",
  "end_date": "2025-11-17",
  "times": [
    { "event": "50FR", "time": "28.45", "event_date": "2025-11-15" },
    { "event": "100FR", "time": "1:02.34", "event_date": "2025-11-16" },
    { "event": "200FR", "time": "2:18.67", "event_date": "2025-11-17" }
  ]
}
```

### 4. Single-Day Meets

For single-day meets, use the same date for start and end:

```json
{
  "start_date": "2025-12-08",
  "end_date": "2025-12-08",
  "times": [
    { "event": "50FR", "time": "27.89", "event_date": "2025-12-08" }
  ]
}
```

### 5. Course Type Separation

Keep 25m and 50m meets separate - they're tracked independently in the system. Don't mix course types in a single import file.

### 6. Validate JSON

Use a JSON validator before importing:

```bash
python3 -m json.tool data/my-swimmer.json > /dev/null && echo "Valid JSON" || echo "Invalid JSON"
```

## Troubleshooting

### Import Failed: Invalid JSON

**Problem**: `Failed to decode import data: invalid character...`

**Solution**: Validate your JSON syntax. Check for:
- Missing commas between objects
- Missing quotes around strings
- Extra commas at the end of arrays

### Import Failed: Validation Error

**Problem**: `gender must be 'female' or 'male', got: Female`

**Solution**: Check field values match exactly:
- Gender: `"female"` or `"male"` (lowercase)
- Course type: `"25m"` or `"50m"`
- Dates: `"YYYY-MM-DD"` format

### Times Skipped: Duplicate Event

**Problem**: `2 duplicate event(s) skipped`

**Solution**: This is normal if you're re-importing data. Each meet can only have one time per event. Remove duplicate events or import into a fresh database.

### Event Date Outside Range

**Problem**: `event_date 2025-10-15 is outside meet date range`

**Solution**: Make sure each `event_date` falls between the meet's `start_date` and `end_date`.

### Invalid Event Code

**Problem**: `invalid event code: 50Freestyle`

**Solution**: Use the correct event codes (e.g., `"50FR"` not `"50Freestyle"`). See Valid Event Codes above.

## After Importing

Once your data is imported:

1. **Import Time Standards**
   - Go to Standards page
   - Click "Import from JSON"
   - Import Swimming Canada and Swim Ontario standards from `data/` directory

2. **View Comparisons**
   - Navigate to Compare page
   - Select a standard
   - See how your times stack up!

3. **Explore Progress**
   - Check Personal Bests for fastest times
   - Browse All Times to see improvement over time
   - Review meets to see full competition history

## Sample Data

A sample import file is provided at:
```
data/sample-swimmer-import.json
```

This contains realistic data for a 13-14 age group female swimmer with 3 meets and 13 swim times. You can use this to test the import functionality.

## API Endpoint

**Endpoint**: `POST /api/v1/data/import`
**Content-Type**: `application/json`
**Authentication**: Required (Bearer token or dev mode)

The import endpoint is now fully implemented and ready to use!

---

For more details on the import format, see `/data/IMPORT-README.md`.
