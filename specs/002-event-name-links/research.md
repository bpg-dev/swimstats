# Research: Event and Meet Name Links

**Feature**: 002-event-name-links
**Date**: 2026-01-24

## Summary

This feature adds two types of navigation links across the application:

1. **Event links** → All Times page filtered by event (extends existing Personal Bests pattern)
2. **Meet links** → Meet Details page for that meet

## Existing Implementation Analysis

### PersonalBestCard Pattern (Event Links)

**Location**: `frontend/src/components/comparison/PersonalBestCard.tsx`

**Key Findings**:

1. Uses `useNavigate()` from react-router-dom for programmatic navigation
2. Navigation URL pattern: `/all-times?event={eventCode}`
3. Full accessibility support:
   - `role="button"` for semantic meaning
   - `tabIndex={0}` for keyboard focus
   - `onKeyDown` handler for Enter/Space activation
   - `aria-label` for screen readers
4. Visual feedback: `hover:shadow-md transition-shadow cursor-pointer`

**Decision**: Adopt the navigation pattern but use `<Link>` component for inline text links.

### MeetList Pattern (Meet Links)

**Location**: `frontend/src/components/meets/MeetList.tsx`

**Key Findings**:

1. Uses React Router `<Link>` component
2. Navigation URL pattern: `/meets/{meetId}`
3. Conditional rendering for link vs button based on context
4. Visual feedback: `hover:bg-slate-50 transition-colors`

**Decision**: Use same URL pattern for MeetLink component.

### Event Metadata System

**Location**: `frontend/src/types/time.ts`

**Key Findings**:

1. Centralized `EVENTS` array with all event definitions
2. `getEventInfo(code)` utility function for name resolution
3. `EventCode` type for compile-time safety
4. `VALID_EVENTS` Set for runtime validation

**Decision**: Use existing `getEventInfo()` for EventLink display names.

### AllTimes Page URL Handling

**Location**: `frontend/src/pages/AllTimes.tsx`

**Key Findings**:

1. Reads event from URL via `useSearchParams().get('event')`
2. Validates against `VALID_EVENTS` set
3. Falls back to `DEFAULT_EVENT` ('50FR') if invalid
4. Updates URL reactively with `setSearchParams({ event })`

**Decision**: No changes needed to AllTimes page - already supports deep linking.

### Meet Details Page

**Location**: `frontend/src/pages/MeetDetails.tsx`

**Key Findings**:

1. Reads meet ID from URL via `useParams()`
2. Fetches meet data using React Query
3. Handles loading and error states
4. URL pattern: `/meets/:id`

**Decision**: No changes needed to MeetDetails page - already supports direct navigation.

## Components to Modify

### 1. TimeHistory Component

**Location**: `frontend/src/components/times/TimeHistory.tsx`

**Current**: Displays event and meet names as plain text
**Change**: Wrap event name with EventLink, meet name with MeetLink

### 2. MeetTimesList Component

**Location**: `frontend/src/components/meets/MeetTimesList.tsx`

**Current**: Displays event names as section headers
**Change**: Wrap event name with EventLink

### 3. AllTimesList Component

**Location**: `frontend/src/components/times/AllTimesList.tsx`

**Current**: Displays meet names as plain text
**Change**: Wrap meet name with MeetLink

### 4. Progress Page

**Location**: `frontend/src/pages/Progress.tsx`

**Current**: Shows event name in CardTitle as plain text
**Change**: Wrap event name with EventLink

## Design Decisions

### D1: Link vs Button Semantics

**Decision**: Use `<Link>` component (react-router-dom) for both link types.

**Rationale**:

- Standard anchor semantics for navigation
- Supports browser features: middle-click, right-click menu, Cmd/Ctrl+click
- Correct element for "navigate to another page"
- PersonalBestCard uses button because entire card is clickable; inline text should use link

**Alternatives Considered**:

- `useNavigate()` with button: Rejected - loses anchor features
- Native `<a>` tag: Rejected - doesn't integrate with React Router

### D2: Reusable Components

**Decision**: Create `EventLink` and `MeetLink` components to centralize link logic.

**Rationale**:

- DRY: Avoid duplicating accessibility attributes
- Consistency: Same styling everywhere
- Maintainability: Single point of change

**Component Designs**:

```typescript
// EventLink - auto-resolves event code to display name
<EventLink event="50FR" />
// Renders as: <Link to="/all-times?event=50FR">50m Freestyle</Link>

// MeetLink - requires both ID and name
<MeetLink meetId={123} meetName="Ontario Championships" />
// Renders as: <Link to="/meets/123">Ontario Championships</Link>
```

### D3: Link Styling

**Decision**: Underlined text link style (not card/button style).

**Rationale**:

- Appropriate for inline text context
- Doesn't disrupt existing visual hierarchy
- Standard web convention for in-content navigation
- Consistent for both event and meet links

**Styling Specification** (TailwindCSS):

```css
font-medium text-slate-900 dark:text-slate-100
underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2
hover:text-blue-600 hover:decoration-blue-600
dark:hover:text-blue-400 dark:hover:decoration-blue-400
focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
focus-visible:ring-offset-2 rounded
transition-colors
```

## Test Strategy

### Unit Tests

**EventLink**:

1. Rendering: Displays correct event name from code
2. Navigation: Link href is `/all-times?event={code}`
3. Custom children: Renders children instead of resolved name
4. className: Merges custom className with defaults
5. Accessibility: Has proper link role and labeling

**MeetLink**:

1. Rendering: Displays meet name correctly
2. Navigation: Link href is `/meets/{id}`
3. className: Merges custom className with defaults
4. Accessibility: Has proper link role and labeling

### Integration Tests

1. **TimeHistory**: Click event → All Times; Click meet → Meet Details
2. **MeetTimesList**: Click event → All Times
3. **AllTimesList**: Click meet → Meet Details
4. **Progress**: Click event → All Times
5. **AllTimes page**: Event names are NOT links (no circular nav)
6. **MeetDetails page**: Meet name in header is NOT a link

## No Further Research Needed

All technical questions have been answered by examining the existing codebase:

- Navigation patterns: Established by PersonalBestCard and MeetList
- Event metadata: Centralized in types/time.ts
- URL handling: Already supported by AllTimes and MeetDetails pages
- Testing patterns: Established in existing component tests
