# Research: Relay Split Times

## Decision 1: Event Code Convention for Splits

**Decision**: Use single-character suffix `S` — e.g., `50FRS`, `100FRS`, `200FRS`, `50BKS`, `100BKS`

**Rationale**:
- Compact and consistent with existing event code style (distance + stroke code)
- Unambiguous: no existing event codes end with `S` (all end with `FR`, `BK`, `BR`, `FL`, `IM`)
- Easy to parse: `IsSplit()` checks suffix, `BaseEvent()` trims last character
- Fits within existing VARCHAR(50) database columns with no schema change
- Fits the user's preference for "Split suffix" event types

**Alternatives considered**:
- `100FR-S` — more explicit but inconsistent with existing code style (no hyphens in current codes)
- `100FR_SPLIT` — verbose, harder to display in compact UI elements
- `S100FR` — prefix approach; harder to sort alongside base events
- Boolean `is_split` column on times table — requires schema migration, changes uniqueness model

## Decision 2: Personal Best Aggregation Strategy

**Decision**: Merge split PBs with base event PBs in the backend service layer (not SQL)

**Rationale**:
- Current `GetPersonalBests` SQL query uses `DISTINCT ON (t.event)` which naturally returns separate PBs for `100FR` and `100FRS`
- Merging in Go code (comparison service + PB handler) is simpler than modifying SQL with CASE expressions
- Preserves the information about which event code the PB came from (needed for "PB from split" badge)
- Keeps SQL queries clean and standard
- A new `GetPersonalBestsWithSplits` query can use `DISTINCT ON` with a normalized event expression, OR the merge can happen purely in application code

**Alternatives considered**:
- SQL-level grouping with CASE expression — complex, harder to maintain, loses split origin info
- Separate PB tracking for splits — contradicts spec requirement that splits compete with base events for PB

## Decision 3: Progress Data Fetching for Splits

**Decision**: Fetch progress data for both base event and its split variant, merge in service layer

**Rationale**:
- Current `GetProgressData` query filters `t.event = $3` (exact match)
- Modifying to `t.event IN ($3, $4)` allows fetching both `100FR` and `100FRS` in one query
- The `event` column in the result can be used by the frontend to distinguish regular vs split data points
- Alternative: two separate queries merged in Go — simpler SQL but more round trips

**Alternatives considered**:
- Single query with LIKE pattern — fragile, could match unintended events
- Frontend-side merging — increases API calls, moves logic to wrong layer

## Decision 4: Comparison Service Iteration

**Decision**: Iterate only base (individual) event codes for comparison display; merge split PBs into base event PBs before comparison

**Rationale**:
- Users don't want to see "100FRS" as a separate line in comparison tables
- Standards exist only for base events (100FR), not split variants (100FRS)
- The comparison loop should use a new `IndividualEventCodes` list (the original 17 events)
- Split PBs are merged into the `pbMap` before the loop starts

**Alternatives considered**:
- Showing splits as separate comparison rows — clutters the view, standards don't exist for splits
- Modifying standards to include split events — unnecessary duplication

## Decision 5: Database Schema Changes

**Decision**: No schema migration required. No new columns or tables needed.

**Rationale**:
- Event codes are stored as VARCHAR(50) strings — new codes like `100FRS` fit naturally
- The one-event-per-meet check (`EventExistsForMeet`) uses exact event match — `100FR` and `100FRS` are treated as distinct events, which is the desired behavior
- Existing indexes on `event` column work with new codes
- No new relationships or constraints needed

**Alternatives considered**:
- Adding `is_split` boolean column to times table — requires migration, changes how uniqueness works, more complex queries
- Adding `base_event` column — denormalization, derivable from event code

## Decision 6: Export/Import Format

**Decision**: No format version bump needed. Split event codes are naturally supported.

**Rationale**:
- The export `TimeExport.Event` field is a plain string — `100FRS` exports/imports like any other event code
- Old exports without split events import fine (backward compatible)
- New exports with split events can be imported by older versions that don't know about splits — they'll fail validation, which is acceptable (forward compatibility is not required)
- The importer's hardcoded event validation map (lines 246-252 of importer/service.go) should be replaced with `domain.IsValidEvent()` to stay DRY

**Alternatives considered**:
- Bumping format_version to "1.1" — unnecessary since no structural format change occurred
- Adding a separate `is_split` field to export — redundant, derivable from event code

## Decision 7: Frontend Event Grouping

**Decision**: Group split events alongside their base events in the same stroke category, visually distinguished with a "Split" badge

**Rationale**:
- Split events belong to the same stroke as their base event (100FRS is Freestyle, 100BKS is Backstroke)
- Placing them adjacent to their base event in the event selector makes the relationship clear
- A "Split" label/badge provides visual distinction without creating a separate "Relay" category

**Alternatives considered**:
- Separate "Relay Splits" stroke category — disconnects splits from their base events
- Separate tab or toggle — adds UI complexity for a small number of events
