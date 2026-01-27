# Quickstart: Swim Progress Tracker

**Purpose**: Get the development environment running locally in under 10 minutes.

## Prerequisites

- Go 1.25+
- Node.js 20+ (LTS)
- Docker & Docker Compose
- Git

## Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/bpg/swimstats.git
cd swimstats
```

### 2. Start Infrastructure

```bash
# Start PostgreSQL and (optionally) local OIDC provider
docker-compose up -d
```

This starts:
- PostgreSQL 16 on port 5432
- (Optional) Mock OIDC provider for local development

### 3. Backend Setup

```bash
cd backend

# Install tools
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

# Run migrations (embedded in the server binary)
go run ./cmd/server migrate

# Generate sqlc code
sqlc generate

# Run backend
go run ./cmd/server
```

Backend runs on http://localhost:8080

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs on http://localhost:5173

### 5. Verify Setup

```bash
# Health check
curl http://localhost:8080/api/v1/health
# Expected: {"status":"ok"}

# Open frontend
open http://localhost:5173
```

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=8080
ENV=development

# Database
DATABASE_URL=postgres://swimstats:swimstats@localhost:5432/swimstats?sslmode=disable

# OIDC (Authentik)
OIDC_ISSUER=https://auth.example.com/application/o/swimstats/
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_REDIRECT_URL=http://localhost:5173/auth/callback

# Access control (claim or group that grants full access)
OIDC_FULL_ACCESS_CLAIM=swimstats_admin
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_OIDC_AUTHORITY=https://auth.example.com/application/o/swimstats/
VITE_OIDC_CLIENT_ID=your-client-id
VITE_OIDC_REDIRECT_URI=http://localhost:5173/auth/callback
```

## Docker Compose Reference

```yaml
# docker-compose.yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: swimstats
      POSTGRES_PASSWORD: swimstats
      POSTGRES_DB: swimstats
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Common Tasks

### Run Tests

```bash
# Backend tests
cd backend
go test ./...

# Frontend tests
cd frontend
npm test
```

### Run Linters

```bash
# Backend
cd backend
golangci-lint run

# Frontend
cd frontend
npm run lint
```

### Add Database Migration

```bash
cd backend
# Create new migration files manually
# Name format: NNN_description.up.sql and NNN_description.down.sql
# Where NNN is the next sequence number (e.g., 005)
touch migrations/005_add_new_table.up.sql migrations/005_add_new_table.down.sql
# Edit the .up.sql and .down.sql files with your schema changes
```

### Regenerate API Types

```bash
# After editing contracts/api.yaml
cd frontend
npm run generate:api  # Uses openapi-typescript
```

## Project Structure Quick Reference

```
swimstats/
├── backend/
│   ├── cmd/server/main.go      # Entry point
│   ├── internal/
│   │   ├── api/handlers/       # HTTP handlers
│   │   ├── domain/             # Business logic
│   │   └── store/              # Database access
│   └── migrations/             # SQL migrations
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Route components
│   │   └── services/           # API client
│   └── tests/                  # Frontend tests
└── specs/                      # Feature specifications
```

## Troubleshooting

### Database connection refused

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Restart
docker-compose down && docker-compose up -d
```

### OIDC redirect issues

For local development without Authentik:
1. Set `ENV=development` in backend
2. Backend will accept a mock token header for testing
3. Use `X-Mock-User: {"email":"test@example.com","access":"full"}` header

### Port already in use

```bash
# Find process using port
lsof -i :8080
lsof -i :5173

# Kill it or change port in .env
```

## Next Steps

1. Set up Authentik OIDC application
2. Configure GitHub Actions CI
3. Build and push containers
4. Deploy to Kubernetes (see deployment docs)
