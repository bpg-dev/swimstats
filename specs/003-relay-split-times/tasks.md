# Tasks: Relay Split Times

**Input**: Design documents from `/specs/003-relay-split-times/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-changes.md, quickstart.md

**Tests**: TDD required per project constitution — tests written first, must fail, then implement.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Backend + Frontend Domain Types)

**Purpose**: Extend the event code system with split event constants, helpers, and frontend types. ALL user stories depend on these changes.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 Write unit tests for split event helpers (`IsSplit`, `BaseEvent`, `SplitVariant`, `IsValid` for split codes, `IndividualEventCodes`, `SplitEventCodes`, `Description`, `Stroke`, `EventsByStroke` with splits) in `backend/internal/domain/types_test.go`
- [x] T002 Add split event constants (`Event50FRS`, `Event100FRS`, `Event200FRS`, `Event50BKS`, `Event100BKS`), `SplitEventCodes` slice, `IndividualEventCodes` slice, and helper methods (`IsSplit()`, `BaseEvent()`, `SplitVariant()`) to `backend/internal/domain/types.go`. Update `ValidEventCodes`, `Description()`, `Stroke()`, and `EventsByStroke()` to include split events.
- [x] T003 [P] Extend `EventCode` union type with split codes (`'50FRS' | '100FRS' | '200FRS' | '50BKS' | '100BKS'`), add split entries to `EVENTS` array (with display names like "100m Freestyle Split") and `EVENTS_BY_STROKE` map, add `isSplitEvent()` and `baseEvent()` helper functions in `frontend/src/types/time.ts`

**Checkpoint**: Split event codes are valid in both backend and frontend. Helpers available for all downstream logic.

---

## Phase 2: User Story 1 - Record a Relay Split Time at a Meet (Priority: P1) MVP

**Goal**: Users can add a split time alongside a regular time for the same base event at the same meet.

**Independent Test**: Add a 100FR time and a 100FRS time at the same meet — both accepted. Adding a second 100FRS → rejected as duplicate.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T004 [US1] Write integration tests for split time creation in `backend/tests/integration/time_test.go`: test creating a split time succeeds, test base+split coexist at same meet, test duplicate split rejected (409 DUPLICATE_EVENT), test invalid split code rejected (e.g., `400FRS`), test batch entry with split events (base+split in same batch allowed, two identical splits rejected), test PUT /times/{id} rejects changing event code from base to split (e.g., 100FR to 100FRS)

### Implementation for User Story 1

- [x] T005 [US1] Test EventSelector with split events in `frontend/src/components/times/EventSelector.tsx` — verify split events render correctly with the updated EVENTS array. If split events need visual grouping or a "Split" label in the dropdown to distinguish them from base events, implement those changes.
- [x] T006 [US1] Test batch time entry with split events in `frontend/src/components/times/TimeEntryForm.tsx` — verify split events are selectable and follow one-per-meet rule per event code. Fix any issues found.

**Checkpoint**: Split times can be created and stored. Event selectors show split events. Core recording capability works.

---

## Phase 3: User Story 2 - View Split Times Alongside Regular Times (Priority: P2)

**Goal**: Split times are visually distinguished from regular times in all list views.

**Independent Test**: View the All Times page with a mix of regular and split times — split times show a "Split" badge.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [US2] Write component test for split badge rendering in `frontend/tests/components/` — render AllTimes with a mix of regular and split times (via MSW), verify split times display a "Split" badge and regular times do not

### Implementation for User Story 2

- [x] T008 [US2] Add "Split" badge to split times on `frontend/src/pages/AllTimes.tsx` — detect split event codes using `isSplitEvent()` helper and render a small visual badge next to event name. Include accessible labeling (`aria-label` or `sr-only` text like "from relay split") for screen readers.

**Checkpoint**: Split times are visually distinguishable from regular times in the All Times view.

---

## Phase 4: User Story 3 - Split Times in Personal Bests and Standard Comparisons (Priority: P2)

**Goal**: Split times compete with base event times for PBs. Comparisons use merged PBs. PBs from splits are indicated.

**Independent Test**: Record 100FR at 1:05.00 and 100FRS at 1:03.50 — PB shows 1:03.50 with "from relay split" indicator. Comparison for 100FR uses the 1:03.50 split time.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T009 [US3] Write integration tests for PB merging with splits in `backend/tests/integration/personalbest_test.go`: test split faster than base (PB = split, `is_from_split=true`), test base faster than split (PB = base, `is_from_split=false`), test only split exists (PB = split), test only base exists (PB = base, `is_from_split=false`)

### Implementation for User Story 3

- [x] T010 [US3] Add PB merge logic to `backend/internal/api/handlers/personalbest.go`: after fetching raw PBs from DB, iterate split event PBs and merge into base event PBs (keep faster time), add `is_from_split` boolean field to JSON response per data-model.md merge algorithm
- [x] T011 [US3] Update comparison service in `backend/internal/domain/comparison/service.go`: merge split PBs into `pbMap` before comparison loop (same merge logic as PB handler), change comparison iteration from `domain.ValidEventCodes` to `domain.IndividualEventCodes` (17 base events only), add `is_from_split` field to comparison response items
- [x] T012 [US3] (Optional/Skipped) Add split events to standard time ordering CASE in `backend/internal/store/queries/standardtime.sql` and regenerate sqlc (`cd backend && make sqlc`). Note: standards only exist for base events, so split codes should not appear in standard_times queries. Only needed if the ordering CASE is used in a context that could include split event codes from joins. Skip if analysis confirms it is unnecessary.
- [x] T013 [P] [US3] Add `is_from_split` boolean field to `PersonalBest` interface in `frontend/src/types/personalbest.ts`
- [x] T014 [US3] Show "from relay split" indicator on PBs in `frontend/src/pages/PersonalBests.tsx` when `is_from_split` is true — small badge or text. Include accessible labeling (`aria-label` or visually hidden text) for screen readers.
- [x] T015 [P] [US3] Show split indicator on PB grid items in `frontend/src/components/comparison/PersonalBestGrid.tsx` when `is_from_split` is true. Include accessible labeling for screen readers.
- [x] T016 [US3] Update comparison display in `frontend/src/components/comparison/ComparisonTable.tsx`: add split event names to hardcoded `eventNames` map, show `is_from_split` indicator on comparison rows with accessible labeling

**Checkpoint**: PBs correctly reflect fastest time across base and split events. Comparisons include split times. Split origin is indicated in all views.

---

## Phase 5: User Story 4 - Split Times in Progress Graphs (Priority: P3)

**Goal**: Progress graphs for a base event show both individual and split times with visual distinction.

**Independent Test**: View 100FR progress graph with both 100FR and 100FRS times — both appear, split times have distinct markers. The `is_pb` markers consider both base and split times together.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T017 [P] [US4] Write integration test for progress endpoint with split times in `backend/tests/integration/` — test that GET /progress/100FR returns both 100FR and 100FRS times, test that `is_split` field is present on split data points, test that `is_pb` is calculated across both base and split events (e.g., if split 1:03.50 is faster than base 1:05.00, the split is marked `is_pb=true` and the base is not)
- [x] T018 [P] [US4] Write component test for split markers on progress chart in `frontend/tests/components/` — render Progress page with mixed base and split data points (via MSW), verify split points have distinct visual markers and a legend entry

### Implementation for User Story 4

- [x] T019 [US4] Modify `GetProgressData` query in `backend/internal/store/queries/time.sql` to accept both base and split event codes (change `t.event = $3` to `t.event IN ($3, $4)` or use `ANY` parameter), regenerate sqlc (`cd backend && make sqlc`)
- [x] T020 [US4] Update progress service in `backend/internal/domain/comparison/progress.go`: compute split variant for requested base event using `SplitVariant()`, pass both codes to modified query, add `is_split` boolean field to response data points (derived from event code). Recalculate `is_pb` in the service layer after fetching results: find the minimum `time_ms` across ALL returned data points (both base and split events combined), then mark only the fastest time as `is_pb=true`. This replaces the per-event-code `is_pb` from the SQL query.
- [x] T021 [US4] Render split data points with distinct visual markers on `frontend/src/pages/Progress.tsx` — use different dot shape, color, or styling for split times vs regular times. Add `is_split` to the frontend progress data type. Include legend entry for split times. Ensure chart markers have accessible labels (e.g., tooltip or `aria-label` distinguishing split from regular).

**Checkpoint**: Progress graphs show complete picture with both individual and split times, visually distinguished. PB markers are accurate across both event types.

---

## Phase 6: User Story 5 - Export and Import Split Times (Priority: P3)

**Goal**: Split times preserved through export/import cycle. Backward compatible with old exports.

**Independent Test**: Export data with split times, import into fresh state — split times preserved with correct event codes.

### Implementation for User Story 5

- [x] T022 [US5] Replace hardcoded valid events map with `domain.IsValidEvent()` call in `backend/internal/domain/importer/service.go` (around lines 246-252) to accept split event codes on import. This is a DRY fix — the hardcoded map duplicates `ValidEventCodes`.
- [x] T023 [US5] Write integration test verifying export includes split event codes and import restores them correctly in `backend/tests/integration/` — test export with splits, test import with splits, test import of old export without splits (backward compat)

**Checkpoint**: Data portability works with split times. Old exports without splits import normally.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all stories

- [x] T024 Run backend quality gates: `cd backend && make lint && make test`
- [x] T025 Run frontend quality gates: `cd frontend && make check && make test`
- [x] T026 Verify all acceptance scenarios from spec.md pass (manual or via integration tests)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately. BLOCKS all user stories.
- **US1 (Phase 2)**: Depends on Phase 1 completion.
- **US2 (Phase 3)**: Depends on Phase 1 completion. Independent of US1.
- **US3 (Phase 4)**: Depends on Phase 1 completion. Independent of US1, US2.
- **US4 (Phase 5)**: Depends on Phase 1 completion. Independent of other stories.
- **US5 (Phase 6)**: Depends on Phase 1 completion. Independent of other stories.
- **Polish (Phase 7)**: Depends on all user stories being complete.

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Backend changes before frontend changes (API contract drives UI)
- Types/models before services before handlers
- Commit after each task or logical group

### Parallel Opportunities

**Phase 1 (Foundational)**:
- T003 (frontend types) can run in parallel with T001+T002 (backend types)

**After Phase 1 completes**:
- US1, US2, US3, US4, US5 can ALL start simultaneously
- Within US3: T013 and T015 can run in parallel with backend tasks (T010-T012)
- Within US4: T017 and T018 (tests) can run in parallel, T021 (frontend) can start once T019-T020 (backend) define the API shape

---

## Parallel Example: Foundational Phase

```text
Agent 1: T001 (test) -> T002 (implement)  [backend domain types]
Agent 2: T003                              [frontend types]
```

## Parallel Example: After Foundational

```text
Agent 1: US1  T004 -> T005 -> T006
Agent 2: US2  T007 -> T008
Agent 3: US3  T009 -> T010 -> T011 -> T012 -> T013/T015 -> T014 -> T016
Agent 4: US4  T017/T018 -> T019 -> T020 -> T021
Agent 5: US5  T022 -> T023
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (backend + frontend types)
2. Complete Phase 2: US1 (recording split times)
3. **STOP and VALIDATE**: Can split times be created and stored?
4. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 (Foundational) → Types ready
2. Phase 2 (US1) → Record splits → **MVP!**
3. Phase 3 (US2) → See splits in views
4. Phase 4 (US3) → Splits count for PBs and comparisons
5. Phase 5 (US4) → Splits on progress graphs
6. Phase 6 (US5) → Export/import with splits
7. Phase 7 (Polish) → Final verification

---

## Notes

- No database migration required — VARCHAR(50) event column handles new codes
- PB merging happens in Go service layer, not SQL
- Comparison iterates base events only (17 `IndividualEventCodes`) — splits don't get their own comparison rows
- `is_from_split` field added to PB and comparison API responses
- `is_split` field added to progress data points
- Progress `is_pb` must be recalculated in service layer across both base and split events
- EventSelector is generic — verify it works with new events, don't rewrite
- Importer DRY fix replaces hardcoded map with `domain.IsValidEvent()`
- sqlc must be regenerated after each SQL query change (Phases 4 and 5)
- All UI badges/indicators must include accessible labeling (ARIA attributes or sr-only text)
