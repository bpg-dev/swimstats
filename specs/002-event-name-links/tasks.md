# Tasks: Event and Meet Name Links

**Input**: Design documents from `/specs/002-event-name-links/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md

**Tests**: Included per Constitution TDD requirements (II. Test-Driven Development)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/`, `frontend/tests/`
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create reusable link components that all user stories depend on

- [x] T001 [P] Create EventLink component in frontend/src/components/ui/EventLink.tsx
- [x] T002 [P] Create MeetLink component in frontend/src/components/ui/MeetLink.tsx
- [x] T003 Write unit tests for EventLink and MeetLink in frontend/tests/components/links.test.tsx
- [x] T004 Run tests to verify EventLink and MeetLink pass all unit tests

**Checkpoint**: Reusable link components ready - user story implementation can now begin

---

## Phase 2: User Story 1 - Progress Page Event Links (Priority: P1) 🎯 MVP

**Goal**: Make event name in Progress page chart title clickable, navigating to All Times filtered by that event

**Independent Test**: Navigate to Progress page, select any event, click the event name in chart title, verify navigation to `/all-times?event={code}`

### Tests for User Story 1

- [x] T005 [US1] Add integration test for Progress page event link navigation in frontend/tests/components/progress.test.tsx

### Implementation for User Story 1

- [x] T006 [US1] Import EventLink and update Progress page chart title in frontend/src/pages/Progress.tsx
- [x] T007 [US1] Verify keyboard navigation (Tab, Enter) works for event link on Progress page

**Checkpoint**: Progress page event name is clickable and navigates to All Times

---

## Phase 3: User Story 2 - Meet Details Event Links (Priority: P1)

**Goal**: Make event names in Meet Details page (MeetTimesList) clickable, navigating to All Times

**Independent Test**: View any meet with recorded times, click event name, verify navigation to All Times with correct event filter

### Tests for User Story 2

- [x] T008 [US2] Add integration test for MeetTimesList event link navigation in frontend/tests/components/meets.test.tsx

### Implementation for User Story 2

- [x] T009 [US2] Import EventLink and update event name display in frontend/src/components/meets/MeetTimesList.tsx
- [x] T010 [US2] Verify keyboard navigation works for event links in MeetTimesList

**Checkpoint**: Meet details page event names are clickable and navigate to All Times

---

## Phase 4: User Stories 3 & 5 - Time Table Links (Priority: P1/P2)

**Goal**: Make event and meet names clickable in AllTimesList and TimeHistory components

**Independent Tests**:

- [US5] View All Times or TimeHistory, click any meet name, verify navigation to `/meets/{id}`
- [US3] Locate any TimeHistory table, click event name, verify navigation to All Times

### Tests for User Stories 3 & 5

- [x] T011 [P] [US5] Add integration test for AllTimesList meet link navigation in frontend/tests/components/alltimes.test.tsx
- [x] T012 [US3+US5] Add integration tests for TimeHistory event and meet link navigation in frontend/tests/components/times.test.tsx

### Implementation for User Stories 3 & 5

- [x] T013 [US5] Import MeetLink and update meet name display in frontend/src/components/times/AllTimesList.tsx
- [x] T014 [US3+US5] Import EventLink and MeetLink, update both name displays in frontend/src/components/times/TimeHistory.tsx
- [x] T014b [US3] Import EventLink and update event name display in frontend/src/components/comparison/ComparisonTable.tsx
- [x] T015 [US3+US5] Verify keyboard navigation works for all links in TimeHistory and AllTimesList

**Checkpoint**: TimeHistory has both event and meet links; AllTimesList has meet links

---

## Phase 5: User Story 4 & 7 - Consistent Visual Treatment (Priority: P2)

**Goal**: Ensure all event and meet links have consistent styling (hover, focus, underline)

**Independent Test**: Visual inspection across all pages - all links should have identical styling

### Implementation for User Stories 4 & 7

- [x] T016 [US4] Verify EventLink styling matches spec in all locations (Progress, MeetTimesList, TimeHistory)
- [x] T017 [US7] Verify MeetLink styling matches spec in all locations (AllTimesList, TimeHistory)
- [x] T018 [US4] Verify event names on All Times page are NOT styled as links (no circular nav)
- [x] T019 [US7] Verify meet name on Meet Details page header is NOT styled as a link (no circular nav)

