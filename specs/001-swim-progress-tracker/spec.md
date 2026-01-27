# Feature Specification: Swim Progress Tracker

**Feature Branch**: `001-swim-progress-tracker`  
**Created**: 2026-01-17  
**Status**: Draft  
**Input**: User description: "Build an application that can help me track progress of a competitive swimmer (my daughter) across the ages and seasons. It should track her current times across all competitive swimming disciplines for 25 and 50 meter courses (times), personal bests, and comparison against various time standards. Time standards can be added/removed/modified at any time, time standards are usually age-based. I also want to see graphs showing progress over time, and standing/difference against a specified standard."

**Context**: Canadian competitive swimmer  
**Platform**: Web application (browser-based, laptop/desktop primary use)  
**Scope**: Single swimmer initially, designed for easy expansion to multiple swimmers  
**Organization**: Course-centric (25m short course and 50m long course as primary data separation)

## Clarifications

### Session 2026-01-20

- Q: What format should be used for data export and import? → A: JSON (single file with all data)
- Q: What level of accessibility support is needed? → A: Basic (semantic HTML, keyboard navigation)

### Session 2026-01-17

- Q: What threshold defines "almost there" for qualification status? → A: Within 3% of qualifying time (default), user-configurable
- Q: How do time standards handle gender differences? → A: Standards are gender-specific; system auto-filters to match swimmer's gender

## User Scenarios & Testing *(mandatory)*

### User Story 0 - User Authentication (Priority: P1)

As a user, I want to log in using my identity provider so that my data is secure and I can share view-only access with others.

**Why this priority**: Authentication is foundational for data security and enables sharing the app with others (e.g., coaches, other parents) without giving them edit access.

**Independent Test**: Can be fully tested by logging in via OIDC provider and verifying access is granted with correct permissions.

**Acceptance Scenarios**:

1. **Given** I am not logged in, **When** I access the application, **Then** I am redirected to the OIDC login flow
2. **Given** I complete OIDC authentication successfully, **When** I am redirected back, **Then** I am logged in and can access the application
3. **Given** I am logged in with full access, **When** I use the application, **Then** I can view, add, edit, and delete all data
4. **Given** I am logged in with view-only access, **When** I use the application, **Then** I can view all data but cannot add, edit, or delete anything
5. **Given** I am logged in, **When** I want to end my session, **Then** I can log out and must re-authenticate to access the application again
6. **Given** my session has expired, **When** I try to perform an action, **Then** I am prompted to re-authenticate

---

### User Story 0b - Filter by Course Type (Priority: P1)

As a swim parent, I want to filter data by 25m (short course) or 50m (long course) so that I can focus on times relevant to the current competitive season.

**Why this priority**: The 25m and 50m seasons are fundamentally separate in competitive swimming - times are not comparable across course types. Filtering by course mirrors how swimmers, coaches, and parents think about their data.

**Independent Test**: Can be fully tested by having meets/times for both course types, then filtering to one course and verifying only relevant data is shown.

**Acceptance Scenarios**:

1. **Given** I have times from both 25m and 50m meets, **When** I filter to 25m, **Then** I see only data from 25m meets
2. **Given** I am viewing 25m data, **When** I want to see 50m data, **Then** I can easily switch the filter
3. **Given** I switch from 25m to 50m filter, **When** the view updates, **Then** all displayed data (times, PBs, comparisons, graphs) reflects only 50m meets
4. **Given** I have no filter applied, **When** I view data, **Then** I can see all times but they are clearly labeled by course type

---

### User Story 1 - Record Swim Times (Priority: P1)

As a swim parent, I want to record my daughter's swim times from competitions and time trials so that I have an accurate history of all her performances organized by meet.

**Why this priority**: Without the ability to record times, no other features (personal bests, comparisons, graphs) can function. This is the foundational data entry capability.

**Independent Test**: Can be fully tested by creating a meet and entering swim times for it, then verifying times appear in the swimmer's history with meet details. Delivers immediate value by creating a permanent record of performances.

**Acceptance Scenarios**:

