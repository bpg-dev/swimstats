# Quickstart: Relay Split Times Implementation

## What This Feature Does

Adds 5 new "split" event codes (`50FRS`, `100FRS`, `200FRS`, `50BKS`, `100BKS`) representing relay leadoff split times. These events:
- Can be recorded alongside regular events at the same meet
- Count toward personal bests for the corresponding base event
- Are compared against time standards for the base event
- Appear on progress graphs with visual distinction

## Key Design Decisions

1. **Split events are separate event codes** (suffix `S`), not a boolean flag on times
2. **No database migration** — VARCHAR(50) event column handles new codes
3. **PB merging happens in backend service layer** — SQL returns raw PBs, Go merges splits into base events
4. **Comparison iterates base events only** — splits don't get their own comparison rows

## Implementation Order

### Phase 1: Backend Core (no UI changes yet)
1. Add split event constants and helpers to `backend/internal/domain/types.go`
2. Update SQL queries (progress to accept split events, standard ordering)
3. Regenerate sqlc
4. Update PB handler to merge split PBs
5. Update comparison service to use merged PBs
6. Update progress service to include split times
7. Fix importer hardcoded event validation

### Phase 2: Frontend Core
1. Extend `EventCode` type and `EVENTS` array in `frontend/src/types/time.ts`
2. Update `EventSelector` to show split events
3. Update `AllTimes` page to show split badges
4. Update `PersonalBests` page to show "from split" indicator
5. Update `Progress` chart: diamond markers for splits (purple default, green for PB), same-date offset for independent selection

### Phase 3: Integration & Polish
1. Update comparison components for split indication
2. Test export/import with split events
3. Integration tests for all modified endpoints

## Files to Modify

### Backend (Go)
| File | Change |
|------|--------|
| `internal/domain/types.go` | Add split constants, helpers, update Description/Stroke/EventsByStroke |
| `internal/store/queries/time.sql` | Modify GetProgressData to accept base+split events |
| `internal/store/queries/standardtime.sql` | Add split events to ordering CASE |
| `internal/api/handlers/personalbest.go` | Add PB merge logic, add `is_from_split` to response |
| `internal/domain/comparison/service.go` | Merge split PBs, iterate IndividualEventCodes |
| `internal/domain/comparison/progress.go` | Fetch both base and split event progress data |
| `internal/domain/importer/service.go` | Replace hardcoded event map with `domain.IsValidEvent()` |

### Frontend (TypeScript/React)
| File | Change |
|------|--------|
| `src/types/time.ts` | Add split codes to EventCode, EVENTS, EVENTS_BY_STROKE |
| `src/types/personalbest.ts` | Add `is_from_split` field to PersonalBest |
| `src/components/times/EventSelector.tsx` | Show split events grouped with base events |
| `src/pages/AllTimes.tsx` | Display "Split" badge on split times |
| `src/pages/PersonalBests.tsx` | Show "from relay split" indicator |
| `src/pages/Progress.tsx` | Exclude splits from event selector |
| `src/components/charts/ProgressChart.tsx` | Diamond markers for splits, same-date point offset |
| `src/components/comparison/PersonalBestGrid.tsx` | Show split indicator |

### Tests
| File | Change |
|------|--------|
| `backend/internal/domain/types_test.go` | Test new helpers: IsSplit, BaseEvent, SplitVariant |
| `backend/tests/integration/time_test.go` | Test split creation, duplicate rules |
| `backend/tests/integration/personalbest_test.go` | Test PB merging with splits |
| `frontend/tests/components/` | Test split display, event selector with splits |

## Verification Commands

```bash
# Backend
cd backend && make lint && make test

# Frontend
cd frontend && make check && make test
```
