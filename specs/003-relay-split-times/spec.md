# Feature Specification: Relay Split Times

**Feature Branch**: `003-relay-split-times`
**Created**: 2026-03-06
**Status**: Draft
**Input**: User description: "Add support for relay split times - allow recording leadoff split times from relay events as additional times for individual events at a meet"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record a Relay Split Time at a Meet (Priority: P1)

A swimmer competes in both the 100m Freestyle individual event and the 4x100m Freestyle Relay at the same meet. The swimmer is the leadoff leg of the relay and receives an official split time. The user wants to record both the individual 100m Freestyle time and the relay leadoff split time for that meet.

**Why this priority**: This is the core capability — without the ability to record split times, no other feature in this spec has value.

**Independent Test**: Can be fully tested by adding a regular time and a split time for the same base event at the same meet, and verifying both are stored and displayed.

**Acceptance Scenarios**:

1. **Given** a meet with a 100FR time already recorded, **When** the user adds a "100FR Split" time for the same meet, **Then** the system accepts it without a duplicate event error.
2. **Given** the "add time" form, **When** the user selects an event, **Then** only events that can be relay leadoff splits show a split variant (e.g., 50FR, 100FR, 200FR, 50BK, 100BK).
3. **Given** a meet with no times, **When** the user adds a "100FR Split" time, **Then** the system accepts it (a split can exist without a corresponding individual time).
4. **Given** a meet with a "100FR Split" already recorded, **When** the user tries to add another "100FR Split", **Then** the system rejects it as a duplicate event.

---

### User Story 2 - View Split Times Alongside Regular Times (Priority: P2)

A user views the times list and wants to distinguish split times from individual event times. Split times should be clearly labeled so the user knows they came from a relay leadoff leg.

**Why this priority**: Visibility of split times is essential for the data to be useful, but secondary to the ability to record them.

**Independent Test**: Can be tested by viewing the times list/all times page with a mix of regular and split times, verifying split times are visually distinguished.

**Acceptance Scenarios**:

1. **Given** a swimmer with both regular and split times, **When** viewing the All Times page for a base event (e.g., 100FR), **Then** both individual and split times for that event are shown together, with split times visually distinguished by a "Split" badge.
2. **Given** the All Times event filter, **When** viewing the dropdown, **Then** only base events are listed — split event variants are excluded since splits are shown alongside their base event.
3. **Given** a swimmer with split times, **When** viewing times for a specific meet, **Then** split times appear alongside regular times with clear labeling.
4. **Given** a split time, **When** viewing its details, **Then** the event name shows it is a relay split (e.g., "100m Freestyle Split").

---

### User Story 3 - Split Times in Personal Bests and Standard Comparisons (Priority: P2)

A swimmer's relay leadoff split may be faster than their individual event time. In competitive swimming, relay leadoff splits are officially recognized times. The user wants split times to be considered when calculating personal bests and comparing against time standards.

**Why this priority**: Equal to US2 — split times being recognized for PBs and standards is a key reason swimmers track them. However, this can be delivered after the basic recording capability.

**Independent Test**: Can be tested by recording a split time faster than the individual PB and verifying the PB and comparison views reflect the faster split time.

**Acceptance Scenarios**:

1. **Given** a swimmer with a 100FR time of 1:05.00 and a 100FR Split of 1:03.50, **When** viewing personal bests, **Then** the PB for 100FR shows 1:03.50 (the faster split time).
2. **Given** a swimmer with only a split time for an event (no individual time), **When** viewing personal bests, **Then** the split time appears as the PB for that base event.
3. **Given** a PB that comes from a split time, **When** viewing the PB display, **Then** it is indicated that the PB is from a relay split.
4. **Given** time standards for 100FR, **When** comparing a swimmer's times, **Then** the 100FR Split time is also compared against the 100FR standard.

---

### User Story 4 - Split Times in Progress Graphs (Priority: P3)

A user viewing progress over time for an event (e.g., 100FR) wants to see both individual and relay split times plotted on the graph to get a complete picture of their improvement.

**Why this priority**: Progress graphs are a secondary view that builds on the data already recorded and displayed; it adds value but is not essential for the core feature.

**Independent Test**: Can be tested by viewing a progress graph for an event that has both regular and split times, verifying both types of data points appear with distinct markers.

**Acceptance Scenarios**:

1. **Given** a swimmer with 100FR and 100FR Split times across multiple meets, **When** viewing the 100FR progress graph, **Then** both individual and split times are plotted.
2. **Given** the progress graph with both time types, **When** viewing data points, **Then** split times are visually distinct from individual times (e.g., different marker shape or color), and the tooltip annotation indicates "Relay Split".
3. **Given** the progress page event selector, **When** viewing the dropdown, **Then** only base events are listed — split variants are excluded since the graph automatically includes split times for the selected base event.