1. **Given** I want to record times from a meet, **When** I create a new meet with name, city, country (defaulting to Canada), date, and course type (25m or 50m), **Then** the meet is saved and I can add times to it
2. **Given** I have created or selected a meet, **When** I add time entries with event (stroke + distance) and time, **Then** the times are saved and associated with that meet
3. **Given** I have entered times, **When** I view the time history for an event, **Then** I see all recorded times for the current course context with meet details, sorted by date
4. **Given** I made an error entering a time, **When** I edit or delete that time entry, **Then** the correction is saved and reflected throughout the system
5. **Given** I am entering times, **When** I select an event, **Then** I can choose from all standard competitive swimming events (Freestyle, Backstroke, Breaststroke, Butterfly, IM at standard distances)
6. **Given** I attended a meet I've recorded before, **When** I want to add times, **Then** I can select the existing meet from a list instead of re-entering details

---

### User Story 2 - View Personal Bests (Priority: P1)

As a swim parent, I want to see my daughter's personal best times for each event so that I can quickly reference her fastest performances.

**Why this priority**: Personal bests are the most frequently referenced metrics in competitive swimming. Parents, coaches, and swimmers constantly need to know current best times for meet entries and goal-setting.

**Independent Test**: Can be fully tested by entering multiple times for the same event and verifying the system correctly identifies and displays the fastest time as the personal best.

**Acceptance Scenarios**:

1. **Given** multiple times have been recorded for an event in the current course, **When** I view personal bests, **Then** the system displays the fastest time for that event in the current course context
2. **Given** personal bests exist for multiple events, **When** I view the personal bests summary, **Then** I see all events with recorded times for the current course, showing the best time for each, organized by stroke
3. **Given** I enter a new time that is faster than the current personal best for that course, **When** I save the entry, **Then** the system updates the personal best and indicates it was a new best time
4. **Given** I switch between 25m and 50m course contexts, **When** I view personal bests, **Then** I see completely separate personal bests for each course (times are never mixed between courses)

---

### User Story 3 - Manage Time Standards (Priority: P2)

As a swim parent, I want to create and manage time standards (like regional qualifiers, club records, or motivational times) so that I can track my daughter's progress toward specific goals.

**Why this priority**: Time standards provide context and goals for swim times. Without standards, times are just numbers; with standards, parents can see meaningful progress toward qualifications.

**Independent Test**: Can be fully tested by creating a time standard with qualifying times for various events and age groups, then verifying the standard appears in the system and can be selected for comparisons.

**Acceptance Scenarios**:

1. **Given** I want to track progress toward a goal, **When** I create a new time standard with a name (e.g., "Swimming Canada Provincial 2026", "Ontario Age Group Champs"), **Then** the standard is created and available for adding qualifying times
2. **Given** I have created a time standard, **When** I add qualifying times for specific events and age groups, **Then** those times are saved and associated with the standard
3. **Given** a time standard exists, **When** I edit or update the qualifying times, **Then** the changes are saved and comparisons reflect the updated values
4. **Given** a time standard is no longer relevant, **When** I delete it, **Then** it is removed from the system and no longer available for comparisons
5. **Given** time standards are age-based, **When** I define a standard, **Then** I can specify different qualifying times for different age groups

---

### User Story 4 - Compare Times Against Standards (Priority: P2)

As a swim parent, I want to compare my daughter's times against a selected time standard so that I can see how close she is to achieving specific goals.

**Why this priority**: Comparisons give meaning to recorded times by showing progress toward goals. This is essential for motivation and planning.

**Independent Test**: Can be fully tested by selecting a time standard, then viewing a comparison that shows the swimmer's best times alongside the standard's qualifying times with the difference calculated.

**Acceptance Scenarios**:

1. **Given** personal bests exist and a time standard is selected, **When** I view the comparison, **Then** I see a side-by-side view of swimmer's times vs. standard times for each event
2. **Given** I am viewing a comparison, **When** a swimmer's time meets or beats the standard, **Then** it is visually highlighted as "achieved" or "qualified"
3. **Given** I am viewing a comparison, **When** a swimmer's time does not meet the standard, **Then** I see the time difference (how much faster they need to swim)
4. **Given** multiple time standards exist, **When** I want to compare against a different standard, **Then** I can easily switch between standards
5. **Given** the swimmer's age changes, **When** I view comparisons against age-based standards, **Then** the comparison uses the appropriate age group times ✅ **Implemented**

**UX Enhancements Implemented**:

- **OPEN Standards**: Age group labels are hidden when comparing against standards without age-specific times (e.g., "Canadian Open" shows just the time, not "(11-12)")
- **PB Dates**: "Your Time" column displays the date when each personal best was achieved
- **Table Alignment**: Vertical alignment (align-top) ensures multi-line cells align properly; horizontal alignment centers numerical columns
- **Typography**: Tabular numbers (`tabular-nums`) for consistent digit spacing in all time values
- **Column Widths**: Fixed widths for consistent layout (Event: 48, Times: 28-32, Status: 24)

