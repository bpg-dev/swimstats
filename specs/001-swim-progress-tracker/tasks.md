# Tasks: Swim Progress Tracker

**Input**: Design documents from `/specs/001-swim-progress-tracker/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.yaml, research.md, quickstart.md

**Tests**: Included per Constitution Principle II (Test-Driven Development)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

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
- [ ] T018 Create API router skeleton in backend/internal/api/router.go
- [X] T019 [P] Create error handling middleware in backend/internal/api/middleware/errors.go
- [X] T020 [P] Create logging middleware in backend/internal/api/middleware/logging.go
- [X] T021 [P] Create CORS middleware in backend/internal/api/middleware/cors.go
- [ ] T022 Create health check handler in backend/internal/api/handlers/health.go
- [ ] T023 Create server entrypoint in backend/cmd/server/main.go

### Authentication (US0)

- [ ] T024 Create OIDC configuration in backend/internal/auth/config.go
- [ ] T025 Create OIDC provider client in backend/internal/auth/oidc.go
- [ ] T026 Create auth middleware in backend/internal/api/middleware/auth.go (token validation, access level extraction)
- [ ] T027 Create current user handler in backend/internal/api/handlers/auth.go (GET /auth/me)
- [ ] T028 [P] Create auth types in frontend/src/types/auth.ts (User, AccessLevel)
- [ ] T029 [P] Create auth service in frontend/src/services/auth.ts (OIDC flow, token management)
- [ ] T030 Create auth store in frontend/src/stores/authStore.ts (Zustand)
- [ ] T031 Create ProtectedRoute component in frontend/src/components/layout/ProtectedRoute.tsx
- [ ] T032 Create login callback page in frontend/src/pages/AuthCallback.tsx

### Frontend Core

- [ ] T033 [P] Create base UI components in frontend/src/components/ui/ (Button, Input, Select, Card, Loading, ErrorBanner)
- [ ] T034 [P] Create API client in frontend/src/services/api.ts (axios instance with auth interceptor)
- [ ] T035 Create app shell layout in frontend/src/components/layout/AppShell.tsx (navigation, header)
- [ ] T036 Create course filter store in frontend/src/stores/courseFilterStore.ts (Zustand for 25m/50m filter state)
- [ ] T037 Create CourseFilterToggle component in frontend/src/components/layout/CourseFilterToggle.tsx
- [ ] T038 Configure React Query in frontend/src/main.tsx
- [ ] T039 Configure React Router in frontend/src/App.tsx

### Integration Tests Setup

- [ ] T040 [P] Create test database setup in backend/tests/integration/testdb.go (testcontainers)
- [ ] T041 [P] Create API test client in backend/tests/integration/client.go
- [ ] T042 [P] Create MSW handlers setup in frontend/tests/mocks/handlers.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Record Swim Times (Priority: P1) 🎯 MVP

**Goal**: Record swim times organized by meet with quick entry workflow

**Independent Test**: Create a meet, enter multiple times, verify times appear with meet details

### Tests for User Story 1

- [ ] T043 [P] [US1] Create swimmer API tests in backend/tests/integration/swimmer_test.go
- [ ] T044 [P] [US1] Create meet API tests in backend/tests/integration/meet_test.go
- [ ] T045 [P] [US1] Create time entry API tests in backend/tests/integration/time_test.go
- [ ] T046 [P] [US1] Create meet components tests in frontend/tests/components/meets.test.tsx
- [ ] T047 [P] [US1] Create time entry components tests in frontend/tests/components/times.test.tsx

### Backend Implementation for US1

- [ ] T048 [P] [US1] Create swimmer sqlc queries in backend/internal/store/queries/swimmer.sql
- [ ] T049 [P] [US1] Create meet sqlc queries in backend/internal/store/queries/meet.sql
- [ ] T050 [P] [US1] Create time sqlc queries in backend/internal/store/queries/time.sql
- [ ] T051 Run sqlc generate to create Go code from queries
- [ ] T052 [US1] Create swimmer repository in backend/internal/store/postgres/swimmer.go
- [ ] T053 [US1] Create meet repository in backend/internal/store/postgres/meet.go
- [ ] T054 [US1] Create time repository in backend/internal/store/postgres/time.go
- [ ] T055 [US1] Create swimmer service in backend/internal/domain/swimmer/service.go
- [ ] T056 [US1] Create meet service in backend/internal/domain/meet/service.go
- [ ] T057 [US1] Create time service in backend/internal/domain/time/service.go (includes batch create)
- [ ] T058 [US1] Create swimmer handlers in backend/internal/api/handlers/swimmer.go (GET/PUT /swimmer)
- [ ] T059 [US1] Create meet handlers in backend/internal/api/handlers/meet.go (CRUD /meets)
- [ ] T060 [US1] Create time handlers in backend/internal/api/handlers/time.go (CRUD /times, POST /times/batch)
- [ ] T061 [US1] Register US1 routes in backend/internal/api/router.go

### Frontend Implementation for US1

- [ ] T062 [P] [US1] Create swimmer types in frontend/src/types/swimmer.ts
- [ ] T063 [P] [US1] Create meet types in frontend/src/types/meet.ts
- [ ] T064 [P] [US1] Create time types in frontend/src/types/time.ts
- [ ] T065 [US1] Create swimmer API service in frontend/src/services/swimmer.ts
- [ ] T066 [US1] Create meet API service in frontend/src/services/meets.ts
- [ ] T067 [US1] Create time API service in frontend/src/services/times.ts
- [ ] T068 [US1] Create useSwimmer hook in frontend/src/hooks/useSwimmer.ts (React Query)
- [ ] T069 [US1] Create useMeets hook in frontend/src/hooks/useMeets.ts (React Query)
- [ ] T070 [US1] Create useTimes hook in frontend/src/hooks/useTimes.ts (React Query)
- [ ] T071 [US1] Create SwimmerProfile component in frontend/src/components/swimmer/SwimmerProfile.tsx
- [ ] T072 [US1] Create SwimmerSetupForm component in frontend/src/components/swimmer/SwimmerSetupForm.tsx
- [ ] T073 [US1] Create MeetList component in frontend/src/components/meets/MeetList.tsx
- [ ] T074 [US1] Create MeetForm component in frontend/src/components/meets/MeetForm.tsx
- [ ] T075 [US1] Create MeetSelector component in frontend/src/components/meets/MeetSelector.tsx
- [ ] T076 [US1] Create TimeEntryForm component in frontend/src/components/times/TimeEntryForm.tsx
- [ ] T077 [US1] Create QuickEntryForm component in frontend/src/components/times/QuickEntryForm.tsx (batch entry)
- [ ] T078 [US1] Create TimeHistory component in frontend/src/components/times/TimeHistory.tsx
- [ ] T079 [US1] Create EventSelector component in frontend/src/components/times/EventSelector.tsx
- [ ] T080 [US1] Create time formatting utils in frontend/src/utils/timeFormat.ts
- [ ] T081 [US1] Create Home page in frontend/src/pages/Home.tsx
- [ ] T082 [US1] Create Meets page in frontend/src/pages/Meets.tsx
- [ ] T083 [US1] Create AddTimes page in frontend/src/pages/AddTimes.tsx
- [ ] T084 [US1] Create TimeHistory page in frontend/src/pages/TimeHistory.tsx

**Checkpoint**: User Story 1 complete - can record times organized by meet

---

## Phase 4: User Story 2 - View Personal Bests (Priority: P1)

**Goal**: Display personal best times for each event, organized by stroke

**Independent Test**: Enter multiple times for same event, verify fastest is shown as PB

### Tests for User Story 2

- [ ] T085 [P] [US2] Create personal bests API tests in backend/tests/integration/personalbest_test.go
- [ ] T086 [P] [US2] Create personal bests component tests in frontend/tests/components/personalbests.test.tsx

### Backend Implementation for US2

- [ ] T087 [US2] Create personal bests query in backend/internal/store/queries/personalbest.sql
- [ ] T088 [US2] Run sqlc generate for personal bests
- [ ] T089 [US2] Create personal bests service in backend/internal/domain/comparison/personalbest.go
- [ ] T090 [US2] Create personal bests handler in backend/internal/api/handlers/personalbest.go (GET /personal-bests)
- [ ] T091 [US2] Update time service to detect new PBs in backend/internal/domain/time/service.go

### Frontend Implementation for US2

- [ ] T092 [P] [US2] Create personal best types in frontend/src/types/personalbest.ts
- [ ] T093 [US2] Create personal bests API service in frontend/src/services/personalBests.ts
- [ ] T094 [US2] Create usePersonalBests hook in frontend/src/hooks/usePersonalBests.ts
- [ ] T095 [US2] Create PersonalBestCard component in frontend/src/components/comparison/PersonalBestCard.tsx
- [ ] T096 [US2] Create PersonalBestGrid component in frontend/src/components/comparison/PersonalBestGrid.tsx
- [ ] T097 [US2] Create NewPBBadge component in frontend/src/components/times/NewPBBadge.tsx
- [ ] T098 [US2] Create PersonalBests page in frontend/src/pages/PersonalBests.tsx
- [ ] T099 [US2] Update QuickEntryForm to show new PB indicator in frontend/src/components/times/QuickEntryForm.tsx

**Checkpoint**: User Story 2 complete - can view personal bests by event

---

## Phase 5: User Story 3 - Manage Time Standards (Priority: P2)

**Goal**: Create, edit, delete time standards with pre-loaded Swimming Canada/Swim Ontario standards

**Independent Test**: Create a custom standard, add qualifying times, verify it appears in list

### Tests for User Story 3

- [ ] T100 [P] [US3] Create standards API tests in backend/tests/integration/standard_test.go
- [ ] T101 [P] [US3] Create standards component tests in frontend/tests/components/standards.test.tsx

### Backend Implementation for US3

- [ ] T102 [P] [US3] Create standard sqlc queries in backend/internal/store/queries/standard.sql
- [ ] T103 [P] [US3] Create standard time sqlc queries in backend/internal/store/queries/standardtime.sql
- [ ] T104 Run sqlc generate for standards
- [ ] T105 [US3] Create standard repository in backend/internal/store/postgres/standard.go
- [ ] T106 [US3] Create standard service in backend/internal/domain/standard/service.go
- [ ] T107 [US3] Create standard handlers in backend/internal/api/handlers/standard.go (CRUD /standards, PUT /standards/{id}/times)
- [ ] T108 [US3] Create standards import handler in backend/internal/api/handlers/standard.go (POST /standards/import)
- [ ] T109 [US3] Create Swimming Canada standards seed data in backend/tests/testdata/swimming_canada_standards.json
- [ ] T110 [US3] Create Swim Ontario standards seed data in backend/tests/testdata/swim_ontario_standards.json
- [ ] T111 [US3] Create seed migration in backend/migrations/002_seed_standards.up.sql
- [ ] T112 [US3] Add gender field to time_standards table in backend/migrations/003_add_gender_to_standards.up.sql

### Frontend Implementation for US3

- [ ] T113 [P] [US3] Create standard types in frontend/src/types/standard.ts
- [ ] T114 [US3] Create standards API service in frontend/src/services/standards.ts
- [ ] T115 [US3] Create useStandards hook in frontend/src/hooks/useStandards.ts
- [ ] T116 [US3] Create StandardList component in frontend/src/components/standards/StandardList.tsx
- [ ] T117 [US3] Create StandardForm component in frontend/src/components/standards/StandardForm.tsx
- [ ] T118 [US3] Create StandardTimesEditor component in frontend/src/components/standards/StandardTimesEditor.tsx
- [ ] T119 [US3] Create StandardImportForm component in frontend/src/components/standards/StandardImportForm.tsx
- [ ] T120 [US3] Create Standards page in frontend/src/pages/Standards.tsx
- [ ] T121 [US3] Create StandardDetail page in frontend/src/pages/StandardDetail.tsx

**Checkpoint**: User Story 3 complete - can manage time standards

---

## Phase 6: User Story 4 - Compare Times Against Standards (Priority: P2)

**Goal**: Compare personal bests against selected standard with difference calculations

**Independent Test**: Select a standard, view comparison showing achieved/not-achieved status with differences

### Tests for User Story 4

- [ ] T122 [P] [US4] Create comparison API tests in backend/tests/integration/comparison_test.go
- [ ] T123 [P] [US4] Create comparison component tests in frontend/tests/components/comparison.test.tsx

### Backend Implementation for US4

- [ ] T124 [US4] Create comparison query in backend/internal/store/queries/comparison.sql
- [ ] T125 Run sqlc generate for comparison
- [ ] T126 [US4] Create comparison service in backend/internal/domain/comparison/service.go
- [ ] T127 [US4] Create comparison handler in backend/internal/api/handlers/comparison.go (GET /comparisons)
- [ ] T128 [US4] Add "almost there" threshold logic (3% configurable) in backend/internal/domain/comparison/service.go

### Frontend Implementation for US4

- [ ] T129 [P] [US4] Create comparison types in frontend/src/types/comparison.ts
- [ ] T130 [US4] Create comparison API service in frontend/src/services/comparisons.ts
- [ ] T131 [US4] Create useComparison hook in frontend/src/hooks/useComparison.ts
- [ ] T132 [US4] Create ComparisonTable component in frontend/src/components/comparison/ComparisonTable.tsx
- [ ] T133 [US4] Create ComparisonRow component in frontend/src/components/comparison/ComparisonRow.tsx
- [ ] T134 [US4] Create StandardSelector component in frontend/src/components/comparison/StandardSelector.tsx
- [ ] T135 [US4] Create AchievedBadge component in frontend/src/components/comparison/AchievedBadge.tsx
- [ ] T136 [US4] Create AlmostThereBadge component in frontend/src/components/comparison/AlmostThereBadge.tsx
- [ ] T137 [US4] Create Compare page in frontend/src/pages/Compare.tsx

**Checkpoint**: User Story 4 complete - can compare times against standards

---

## Phase 7: User Story 5 - View Progress Graphs (Priority: P3)

**Goal**: Display line graphs showing time progression with standard reference lines

**Independent Test**: View progress graph for an event, verify times plotted correctly with optional standard line

### Tests for User Story 5

- [ ] T138 [P] [US5] Create progress API tests in backend/tests/integration/progress_test.go
- [ ] T139 [P] [US5] Create chart component tests in frontend/tests/components/charts.test.tsx

### Backend Implementation for US5

- [ ] T140 [US5] Create progress data query in backend/internal/store/queries/progress.sql
- [ ] T141 Run sqlc generate for progress
- [ ] T142 [US5] Create progress service in backend/internal/domain/comparison/progress.go
- [ ] T143 [US5] Create progress handler in backend/internal/api/handlers/progress.go (GET /progress/{event})

### Frontend Implementation for US5

- [ ] T144 [P] [US5] Create progress types in frontend/src/types/progress.ts
- [ ] T145 [US5] Create progress API service in frontend/src/services/progress.ts
- [ ] T146 [US5] Create useProgress hook in frontend/src/hooks/useProgress.ts
- [ ] T147 [US5] Create ProgressChart component in frontend/src/components/charts/ProgressChart.tsx (Recharts)
- [ ] T148 [US5] Create DateRangeFilter component in frontend/src/components/charts/DateRangeFilter.tsx
- [ ] T149 [US5] Create ChartTooltip component in frontend/src/components/charts/ChartTooltip.tsx
- [ ] T150 [US5] Create Progress page in frontend/src/pages/Progress.tsx

**Checkpoint**: User Story 5 complete - can view progress graphs

---

## Phase 8: User Story 6 - View Standing Against Standard (Priority: P3)

**Goal**: Dashboard showing qualification status across all events with configurable "almost there" threshold

**Independent Test**: View standing dashboard, verify qualification summary with achieved/close/not-achieved counts

### Tests for User Story 6

- [ ] T151 [P] [US6] Create standing API tests in backend/tests/integration/standing_test.go
- [ ] T152 [P] [US6] Create standing component tests in frontend/tests/components/standing.test.tsx

### Backend Implementation for US6

- [ ] T153 [US6] Add threshold configuration to user preferences in backend/internal/domain/config/service.go
- [ ] T154 [US6] Create settings handler in backend/internal/api/handlers/settings.go (GET/PUT threshold config)

### Frontend Implementation for US6

- [ ] T155 [P] [US6] Create settings types in frontend/src/types/settings.ts
- [ ] T156 [US6] Create settings API service in frontend/src/services/settings.ts
- [ ] T157 [US6] Create useSettings hook in frontend/src/hooks/useSettings.ts
- [ ] T158 [US6] Create StandingSummary component in frontend/src/components/comparison/StandingSummary.tsx
- [ ] T159 [US6] Create StandingGrid component in frontend/src/components/comparison/StandingGrid.tsx
- [ ] T160 [US6] Create EventStatusCard component in frontend/src/components/comparison/EventStatusCard.tsx
- [ ] T161 [US6] Create ThresholdSettings component in frontend/src/components/settings/ThresholdSettings.tsx
- [ ] T162 [US6] Create Standing page in frontend/src/pages/Standing.tsx
- [ ] T163 [US6] Create Settings page in frontend/src/pages/Settings.tsx

**Checkpoint**: User Story 6 complete - can view qualification standing dashboard

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Data export/import, documentation, and final polish

### Data Export/Import

- [ ] T164 [P] Create data export API tests in backend/tests/integration/export_test.go
- [ ] T165 Create export service in backend/internal/domain/data/export.go
- [ ] T166 Create import service in backend/internal/domain/data/import.go
- [ ] T167 Create data handlers in backend/internal/api/handlers/data.go (GET /data/export, POST /data/import)
- [ ] T168 Create DataExport page in frontend/src/pages/DataExport.tsx
- [ ] T169 Create DataImport component in frontend/src/components/data/DataImport.tsx

### Documentation & Polish

- [ ] T170 [P] Update README.md with project setup instructions
- [ ] T171 [P] Create API documentation from OpenAPI spec
- [ ] T172 Run accessibility audit with axe-core and fix issues
- [ ] T173 Run Lighthouse performance audit and optimize
- [ ] T174 Verify all empty states have helpful guidance
- [ ] T175 Verify all loading states show appropriate indicators
- [ ] T176 Run full E2E test of quickstart.md workflow

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

| Increment | Stories | Capability |
|-----------|---------|------------|
| MVP | US1 + US2 | Record times, view PBs |
| +Standards | US3 | Add/manage time standards |
| +Comparison | US4 | Compare against standards |
| +Charts | US5 | View progress graphs |
| +Dashboard | US6 | Qualification standing view |

### Suggested MVP Scope

**Minimum Viable Product**: Phases 1-4 (Setup, Foundation, US1, US2)
- Authentication working
- Can record swimmer profile
- Can create meets and enter times
- Can view personal bests
- Course filtering works

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Constitution requires TDD - write tests first, verify they fail
- Constitution requires >90% coverage on critical paths
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US7 (Historical Import) is P4/Future - not included in initial scope
