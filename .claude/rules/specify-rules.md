# swimstats Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-06

## Active Technologies
- Go 1.24 (backend), TypeScript 5.9 + React 19 (frontend) + chi v5, sqlc, pgx v5, React Query v5, Recharts v3, TailwindCSS 4 (003-relay-split-times)
- PostgreSQL 18 — no schema changes required (003-relay-split-times)

- **Backend**: Go 1.26, chi router, sqlc for type-safe SQL
- **Frontend**: React 19, TypeScript 5.x, Vite 7, TailwindCSS, React Query
- **Database**: PostgreSQL 18
- **Authentication**: OIDC via Authentik (coreos/go-oidc library)
- **Testing**: Go testing + testify (backend), Vitest + React Testing Library (frontend)
- **Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), Kubernetes

## Project Structure

```text
backend/
├── cmd/server/              # Application entrypoint
├── internal/
│   ├── api/                 # HTTP handlers, middleware, router
│   ├── auth/                # OIDC authentication
│   ├── domain/              # Business logic by entity (swimmer, meet, time, standard, comparison)
│   └── store/               # PostgreSQL implementations, sqlc queries
├── migrations/              # Database migrations
├── tests/integration/       # API integration tests
└── Dockerfile

frontend/
├── src/
│   ├── components/          # React components (ui/, layout/, meets/, times/, standards/, comparison/, charts/)
│   ├── pages/               # Route-level components
│   ├── hooks/               # Custom React hooks (React Query)
│   ├── services/            # API client
│   ├── stores/              # State management (Zustand)
│   ├── types/               # TypeScript types
│   └── utils/               # Helpers (time formatting, etc.)
├── tests/                   # Component tests, integration tests with MSW
└── Dockerfile

.github/workflows/           # CI/CD (lint, test, build)
docker-compose.yaml          # Local development environment
```

## Commands

**Backend**:
- `cd backend && make lint` - Run golangci-lint
- `cd backend && make test` - Run all tests (starts test DB, runs migrations, tests, tears down)
- `cd backend && make test-unit` - Run unit tests only (no database)
- `cd backend && make sqlc` - Generate type-safe SQL code
- `cd backend && make serve` - Start backend with hot reload (air)

**Frontend**:
- `cd frontend && make check` - Run all checks (lint, format, typecheck)
- `cd frontend && make test` - Run tests with coverage
- `cd frontend && make dev` - Start development server
- `cd frontend && make build` - Build Docker image

**Root Makefile**:
- `make lint` - Lint both backend and frontend
- `make test` - Test both backend and frontend
- `make serve` - Start full dev environment (postgres + backend + frontend)

**Development**:
- `docker-compose up` - Start PostgreSQL locally
- `make dev-up` / `make dev-down` - Start/stop postgres

**Migrations**:
- `docker-compose --profile migrate up migrate` - Run migrations via Docker
- `cd backend && go run ./cmd/server migrate` - Run migrations directly (embedded in binary)

## Code Quality Standards

### I. Code Quality
- **Go**: golangci-lint, strict typing, no `interface{}` without justification
- **TypeScript**: ESLint, strict mode, no `any` without justification
- Follow DRY principles and single responsibility

### II. Test-Driven Development
- **New features/user stories**: TDD required — tests written FIRST, must fail, THEN implement
- **Bug fixes and refactors**: Tests recommended but may be written alongside or after the change
- **Documentation and config changes**: Tests not required
- >90% coverage on critical paths
- Unit tests: Go table-driven tests with testify, React with Vitest + RTL
- Integration tests: testcontainers (Go), MSW (frontend)
- API contract tests required

### III. UX Consistency
- TailwindCSS design tokens for consistent styling
- Accessible components (semantic HTML, keyboard navigation)
- Loading states (skeletons), error handling, empty states with guidance

### IV. Performance
- API p95 <200ms reads, <500ms writes
- Time to Interactive (TTI) <3s
- <250KB gzipped JS bundle
- No N+1 queries (sqlc prevents this)
- Vite code splitting, React Query caching

## Current Implementation Status

**✅ All Phases Complete** (Full Feature Set):
- Phase 1: Setup (project scaffolding, Docker, CI)
- Phase 2: Foundational (DB, Auth, Core UI, Test setup)
- Phase 3: US1 - Record Swim Times (meets, times, course filtering)
- Phase 4: US2 - Personal Bests (PB calculation, display)
- Phase 4b: All Times View (event-based history with PB badges, ranking)
- Phase 5: US3 - Manage Time Standards (CRUD, JSON import, data files)
- Phase 6: US4 + US6 - Compare Times Against Standards (includes standing dashboard)
- Phase 7: US5 - View Progress Graphs (line charts with recharts, standard reference lines, date filtering)
- Phase 8: Polish (data export/import with preview, accessibility with ARIA labels, USER-GUIDE.md)

## API Routes (all under /api/v1, authenticated)

- `GET /health`, `GET /api/health` — health check (no auth)
- **Auth**: `GET auth/me`
- **Swimmer**: `GET|PUT swimmer`
- **Meets**: `GET|POST meets`, `GET|PUT|DELETE meets/{id}`
- **Times**: `GET|POST times`, `POST times/batch`, `GET|PUT|DELETE times/{id}`
- **Personal Bests**: `GET personal-bests`
- **Standards**: `GET|POST standards`, `POST standards/import`, `POST standards/import/json`, `GET|PUT|DELETE standards/{id}`, `PUT standards/{id}/times`
- **Comparisons**: `GET comparisons`
- **Progress**: `GET progress/{event}`
- **Data**: `GET data/export`, `POST data/import/preview`, `POST data/import`

