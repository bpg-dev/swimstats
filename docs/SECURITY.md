# Security Guide

This document describes the security measures implemented in SwimStats and recommendations for production deployment.

## Authentication

### OIDC Integration

SwimStats uses OpenID Connect (OIDC) for authentication:

- **Provider**: Authentik, Keycloak, or any OIDC-compliant provider
- **Library**: `coreos/go-oidc` for token verification
- **Token Flow**:
  1. Frontend redirects to OIDC provider
  2. User authenticates
  3. Provider issues ID token
  4. Frontend includes token in API requests
  5. Backend verifies token signature with provider's JWKS

### Development Mode

In development mode (`ENV=development`):
- Mock authentication via `X-Mock-User` header
- No external OIDC provider required
- Full or view-only access via header value

**Warning**: Never run development mode in production!

### Token Handling

```go
// Token verification (auth.go)
func (p *Provider) VerifyToken(ctx context.Context, rawToken string) (*User, error) {
    idToken, err := p.verifier.Verify(ctx, rawToken)
    if err != nil {
        return nil, fmt.Errorf("invalid token: %w", err)
    }
    // Extract claims and create user
    ...
}
```

## Authorization

### Access Levels

Two access levels are supported:

| Level | Read | Write | Delete |
|-------|------|-------|--------|
| Full | ✓ | ✓ | ✓ |
| View-only | ✓ | ✗ | ✗ |

Access level is determined by OIDC claims/groups.

### Access Control Implementation

Access checks are enforced in each handler:

```go
// Example: CreateMeet handler
user := middleware.GetUser(ctx)
if user != nil && !user.AccessLevel.CanWrite() {
    middleware.WriteError(w, http.StatusForbidden, "write access required", "FORBIDDEN")
    return
}
```

All write endpoints (POST, PUT, DELETE) check for write access.

### Testing

Access control is tested in integration tests:

```go
t.Run("view-only access cannot create meets", func(t *testing.T) {
    client.SetMockUser("view_only")
    rr := client.Post("/api/v1/meets", input)
    assert.Equal(t, http.StatusForbidden, rr.Code)
})
```

## Error Handling

### Secure Error Messages

Errors do not expose internal details:

```go
// Generic error for internal failures
WriteError(w, http.StatusInternalServerError, "internal server error", "INTERNAL_ERROR")

// Specific error for validation
WriteValidationError(w, map[string]string{"event": "invalid event code"})
```

### Panic Recovery

The recovery middleware catches panics and returns generic 500:

```go
defer func() {
    if rec := recover(); rec != nil {
        logger.Error("panic recovered", "panic", rec)
        WriteError(w, http.StatusInternalServerError, "internal server error", "PANIC")
    }
}()
```

### Logging

Errors are logged with context but not sent to clients:

```go
logger.Error("internal error", "error", err, "path", r.URL.Path)
```

## Input Validation

### API Input

All API inputs are validated:

- **Event codes**: Whitelist validation against known events
- **Dates**: Format validation (YYYY-MM-DD)
- **Times**: Positive integer validation
- **UUIDs**: Format validation before database queries

### SQL Injection Prevention

- **SQLC**: Type-safe, parameterized queries
- No string concatenation for SQL
- All queries use `$1`, `$2`, etc. placeholders

Example generated code:
```sql
-- name: GetMeet :one
SELECT * FROM meets WHERE id = $1;
```

### Import Validation

Data import validates:

- JSON structure
- Field types and formats
- Event codes against whitelist
- Date ranges (event_date within meet dates)
- Course type values (25m, 50m only)

## Data Protection

### Personal Data

The application stores:
- Swimmer name
- Birth date
- Gender
- Swim times with dates

### Access Control

- All data access requires authentication
- Data is scoped to the authenticated user (single-tenant)
- No cross-user data access possible

### Export/Import

- Export includes all user data (for backup)
- Import replaces data (with preview confirmation)
- Pre-loaded standards are protected from modification

## Production Recommendations

### Rate Limiting

**Not currently implemented**. For production, consider:

```go
// Example using golang.org/x/time/rate
limiter := rate.NewLimiter(rate.Every(time.Second), 100)
```

Recommended limits:
- API: 100 requests/minute per user
- Import: 1 request/minute per user
- Export: 10 requests/hour per user

### HTTPS

Always use HTTPS in production:

```yaml
# Kubernetes Ingress example
metadata:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts: [swimstats.example.com]
      secretName: swimstats-tls
```

### Environment Variables

Sensitive configuration via environment:

```bash
# Required in production
OIDC_ISSUER=https://auth.example.com/
OIDC_CLIENT_ID=swimstats
OIDC_CLIENT_SECRET=<secret>
DATABASE_URL=postgres://user:password@host/db?sslmode=require

# Never set in production
# ENV=development
```

### Database Security

- Use SSL for database connections (`sslmode=require`)
- Create dedicated database user with minimal privileges
- Regular backups with encryption

### Secrets Management

Production deployment should use:
- Kubernetes Secrets (encrypted at rest)
- External secrets manager (HashiCorp Vault, AWS Secrets Manager)
- Environment variable injection at runtime

## Security Checklist

### Development

- [x] Authentication via OIDC tokens
- [x] Authorization with access levels
- [x] Input validation on all endpoints
- [x] SQL injection prevention (SQLC)
- [x] Error messages don't expose internals
- [x] Panic recovery middleware
- [x] CORS configuration

### Production (Recommended)

- [ ] HTTPS with valid certificate
- [ ] Rate limiting on all endpoints
- [ ] Database SSL connections
- [ ] Secrets in environment (not in code)
- [ ] Regular security updates
- [ ] Monitoring and alerting
- [ ] Audit logging
- [ ] WAF (Web Application Firewall)

## Reporting Security Issues

Report security vulnerabilities to: security@example.com

Do not open public issues for security vulnerabilities.
