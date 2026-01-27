# Feature Specification: Event and Meet Name Links

**Feature Branch**: `002-event-name-links`
**Created**: 2026-01-24
**Status**: Draft
**Input**: User description: "To improve navigation, add links for every event name displayed (like '50m Free') to navigate to a specific event in 'All Times' section. This should work across all pages/tables where event names are displayed, except the 'All Times' page itself. Personal Bests page is already doing it. Additionally, every meet name displayed should be clickable and navigate to the meet detail page."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate from Progress Page to All Times (Priority: P1)

A user viewing a progress chart for a specific event (e.g., "100m Backstroke") wants to quickly see all recorded times for that event. They click on the event name displayed on the Progress page and are taken directly to the All Times page with that event pre-selected.

**Why this priority**: The Progress page prominently displays the event name in the chart title, and users analyzing their progress naturally want to drill down into the detailed time history.

**Independent Test**: Can be fully tested by navigating to Progress page, selecting an event, clicking on the event name, and verifying navigation to All Times with the correct event filter applied.

**Acceptance Scenarios**:

1. **Given** a user is on the Progress page viewing "100m Backstroke" progress, **When** they click on the event name "100m Backstroke", **Then** they are navigated to `/all-times?event=100BK` with "100m Backstroke" pre-selected in the event filter.

2. **Given** a user is on the Progress page using keyboard navigation, **When** they focus on the event name and press Enter or Space, **Then** they are navigated to the All Times page for that event.

---

### User Story 2 - Navigate from Meet Details to All Times (Priority: P1)

A user viewing a specific meet's time entries sees event names listed (e.g., "50m Freestyle", "200m IM"). They want to compare that time against all their other times for the same event. Clicking the event name takes them to All Times filtered by that event.

**Why this priority**: Meet details often show multiple events, and users frequently want to see historical context for any given event time.

**Independent Test**: Can be fully tested by viewing any meet with recorded times, clicking an event name in the times list, and verifying navigation to All Times with correct filtering.

**Acceptance Scenarios**:

1. **Given** a user is viewing meet details with a "50m Freestyle" time entry, **When** they click on "50m Freestyle", **Then** they are navigated to `/all-times?event=50FR`.

2. **Given** a user is viewing meet details with multiple events listed, **When** they click on any event name, **Then** they are navigated to All Times filtered to that specific event only.

---

### User Story 3 - Navigate from Time History Tables to All Times (Priority: P2)

Anywhere the TimeHistory component displays event names in a table format, users can click on the event name to navigate to All Times for that event.

**Why this priority**: TimeHistory is a reusable component that may appear in various contexts; making event names consistently clickable improves navigation predictability.

**Independent Test**: Can be tested by locating any TimeHistory table instance, clicking an event name, and verifying correct navigation.

**Acceptance Scenarios**:

1. **Given** a TimeHistory table is displayed showing times with event names, **When** a user clicks on any event name, **Then** they are navigated to All Times filtered by that event.

---

### User Story 4 - Consistent Visual Treatment (Priority: P2)

All clickable event names across the application have consistent visual styling that indicates they are interactive links, matching the existing Personal Bests implementation.

**Why this priority**: Consistent visual cues help users understand what is clickable without trial-and-error.

**Independent Test**: Can be tested by visual inspection across all pages where event names appear, verifying consistent link styling.

**Acceptance Scenarios**:

1. **Given** a user views any page with event names, **When** they see an event name that links to All Times, **Then** it has visual styling (hover state, cursor change) indicating it is clickable.

2. **Given** a user is on the All Times page, **When** they view the event name in the page header or filter, **Then** it is NOT styled as a link (since they are already on the destination page).

---

### User Story 5 - Navigate from Time Tables to Meet Details (Priority: P1)

A user viewing a list of times (in All Times, TimeHistory, or other time displays) sees meet names associated with each time entry. They want to see details about a specific meet. Clicking the meet name navigates them to the meet detail page.

**Why this priority**: Meet context is essential for understanding times (location, competition level, conditions). Users frequently need to drill into meet details.

**Independent Test**: Can be fully tested by viewing any time listing, clicking a meet name, and verifying navigation to the correct meet detail page.

**Acceptance Scenarios**:

1. **Given** a user is viewing All Times with times from "Ontario Championships 2026", **When** they click on the meet name, **Then** they are navigated to `/meets/{meetId}` for that meet.

2. **Given** a user is viewing TimeHistory with multiple meets listed, **When** they click on any meet name, **Then** they are navigated to the detail page for that specific meet.

---

### User Story 6 - Navigate from Progress Chart to Meet Details (Priority: P2)

A user viewing the progress chart sees data points representing times from various meets. When hovering or viewing details, they can click on the meet name to navigate to meet details.

**Why this priority**: Understanding the context of a specific time on the progress chart requires seeing meet details.

**Independent Test**: Can be tested by viewing a progress chart with multiple data points, clicking a meet name in the tooltip or data display, and verifying navigation.

