# Implementation Plan: Swim Progress Tracker

**Branch**: `001-swim-progress-tracker` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-swim-progress-tracker/spec.md`

## Summary

Build a web application to track competitive swimming progress for a Canadian swimmer. The system records swim times organized by meets, calculates personal bests, compares against time standards (Swimming Canada, Swim Ontario), and visualizes progress over time. Course-centric organization (25m/50m) with OIDC authentication supporting full and view-only access levels.

**Technical Approach**: Modern SPA frontend with Go backend API, PostgreSQL persistence, containerized for Kubernetes deployment.

## Technical Context

**Language/Version**: Go 1.25+ (backend), TypeScript 5.x (frontend)
**Frontend Framework**: React 18 with Vite, TailwindCSS, React Query
**Backend Framework**: Go standard library + chi router, sqlc for type-safe SQL
**Storage**: PostgreSQL 16
**Authentication**: OIDC via Authentik (coreos/go-oidc library)
**Testing**: Go testing + testify (backend), Vitest + React Testing Library (frontend)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), Kubernetes
**Project Type**: Web application (frontend + backend)
**Build/CI**: GitHub Actions, multi-stage Docker builds
**Registry**: GitHub Container Registry (ghcr.io)
**Performance Goals**: API p95 < 200ms reads, < 500ms writes; TTI < 3s; graphs render < 2s for 500 times
**Constraints**: < 250KB gzipped JS bundle; basic accessibility (semantic HTML, keyboard navigation)
**Scale/Scope**: Single swimmer (expandable), ~500 times, ~50 meets, ~10 standards

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Plan Compliance | Status |
|-----------|-------------|-----------------|--------|
| I. Code Quality | Linting, type safety, DRY, single responsibility | Go: golangci-lint, strict typing; TS: ESLint, strict mode | ✅ Pass |
| II. Test-Driven Development | Test-first, >90% coverage critical paths, unit/integration/contract tests | Go: table-driven tests, testify; React: Vitest, RTL; API contract tests | ✅ Pass |
| III. UX Consistency | Design system, basic a11y (semantic HTML, keyboard nav), responsive, loading states, error handling | TailwindCSS design tokens, accessible components, loading skeletons | ✅ Pass |
| IV. Performance | API p95 <200ms/<500ms, TTI <3s, <250KB bundle, no N+1 queries | sqlc prevents N+1, Vite code splitting, React Query caching | ✅ Pass |

**Quality Gates Compliance:**

- Lint: golangci-lint (Go), ESLint (TS) - CI blocking
- Type Check: Go compiler, TypeScript strict - CI blocking
- Unit Tests: go test, Vitest - CI blocking
- Integration Tests: testcontainers (Go), MSW (frontend) - CI blocking
- Accessibility: axe-core in CI - CI blocking for UI changes
- Code Review: GitHub branch protection - required

## Project Structure

### Documentation (this feature)

```text
specs/001-swim-progress-tracker/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI spec)
│   └── api.yaml
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── cmd/
│   └── server/
│       └── main.go           # Application entrypoint
├── internal/
│   ├── api/
│   │   ├── handlers/         # HTTP handlers by domain
│   │   ├── middleware/       # Auth, logging, CORS
│   │   └── router.go         # Route definitions
│   ├── auth/
│   │   └── oidc.go           # OIDC authentication
│   ├── domain/
│   │   ├── swimmer/          # Swimmer entity & service
│   │   ├── meet/             # Meet entity & service
│   │   ├── time/             # Time entry entity & service
│   │   ├── standard/         # Time standards entity & service
│   │   ├── comparison/       # Comparison & PB logic
│   │   └── importer/         # Bulk data import service
│   └── store/
│       ├── postgres/         # PostgreSQL implementations
│       └── queries/          # sqlc SQL files
├── migrations/               # Database migrations
├── tests/
│   ├── integration/          # API integration tests
│   └── testdata/             # Test fixtures (standards JSON)
├── Dockerfile
└── go.mod