---

### User Story 5 - Export and Import Split Times (Priority: P3)

A user exports their data and later imports it. Split times must be preserved in the export format and correctly restored on import.

**Why this priority**: Data portability is important but builds on existing export/import functionality; it is a polish feature.

**Independent Test**: Can be tested by exporting data with split times, then importing into a fresh instance and verifying split times are preserved with correct event codes.

**Acceptance Scenarios**:

1. **Given** a swimmer with split times, **When** exporting data, **Then** the export file includes split times with their split event codes.
2. **Given** an export file containing split times, **When** importing, **Then** split times are correctly created with split event codes.
3. **Given** an export file from a version without split support, **When** importing into the new version, **Then** the import works normally (backward compatible).

---

### Edge Cases

- What happens when a user tries to add a split for an event that cannot be a relay leadoff (e.g., 400FR, 200IM)? The system must reject it with a clear error message.
- What happens when editing an existing regular time — can it be changed to a split or vice versa? No — the event code (including split designation) is part of the time's identity. To change, delete and re-create.
- What happens if split events are later added or removed from the valid list? Existing recorded times remain valid; only new entries are constrained to the current valid list.
- How are split times handled in batch time entry? Split events should be available in the batch form, following the same one-per-meet rule per event code.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support a set of "split" event variants corresponding to relay leadoff legs: 50m Freestyle Split, 100m Freestyle Split, 200m Freestyle Split, 50m Backstroke Split, and 100m Backstroke Split.
- **FR-002**: System MUST enforce that only the defined split-eligible events have split variants. Events like 400m Freestyle, 800m Freestyle, 1500m Freestyle, Breaststroke, Butterfly, and Individual Medley MUST NOT have split variants.
- **FR-003**: System MUST allow one regular time AND one split time for the same base event at the same meet (e.g., both 100FR and 100FR Split at Meet X).
- **FR-004**: System MUST NOT allow more than one split time for the same event at the same meet (the one-event-per-meet rule applies to split events independently).
- **FR-005**: System MUST visually distinguish split times from regular times in all list and detail views.
- **FR-006**: System MUST include split times when calculating personal bests for the corresponding base event (e.g., a 100FR Split time competes with 100FR times for the PB).
- **FR-007**: System MUST include split times when comparing against time standards for the corresponding base event.
- **FR-008**: System MUST display split times on progress graphs for the corresponding base event, with visual distinction from regular times.
- **FR-009**: System MUST support split times in data export and import, maintaining backward compatibility with exports that lack split times.
- **FR-010**: System MUST indicate when a personal best originates from a relay split time.

### Key Entities

- **Split Event**: A variant of an individual swimming event representing a relay leadoff split time. Each split event maps to exactly one base individual event. Only events that correspond to relay leadoff legs have split variants.
- **Relay-to-Split Mapping**: The relationship between relay events and their corresponding individual split events:
  - 4x50m Freestyle Relay leadoff → 50m Freestyle Split
  - 4x100m Freestyle Relay leadoff → 100m Freestyle Split
  - 4x200m Freestyle Relay leadoff → 200m Freestyle Split
  - 4x50m Medley Relay leadoff → 50m Backstroke Split (medley relays start with backstroke)
  - 4x100m Medley Relay leadoff → 100m Backstroke Split (medley relays start with backstroke)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can record both a regular time and a relay split time for the same base event at the same meet without errors.
- **SC-002**: Split times are visually distinguishable from regular times in all views where times are displayed.
- **SC-003**: Personal bests reflect the fastest time across both regular and split times for each event, with 100% accuracy.
- **SC-004**: Standard comparisons include split times, giving swimmers credit for relay leadoff splits that meet qualifying standards.
- **SC-005**: Data exported with split times can be re-imported with no data loss.
- **SC-006**: Users attempting to add a split for an ineligible event (e.g., 400FR) receive a clear, immediate error.

## Assumptions

- Only the **leadoff (first leg)** swimmer in a relay gets an official split time. Second, third, and fourth legs use flying starts and are not valid individual times. This feature only covers leadoff splits.
- The 4x50m relays (Freestyle and Medley) are primarily short-course (25m pool) events, but the system does not restrict split times by course type — if a user records a split at a meet, the course type comes from the meet itself.
- Split times are treated as fully official times for PB and standard comparison purposes, consistent with World Aquatics and Swimming Canada rules.
- The relay event itself (e.g., "4x100m Freestyle Relay") is NOT tracked as an event in the system — only the individual leadoff split time is recorded.
