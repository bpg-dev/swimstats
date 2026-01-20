# Tasks: Swim Progress Tracker

**Input**: Design documents from `/specs/001-swim-progress-tracker/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.yaml, research.md, quickstart.md

**Tests**: Included per Constitution Principle II (Test-Driven Development)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

**Current Status** (as of 2026-01-20):

- ✅ MVP Complete: Phases 1-4b (Setup, Foundation, US1, US2, All Times)
- ✅ Phase 5 Complete: US3 - Time Standards (CRUD, JSON import, data files)
- ✅ Phase 6 Complete: US4 + US6 - Compare Times Against Standards (with standing dashboard)
- ✅ Phase 6b Complete: US7 - Import Historical Results (JSON bulk import system)
- ✅ Phase 7 Complete: US5 - View Progress Graphs (Recharts line charts with standard reference lines)
- ✅ Navigation UI Polish: Enhanced visual hierarchy, removed redundant Home nav, improved course filter styling
- ✅ Phase 8 Data Export/Import: Complete (T180-T191, 12/12 tasks) - export, import with preview, replace mode, dialogs
- ⏳ Next: Phase 8 remaining work - documentation (4), accessibility (5), performance (5), testing (4), security (5), validation (5), deployment (5)
- Clarifications applied: JSON export format, basic accessibility (semantic HTML + keyboard nav)
- Recent enhancements: Export/import with preview and replace mode, in-app dialogs, comprehensive warnings

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/` (Go 1.25+, chi router, sqlc)
- **Frontend**: `frontend/` (React 18, Vite, TailwindCSS)
- **Migrations**: `backend/migrations/`
- **Tests**: `backend/tests/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure per plan.md in repository root
- [X] T002 [P] Initialize Go module in backend/go.mod with dependencies (chi, sqlc, go-oidc, testify)
- [X] T003 [P] Initialize frontend with Vite + React + TypeScript in frontend/package.json
- [X] T004 [P] Configure TailwindCSS in frontend/tailwind.config.js
- [X] T005 [P] Configure ESLint and Prettier in frontend/.eslintrc.js
- [X] T006 [P] Configure golangci-lint in backend/.golangci.yml
- [X] T007 Create docker-compose.yaml with PostgreSQL 16 service
- [X] T008 [P] Create GitHub Actions CI workflow in .github/workflows/ci.yaml
- [X] T009 [P] Create backend Dockerfile in backend/Dockerfile (multi-stage build)
- [X] T010 [P] Create frontend Dockerfile in frontend/Dockerfile (nginx serving static)

**Checkpoint**: Project scaffolding complete, ready for foundational work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Migrations

- [X] T011 Create initial database migration in backend/migrations/001_initial_schema.up.sql (all tables from data-model.md)
- [X] T012 Create down migration in backend/migrations/001_initial_schema.down.sql
- [X] T013 Configure sqlc in backend/sqlc.yaml

### Backend Core

- [X] T014 [P] Create base types in backend/internal/domain/types.go (CourseType, EventCode, AgeGroup enums)
- [X] T015 [P] Create time formatting utilities in backend/internal/domain/timeformat.go (FormatTime, ParseTime)
- [X] T016 [P] Create age calculation utilities in backend/internal/domain/age.go (AgeAtCompetition, AgeGroupFromAge)
- [X] T017 Create database connection pool in backend/internal/store/postgres/db.go
- [X] T018 Create API router skeleton in backend/internal/api/router.go
- [X] T019 [P] Create error handling middleware in backend/internal/api/middleware/errors.go
- [X] T020 [P] Create logging middleware in backend/internal/api/middleware/logging.go
- [X] T021 [P] Create CORS middleware in backend/internal/api/middleware/cors.go
- [X] T022 Create health check handler in backend/internal/api/handlers/health.go
- [X] T023 Create server entrypoint in backend/cmd/server/main.go

### Authentication (US0)

- [X] T024 Create OIDC configuration in backend/internal/auth/config.go
- [X] T025 Create OIDC provider client in backend/internal/auth/oidc.go
- [X] T026 Create auth middleware in backend/internal/api/middleware/auth.go (token validation, access level extraction)
- [X] T027 Create current user handler in backend/internal/api/handlers/auth.go (GET /auth/me)
- [X] T028 [P] Create auth types in frontend/src/types/auth.ts (User, AccessLevel)
- [X] T029 [P] Create auth service in frontend/src/services/auth.ts (OIDC flow, token management)
- [X] T030 Create auth store in frontend/src/stores/authStore.ts (Zustand)
- [X] T031 Create ProtectedRoute component in frontend/src/components/layout/ProtectedRoute.tsx
- [X] T032 Create login callback page in frontend/src/pages/AuthCallback.tsx

### Frontend Core

- [X] T033 [P] Create base UI components in frontend/src/components/ui/ (Button, Input, Select, Card, Loading, ErrorBanner)
- [X] T034 [P] Create API client in frontend/src/services/api.ts (axios instance with auth interceptor)
- [X] T035 Create app shell layout in frontend/src/components/layout/AppShell.tsx (navigation, header)
- [X] T036 Create course filter store in frontend/src/stores/courseFilterStore.ts (Zustand for 25m/50m filter state)
- [X] T037 Create CourseFilterToggle component in frontend/src/components/layout/CourseFilterToggle.tsx
- [X] T038 Configure React Query in frontend/src/main.tsx
- [X] T039 Configure React Router in frontend/src/App.tsx

### Integration Tests Setup

- [X] T040 [P] Create test database setup in backend/tests/integration/testdb.go (testcontainers)
- [X] T041 [P] Create API test client in backend/tests/integration/client.go
- [X] T042 [P] Create MSW handlers setup in frontend/tests/mocks/handlers.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Record Swim Times (Priority: P1) 🎯 MVP

**Goal**: Record swim times organized by meet with quick entry workflow

**Independent Test**: Create a meet, enter multiple times, verify times appear with meet details

### Tests for User Story 1

- [X] T043 [P] [US1] Create swimmer API tests in backend/tests/integration/swimmer_test.go
- [X] T044 [P] [US1] Create meet API tests in backend/tests/integration/meet_test.go
- [X] T045 [P] [US1] Create time entry API tests in backend/tests/integration/time_test.go
- [X] T046 [P] [US1] Create meet components tests in frontend/tests/components/meets.test.tsx
- [X] T047 [P] [US1] Create time entry components tests in frontend/tests/components/times.test.tsx

### Backend Implementation for US1

- [X] T048 [P] [US1] Create swimmer sqlc queries in backend/internal/store/queries/swimmer.sql
- [X] T049 [P] [US1] Create meet sqlc queries in backend/internal/store/queries/meet.sql
- [X] T050 [P] [US1] Create time sqlc queries in backend/internal/store/queries/time.sql
- [X] T051 Run sqlc generate to create Go code from queries
- [X] T052 [US1] Create swimmer repository in backend/internal/store/postgres/swimmer.go
- [X] T053 [US1] Create meet repository in backend/internal/store/postgres/meet.go
- [X] T054 [US1] Create time repository in backend/internal/store/postgres/time.go
- [X] T055 [US1] Create swimmer service in backend/internal/domain/swimmer/service.go
- [X] T056 [US1] Create meet service in backend/internal/domain/meet/service.go
- [X] T057 [US1] Create time service in backend/internal/domain/time/service.go (includes batch create)
- [X] T058 [US1] Create swimmer handlers in backend/internal/api/handlers/swimmer.go (GET/PUT /swimmer)
- [X] T059 [US1] Create meet handlers in backend/internal/api/handlers/meet.go (CRUD /meets)
- [X] T060 [US1] Create time handlers in backend/internal/api/handlers/time.go (CRUD /times, POST /times/batch)
- [X] T061 [US1] Register US1 routes in backend/internal/api/router.go

### Frontend Implementation for US1

- [X] T062 [P] [US1] Create swimmer types in frontend/src/types/swimmer.ts
- [X] T063 [P] [US1] Create meet types in frontend/src/types/meet.ts
- [X] T064 [P] [US1] Create time types in frontend/src/types/time.ts
- [X] T065 [US1] Create swimmer API service in frontend/src/services/swimmer.ts
- [X] T066 [US1] Create meet API service in frontend/src/services/meets.ts
- [X] T067 [US1] Create time API service in frontend/src/services/times.ts
- [X] T068 [US1] Create useSwimmer hook in frontend/src/hooks/useSwimmer.ts (React Query)
- [X] T069 [US1] Create useMeets hook in frontend/src/hooks/useMeets.ts (React Query)
- [X] T070 [US1] Create useTimes hook in frontend/src/hooks/useTimes.ts (React Query)
- [X] T071 [US1] Create SwimmerProfile component in frontend/src/components/swimmer/SwimmerProfile.tsx
- [X] T072 [US1] Create SwimmerSetupForm component in frontend/src/components/swimmer/SwimmerSetupForm.tsx
- [X] T073 [US1] Create MeetList component in frontend/src/components/meets/MeetList.tsx
- [X] T074 [US1] Create MeetForm component in frontend/src/components/meets/MeetForm.tsx
- [X] T075 [US1] Create MeetSelector component in frontend/src/components/meets/MeetSelector.tsx
- [X] T076 [US1] Create TimeEntryForm component in frontend/src/components/times/TimeEntryForm.tsx
- [X] T077 [US1] Create QuickEntryForm component in frontend/src/components/times/QuickEntryForm.tsx (batch entry)
- [X] T078 [US1] Create TimeHistory component in frontend/src/components/times/TimeHistory.tsx
- [X] T079 [US1] Create EventSelector component in frontend/src/components/times/EventSelector.tsx
- [X] T080 [US1] Create time formatting utils in frontend/src/utils/timeFormat.ts
- [X] T081 [US1] Create Home page in frontend/src/pages/Home.tsx
- [X] T082 [US1] Create Meets page in frontend/src/pages/Meets.tsx
- [X] T083 [US1] Create AddTimes page in frontend/src/pages/AddTimes.tsx
- [X] T084 [US1] Create TimeHistory page in frontend/src/pages/TimeHistory.tsx

**Checkpoint**: User Story 1 complete - can record times organized by meet

### Post-US1 Fixes & Polish (Completed)

- [X] Fix proxy "Invalid header value char" error - base64 encode X-Mock-User header
- [X] Add Settings button to navigation (gear icon near Sign out)
- [X] Add Settings link to mobile menu
- [X] Add /time-history route alias for Time History page
- [X] Add swimmer profile editor to Settings page
- [X] Update README.md with development setup instructions
- [X] Fix "Recent Meets0" / "Time History0" display bug (React rendering numeric 0)
- [X] Add Quick Add Meet option to QuickEntryForm for streamlined time entry workflow
- [X] Reorder navigation menu: Add Times before Meets
- [X] Fix auth persistence: persist user object in localStorage (not just isAuthenticated)
- [X] Fix auth rehydration: handle inconsistent state (isAuthenticated=true but user=null) on store load
- [X] Fix Quick Entry form alignment: use column headers instead of per-row labels
- [X] Add labelClassName prop to Input, Select, and EventSelector components

### US1 Enhancement: Save Feedback & Meet Details Page

- [x] **Frontend**: Update QuickEntryForm to show success state with times count (not just PB notification)
- [x] **Frontend**: Add "View Meet" and "Add More Times" buttons to success state
- [x] **Frontend**: Create MeetDetails page (`/meets/:id`) showing all times from a specific meet
- [x] **Frontend**: Create MeetTimesList component displaying times in a table grouped by event
- [x] **Frontend**: Add navigation to MeetDetails from MeetList (click on meet name)
- [x] **Frontend**: Update App.tsx with /meets/:id route
- [x] **Tests**: Add tests for MeetDetails page and MeetTimesList component
- [x] **Tests**: Add tests for QuickEntryForm success state with navigation options

### US1 Enhancement: Delete Time from Meet Details

- [x] **Frontend**: Add delete button to MeetTimesList for each time entry
- [x] **Frontend**: Implement confirmation dialog before deletion
- [x] **Frontend**: Use existing `useDeleteTime` hook for mutation
- [x] **Tests**: Add delete time tests to meets.test.tsx
- [x] **Mocks**: Add DELETE /times/:id handler to MSW handlers

### US1 Enhancement: One Event Per Meet Validation

- [x] **Spec**: Add FR-03A and FR-03B requirements (one event per meet rule)
- [x] **Backend**: Add `EventExistsForMeet` query in time.sql
- [x] **Backend**: Add `ErrDuplicateEvent` error in postgres/db.go
- [x] **Backend**: Add duplicate event validation in time service (Create and CreateBatch)
- [x] **Backend**: Return 409 Conflict with DUPLICATE_EVENT code in handlers
- [x] **Backend**: Add integration tests for duplicate event validation
- [x] **Frontend**: Add `ApiRequestError` class with error code support
- [x] **Frontend**: Add client-side duplicate event validation in QuickEntryForm
- [x] **Frontend**: Handle DUPLICATE_EVENT error in TimeEntryForm and QuickEntryForm
- [x] **Frontend**: Filter out already-entered events from EventSelector dropdown
- [x] **Frontend**: Add `excludeEvents` prop to EventSelector component
- [x] **Tests**: Add test for excluded events in dropdown
- [x] **Docs**: Update tasks.md with this enhancement

### US1 Enhancement: Multi-Day Meets and Event Dates

- [x] **Spec**: Update spec.md with multi-day meet requirements (FR-020, FR-03C)
- [x] **Backend**: Add migration for `end_date` to `meets` table and `event_date` to `times` table
- [x] **Backend**: Update meet/time models and SQL queries to use `start_date`, `end_date`, and `event_date`
- [x] **Backend**: Update meet/time services with date validation (end_date >= start_date, event_date within range)
- [x] **Backend**: Update API handlers for new date fields
- [x] **Backend**: Update integration tests for new date fields
- [x] **Frontend**: Update `Meet` and `TimeRecord` types with new date fields
- [x] **Frontend**: Update `MeetForm` with date range picker (start_date, end_date)
- [x] **Frontend**: Add `formatDateRange` utility function
- [x] **Frontend**: Update `MeetList`, `MeetDetails`, `MeetSelector` to display date ranges
- [x] **Frontend**: Add event date selector to `TimeEntryForm` (for multi-day meets)
- [x] **Frontend**: Add event date selector to `QuickEntryForm` (for multi-day meets)
- [x] **Frontend**: Update `AllTimesList` and `TimeHistory` to show event dates
- [x] **Frontend**: Update MSW mock handlers with new date fields
- [x] **Tests**: All frontend tests passing (58 tests)
- [x] **Tests**: All backend integration tests passing

### US1 Enhancement: Quick Entry Form UI Fixes

- [x] **Frontend**: Fix Quick Entry form header alignment for multi-day and single-day meets
- [x] **Frontend**: Fix delete button (X) vertical alignment in Quick Entry form
- [x] **Frontend**: Add multi-day meet support to "Quick Add Meet" form (start_date, end_date fields)
- [x] **Frontend**: Add validation for end_date >= start_date in Quick Add Meet
- [x] **Tests**: All frontend tests passing (58 tests)

---

## Phase 4: User Story 2 - View Personal Bests (Priority: P1)

**Goal**: Display personal best times for each event, organized by stroke

**Independent Test**: Enter multiple times for same event, verify fastest is shown as PB

### Tests for User Story 2

- [X] T085 [P] [US2] Create personal bests API tests in backend/tests/integration/personalbest_test.go
- [X] T086 [P] [US2] Create personal bests component tests in frontend/tests/components/personalbests.test.tsx

### Backend Implementation for US2

- [X] T087 [US2] Create personal bests query in backend/internal/store/queries/personalbest.sql (already existed from US1)
- [X] T088 [US2] Run sqlc generate for personal bests (already generated)
- [X] T089 [US2] Create personal bests service in backend/internal/domain/comparison/personalbest.go
- [X] T090 [US2] Create personal bests handler in backend/internal/api/handlers/personalbest.go (GET /personal-bests)
- [X] T091 [US2] Update time service to detect new PBs in backend/internal/domain/time/service.go (already implemented in US1)

### Frontend Implementation for US2

- [X] T092 [P] [US2] Create personal best types in frontend/src/types/personalbest.ts
- [X] T093 [US2] Create personal bests API service in frontend/src/services/personalBests.ts
- [X] T094 [US2] Create usePersonalBests hook in frontend/src/hooks/usePersonalBests.ts
- [X] T095 [US2] Create PersonalBestCard component in frontend/src/components/comparison/PersonalBestCard.tsx
- [X] T096 [US2] Create PersonalBestGrid component in frontend/src/components/comparison/PersonalBestGrid.tsx
- [X] T097 [US2] Create NewPBBadge component in frontend/src/components/times/NewPBBadge.tsx
- [X] T098 [US2] Create PersonalBests page in frontend/src/pages/PersonalBests.tsx
- [X] T099 [US2] Update QuickEntryForm to show new PB indicator in frontend/src/components/times/QuickEntryForm.tsx (already implemented in US1)

**Checkpoint**: User Story 2 complete - can view personal bests by event

---

## Phase 4b: All Times View (Enhancement to US1/US2)

**Goal**: View all recorded times for a selected event with PB indicators

**Independent Test**: Select an event, view all times sorted by date, verify PBs are marked

### Backend Implementation for All Times

- [x] T085b [AllTimes] Verify existing times query supports event filtering (already exists)
- [x] T086b [AllTimes] Use personalBests API to identify PB time IDs (no backend change needed)

### Frontend Implementation for All Times

- [x] T087b [P] [AllTimes] Create AllTimesList component in frontend/src/components/times/AllTimesList.tsx
- [x] T088b [P] [AllTimes] Create EventFilter component in frontend/src/components/times/EventFilter.tsx
- [x] T089b [P] [AllTimes] Create SortToggle component in frontend/src/components/times/SortToggle.tsx
- [x] T090b [AllTimes] Reuse existing useTimes hook (no new hook needed)
- [x] T091b [AllTimes] Create AllTimes page in frontend/src/pages/AllTimes.tsx
- [x] T092b [AllTimes] Update navigation order: Add Times → All Times → Personal Bests → Meets
- [x] T093b [AllTimes] Add PB badge display to AllTimesList using existing NewPBBadge component

### Tests for All Times

- [x] T094b [P] [AllTimes] Create All Times component tests in frontend/tests/components/alltimes.test.tsx

### All Times Consolidation & Polish

- [x] T095b [AllTimes] Convert AllTimesList from cards to compact table format
- [x] T096b [AllTimes] Remove "All Events" option (require specific event selection)
- [x] T097b [AllTimes] Consolidate /times and /all-times routes (removed TimeHistory page)
- [x] T098b [AllTimes] Update Home Quick Action to link to /all-times
- [x] T099b [AllTimes] Add rank badges (gold/silver/bronze) when sorting by fastest

**Checkpoint**: All Times view complete - can view all times per event with PB markers and rankings

---

## Phase 5: User Story 3 - Manage Time Standards (Priority: P2)

**Goal**: Create, edit, delete time standards with pre-loaded Swimming Canada/Swim Ontario standards

**Independent Test**: Create a custom standard, add qualifying times, verify it appears in list

### Tests for User Story 3

- [x] T100 [P] [US3] Create standards API tests in backend/tests/integration/standard_test.go
- [x] T101 [P] [US3] Create standards component tests in frontend/tests/components/standards.test.tsx

### Backend Implementation for US3

- [x] T102 [P] [US3] Create standard sqlc queries in backend/internal/store/queries/standard.sql
- [x] T103 [P] [US3] Create standard time sqlc queries (combined in standard.sql)
- [x] T104 Run sqlc generate for standards
- [x] T105 [US3] Create standard repository in backend/internal/store/postgres/standard.go
- [x] T106 [US3] Create standard service in backend/internal/domain/standard/service.go
- [x] T107 [US3] Create standard handlers in backend/internal/api/handlers/standard.go (CRUD /standards, PUT /standards/{id}/times)
- [x] T108 [US3] Create standards import handler in backend/internal/api/handlers/standard.go (POST /standards/import, POST /standards/import/json)
- [x] T109 [US3] Create Swimming Canada standards data files in data/swimming-canada-*.json
- [x] T110 [US3] Create Swim Ontario standards data files in data/swim-ontario-*.json
- [x] T111 [US3] Add database migration for time_standards and standard_times tables (003_time_standards.up.sql)
- [x] T112 [US3] Gender field included in time_standards table from initial migration

### Frontend Implementation for US3

- [x] T113 [P] [US3] Create standard types in frontend/src/types/standard.ts
- [x] T114 [US3] Create standards API service in frontend/src/services/standards.ts
- [x] T115 [US3] Create useStandards hook in frontend/src/hooks/useStandards.ts
- [x] T116 [US3] Create StandardList component in frontend/src/components/standards/StandardList.tsx
- [x] T117 [US3] Create StandardForm component in frontend/src/components/standards/StandardForm.tsx
- [x] T118 [US3] Create StandardTimesEditor component in frontend/src/components/standards/StandardTimesEditor.tsx
- [x] T119 [US3] Create StandardImportForm component in frontend/src/components/standards/StandardImportForm.tsx (JSON file upload)
- [x] T120 [US3] Create Standards page in frontend/src/pages/Standards.tsx
- [x] T121 [US3] Create StandardDetail page in frontend/src/pages/StandardDetail.tsx

### US3 Enhancement: JSON File Import

- [x] T122 [US3] Create JSON file format specification in data/README.md
- [x] T123 [US3] Add JSONFileInput types and ImportFromJSON service method in backend
- [x] T124 [US3] Add POST /standards/import/json endpoint for bulk JSON import
- [x] T125 [US3] Add useImportFromJSON hook in frontend
- [x] T126 [US3] Create Swim Ontario 2025-2026 female standards (SC + LC JSON files)
- [x] T127 [US3] Create Swimming Canada 2026-2028 female standards (SC + LC JSON files)

**Checkpoint**: User Story 3 complete - can manage time standards

---

## Phase 6: User Story 4 - Compare Times Against Standards (Priority: P2)

**Goal**: Compare personal bests against selected standard with difference calculations

**Independent Test**: Select a standard, view comparison showing achieved/not-achieved status with differences

### Tests for User Story 4

- [x] T122 [P] [US4] Create comparison component tests in frontend/tests/components/comparison.test.tsx

### Backend Implementation for US4

- [x] T123 [US4] Create comparison service in backend/internal/domain/comparison/service.go
- [x] T124 [US4] Create comparison handler in backend/internal/api/handlers/comparison.go (GET /comparisons)
- [x] T125 [US4] Add "almost there" threshold logic (3% configurable) in comparison service
- [x] T126 [US4] Wire up comparison route in router.go

### Frontend Implementation for US4

- [x] T127 [P] [US4] Create comparison types in frontend/src/types/comparison.ts
- [x] T128 [US4] Create comparison API service in frontend/src/services/comparisons.ts
- [x] T129 [US4] Create useComparison hook in frontend/src/hooks/useComparison.ts
- [x] T130 [US4] Create ComparisonTable component in frontend/src/components/comparison/ComparisonTable.tsx
- [x] T131 [US4] Create StandardSelector component in frontend/src/components/comparison/StandardSelector.tsx
- [x] T132 [US4] Create StatusBadge component in frontend/src/components/comparison/StatusBadge.tsx
- [x] T133 [US4] Create ComparisonSummary component in frontend/src/components/comparison/ComparisonSummary.tsx
- [x] T134 [US4] Update Compare page in frontend/src/pages/Compare.tsx

**Checkpoint**: User Story 4 complete - can compare times against standards

### Phase 6 Enhancements: Comparison UI & Navigation Polish

- [x] T135 [US4] Add adjacent age group columns (prev/next) to ComparisonTable.tsx
- [x] T136 [US4] Add PreviousAgeGroup() and NextAgeGroup() helper functions in backend/internal/domain/age.go
- [x] T137 [US4] Extend EventComparison struct with prev/next age group fields in backend/internal/domain/comparison/service.go
- [x] T138 [US4] Create getStandardTimeExact() function for age group lookup without OPEN fallback
- [x] T139 [US4] Make prev/next columns conditional based on data availability in ComparisonTable.tsx
- [x] T140 [US4] Add percentage display to Difference column in ComparisonTable.tsx
- [x] T141 [US4] Update course filter toggle colors (25m=blue, 50m=green) in CourseFilterToggle.tsx
- [x] T142 [US4] Add achieved standards display to PersonalBestCard.tsx with clickable badges
- [x] T143 [US4] Implement achieved standards calculation in PersonalBests.tsx using useQueries
- [x] T144 [US4] Add standard_id query parameter support to Compare.tsx for direct navigation
- [x] T145 [US4] Style achieved standards badges (green background, smaller text)
- [x] T146 [US4] Remove green highlighting from "Achieved:" label (neutral gray)
- [x] T147 [Nav] Reorder navigation: Personal Bests first after Home in AppShell.tsx
- [x] T148 [Nav] Reorder Quick Actions: Personal Bests first in Home.tsx

**Checkpoint**: Phase 6 enhancements complete - polished comparison UI and improved navigation

---

## Phase 6b: User Story 7 - Import Historical Results (Priority: P4)

**Status**: ✅ **COMPLETE** - JSON bulk import system implemented

**Goal**: Import swimmer data and time standards from JSON files to avoid manual data entry

**Independent Test**: Import JSON file with meets and times, verify all data appears correctly with PB calculation

### Backend Implementation for US7

- [x] T160 [P] [US7] Create importer service in backend/internal/domain/importer/service.go
- [x] T161 [P] [US7] Create importer types in backend/internal/domain/importer/types.go
- [x] T162 [US7] Create import handler in backend/internal/api/handlers/import.go (POST /data/import)
- [x] T163 [US7] Add import route to router in backend/internal/api/router.go

### Scripts & Documentation for US7

- [x] T164 [P] [US7] Create import-all.sh script in scripts/
- [x] T165 [P] [US7] Create import-standards.sh script in scripts/
- [x] T166 [P] [US7] Create test-import.sh script in scripts/
- [x] T167 [P] [US7] Create reset-database.sh script in scripts/
- [x] T168 [P] [US7] Create swimmer import template in data/swimmer-import-template.json
- [x] T169 [P] [US7] Create Alice Boldyrev data files in data/ (complete season + 2025-2026 subset)
- [x] T170 [P] [US7] Create IMPORT-README.md in data/ (format documentation)
- [x] T171 [P] [US7] Create IMPORT-GUIDE.md in repository root (user guide)

**Checkpoint**: Phase 6b complete - full import system working with scripts and documentation

---

## Phase 7: User Story 5 - View Progress Graphs (Priority: P3) ✅ COMPLETE

**Goal**: Display line graphs showing time progression with standard reference lines

**Independent Test**: View progress graph for an event, verify times plotted correctly with optional standard line

### Tests for User Story 5

- [X] T138 [P] [US5] Create progress API tests in backend/tests/integration/progress_test.go
- [X] T139 [P] [US5] Create chart component tests in frontend/tests/components/charts.test.tsx

### Backend Implementation for US5

- [X] T140 [US5] Create progress data query in backend/internal/store/queries/time.sql (GetProgressData)
- [X] T141 Run sqlc generate for progress
- [X] T142 [US5] Create progress service in backend/internal/domain/comparison/progress.go
- [X] T143 [US5] Create progress handler in backend/internal/api/handlers/progress.go (GET /v1/progress/{event})

### Frontend Implementation for US5

- [X] T144 [P] [US5] Create progress types in frontend/src/types/progress.ts
- [X] T145 [US5] Create progress API service in frontend/src/services/progress.ts
- [X] T146 [US5] Create useProgress hook in frontend/src/hooks/useProgress.ts
- [X] T147 [US5] Create ProgressChart component in frontend/src/components/charts/ProgressChart.tsx (Recharts with custom PB markers, tooltips, reference line)
- [X] T148 [US5] Integrate date range filters in frontend/src/pages/Progress.tsx (start_date, end_date query params)
- [X] T149 [US5] Implement standard reference line with formatted label in ProgressChart.tsx
- [X] T150 [US5] Create Progress page in frontend/src/pages/Progress.tsx with event selector, date filters, standard selector

**Checkpoint**: User Story 5 complete - can view progress graphs with PB markers and standard reference lines

---

## Phase 7b: Navigation UI Polish

**Status**: ✅ **COMPLETE** - Enhanced navigation menu visual hierarchy and styling

**Purpose**: Improve navigation menu aesthetics, visual hierarchy, and user experience

### Navigation Enhancements

- [X] T151 [Nav] Split desktop navigation into logical groups (main + analytics) with visual separator in AppShell.tsx
- [X] T152 [Nav] Enhance visual separation with darker border (border-l-2 border-slate-300) between nav groups
- [X] T153 [Nav] Improve course filter styling with bold selected state (solid colors, shadow, semibold font)
- [X] T154 [Nav] Add user menu grouping with subtle background container (bg-slate-50, border)
- [X] T155 [Nav] Fine-tune alignment and spacing across all navigation elements
- [X] T156 [Nav] Add subtle shadows to active nav items for depth (shadow-sm)
- [X] T157 [Nav] Remove duplicate "Course:" label from AppShell.tsx (CourseFilterToggle has its own)
- [X] T158 [Nav] Add logout icon to Sign out button for consistency with Settings icon
- [X] T159 [Nav] Remove redundant Home nav item (SwimStats logo serves as home link)

**Checkpoint**: Navigation UI polish complete - improved visual hierarchy, better grouping, cleaner design

---

## Phase 8: User Story 6 - View Standing Against Standard (Priority: P3)

**Status**: ✅ **COMPLETE** - Covered by Phase 6 (US4) implementation

**Rationale**: The Compare page already provides all US6 functionality:
- ComparisonSummary component displays achieved/almost/not-yet qualification counts
- Configurable threshold percentage (default 3%) shown in summary
- Visual color-coding (green/amber/gray) for status indicators
- Drill-down capability via ComparisonTable below summary
- All US6 acceptance criteria met through existing US4 implementation

No additional implementation needed. Moving directly to Phase 7 (US5 - Progress Charts).

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Data export, documentation, accessibility, performance validation, and deployment readiness

### Data Export & Import ✅ COMPLETE

- [x] T180 [P] Create data export API tests in backend/tests/integration/export_test.go
- [x] T181 [P] Create export service in backend/internal/domain/exporter/service.go (single JSON file with all data)
- [x] T182 [US7] Create export handler in backend/internal/api/handlers/export.go (GET /data/export)
- [x] T183 [US7] Add export button to Settings page in frontend/src/pages/Settings.tsx
- [x] T184 [US7] Test export/import round-trip for data integrity
- [x] T185 [US7] Update importer to match export format (make swimmer/meets/standards optional sections)
- [x] T186 [US7] Implement preview endpoint (POST /data/import/preview) showing what will be deleted
- [x] T187 [US7] Implement replace mode - sections in import file completely replace existing data
- [x] T188 [US7] Add confirmation flow with warning dialog showing deletion counts
- [x] T189 [US7] Replace browser alerts with in-app success/error dialogs
- [x] T190 [US7] Create comprehensive import integration tests with preview and replace mode
- [x] T191 [US7] Update spec.md and plan.md with export/import implementation details

**Export/Import Requirements**:
- Export: Single JSON file with swimmer, meets (with times), custom standards (FR-081)
- Import: Optional sections (swimmer/meets/standards) with REPLACE mode (FR-082)
- Preview: Shows counts of what will be deleted before confirmation required
- UI: File upload, preview dialog, confirmation with warnings, success/error dialogs
- Format symmetry: Export and import use identical JSON structure

### Documentation

- [ ] T192 [P] Update README.md with complete feature list and screenshots
- [ ] T193 [P] Create USER-GUIDE.md documenting all features and workflows
- [ ] T194 [P] Verify IMPORT-GUIDE.md is complete and accurate
- [ ] T195 [P] Add API documentation in docs/API.md or update contracts/api.yaml

### Accessibility Verification

- [ ] T196 Run axe-core accessibility tests on all UI pages
- [ ] T197 Verify keyboard navigation works for all interactive elements
- [ ] T198 Ensure semantic HTML structure throughout application
- [ ] T199 Test screen reader compatibility on critical user journeys
- [ ] T200 Verify color contrast meets WCAG AA standards

**Accessibility Target**: Basic accessibility (semantic HTML, keyboard navigation) per FR-084

### Performance Optimization & Validation

- [ ] T201 Measure and verify API p95 latency targets (reads <200ms, writes <500ms)
- [ ] T202 Measure and verify Time to Interactive (TTI) <3s
- [ ] T203 Verify JavaScript bundle size <250KB gzipped
- [ ] T204 Optimize chart rendering for 500+ data points if needed (Phase 7 dependency)
- [ ] T205 Add React Query caching optimization if needed

**Performance Targets**: API p95 <200ms/<500ms, TTI <3s, <250KB bundle, graphs <2s for 500 times

### Testing Coverage

- [ ] T206 [P] Add integration tests for progress chart API (Phase 7 dependency)
- [ ] T207 [P] Add component tests for chart components (Phase 7 dependency)
- [ ] T208 Verify >90% coverage on critical paths (PB calculation, comparison logic, import/export service)
- [ ] T209 Run full test suite and fix any failures

### Security & Reliability

- [ ] T210 Review and harden OIDC authentication flow
- [ ] T211 Verify access level enforcement on all endpoints
- [ ] T212 Add rate limiting to import endpoints if needed
- [ ] T213 Review error handling and logging across application
- [ ] T214 Test session expiry and re-authentication flow

### Final Validation

- [ ] T215 Run quickstart.md validation scenarios
- [ ] T216 Verify all success criteria (SC-001 through SC-011) are met
- [ ] T217 Test application end-to-end with real swimmer data
- [ ] T218 Code cleanup and refactoring across codebase
- [ ] T219 Final linting and type checking pass (both backend and frontend)

**Success Criteria** (from spec.md):
- SC-001: Record time in <30s
- SC-002: Enter 5+ times in <3min
- SC-003: View all PBs on one screen
- SC-004: Create standard in <5min
- SC-005: View comparison within 2 clicks
- SC-006: Graphs load in <2s for 500 times
- SC-007: PB identification 100% accurate
- SC-008: Age-based comparisons correct
- SC-009: Zero data loss on restart
- SC-010: Export/import without corruption
- SC-011: First-time user can add time without docs

### Deployment Preparation

- [ ] T213 [P] Update Docker configurations if needed
- [ ] T214 [P] Update kubernetes manifests if applicable
- [ ] T215 Verify GitHub Actions CI/CD pipeline is working
- [ ] T216 Create deployment guide in docs/DEPLOYMENT.md
- [ ] T217 Tag release version and update CHANGELOG.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational - MVP, must complete first
- **US2 (Phase 4)**: Depends on US1 (needs times to compute PBs)
- **US3 (Phase 5)**: Depends on Foundational only - can parallel with US1/US2
- **US4 (Phase 6)**: Depends on US2 + US3 (needs PBs and standards)
- **US5 (Phase 7)**: Depends on US1 (needs times for charts)
- **US6 (Phase 8)**: Depends on US4 (needs comparison logic)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

```text
Phase 2 (Foundation)
      │
      ├──────────────────────────┬────────────────────┐
      │                          │                    │
      ▼                          ▼                    ▼
