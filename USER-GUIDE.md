# SwimStats User Guide

A comprehensive guide to using SwimStats for tracking your competitive swimming progress.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Recording Times](#recording-times)
3. [Personal Bests](#personal-bests)
4. [All Times](#all-times)
5. [Meets](#meets)
6. [Time Standards](#time-standards)
7. [Compare Times](#compare-times)
8. [Progress Charts](#progress-charts)
9. [Data Management](#data-management)
10. [Settings](#settings)

---

## Getting Started

### First Time Setup

1. **Log In**: Click "Continue to App" (development mode) or log in with your OIDC provider
2. **Create Swimmer Profile**: Enter your name, birth date, and gender
3. **Start Recording**: You're ready to add your first swim times!

### Course Type Filter

SwimStats tracks short course (25m) and long course (50m) times separately. Use the course filter in the navigation bar to switch between them:

- **25m** (Blue) - Short course meters pool times
- **50m** (Green) - Long course meters pool times

Personal bests are calculated separately for each course type.

---

## Recording Times

### Quick Entry (Recommended)

The fastest way to record multiple times from a meet:

1. Navigate to **Add Times**
2. Select or create a meet
3. Add multiple time entries:
   - Select the event (e.g., 50m Freestyle)
   - Enter the time (e.g., "30.12" or "1:07.45")
   - For multi-day meets, select the event date
   - Optionally add notes
4. Click **Save All Times**

**Time Format**: Enter times as:
- Seconds: `30.12`
- Minutes:Seconds: `1:07.45`
- Hours:Minutes:Seconds: `1:02:34.56` (for distance events)

**New PB Notification**: After saving, you'll see which times are new personal bests.

### Quick Add Meet

Don't see your meet in the list? Create one inline:

1. Click "Or add a new meet"
2. Fill in the meet details:
   - Name (e.g., "Fall Classic 2025")
   - City
   - Country
   - Start Date
   - End Date (same as start for single-day meets)
   - Course Type (25m or 50m)
3. Click **Add Meet**

### One Event Per Meet Rule

SwimStats enforces a one-event-per-meet rule to maintain accurate records. If you try to add a duplicate event for the same meet, you'll see an error message. To update a time, delete the existing entry first.

---

## Personal Bests

View your fastest times across all events, organized by stroke.

### Features

- **Grouped by Stroke**: Freestyle, Backstroke, Breaststroke, Butterfly, Individual Medley
- **PB Times**: Your fastest time for each event
- **Achieved Standards**: Green badges showing which standards you've achieved
- **Quick Navigation**: Click any PB card to view all times for that event
- **Keyboard Accessible**: Use Tab to navigate and Enter/Space to activate cards

### Navigating from Personal Bests

- **Click a PB Card**: Opens the All Times page filtered to that event, showing your complete history
- **Click a Standard Badge**: Opens the comparison view for that specific standard

### Achieved Standards Badges

When your PB meets or exceeds a time standard, you'll see an emerald green badge with white text. Click any badge to navigate directly to the comparison view for that standard.

---

## All Times

Browse your complete time history for any event.

### Features

- **Event Filter**: Select a specific event to view
- **Sort Options**:
  - By Date (newest first)
  - By Time (fastest first)
- **PB Badge**: Gold "PB" badge marks your personal best
- **Rank Badges**: When sorted by fastest, see gold/silver/bronze ranks
- **Deep Linking**: URL supports `?event=CODE` parameter for direct navigation

### URL Parameter Support

The All Times page supports deep linking via URL parameters:
- Navigate directly to an event: `/all-times?event=100FR`
- This is used when clicking a PB card from the Personal Bests page
- Bookmarkable for quick access to specific events

### Understanding the Display

| Column | Description |
|--------|-------------|
| Meet | Competition name and location |
| Event Date | When the race occurred |
| Time | Your recorded time |
| Notes | Any notes you added |

---

## Meets

Manage your competitions and view times by meet.

### Meet List

- View all meets for the selected course type
- See date range and location
- Click any meet to view its details

### Meet Details

View all times recorded at a specific meet:

- **Times Table**: All your times from that meet, grouped by event
- **PB Indicators**: Gold highlights for times that are current PBs
- **Delete Option**: Remove individual times with confirmation

### Creating Meets

1. Navigate to **Meets**
2. Click **New Meet**
3. Fill in the details:
   - Meet name
   - City and country
   - Start and end dates
   - Course type (25m or 50m)

---

## Time Standards

Manage time standards for tracking qualification goals.

### Pre-loaded Standards

SwimStats includes pre-loaded standards for:
- Swimming Canada (Senior, Junior, Usport, Canadian Open)
- Swim Ontario (OSC, OAG)

Pre-loaded standards are marked with a lock icon and cannot be edited.

### Custom Standards

Create your own standards for club meets, regional competitions, or personal goals:

1. Navigate to **Standards**
2. Click **New Standard**
3. Enter:
   - Standard name
   - Description (optional)
   - Course type
   - Gender
4. Add qualifying times for each event/age group

### Import Standards from JSON

For bulk importing time standards:

1. Click **Import from JSON**
2. Select a JSON file (see `data/README.md` for format)
3. Review and confirm the import

---

## Compare Times

See how your personal bests stack up against time standards.

### Using the Comparison View

1. Navigate to **Compare**
2. Select a time standard from the dropdown
3. View the comparison table with your standing summary in the header

### Understanding the Table

| Column | Description |
|--------|-------------|
| Event | The swimming event with meet name |
| Your Time | Your personal best with date achieved |
| Prev Standard | Previous age group standard time with difference |
| Current Standard | Target time for your age group with difference |
| Next Standard | Next age group standard time with difference |
| Status | Achievement status badge |

Age groups are displayed in the column headers (e.g., "Prev Standard (11-12)").

Each standard column shows the qualifying time and, when you have a recorded time, the difference to that standard with percentage.

### Status Indicators

- **Achieved** (Emerald badge): Your PB meets or beats the current standard
- **Achieved with Star** (Emerald badge with gold star): Your PB also meets the next age group standard
- **Almost** (Amber badge and highlight): Within 3% of the standard
- **Not Yet** (Gray badge): More than 3% away from the standard
- **No Time** (Light gray): No recorded time for this event

### Column Highlighting

Standard columns are highlighted based on achievement:
- **Prev Standard**: Gray background and text when achieved
- **Current Standard**: Green background when achieved, amber when almost
- **Next Standard**: Blue background and text when achieved

### Standing Summary

The header shows your overall standing inline:
- Number of standards achieved (green)
- Number "almost there" within 3% (amber)
- Number not yet achieved (gray)

---

## Progress Charts

Visualize your improvement over time with line charts.

### Features

- **Time Progression**: See how your times have improved
- **PB Markers**: Star icons mark personal best swims
- **Date Filtering**: Filter by date range
- **Standard Reference Line**: Compare against a target standard

### Using Progress Charts

1. Navigate to **Progress**
2. Select an event from the dropdown
3. Optionally filter by date range
4. Optionally select a standard to show as a reference line

### Reading the Chart

- **X-Axis**: Event dates
- **Y-Axis**: Time (faster times are lower)
- **Blue Line**: Your time progression
- **Star Markers**: Personal best achievements
- **Dashed Line**: Selected standard (when enabled)

**Hover** over any point to see details including meet name, time, and date.

---

## Data Management

### Export Data

Create a backup of all your data:

1. Navigate to **Settings**
2. Click **Export Data**
3. A JSON file will download with:
   - Your swimmer profile
   - All meets and times
   - Custom time standards (not pre-loaded ones)

### Import Data

Restore data from a backup or import new data:

1. Navigate to **Settings**
2. Click **Import Data**
3. Select your JSON file
4. **Preview**: Review what will be imported and deleted
5. **Confirm**: Complete the import

**Warning**: Importing with sections present will REPLACE existing data in those sections. The preview shows exactly what will be deleted.

### Import Format

The import file can include any combination of:

```json
{
  "swimmer": { ... },     // Optional: replaces swimmer profile
  "meets": [ ... ],       // Optional: replaces all meets and times
  "standards": [ ... ]    // Optional: replaces custom standards
}
```

See [IMPORT-GUIDE.md](IMPORT-GUIDE.md) for detailed format documentation.

---

## Settings

Access settings from the gear icon in the navigation bar.

### Swimmer Profile

Edit your swimmer profile:
- Name
- Birth Date
- Gender

### Access Levels

SwimStats supports two access levels determined by your OIDC provider:

- **Full Access**: Can add, edit, and delete all data (meets, times, standards)
- **View Only**: Can view all data but cannot make any changes

If you have view-only access:
- Add/Edit/Delete buttons will be disabled throughout the app
- You can still view all times, meets, standards, progress charts, and comparisons
- Contact your administrator if you need full access

Your current access level is shown in the header as a badge (displayed only for view-only users).

### Data Export/Import

- **Export**: Download all data as JSON
- **Import**: Upload data from JSON file

---

## Tips & Best Practices

### Recording Times Efficiently

1. **Use Quick Entry**: Enter all times from a meet in one session
2. **Add Notes**: Record lane, heat, placement, or conditions
3. **Import Historical Data**: Use the import feature for bulk data

### Tracking Progress

1. **Check Progress Charts**: Review weekly/monthly to see trends
2. **Set Standard Goals**: Choose target standards to work toward
3. **Monitor "Almost" Times**: Focus training on events close to standards

### Data Management

1. **Export Regularly**: Create backups after adding significant data
2. **Separate by Season**: Consider separate import files for each season
3. **Keep Course Types Separate**: Don't mix 25m and 50m data in imports

---

## Keyboard Navigation

SwimStats supports keyboard navigation:

- **Tab**: Move between interactive elements
- **Enter/Space**: Activate buttons, links, and clickable cards (like PB cards)
- **Escape**: Close dialogs and dropdowns

---

## Troubleshooting

### Times Not Showing

- Check the course type filter (25m vs 50m)
- Verify the meet's course type matches your filter

### Can't Add Duplicate Event

This is intentional. Each meet can only have one time per event. To update a time:
1. Go to the meet details page
2. Delete the existing time
3. Add the new time

### Import Failed

- Validate your JSON file syntax
- Check that dates are in YYYY-MM-DD format
- Ensure event codes are valid (e.g., "50FR", not "50 Freestyle")
- See [IMPORT-GUIDE.md](IMPORT-GUIDE.md) for troubleshooting tips

### Chart Not Loading

- Ensure you have times recorded for the selected event
- Check that the date range includes your times
- Try selecting a different course type

---

## Getting Help

- **Documentation**: Check this guide and [README.md](README.md)
- **Import Guide**: See [IMPORT-GUIDE.md](IMPORT-GUIDE.md) for data import help
- **Issues**: Report bugs at https://github.com/bpg/swimstats/issues