frontend/
├── src/
│   ├── components/
│   │   ├── ui/               # Base UI components (buttons, inputs, etc.)
│   │   ├── layout/           # App shell, navigation
│   │   ├── meets/            # Meet-related components
│   │   ├── times/            # Time entry components
│   │   ├── standards/        # Standards management
│   │   ├── comparison/       # Comparison views
│   │   └── charts/           # Progress visualization
│   ├── pages/                # Route-level components
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API client
│   ├── stores/               # State management (Zustand)
│   ├── types/                # TypeScript types
│   └── utils/                # Helpers (time formatting, etc.)
├── tests/
│   ├── components/           # Component tests
│   └── integration/          # E2E-style tests with MSW
├── Dockerfile
├── vite.config.ts
└── package.json

.github/
└── workflows/
    ├── ci.yaml               # Lint, test, build
    └── release.yaml          # Build & push containers

scripts/
├── reset-database.sh         # Clean database and restart
├── import-all.sh             # Import all standards and swimmer data
├── import-standards.sh       # Import time standards from JSON
├── test-import.sh            # Import specific swimmer data file
├── convert-swimrankings.py   # Convert SwimRankings data to import format
└── convert-*.py              # Other conversion scripts

data/
├── swimmer-import-template.json  # Template for swimmer data import
├── swim-ontario-2025-2026-*.json # Swim Ontario time standards
├── swimming-canada-2026-2028-*.json # Swimming Canada time standards
└── IMPORT-README.md          # Import format documentation