---

### User Story 5 - View Progress Graphs (Priority: P3)

As a swim parent, I want to see graphs showing my daughter's time progression over months and seasons so that I can visualize improvement trends.

**Why this priority**: Visualization helps identify trends that aren't obvious from raw numbers. While valuable, it builds on the data from P1 stories and is not required for basic tracking.

**Independent Test**: Can be fully tested by entering times for an event over multiple dates, then viewing a graph that shows time improvement over that period.

**Acceptance Scenarios**:

1. **Given** multiple times exist for an event, **When** I view the progress graph for that event, **Then** I see a line graph showing times (y-axis) over dates (x-axis)
2. **Given** I am viewing a progress graph, **When** times improve (get faster), **Then** the visual clearly shows downward progression (faster times = lower on graph)
3. **Given** a time standard is selected, **When** I view the progress graph, **Then** I see a horizontal reference line showing the standard's qualifying time for context
4. **Given** I want to analyze a specific period, **When** I filter by date range, **Then** the graph shows only times within that range
5. **Given** times exist across multiple seasons, **When** I view progress, **Then** I can see long-term improvement trends across years

---

### User Story 6 - View Standing Against Standard (Priority: P3)

As a swim parent, I want to see a dashboard showing my daughter's overall standing against a selected standard so that I can get a quick overview of qualification status across all events.

**Why this priority**: Provides a high-level summary view. Useful but less critical than the detailed comparisons in US4.

**Independent Test**: Can be fully tested by selecting a standard and viewing a summary that shows qualification status across all events with visual indicators.

**Implementation Status**: ✅ **Complete** - Covered by US4 implementation. The Compare page includes ComparisonSummary component showing achieved/almost/not-yet qualification counts with configurable threshold, plus drill-down to detailed event comparisons.

**Acceptance Scenarios**:

1. **Given** a time standard is selected, **When** I view the standing dashboard, **Then** I see all events with indicators showing qualified/not-yet-qualified status ✅ **Implemented** via ComparisonSummary showing counts
2. **Given** I am viewing the standing dashboard, **When** events are close to qualification (within 3% of qualifying time, configurable), **Then** they are highlighted as "almost there" ✅ **Implemented** with threshold percentage display
3. **Given** I am viewing the standing dashboard, **When** I want details on a specific event, **Then** I can drill down to see the full comparison and history ✅ **Implemented** via ComparisonTable below summary

---

### User Story 7 - Data Export and Import (Priority: P2 - ✅ Implemented)

As a swim parent, I want to export all my daughter's swim data to a JSON file for backup and import it back for restoration so that I can safely preserve and restore all tracked data.

**Why this priority**: Data backup and restoration is essential for data safety and portability. This feature enables users to backup their data, move between devices, or recover from data loss.

**Independent Test**: Can be tested by exporting all data, clearing the database, then importing the file and verifying all data is restored correctly.

**Acceptance Scenarios**:

1. **Given** I have swimmer data, **When** I export all data from Settings page, **Then** a JSON file downloads containing swimmer profile, all meets/times, and custom standards ✅ **Implemented**
2. **Given** I want to import data, **When** I select a JSON export file, **Then** the system shows a preview of what will be replaced (swimmer, meets/times counts, standards counts) ✅ **Implemented**
3. **Given** I review the import preview, **When** the preview shows data will be deleted, **Then** I see clear warnings about deletions with specific counts ✅ **Implemented**
4. **Given** I confirm the import after reviewing warnings, **When** processing completes, **Then** the existing data sections are replaced with imported data and I see a success dialog ✅ **Implemented**
5. **Given** import file sections are optional, **When** a section is present in the file, **Then** only that section's data is replaced (swimmer OR meets OR standards) ✅ **Implemented**
6. **Given** the import file has invalid format or data, **When** the import fails, **Then** I see a clear error dialog and no partial data is saved ✅ **Implemented**

**Implementation Details**:

- **Export Format**: Single JSON file with optional sections: `swimmer`, `meets` (with nested times), `standards`
- **Export Location**: Settings page > Data Management > Export Data button
- **Import Flow**:
  1. User selects file → `POST /api/v1/data/import/preview` returns preview with counts
  2. Warning dialog shows what will be deleted/replaced
  3. User confirms → `POST /api/v1/data/import` with `confirmed: true`
  4. Success dialog shows completion
