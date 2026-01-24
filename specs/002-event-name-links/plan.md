# Implementation Plan: Event and Meet Name Links

**Branch**: `002-event-name-links` | **Date**: 2026-01-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-event-name-links/spec.md`

## Summary

Add clickable navigation links across the application for:

1. **Event names** → navigate to All Times page filtered by that event (extends existing Personal Bests pattern)
2. **Meet names** → navigate to Meet Details page for that meet

## Technical Context

**Language/Version**: TypeScript 5.x, React 18
**Primary Dependencies**: React Router DOM (useNavigate, Link), TailwindCSS
**Storage**: N/A (frontend-only navigation enhancement)
**Testing**: Vitest + React Testing Library
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (frontend only for this feature)
**Performance Goals**: Navigation < 100ms (already met by existing patterns)
**Constraints**: Must follow existing PersonalBestCard accessibility patterns
**Scale/Scope**: 5-6 components to modify, 2 new reusable components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality Excellence | ✅ Pass | Will follow existing patterns, type-safe navigation |
| II. Test-Driven Development | ✅ Pass | Component tests with RTL, test keyboard navigation |
| III. User Experience Consistency | ✅ Pass | Reuse PersonalBestCard link styling, consistent hover states |
| IV. Performance Standards | ✅ Pass | Simple navigation, no new API calls |
| Quality Gates | ✅ Pass | Lint, type check, unit tests, accessibility audit |

**No violations requiring justification.**

## Project Structure

### Documentation (this feature)

```text
specs/002-event-name-links/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # N/A (no data model changes)
├── quickstart.md        # Phase 1 output
└── contracts/           # N/A (no API changes)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── EventLink.tsx         # NEW: Reusable event link component
│   │   │   └── MeetLink.tsx          # NEW: Reusable meet link component
│   │   ├── times/
│   │   │   ├── TimeHistory.tsx       # MODIFY: Add event and meet links
│   │   │   └── AllTimesList.tsx      # MODIFY: Add meet links
│   │   └── meets/
│   │       └── MeetTimesList.tsx     # MODIFY: Add event links
│   └── pages/
│       └── Progress.tsx              # MODIFY: Add event link to chart title
└── tests/
    └── components/
        ├── links.test.tsx            # NEW: EventLink and MeetLink unit tests
        ├── progress.test.tsx         # MODIFY: Add event/meet link integration tests
        ├── meets.test.tsx            # MODIFY: Add event link integration tests
        ├── alltimes.test.tsx         # MODIFY: Add meet link integration tests
        └── times.test.tsx            # MODIFY: Add event/meet link integration tests
```

**Structure Decision**: Frontend-only changes following existing component patterns. Two new reusable components (`EventLink`, `MeetLink`) to ensure consistency across all locations.

## Design Decisions

### D1: Reusable Link Components

**Decision**: Create shared `EventLink` and `MeetLink` components rather than duplicating navigation logic.

**Rationale**:

- DRY compliance (Constitution I)
- Consistent accessibility patterns across all locations
- Single place to update styling or behavior
- Easier to test

**Component APIs**:

```typescript
// EventLink - resolves event code to name automatically
interface EventLinkProps {
  event: EventCode;
  className?: string;
  children?: React.ReactNode;
}
// Usage: <EventLink event="50FR" />

// MeetLink - requires meet ID and name
interface MeetLinkProps {
  meetId: number;
  meetName: string;
  className?: string;
}
// Usage: <MeetLink meetId={123} meetName="Ontario Championships" />
```

### D2: Link Styling

**Decision**: Style both link types as underlined text with hover color change (not as buttons/cards).

**Rationale**:

- In tables and lists, names appear inline with other text
- Text links are the appropriate pattern for inline navigation
- Matches standard web conventions for in-content links
- Consistent visual treatment for both event and meet links

**Styling** (shared by both):

```css
/* TailwindCSS classes */
font-medium text-slate-900 dark:text-slate-100
underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2
hover:text-blue-600 hover:decoration-blue-600
dark:hover:text-blue-400 dark:hover:decoration-blue-400
focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
focus-visible:ring-offset-2 rounded
transition-colors
```

### D3: TimeHistory Component Modification

**Decision**: Make both event name and meet name cells clickable as separate links.

**Rationale**:

- TimeHistory rows contain multiple pieces of data
- Users may want to navigate to either event or meet independently
- Clear, separate targets for different navigation actions

### D4: Progress Page Links

**Decision**: Make the event name in chart title clickable. Meet names in tooltips/data displays also clickable.

**Rationale**:

- Event in title is the primary context
- Meet context for individual data points shown on interaction

### D5: AllTimesList Meet Links

**Decision**: Add meet name links in the All Times list view.

**Rationale**:

- All Times shows times with associated meets
- Users reviewing times want to see meet details for context

## Implementation Approach

### Phase 1: Create EventLink Component

1. Create `frontend/src/components/ui/EventLink.tsx`
2. Implement accessible link with keyboard support
3. Add unit tests for navigation, accessibility
4. Use `getEventInfo()` for display name resolution

### Phase 2: Create MeetLink Component

1. Create `frontend/src/components/ui/MeetLink.tsx`
2. Implement accessible link with keyboard support
3. Add unit tests for navigation, accessibility
4. Use meet ID for navigation URL

### Phase 3: Update TimeHistory Component

1. Import EventLink and MeetLink into TimeHistory
2. Replace text displays with link components
3. Add integration tests for both navigation paths

### Phase 4: Update MeetTimesList Component

1. Import EventLink into MeetTimesList
2. Replace event name text with EventLink
3. Add integration test for navigation

### Phase 5: Update AllTimesList Component

1. Import MeetLink into AllTimesList
2. Add meet name links to time entries
3. Add integration test for navigation

### Phase 6: Update Progress Page

1. Import EventLink into Progress page
2. Wrap event name in chart title with EventLink
3. Add MeetLink to tooltip/data displays if applicable
4. Add integration tests

### Phase 7: Verification

1. Run full test suite
2. Manual accessibility audit (keyboard navigation)
3. Visual consistency check across all pages
4. Verify no circular navigation (event on All Times, meet on Meet Details)

## Test Strategy

### Unit Tests (EventLink)

- Renders event name correctly from code
- Navigates to correct URL (`/all-times?event={code}`)
- Handles keyboard activation (Enter, Space)
- Has correct ARIA attributes
- Applies custom className

### Unit Tests (MeetLink)

- Renders meet name correctly
- Navigates to correct URL (`/meets/{id}`)
- Handles keyboard activation (Enter, Space)
- Has correct ARIA attributes
- Applies custom className

### Integration Tests

- TimeHistory: clicking event → All Times, clicking meet → Meet Details
- MeetTimesList: clicking event → All Times
- AllTimesList: clicking meet → Meet Details
- Progress: clicking event → All Times
- All Times page: event names are NOT links
- Meet Details page: meet name in header is NOT a link

### Accessibility Tests

- Focus visible on keyboard navigation for all links
- Screen reader announces links correctly
- Tab order correct within tables
- Both link types have appropriate aria-labels

## Complexity Tracking

> No violations to justify - this is a straightforward frontend enhancement following established patterns.