docker-compose.yaml           # Local development
IMPORT-GUIDE.md               # User guide for data import
```

**Structure Decision**: Web application pattern (frontend + backend) selected due to:

- Separate deployment scaling for API vs static assets
- Go backend provides type safety and performance for API
- React SPA provides responsive, interactive UI for data entry and visualization
- Clear separation of concerns between data/logic (backend) and presentation (frontend)

## Implementation Progress

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Setup | ✅ Complete | Project scaffolding, Docker, CI |
| Phase 2: Foundational | ✅ Complete | DB, Auth, Core UI, Test setup |
| Phase 3: US1 - Record Times | ✅ Complete | Full CRUD for swimmers, meets, times |
| Phase 4: US2 - Personal Bests | ✅ Complete | PB calculation, display, API |
| Phase 4b: All Times View | ✅ Complete | Event-based time history with PB badges |
| Phase 5: US3 - Standards | ✅ Complete | Time standards CRUD, JSON import, bulk import |
| Phase 6: US4 + US6 - Compare | ✅ Complete | Comparison with adjacent age groups, achievements on PBs, standing dashboard |
| Phase 7: US5 - Progress Charts | ✅ Complete | Recharts line charts with PB markers, date filtering, standard reference lines |
| Phase 7b: Navigation UI Polish | ✅ Complete | Enhanced visual hierarchy, logical grouping, improved styling |
| Phase 8: Polish | 🔄 In Progress | Data export/import ✅ complete (12/12 tasks). Remaining: documentation, accessibility, performance, testing, security validation |

**Current State**: Phases 1-7b complete (all user stories + UI polish). Phase 8: Data export/import complete. App can:

- Create and manage swimmer profile
- Create and manage meets (with inline quick-add from time entry)
- Record swim times with batch entry (Quick Entry form with proper column alignment)
- Filter by course type (25m/50m) with color-coded toggle
- View personal bests by stroke with achieved standards badges
- View all times per event with PB indicators and sorting (by date or time)
- View meet details page with all times from that meet
- Delete individual times from the meet details page
- Enforce one-event-per-meet rule (prevents duplicate events at the same meet)
- Create and manage time standards (CRUD operations)
- Import time standards from JSON (single or bulk import)
- Compare personal bests against selected standard with adjacent age groups
- View standing dashboard showing achieved/almost/not-yet qualification counts
- Navigate from PB achieved standards directly to comparison view
- **Export all data** (swimmer, meets/times, custom standards) as JSON backup
- **Import data with preview** - see what will be deleted before confirmation
- **Replace mode import** - optional sections (swimmer/meets/standards) replace existing data
- Import swimmer data and time standards from JSON files (legacy CLI scripts)
- Bulk import time standards from multiple JSON files (legacy CLI scripts)
- Reset database to fresh state for new data imports (legacy CLI scripts)
- View progress charts showing time improvement over time with PB markers
- Filter progress charts by date range
- Compare progress against time standards with reference lines on charts

**Known Issues Resolved**:

- Base64 encoded `X-Mock-User` header to fix proxy errors
- Added Settings button to navigation
- Added swimmer profile editing to Settings page
- Fixed "Recent Meets0" / "Time History0" display bug (React rendering numeric 0)
- Fixed auth persistence (persist user object in localStorage, handle inconsistent state on rehydration)
- Fixed request ID generation (invalid characters in logging middleware)
- Fixed Quick Entry form alignment (column headers instead of per-row labels)

**UX Enhancements**:

- Quick Add Meet: Create meets inline from time entry form (FR-037)
- Navigation reordering: Personal Bests first, Home removed (logo serves as home), grouped into main + analytics sections
- Consolidated "All Times" and "Time History" into single compact table view
- Removed "All Events" option from All Times (must select specific event for meaningful ranking)
- All Times shows rank badges (gold/silver/bronze) when sorting by fastest

**Phase 8 Progress** (as of 2026-01-20):

✅ **Data Export & Import Complete** (T180-T191, 12 tasks):
- Export all data to JSON with timestamped filename
- Import with preview endpoint showing deletion counts
- Replace mode: optional sections completely replace existing data
- Confirmation dialog with detailed warnings
- In-app success/error dialogs (no browser alerts)
- Comprehensive integration tests
- Documentation updated

⏳ **Remaining Phase 8 Work** (~33 tasks):
- Documentation: README, USER-GUIDE, API docs (4 tasks)
- Accessibility: axe-core, keyboard nav, semantic HTML, WCAG AA (5 tasks)
- Performance: API latency, TTI, bundle size validation (5 tasks)
- Testing: Chart tests, coverage verification (4 tasks)
- Security: Auth review, access enforcement, session handling (5 tasks)
- Final Validation: Success criteria, E2E testing, cleanup (5 tasks)
- Deployment: Docker/K8s config updates (5 tasks)
- Meet Details page: View all times from a meet with "Add Times" and "View Meet" navigation
- Save feedback: Success state after saving times with count and navigation options
- Delete times: Remove individual time entries from meet details page with confirmation
- Course filter toggle: Color-coded (25m = blue, 50m = green) to match standards page
- Comparison table: Shows adjacent age groups (prev/next) when available with achievement indicators
- Comparison table: Displays percentage in Difference column for easier interpretation
- Comparison table: Hides age group labels for OPEN standards (standards without age-specific times)
- Comparison table: Shows date of PB achievement in "Your Time" column
- Comparison table: Improved vertical and horizontal alignment with centered numerical columns
- Comparison table: Fixed column widths for consistent layout (tabular-nums for monospaced numbers)
- Personal Bests: Shows achieved standards as clickable badges linking to comparison page
- Standing dashboard: High-level summary showing achieved/almost/not-yet counts (US6 covered by US4 implementation)
- Progress charts: Recharts line charts with PB markers, date range filtering, standard reference lines
- Navigation menu: Logical grouping (main nav + analytics), enhanced visual hierarchy with borders and shadows
- Navigation menu: Removed redundant Home link (SwimStats logo serves as home)
- Navigation menu: Improved course filter with bold selected state (solid colors with shadow)
- Navigation menu: User menu grouping with subtle background container for Settings and Logout icons

**Navigation Order**: Personal Bests → Add Times → All Times → Meets | Progress → Compare → Standards

## Complexity Tracking

No Constitution violations requiring justification. The architecture follows standard web application patterns with appropriate technology choices for each layer.
