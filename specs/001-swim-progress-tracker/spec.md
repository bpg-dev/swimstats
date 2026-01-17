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
5. **Given** the swimmer's age changes, **When** I view comparisons against age-based standards, **Then** the comparison uses the appropriate age group times

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

**Acceptance Scenarios**:

1. **Given** a time standard is selected, **When** I view the standing dashboard, **Then** I see all events with indicators showing qualified/not-yet-qualified status
2. **Given** I am viewing the standing dashboard, **When** events are close to qualification (within 3% of qualifying time, configurable), **Then** they are highlighted as "almost there"
3. **Given** I am viewing the standing dashboard, **When** I want details on a specific event, **Then** I can drill down to see the full comparison and history

---

### User Story 7 - Import Historical Results (Priority: P4 - Future)

As a swim parent, I want to import my daughter's historical swim results from online sources so that I don't have to manually enter years of past competition data.

**Why this priority**: This is a convenience feature that saves significant data entry time, but the application is fully functional without it. Additionally, the data source and technical approach are not yet determined. Marked as future/optional.

**Independent Test**: Can be tested by triggering an import for a swimmer and verifying historical times appear in the system with correct events, times, and dates.

**Acceptance Scenarios**:

1. **Given** I want to import historical data, **When** I initiate an import and provide required identifiers (swimmer name, club, or registration number), **Then** the system retrieves available historical results
2. **Given** results have been retrieved, **When** I review the imported data, **Then** I can see a preview before confirming the import
3. **Given** I confirm the import, **When** processing completes, **Then** all imported times appear in the swimmer's history and personal bests are recalculated
4. **Given** some imported times conflict with existing entries (same event, same date), **When** conflicts are detected, **Then** I can choose to skip, overwrite, or keep both
5. **Given** the import source is unavailable or returns errors, **When** the import fails, **Then** I see a clear error message and no partial data is saved

**Open Questions** (to be resolved before implementation):

- Data source: Potential sources include provincial swimming databases, Swimming Canada results, or meet results aggregators
- Technical approach: Direct API (if available), authorized data export, or manual file upload as fallback
- Anti-scraping considerations: May require user to manually export/download their data from source sites

---

### Edge Cases

- What happens when no times have been recorded yet? Display helpful empty state with guidance on how to add first time
- What happens when a time standard has no qualifying time for a specific event? Show "N/A" for that event in comparisons
- How does the system handle times recorded before the swimmer's birthday when comparing age-based standards? Use the swimmer's age at the time of the swim for standard comparisons
- What happens when a swimmer ages into a new age group mid-season? Automatically apply appropriate age group standards based on swim date and swimmer's age at time of competition (following Swimming Canada age determination rules: age as of December 31 of the competition year)
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

- **FR-020**: System MUST allow creating a meet record with: meet name, city, country (defaults to Canada), date, and course type (25m or 50m)
- **FR-021**: System MUST associate all recorded times with a meet; times inherit course type from their meet
- **FR-022**: System MUST allow editing and deleting meet records
- **FR-023**: System MUST list previous meets for easy selection when adding times, filterable by course type

**Time Entry**

- **FR-030**: System MUST allow recording swim times with: event (stroke + distance), time (in minutes:seconds.hundredths format), associated meet (course type determined by current context)
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

**Personal Bests**

- **FR-040**: System MUST automatically track personal best times for each event and course type combination
- **FR-041**: System MUST update personal bests when a faster time is recorded
- **FR-042**: System MUST display personal bests organized by stroke and distance within the current course context
- **FR-043**: System MUST indicate when a newly entered time is a personal best

**Time Standards**

- **FR-050**: System MUST allow creating custom time standards with a name and description
- **FR-051**: System MUST allow defining qualifying times for each event within a standard
- **FR-052**: System MUST support age-group-based standards following Swimming Canada age brackets (10&Under, 11-12, 13-14, 15-17, Senior/Open)
- **FR-053**: System MUST allow editing and deleting time standards
- **FR-054**: System MUST allow importing time standards from structured data (for convenience when adding Swimming Canada or provincial standards)
- **FR-055**: System MUST support defining standards for either or both course types (25m/50m)
- **FR-056**: System MUST include pre-loaded time standards for all age groups and events:
  - Swimming Canada national standards (Provincial, Western/Eastern Canadian, Junior National, Senior National)
  - Swim Ontario provincial standards
- **FR-057**: System MUST display only standards applicable to the current course context in comparisons
- **FR-058**: System MUST store time standards with gender designation (female/male)
- **FR-059**: System MUST automatically filter available standards to match the swimmer's gender

**Comparisons**

- **FR-060**: System MUST compare swimmer's personal bests against a selected time standard within the current course context
- **FR-061**: System MUST calculate and display time difference between swimmer's time and standard
- **FR-062**: System MUST visually indicate when a standard has been achieved
- **FR-063**: System MUST use age-appropriate standard times based on swimmer's age at time of swim
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
- **FR-081**: System MUST allow full-access users to export all data for backup purposes (downloadable file)
- **FR-082**: System MUST allow full-access users to import previously exported data for restoration
- **FR-083**: System MUST work in modern web browsers (Chrome, Firefox, Safari, Edge)

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
- **SC-008**: Age-based standard comparisons correctly apply the swimmer's age at time of swim
- **SC-009**: All data persists correctly across application restarts with zero data loss
- **SC-010**: Users can export and re-import all their data without any loss or corruption
- **SC-011**: New users can understand how to add their first time without external documentation