Phase 3 (US1: Times)      Phase 5 (US3: Standards)   (parallel)
      │                          │
      ▼                          │
Phase 4 (US2: PBs)               │
      │                          │
      └──────────┬───────────────┘
                 │
                 ▼
          Phase 6 (US4: Compare)
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
Phase 7 (US5: Charts)  Phase 8 (US6: Standing)
      │                     │
      └──────────┬──────────┘
                 │
                 ▼
          Phase 9 (Polish)
```

### Parallel Opportunities

**Within Phase 1 (Setup)**:

- T002, T003, T004, T005, T006 can run in parallel
- T008, T009, T010 can run in parallel

**Within Phase 2 (Foundational)**:

- T014, T015, T016 can run in parallel
- T019, T020, T021 can run in parallel
- T028, T029 can run in parallel
- T033, T034 can run in parallel
- T040, T041, T042 can run in parallel

**Within Each User Story**:

- All test tasks marked [P] can run in parallel
- All type definition tasks marked [P] can run in parallel
- sqlc queries can be written in parallel before generation

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (Auth, DB, Core)
3. Complete Phase 3: US1 - Record Times
4. Complete Phase 4: US2 - Personal Bests
5. **STOP and VALIDATE**: App can record times and show PBs
6. Deploy/demo MVP

### Incremental Delivery

| Increment | Stories | Capability | Status |
|-----------|---------|------------|--------|
| MVP | US1 + US2 + All Times | Record times, view PBs, browse history | ✅ Complete |
| +Standards | US3 | Add/manage time standards, JSON import | ✅ Complete |
| +Comparison | US4 | Compare against standards | ✅ Complete |
| +Charts | US5 | View progress graphs with PB markers, standard references | ✅ Complete |
| +Dashboard | US6 | Qualification standing view | ✅ Complete (via US4) |
| +Export | Phase 8 | JSON backup/restore, accessibility, performance | ⏳ Next |

### Suggested MVP Scope

**Minimum Viable Product**: Phases 1-4b (Setup, Foundation, US1, US2, All Times) — ✅ COMPLETE

- Authentication working (dev mode + OIDC ready)
- Can record swimmer profile
- Can create meets (single-day and multi-day) and enter times
- Can view personal bests organized by stroke
- Can view all times per event with PB badges and ranking
- Can view meet details and delete individual times
- Course filtering works (25m/50m)
- One-event-per-meet validation enforced

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Constitution requires TDD - write tests first, verify they fail
- Constitution requires >90% coverage on critical paths
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US7 (Historical Import) is P4/Future - not included in initial scope