Router defined in `backend/internal/api/router.go`.

## Key Patterns

### Course-Centric Organization
- 25m (short course) and 50m (long course) are NEVER mixed
- Times inherit course type from their meet
- Course filter applies globally across all views
- Personal bests are tracked separately per course

### One Event Per Meet Rule
- A swimmer can only have ONE time for each event at a given meet
- Enforced at backend (validation) and frontend (UI prevention)
- Prevents duplicate entries for same event at same meet

### Multi-Day Meet Support
- Meets have `start_date` and `end_date` (can be same for single-day)
- Times have `event_date` (must be within meet date range)
- UI shows date range and allows event date selection

### Authentication & Access Levels
- OIDC authentication (Authentik provider)
- Two access levels: full (CRUD all data) and view-only (read only)
- Access level from OIDC claims/groups
- Dev mode: mock user header for local development
- View-only users: all add/edit/delete buttons are disabled in UI
- View-only badge shown in header for view-only users

### API Patterns
- RESTful endpoints with standard HTTP methods
- JSON request/response bodies
- Error responses with error codes (e.g., DUPLICATE_EVENT)
- React Query for client-side caching and mutations

## Recent Changes
- 003-relay-split-times: Added Go 1.24 (backend), TypeScript 5.9 + React 19 (frontend) + chi v5, sqlc, pgx v5, React Query v5, Recharts v3, TailwindCSS 4

- 2026-01-26: Export format now includes `format_version` field and swimmer's `threshold_percent`
- 2026-01-26: Added schema evolution checklist to Constitution (see Data Portability Requirements)

## Quality Gates (CI Blocking)

- ✅ Lint: golangci-lint (Go), ESLint (TS)
- ✅ Type Check: Go compiler, TypeScript strict
- ✅ Unit Tests: go test, Vitest
- ✅ Integration Tests: testcontainers (Go), MSW (frontend)
- ✅ Accessibility: axe-core (UI changes)
- ✅ Code Review: GitHub branch protection required

## Data Model Summary

**Core Entities**:
- **User**: OIDC-authenticated with access level (full/view-only)
- **Swimmer**: Name, birth date, gender, threshold_percent (configurable "almost there" threshold)
- **Meet**: Name, city, country, start_date, end_date, course_type (25m/50m)
- **Time Entry**: Event, time value, event_date, notes; linked to swimmer and meet
- **Event**: Stroke + distance (e.g., 50m Freestyle, 200m IM)
- **Time Standard**: Named collection with gender designation (female/male)
- **Standard Time**: Qualifying time within standard (event, time, age group)
- **Personal Best**: Derived - fastest time per event/course

**Pre-loaded Standards**:
- Swimming Canada 2026-2028 (Trials Senior, Trials Junior, Usport, Canadian Open)
- Swim Ontario 2025-2026 (OSC, OAG)

**Schema Evolution**: When modifying the database schema, you MUST also update the
export/import functionality. See Constitution §Data Portability Requirements for the
complete checklist.

<!-- MANUAL ADDITIONS START -->

## Mandatory Pre-Flight Checks

**BEFORE making any code changes**, you MUST:

1. **Read the Project Constitution** at `.specify/memory/constitution.md`
   - This document is the authoritative source for all development standards
   - All other documentation is subordinate to the Constitution

2. **Follow the PR Workflow** (Constitution §Development Workflow):
   - **All changes MUST be submitted via Pull Requests** - no direct commits to any branch
   - Create feature branches: `feature/*` for features, `fix/*` for bug fixes
   - Never commit directly to `main`

3. **AI Assistant Git Rules** (Constitution §AI Assistant Guidelines):
   - **NEVER commit to main** - All work must be on feature (`feature/*`) or fix (`fix/*`) branches.
   - **ALWAYS create a branch first** - Before making any commits, create an appropriately named branch.
   - **ALWAYS verify quality gates before PR** - Run linter, format check, type check, and tests locally BEFORE creating a PR:
     - Frontend: `cd frontend && make check && make test`
     - Backend: `cd backend && make lint && make test`
   - **Push and create PRs when done** - You MAY push branches and create PRs to streamline workflow.
   - **NEVER merge PRs** - Merging is the sole responsibility of human maintainers.

4. **Verify Constitution Compliance** before completing any task

Failure to follow these requirements may result in rejected changes or rework.

## Commit Message Requirements (CRITICAL)

Commit messages drive the automated release process. **Conventional Commits format is mandatory.**

**Format**: `type(scope): description`

| Type | Version Bump | Changelog Section |
|------|--------------|-------------------|
| `feat` | Minor (0.x.0) | Features |
| `fix` | Patch (0.0.x) | Bug Fixes |
| `perf` | Patch | Performance |
| `chore` | None | Miscellaneous |
| `style`, `refactor`, `test` | None | Excluded |

**Note**: Use `chore(docs):` for documentation changes (not `docs:`) so they appear in Miscellaneous.

**Breaking Changes**: Add `!` after type (e.g., `feat!:`) for major version bump.

**Examples**:
```
feat(api): add bulk import endpoint
fix(ui): correct timezone in date picker
chore(deps): update dependencies
chore(docs): update README badges
```

## Release Process

Releases are automated via release-please:
1. Merge PRs to `main` with conventional commits
2. Release-please creates a "Release PR" with changelog
3. Merging the Release PR creates a GitHub release + version tag
4. Docker images are automatically built with version tags

<!-- MANUAL ADDITIONS END -->
