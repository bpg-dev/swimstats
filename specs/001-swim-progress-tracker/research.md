# Research: Swim Progress Tracker

**Phase**: 0 - Research & Technology Decisions
**Date**: 2026-01-17

## Technology Decisions

### Frontend Framework

**Decision**: React 18 with Vite

**Rationale**:

- Widely adopted with extensive ecosystem and community support
- Vite provides fast development experience and optimized production builds
- React Query handles server state management elegantly
- Strong TypeScript support for type safety
- Abundant charting libraries (Recharts, Chart.js) for progress visualization

**Alternatives Considered**:

- Vue 3: Excellent option, slightly smaller ecosystem for charting
- Svelte: Smaller bundle but less mature ecosystem for enterprise patterns
- Next.js: SSR not needed for this authenticated SPA; adds complexity

### CSS Framework

**Decision**: TailwindCSS

**Rationale**:

- Utility-first approach enables rapid UI development
- Built-in design tokens ensure consistency (Constitution Principle III)
- Small production bundle with purging
- Excellent accessibility primitives via Headless UI
- Works seamlessly with React component patterns

**Alternatives Considered**:

- Chakra UI: Good accessibility but larger bundle
- Material UI: Heavier, opinionated design may conflict with custom branding
- CSS Modules: More flexibility but requires more design system work

### State Management

**Decision**: React Query + Zustand

**Rationale**:

- React Query: Server state caching, automatic refetching, optimistic updates
- Zustand: Minimal client state (course filter, UI preferences) - simple API
- Separation of server vs client state prevents complexity

**Alternatives Considered**:

- Redux Toolkit: Overkill for this scale; more boilerplate
- Jotai: Good alternative to Zustand, similar simplicity

### Backend Framework

**Decision**: Go standard library + chi router

**Rationale**:

- Go provides excellent performance and type safety
- chi is lightweight, idiomatic, and middleware-friendly
- Standard library HTTP handling is production-ready
- Easy containerization with small image sizes
- Strong OIDC library support (coreos/go-oidc)

**Alternatives Considered**:

- Gin: Popular but chi is more idiomatic
- Echo: Similar to chi, personal preference
- Fiber: Express-like but less idiomatic Go

### Database Access

**Decision**: sqlc for type-safe SQL

**Rationale**:

- Generates type-safe Go code from SQL queries
- No ORM magic; explicit SQL control
- Prevents N+1 queries by design (Constitution Principle IV)
- Compile-time query validation
- Excellent PostgreSQL support

**Alternatives Considered**:

- GORM: ORM abstraction can hide performance issues
- pgx directly: Works but loses type generation benefits
- ent: Good but heavier for this use case

### Authentication

**Decision**: OIDC with coreos/go-oidc

**Rationale**:

- Industry-standard protocol for authentication
- Authentik compatibility confirmed
- Well-maintained Go library
- Handles token validation, refresh, claims extraction
- Session management via secure HTTP-only cookies

**Alternatives Considered**:

- Custom JWT handling: More work, same result
- Auth0 SDK: Vendor-specific, OIDC is more portable

### Charting Library

**Decision**: Recharts

**Rationale**:

- React-native, declarative API
- Good performance for moderate data sizes (500 points)
- Responsive and accessible
- Line charts with reference lines (for standards)
- Customizable tooltips for meet details

**Alternatives Considered**:

- Chart.js + react-chartjs-2: Good but less React-idiomatic
- Victory: More complex API
- D3 directly: Overkill for standard chart types

### Database Migrations

**Decision**: golang-migrate

**Rationale**:

- SQL-based migrations (no Go code dependencies)
- CLI and library modes
- PostgreSQL native support
- Versioned, reversible migrations

**Alternatives Considered**:

- goose: Similar capability, personal preference
- Atlas: More features but heavier

### Container Build

**Decision**: Multi-stage Docker builds

**Rationale**:

- Minimal production images (distroless/static for Go)
- Build reproducibility
- Separate builder and runtime stages
- Frontend served via nginx or Go embed

**Alternatives Considered**:

- Buildpacks: Good but Docker is more familiar
- ko (for Go): Excellent for Go but frontend needs standard Docker

## Domain Research

### Swimming Time Format

**Standard Format**: `MM:SS.ss` (minutes:seconds.hundredths)

- Times under 1 minute: `SS.ss` (e.g., `28.45`)
- Times 1+ minutes: `M:SS.ss` (e.g., `1:05.32`)
- Times 10+ minutes: `MM:SS.ss` (e.g., `16:42.18`)

**Storage**: Store as integer milliseconds for accurate calculations; format on display

### Swimming Canada Age Groups

| Age Group | Ages | Notes |
|-----------|------|-------|
| 10 & Under | ≤10 | Age as of Dec 31 of competition year |
| 11-12 | 11-12 | Age as of Dec 31 of competition year |
| 13-14 | 13-14 | Age as of Dec 31 of competition year |
| 15-17 | 15-17 | Age as of Dec 31 of competition year |
| Senior/Open | 18+ | No upper limit |

**Age Calculation**: Use swimmer's age as of December 31 of the competition year, not age at time of swim.

### Standard Competitive Events

**Short Course (25m) and Long Course (50m)**:

- Freestyle: 50, 100, 200, 400, 800, 1500
- Backstroke: 50, 100, 200
- Breaststroke: 50, 100, 200
- Butterfly: 50, 100, 200
- Individual Medley: 200, 400

**Total**: 17 events per course type

### Time Standards Data Source

Swimming Canada publishes time standards annually:

- Format: PDF and sometimes Excel
- Will pre-load as JSON seed data
- User can import updated standards via structured data (CSV/JSON)

## Security Considerations

### OIDC Implementation

- Use PKCE flow for SPA security
- Store tokens in HTTP-only secure cookies (not localStorage)
- Validate tokens on every API request
- Map `groups` or custom claims to access levels
- Implement CSRF protection for state-changing requests

### Access Control

- Full access: CRUD all resources
- View-only: Read operations only; mutation endpoints return 403
- Check access level in middleware before handlers

### Data Protection

- All API traffic over HTTPS (TLS termination at ingress)
- Database credentials via Kubernetes secrets
- No PII beyond swimmer name/birthdate
- Export includes all user data (GDPR consideration)

## Performance Strategy

### Frontend

- Code splitting by route (React.lazy)
- React Query caching with stale-while-revalidate
- Optimistic updates for time entry
- Virtualized lists if time history grows large
- Image optimization not needed (no user uploads)

### Backend

- Connection pooling for PostgreSQL
- Prepared statements via sqlc
- Indexed queries for filtering (course_type, meet_id, event)
- Pagination for large result sets
- Response compression (gzip)

### Database Indexes

```sql
-- Essential indexes
CREATE INDEX idx_times_meet_id ON times(meet_id);
CREATE INDEX idx_times_event ON times(event);
CREATE INDEX idx_meets_course_type ON meets(course_type);
CREATE INDEX idx_meets_date ON meets(date);
CREATE INDEX idx_standard_times_standard_id ON standard_times(standard_id);
CREATE INDEX idx_standard_times_event_age ON standard_times(event, age_group_id);
```

## Open Items Resolved

| Item | Resolution |
|------|------------|
| Frontend framework | React 18 + Vite |
| State management | React Query + Zustand |
| CSS approach | TailwindCSS |
| Backend router | chi |
| Database access | sqlc |
| Charting | Recharts |
| Auth library | coreos/go-oidc |
| Migration tool | golang-migrate |

All NEEDS CLARIFICATION items from Technical Context have been resolved.