**Acceptance Scenarios**:

1. **Given** a user is on the Progress page viewing a chart, **When** they interact with a data point and click the meet name, **Then** they are navigated to the meet detail page for that time's meet.

---

### User Story 7 - Consistent Meet Link Visual Treatment (Priority: P2)

All clickable meet names across the application have consistent visual styling that indicates they are interactive links.

**Why this priority**: Consistent visual treatment for both event and meet links creates predictable navigation patterns.

**Independent Test**: Can be tested by visual inspection across all pages where meet names appear.

**Acceptance Scenarios**:

1. **Given** a user views any page with meet names, **When** they see a meet name that links to meet details, **Then** it has visual styling (hover state, cursor change) indicating it is clickable.

2. **Given** a user is on a Meet Details page, **When** they view the meet name in the page header, **Then** it is NOT styled as a link (already on that page).

---

### Edge Cases

- What happens when a user clicks an event link while on All Times page? This scenario is excluded by design - event names on All Times are not links.
- What happens when a user clicks a meet link while on the Meet Details page? The meet name in the header is not a link (already on that page).
- How does the system handle keyboard-only users? All links (event and meet) must support keyboard navigation (Enter/Space to activate, visible focus state).
- What happens if the event code is somehow invalid? The All Times page already has fallback behavior to default event if invalid code provided.
- What happens if a meet ID is invalid? The Meet Details page handles this with appropriate error display.

## Requirements *(mandatory)*

### Functional Requirements

**Event Name Links:**

- **FR-001**: System MUST make event names clickable links on the Progress page that navigate to All Times filtered by that event.
- **FR-002**: System MUST make event names clickable links in Meet Details views that navigate to All Times filtered by that event.
- **FR-003**: System MUST make event names clickable links in TimeHistory component displays that navigate to All Times filtered by that event.
- **FR-004**: System MUST NOT make event names clickable on the All Times page itself (to avoid circular navigation).

**Meet Name Links:**

- **FR-009**: System MUST make meet names clickable links in All Times view that navigate to the meet detail page.
- **FR-010**: System MUST make meet names clickable links in TimeHistory component displays that navigate to meet details.
- **FR-011**: System MUST make meet names clickable links on the Progress page (in tooltips/data displays) that navigate to meet details.
- **FR-012**: System MUST NOT make meet names clickable on the Meet Details page header (to avoid circular navigation).

**Accessibility (applies to both):**

- **FR-005**: All clickable names (event and meet) MUST be keyboard accessible (support Enter and Space key activation).
- **FR-006**: All clickable names MUST have visible focus states for keyboard navigation.
- **FR-007**: All clickable names MUST have hover states indicating interactivity.
- **FR-008**: Navigation MUST preserve the current course filter context where applicable.

### Key Entities

- **Event**: Swim event identified by code (e.g., "50FR") with human-readable name (e.g., "50m Freestyle"). Events are the target filter when navigating to All Times.
- **Meet**: Competition event identified by ID with name, location, and dates. Meet detail pages show all times recorded at that meet.
- **Navigation Link**: Interactive element that, when activated, navigates user to the appropriate detail page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Event Links:**

- **SC-001**: 100% of pages that display event names (except All Times) have clickable event links after implementation.
- **SC-002**: Users can navigate from any event name display to All Times in a single click/keypress.

**Meet Links:**

- **SC-006**: 100% of pages that display meet names (except Meet Details) have clickable meet links after implementation.
- **SC-007**: Users can navigate from any meet name display to Meet Details in a single click/keypress.

**Both:**

- **SC-003**: All links (event and meet) pass accessibility testing (keyboard navigation works, focus visible, appropriate ARIA labels).
- **SC-004**: Navigation from any link completes within 1 second (perceived performance).
- **SC-005**: Visual styling of links is consistent across all pages where they appear.

## Assumptions

- The existing Personal Bests card implementation provides the reference pattern for event link behavior and styling.
- The All Times page URL pattern (`/all-times?event=EVENT_CODE`) is stable and will continue to support event filtering via query parameter.
- The Meet Details page URL pattern (`/meets/{meetId}`) is stable and already exists.
- Course filter state is managed globally and will be preserved during navigation.
- All event codes used in the application are valid entries in the EVENTS array.
- All meet IDs used in time entries are valid and correspond to existing meets.

## Scope Boundaries

**In Scope**:

- Progress page event name links
- Meet details page event name links
- TimeHistory component event name links
- All Times page meet name links
- TimeHistory component meet name links
- Progress page meet name links (in data displays/tooltips)
- Keyboard accessibility for all new links
- Consistent visual styling for both event and meet links

**Out of Scope**:

- Changes to the Personal Bests page event links (already implemented)
- Changes to the All Times page event filter behavior
- Changes to the Meet Details page behavior
- Backend changes (this is purely a frontend navigation enhancement)
