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
**Constraints**: < 250KB gzipped JS bundle; WCAG 2.1 AA accessibility
**Scale/Scope**: Single swimmer (expandable), ~500 times, ~50 meets, ~10 standards

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Plan Compliance | Status |
|-----------|-------------|-----------------|--------|
| I. Code Quality | Linting, type safety, DRY, single responsibility | Go: golangci-lint, strict typing; TS: ESLint, strict mode | ✅ Pass |
| II. Test-Driven Development | Test-first, >90% coverage critical paths, unit/integration/contract tests | Go: table-driven tests, testify; React: Vitest, RTL; API contract tests | ✅ Pass |
| III. UX Consistency | Design system, WCAG 2.1 AA, responsive, loading states, error handling | TailwindCSS design tokens, accessible components, loading skeletons | ✅ Pass |
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
│   │   └── comparison/       # Comparison & PB logic
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

docker-compose.yaml           # Local development
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
| Phase 4: US2 - Personal Bests | ⏳ Pending | Next up |
| Phase 5: US3 - Standards | ⏳ Pending | |
| Phase 6: US4 - Compare | ⏳ Pending | |
| Phase 7: US5 - Progress Charts | ⏳ Pending | |
| Phase 8: US6 - Standing | ⏳ Pending | |
| Phase 9: Polish | ⏳ Pending | |

**Current State**: MVP core (US1) is complete and tested. App can:
- Create and manage swimmer profile
- Create and manage meets (with inline quick-add from time entry)
- Record swim times with batch entry
- View time history with filtering
- Filter by course type (25m/50m)

**Known Issues Resolved**:
- Base64 encoded `X-Mock-User` header to fix proxy errors
- Added Settings button to navigation
- Added swimmer profile editing to Settings page
- Fixed "Recent Meets0" / "Time History0" display bug (React rendering numeric 0)

**UX Enhancements**:
- Quick Add Meet: Create meets inline from time entry form (FR-037)

## Complexity Tracking

No Constitution violations requiring justification. The architecture follows standard web application patterns with appropriate technology choices for each layer.
