# Implementation Plan: Relay Split Times

**Branch**: `003-relay-split-times` | **Date**: 2026-03-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-relay-split-times/spec.md`

## Summary

Add 5 relay leadoff split event codes (`50FRS`, `100FRS`, `200FRS`, `50BKS`, `100BKS`) as first-class events in the system. Split times can coexist with regular times at the same meet and compete with base event times for personal bests and standard comparisons. No database schema migration required — split codes are stored as event strings in the existing VARCHAR(50) column. PB merging happens in the backend service layer; the frontend displays split badges and uses the `is_from_split` / `is_split` response fields.

## Technical Context

**Language/Version**: Go 1.24 (backend), TypeScript 5.9 + React 19 (frontend)
**Primary Dependencies**: chi v5, sqlc, pgx v5, React Query v5, Recharts v3, TailwindCSS 4
**Storage**: PostgreSQL 18 — no schema changes required
**Testing**: Go testify + testcontainers (backend), Vitest + RTL + MSW (frontend)
**Target Platform**: Modern browsers, Kubernetes
**Project Type**: Web application (backend + frontend)
**Performance Goals**: p95 <200ms reads, <500ms writes (existing targets, no new concerns)
**Constraints**: <250KB gzipped JS bundle; no N+1 queries
**Scale/Scope**: 5 new event codes, ~15 files modified across backend and frontend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. Code Quality | PASS | No new patterns — extends existing EventCode type with same conventions |
| II. TDD | PASS | Tests written first for new helpers, PB merging, and integration scenarios |
| III. UX Consistency | PASS | Split badges follow existing badge/indicator patterns; accessible labels |
| IV. Performance | PASS | No new queries; progress query changes from `= $3` to `IN ($3, $4)` — same index usage |
| Quality Gates | PASS | All existing gates apply; no bypasses needed |
| Data Portability | PASS | Importer updated to use `domain.IsValidEvent()` (DRY fix); export format unchanged |
| PR Workflow | PASS | Feature branch already created; all changes via PR |

**Post-Phase 1 re-check**: No violations found. No new dependencies, no schema migration, no new abstractions beyond what exists.

## Project Structure

### Documentation (this feature)

```text
specs/003-relay-split-times/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: design decisions and rationale
├── data-model.md        # Phase 1: event code model, PB merge logic, validation rules
├── quickstart.md        # Phase 1: implementation guide
├── contracts/
│   └── api-changes.md   # Phase 1: API contract modifications
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── internal/
│   ├── domain/
│   │   └── types.go                         # Add split event constants + helpers
│   ├── api/handlers/
│   │   └── personalbest.go                  # Add PB merge logic, is_from_split field
│   ├── domain/comparison/
│   │   ├── service.go                       # Merge split PBs, iterate IndividualEventCodes
│   │   └── progress.go                      # Fetch base + split event progress data
│   ├── domain/importer/
│   │   └── service.go                       # Replace hardcoded event map with domain.IsValidEvent()
│   └── store/queries/
│       ├── time.sql                         # Modify GetProgressData for split events
│       └── standardtime.sql                 # Add split events to ordering CASE
├── tests/integration/
│   ├── time_test.go                         # Split creation, duplicate rules
│   └── personalbest_test.go                 # PB merging with splits
└── sqlc.yaml                                # Regenerate after query changes

frontend/
├── src/
│   ├── types/
│   │   ├── time.ts                          # Add split codes to EventCode, EVENTS, helpers
│   │   └── personalbest.ts                  # Add is_from_split to PersonalBest
│   ├── components/
│   │   ├── times/
│   │   │   ├── EventSelector.tsx            # excludeSplits prop to hide split variants
│   │   │   ├── EventFilter.tsx              # excludeSplits prop to hide split variants
│   │   │   └── AllTimesList.tsx             # Base name + "Split" badge for split times
│   │   ├── ui/
│   │   │   └── EventLink.tsx                # Base name + "Split" badge, links to base event
│   │   └── comparison/
│   │       └── PersonalBestGrid.tsx         # Show split indicator on PBs
│   └── pages/
│       ├── AllTimes.tsx                     # Merge split variant times, exclude splits from filter
│       ├── PersonalBests.tsx                # Show "from relay split" indicator
│       └── Progress.tsx                     # Exclude splits from filter, diamond markers on chart
└── tests/
    └── components/                          # Test split display
```

**Structure Decision**: Existing web application structure (backend/ + frontend/). No new directories created — all changes modify existing files within established patterns.

## Complexity Tracking

No constitution violations to justify. All changes follow existing patterns:
- Event codes: extend existing `EventCode` type
- PB merging: new logic in existing service layer
- UI display convention: split times show base event name + "Split" badge (not full split event name); full split event names only in add/edit time selectors
- Event filter/selector dropdowns on All Times and Progress pages exclude split variants — the view automatically includes split data for the selected base event
- Progress chart: split times always use diamond markers (purple default, green for PB); same-date data points are offset on x-axis for independent selection
- No new abstractions, no new dependencies