- **Replace Mode**: Import REPLACES data sections (not additive):
  - Swimmer section present → replaces swimmer profile
  - Meets section present → deletes ALL existing meets/times, imports new ones
  - Standards section present → deletes ALL custom standards, imports new ones
  - Preloaded standards are never affected
- **API Endpoints**:
  - `GET /api/v1/data/export` - Export all data
  - `POST /api/v1/data/import/preview` - Preview import changes
  - `POST /api/v1/data/import` - Execute confirmed import
- **UI Components**:
  - Export button with loading state
  - File upload input for import
  - Confirmation dialog with detailed warnings
  - Success/error dialogs (in-app styled components)
- **Legacy Import Scripts** (for development):
  - `import-all.sh` - Import all standards and swimmer data
  - `import-standards.sh` - Import time standards only
  - Python conversion scripts for SwimRankings.net data

---

### Edge Cases

- What happens when no times have been recorded yet? Display helpful empty state with guidance on how to add first time
- What happens when a time standard has no qualifying time for a specific event? Show "N/A" for that event in comparisons
- How does the system handle times recorded before the swimmer's birthday when comparing age-based standards? Use the swimmer's current age group for standard comparisons, showing what standards they should be working toward now
- What happens when a swimmer ages into a new age group mid-season? The comparison page automatically shows standards for the swimmer's current age group, with previous and next age group standards displayed adjacently for reference
- How are tied times handled for personal bests? Display the most recent occurrence as the personal best
- What happens if historical import retrieves hundreds of times? Show progress indicator and allow cancellation; process in batches to avoid browser timeouts
- What happens when user changes the course filter while viewing data? Filter updates immediately; any unsaved data entry remains tied to its original meet
- What happens when OIDC provider is unavailable? Display clear error message; user cannot access application until provider is restored
- What happens when a view-only user tries to access an edit function directly (e.g., via URL)? Display "access denied" message and redirect to view

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Access Control**

- **FR-001**: System MUST authenticate users via OIDC (OpenID Connect) protocol
- **FR-002**: System MUST support two access levels: full access and view-only
- **FR-003**: System MUST enforce access levels on all operations:
  - Full access: view, add, edit, delete all data
  - View-only: view all data; add, edit, delete operations are hidden/disabled
- **FR-004**: System MUST maintain user session and handle session expiry gracefully
- **FR-005**: System MUST provide logout functionality
- **FR-006**: System MUST redirect unauthenticated users to OIDC login
- **FR-007**: System MUST map OIDC claims/groups to application access levels

**Course Filtering**

- **FR-010**: System MUST provide clear filtering between 25m (short course) and 50m (long course) data
- **FR-011**: System MUST maintain the selected course filter across views until explicitly changed
- **FR-012**: System MUST filter all displayed data (times, personal bests, comparisons, graphs) by course type when a filter is active
- **FR-013**: System MUST clearly indicate when a course filter is active and which course is selected
- **FR-014**: System MUST allow viewing all data (both courses) with clear course type labels when no filter is active

**Swimmer Profile**

- **FR-010**: System MUST store swimmer information including name, birth date, and gender
- **FR-011**: System MUST calculate swimmer's current age and age on any given date
- **FR-012**: System MUST support a single swimmer profile initially, with data model designed to accommodate multiple swimmers in future updates

**Meets**

- **FR-020**: System MUST allow creating a meet record with: meet name, city, country (defaults to Canada), start date, end date (for multi-day meets), and course type (25m or 50m)
- **FR-020a**: System MUST support single-day meets (start_date = end_date) and multi-day meets (start_date < end_date)
- **FR-021**: System MUST associate all recorded times with a meet; times inherit course type from their meet
- **FR-022**: System MUST allow editing and deleting meet records
- **FR-023**: System MUST list previous meets for easy selection when adding times, filterable by course type
- **FR-024**: System MUST provide a meet details page showing all times recorded for that meet
- **FR-025**: System MUST display times on the meet details page grouped by event or in a table format
- **FR-026**: System MUST allow navigation to the meet details page from the meets list and after saving times

**Time Entry**

- **FR-030**: System MUST allow recording swim times with: event (stroke + distance), time (in minutes:seconds.hundredths format), associated meet, and event date (within meet date range)
- **FR-030a**: System MUST allow selecting an event date from the meet's date range when entering times
- **FR-031**: System MUST support all standard competitive swimming events:
  - Freestyle: 50m, 100m, 200m, 400m, 800m, 1500m
  - Backstroke: 50m, 100m, 200m
  - Breaststroke: 50m, 100m, 200m
  - Butterfly: 50m, 100m, 200m
  - Individual Medley: 200m, 400m