**Checkpoint**: All links have consistent visual treatment across the application

---

## Phase 6: User Story 6 - Progress Chart Meet Links (Priority: P2)

**Goal**: Make meet names in Progress page tooltips/data displays clickable

**Independent Test**: View Progress chart, interact with data point, click meet name in tooltip, verify navigation

### Tests for User Story 6

- [x] T020 [US6] Update test mock data to include meet_id in frontend/tests/components/progress.test.tsx

### Implementation for User Story 6

- [x] T021 [US6] Add meet_id to backend SQL query and ProgressDataPoint struct
- [x] T022 [US6] Add meet_id to frontend ProgressDataPoint type
- [x] T023 [US6] Import MeetLink and update chart tooltip in frontend/src/components/charts/ProgressChart.tsx

**Checkpoint**: Progress page chart tooltips have clickable meet names

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T023 Run full frontend test suite (npm test)
- [x] T024 Run lint check (npm run lint)
- [x] T025 Manual accessibility audit - verify all links have visible focus states
- [x] T026 Manual accessibility audit - verify Tab order is correct in tables
- [x] T027 Verify navigation preserves course filter context (FR-008)
- [x] T028 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Stories (Phase 2-7)**: All depend on Setup completion (EventLink/MeetLink components)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Progress event links)**: Depends on EventLink component (T001, T003)
- **US2 (Meet details event links)**: Depends on EventLink component (T001, T003)
- **US5 (Meet name links)**: Depends on MeetLink component (T002, T003)
- **US3 (TimeHistory event links)**: Depends on EventLink component (T001, T003)
- **US4 & US7 (Visual consistency)**: Depends on all link implementations being complete
- **US6 (Progress meet links)**: Depends on MeetLink component (T002, T003)

### Parallel Opportunities

**Phase 1:**

- T001, T002 can run in parallel (different component files)
- T003 depends on T001, T002 (tests both components)

**After Phase 1 (all user stories can start in parallel):**

- US1 (T005-T007)
- US2 (T008-T010)
- US5 (T011-T015)
- US3 (T016-T018)
- US6 (T023-T025)

**Within US5:**

- T011, T012 can run in parallel (different test files)
- T013, T014 can run in parallel (different component files)

---

## Parallel Example: Phase 1

```bash
# Launch component creation in parallel:
Task: "Create EventLink component in frontend/src/components/ui/EventLink.tsx"
Task: "Create MeetLink component in frontend/src/components/ui/MeetLink.tsx"

# Then write tests (depends on components):
Task: "Write unit tests for EventLink and MeetLink in frontend/tests/components/links.test.tsx"
```

## Parallel Example: After Phase 1

```bash
# Launch P1 user stories together:
Task: "[US1] Update Progress page chart title in frontend/src/pages/Progress.tsx"
Task: "[US2] Update event name display in frontend/src/components/meets/MeetTimesList.tsx"
Task: "[US5] Update meet name display in frontend/src/components/times/AllTimesList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (EventLink, MeetLink components with tests)
2. Complete Phase 2: User Story 1 (Progress page event link)
3. **STOP and VALIDATE**: Test Progress page navigation independently
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup → Reusable components ready
2. Add US1 (Progress event link) → Test → Demo (MVP!)
3. Add US2 (Meet details event links) → Test → Demo
4. Add US5 (Meet name links) → Test → Demo
5. Add US3 (TimeHistory event links) → Test → Demo
6. Add US4 & US7 (Visual consistency) → Visual verification
7. Add US6 (Progress meet links) → Test → Demo
8. Polish phase → Final verification

### Suggested MVP Scope

**Minimum Viable Product**: Phase 1 + Phase 2 (US1)

- Creates EventLink component
- Adds clickable event name to Progress page
- Demonstrates the pattern that will be applied elsewhere
- Can be tested and demoed independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- EventLink and MeetLink are shared components - complete in Phase 1 before user stories
- Each user story modifies different components, enabling parallel work
- Visual consistency (US4, US7) is verification - grouped together after implementations
- Constitution requires TDD: write tests before implementation within each story
- Commit after each task or logical group
