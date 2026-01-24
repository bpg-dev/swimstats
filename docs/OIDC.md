# OIDC Authentication Configuration

This document describes the OIDC (OpenID Connect) authentication requirements for SwimStats.

## Overview

SwimStats uses OIDC for authentication with a split architecture:
- **Frontend**: React SPA using `react-oidc-context` (PKCE flow)
- **Backend**: Go API validating ID tokens using `coreos/go-oidc`

## Critical Requirements

### 1. Token Type: ID Token (Not Access Token)

**The backend expects ID tokens, not access tokens.**

The backend's OIDC verifier uses `oidc.IDTokenVerifier.Verify()` which:
- Validates the token signature against the OIDC provider's JWKS
- Verifies the token issuer matches the configured authority
- Checks token expiration
- Extracts user claims (email, name, groups)

Access tokens are opaque to the backend and will fail verification with:
```
verify token: oidc: malformed jwt: go-jose/go-jose: compact JWS format must have three parts
```

### 2. Client Type: Public (Not Confidential)

**SPAs must use Public clients with PKCE.**

Single Page Applications cannot securely store client secrets (they're visible in browser DevTools). Therefore:
- Configure your OIDC provider to use "Public" client type
- Enable PKCE (Proof Key for Code Exchange)
- Do NOT include `client_secret` in frontend configuration

If configured as Confidential, the token endpoint will return:
```
HTTP 400: client_secret is required
```

### 3. Required Scopes

The frontend requests these scopes:
```
openid email profile
```

- `openid` - Required for OIDC, triggers ID token in response
- `email` - Provides user's email address
- `profile` - Provides user's name

## Provider Configuration

### Authentik Example

1. **Create OAuth2/OpenID Provider**:
   - Name: `SwimStats`
   - Client type: `Public`
   - Client ID: (auto-generated, copy to config)
   - Redirect URIs: `https://your-domain.com/auth/callback`
   - Signing Key: Select your signing key
   - Scopes: Select `openid`, `email`, `profile`

2. **Create Application**:
   - Name: `SwimStats`
   - Slug: `swimstats`
   - Provider: Select the provider created above

3. **Configure Access Control** (optional):
   - Create a group for full access users (e.g., `swimstats-admin`)
   - Set `OIDC_FULL_ACCESS_CLAIM` env var to the group name

### Other Providers

The same principles apply to other OIDC providers (Keycloak, Auth0, Okta, etc.):
- Use Public client type with PKCE
- Enable ID token in response
- Configure proper redirect URIs

## Environment Variables

### Backend

| Variable | Description | Example |
|----------|-------------|---------|
| `OIDC_ISSUER` | OIDC provider's issuer URL | `https://sso.example.com/application/o/swimstats/` |
| `OIDC_CLIENT_ID` | OAuth2 client ID | `abc123...` |
| `OIDC_CLIENT_SECRET` | OAuth2 client secret (for token introspection) | `secret...` |
| `OIDC_REDIRECT_URL` | Callback URL | `https://app.example.com/auth/callback` |
| `OIDC_FULL_ACCESS_CLAIM` | Group/claim for write access | `swimstats-admin` |

### Frontend

The frontend reads configuration from `/config.json` at runtime:

```json
{
  "oidc": {
    "authority": "https://sso.example.com/application/o/swimstats/",
    "clientId": "abc123..."
  }
}
```

## Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Browser │     │Frontend │     │ Backend │     │  OIDC   │
│         │     │  (SPA)  │     │  (API)  │     │Provider │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ 1. Click Login               │               │
     │──────────────>│               │               │
     │               │               │               │
     │ 2. Redirect to OIDC Provider │               │
     │<──────────────│               │               │
     │               │               │               │
     │ 3. User authenticates        │               │
     │───────────────────────────────────────────────>
     │               │               │               │
     │ 4. Redirect back with code   │               │
     │<──────────────────────────────────────────────│
     │               │               │               │
     │ 5. Exchange code for tokens (PKCE)           │
     │               │───────────────────────────────>
     │               │               │               │
     │ 6. Receive ID token + access token           │
     │               │<──────────────────────────────│
     │               │               │               │
     │ 7. Store ID token            │               │
     │               │               │               │
     │ 8. API request with ID token │               │
     │               │──────────────>│               │
     │               │               │               │
     │               │ 9. Verify ID token signature  │
     │               │               │───────────────>
     │               │               │<──────────────│
     │               │               │               │
     │               │ 10. Extract user claims       │
     │               │               │               │
     │               │ 11. Process request           │
     │               │<──────────────│               │
     │               │               │               │
     │ 12. Return data              │               │
     │<──────────────│               │               │
```

## Access Levels

SwimStats supports two access levels:
- **Full Access**: Can create, update, and delete data
- **View Only**: Can only read data

Access level is determined by the user's group membership. If the user belongs to the group specified in `OIDC_FULL_ACCESS_CLAIM`, they get full access.

## Troubleshooting

### Login Loop / Redirect to Login

1. Check browser console for errors
2. Verify `authority` and `clientId` in `/config.json`
3. Ensure OIDC provider is configured as Public client

### 401 Unauthorized on API Calls

1. Verify the frontend is sending ID token (not access token)
2. Check backend logs for token verification errors
3. Ensure `OIDC_ISSUER` matches the token's `iss` claim exactly (including trailing slash)

### Token Verification Failed

Common causes:
- Wrong token type (access token instead of ID token)
- Issuer mismatch (check trailing slash)
- Expired token
- Invalid signature (JWKS endpoint not reachable)

### Database Credentials in URL

If your database password contains special characters (`@`, `*`, etc.), they must be URL-encoded in the `DATABASE_URL`:
- `@` → `%40`
- `*` → `%2A`
- `#` → `%23`

Use the `urlquery` filter in ExternalSecrets templates:
```yaml
DATABASE_URL: "postgres://{{ .USER | urlquery }}:{{ .PASS | urlquery }}@host:5432/db"
```