- **FR-032**: System MUST store times separately for 25m and 50m courses (times are never mixed or converted between courses)
- **FR-033**: System MUST allow editing and deleting recorded times
- **FR-034**: System MUST validate time format and reject invalid entries
- **FR-035**: System MUST allow optional notes/context for each time entry (e.g., "heat", "final", "PB")
- **FR-036**: System MUST support quick entry workflow: select/create meet once, then enter multiple times for that meet in succession
- **FR-037**: System SHOULD allow creating a new meet inline during time entry without navigating away from the entry form
- **FR-038**: System MUST provide clear feedback after saving times: show success message with count of times saved
- **FR-039**: System MUST offer navigation options after saving: "View Meet" to see all times for the meet, "Add More" to continue adding times
- **FR-03A**: System MUST prevent recording more than one time for the same event at the same meet (one event per meet rule)
- **FR-03B**: System MUST display a clear error message when attempting to add a duplicate event for a meet

**Personal Bests**

- **FR-040**: System MUST automatically track personal best times for each event and course type combination
- **FR-041**: System MUST update personal bests when a faster time is recorded
- **FR-042**: System MUST display personal bests organized by stroke and distance within the current course context
- **FR-043**: System MUST indicate when a newly entered time is a personal best

**All Times View**

- **FR-044**: System MUST provide an "All Times" view to display all recorded times for a selected event
- **FR-045**: System MUST require users to select a specific event from a dropdown (no "all events" option, as ranking across different events is not meaningful)
- **FR-046**: System MUST display each time entry in a compact table format with: time value, meet name, date, and notes (if any)
- **FR-047**: System MUST mark personal best times with a visual indicator (PB badge) in the times list
- **FR-048**: System MUST sort times by date (newest first) by default
- **FR-049**: System MUST allow users to toggle sorting between date (newest first) and time (fastest first)
- **FR-04A**: System MUST display rank badges (1st, 2nd, 3rd with medal colors) when sorting by fastest time
- **FR-04B**: System MUST respect the current course type filter (25m/50m) when displaying times
- **FR-04C**: System MUST default to the first event (50m Freestyle) when no event is selected

**Time Standards**

- **FR-050**: System MUST allow creating custom time standards with a name and description
- **FR-051**: System MUST allow defining qualifying times for each event within a standard
- **FR-052**: System MUST support age-group-based standards following Swimming Canada age brackets (10&Under, 11-12, 13-14, 15-17, Senior/Open)
- **FR-053**: System MUST allow editing and deleting time standards
- **FR-054**: System MUST allow importing time standards from structured JSON files (for convenience when adding Swimming Canada or provincial standards)
- **FR-054a**: System MUST support bulk import of multiple standards from a single JSON file (e.g., OSC and OAG from one file)
- **FR-055**: System MUST support defining standards for either or both course types (25m/50m)
- **FR-056**: System MUST include time standards data files in `data/` directory for easy import:
  - Swimming Canada national standards (Trials Senior, Trials Junior, Usport, Canadian Open)
  - Swim Ontario provincial standards (OSC, OAG)
- **FR-057**: System MUST display only standards applicable to the current course context in comparisons
- **FR-058**: System MUST store time standards with gender designation (female/male)
- **FR-059**: System MUST automatically filter available standards to match the swimmer's gender

**Comparisons**

- **FR-060**: System MUST compare swimmer's personal bests against a selected time standard within the current course context
- **FR-061**: System MUST calculate and display time difference between swimmer's time and standard
- **FR-062**: System MUST visually indicate when a standard has been achieved
- **FR-063**: System MUST use age-appropriate standard times based on swimmer's current age group, with adjacent age group standards shown for reference
- **FR-064**: System MUST allow switching between different standards for comparison (within current course)
- **FR-065**: System MUST highlight times within a configurable threshold of qualifying (default: 3%) as "almost there"
- **FR-066**: System MUST allow full-access users to configure the "almost there" threshold percentage

**Progress Visualization**

- **FR-070**: System MUST display line graphs showing time progression for any event within the current course context
- **FR-071**: System MUST show time standard reference lines on progress graphs when a standard is selected
- **FR-072**: System MUST allow filtering graphs by date range
- **FR-073**: System MUST display times with faster times shown lower on the y-axis (intuitive for improvement)
- **FR-074**: System MUST show data points with meet details on hover/selection

**Data Management**

- **FR-080**: System MUST persist all data so it survives browser sessions and page refreshes
- **FR-081**: System MUST allow full-access users to export all data for backup purposes as a single JSON file ✅ **Implemented**
  - Export includes swimmer profile, all meets with times, and custom standards
  - Export button located in Settings page > Data Management section
  - Downloaded file named with timestamp: `swimstats-export-YYYY-MM-DD.json`
- **FR-082**: System MUST allow full-access users to import previously exported JSON data for restoration ✅ **Implemented**
  - Import supports optional sections (swimmer, meets, standards)
  - Import uses REPLACE mode: present sections completely replace existing data
  - Preview endpoint shows what will be deleted before confirmation required
  - Warning dialog displays specific counts of data to be deleted/imported
  - Success and error dialogs use in-app styled components (not browser alerts)
- **FR-083**: System MUST work in modern web browsers (Chrome, Firefox, Safari, Edge)
- **FR-084**: System MUST use semantic HTML and support keyboard navigation for basic accessibility

**Historical Import (Future/Optional)**

- **FR-090**: System SHOULD support importing historical swim results from external sources
- **FR-091**: System SHOULD provide a preview of imported data before committing
- **FR-092**: System SHOULD detect and handle conflicts between imported and existing times
- **FR-093**: System SHOULD support manual file upload as a fallback import method (CSV or structured format)

### Key Entities

- **User**: An authenticated user; attributes include identity (from OIDC), access level (full or view-only)
- **Swimmer**: The athlete being tracked; attributes include name, birth date, gender
- **Meet**: A competition event; attributes include name, city, country (default: Canada), date, course type (25m or 50m)
- **Time Entry**: A recorded swim performance; attributes include event, time value, optional notes; linked to Swimmer and Meet; inherits course type from Meet
- **Event**: A swimming discipline; attributes include stroke (Freestyle, Backstroke, Breaststroke, Butterfly, IM) and distance (50m, 100m, 200m, etc.)
- **Course Type**: The pool length; either 25m (short course) or 50m (long course); stored on Meet, inherited by Time Entries
- **Time Standard**: A named collection of qualifying times; attributes include name, description, course type applicability, gender (female/male)
- **Standard Time**: A qualifying time within a standard; attributes include event, time value, age group (min/max age); linked to Time Standard; filtered by swimmer's gender automatically
- **Personal Best**: Derived from Time Entries; the fastest time for each event/course combination

### Assumptions

- Authentication via OIDC with Authentik as the identity provider
- Access levels (full/view-only) are managed in Authentik and communicated via OIDC claims or group membership
- Web-based application accessed via browser, optimized for laptop/desktop use
- Course type is a property of the meet (a meet happens at a specific pool which is 25m or 50m)
- Times inherit course type from their associated meet
- Times from 25m and 50m courses are never compared or converted - they are fundamentally different
- Course filtering allows focusing on one season's data while keeping all data accessible
- Initially tracks one Canadian competitive swimmer, but data architecture supports future expansion to multiple swimmers
- Times are primarily entered manually by the user; historical import is a future convenience feature
- Age groups in time standards follow Swimming Canada conventions (typically 10&Under, 11-12, 13-14, 15-17, Senior/Open)
- Swimming Canada national time standards are pre-loaded and may require periodic updates when Swimming Canada publishes new standards
- Users understand competitive swimming terminology (strokes, events, course types)
- Data is stored persistently (browser local storage or server-side) so it survives browser sessions
- Historical import feature (P4) depends on identifying a viable data source; may require manual CSV upload if automated retrieval is not feasible due to anti-scraping protections

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can record a new swim time in under 30 seconds
- **SC-002**: Users can enter multiple times from a meet (5+ events) in under 3 minutes using quick entry
- **SC-003**: Users can view personal bests for all events on a single screen
- **SC-004**: Users can create a complete time standard (all events for one age group) in under 5 minutes
- **SC-005**: Users can see comparison against a standard within 2 clicks from any screen
- **SC-006**: Progress graphs load and display within 2 seconds for up to 500 recorded times
- **SC-007**: System correctly identifies personal bests 100% of the time when new times are entered
- **SC-008**: Age-based standard comparisons correctly apply the swimmer's current age group
- **SC-009**: All data persists correctly across application restarts with zero data loss
- **SC-010**: Users can export and re-import all their data without any loss or corruption
- **SC-011**: New users can understand how to add their first time without external documentation
