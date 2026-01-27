# Contributing to SwimStats

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/swimstats.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Push and create a Pull Request

## Development Setup

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
cd backend && go run ./cmd/server migrate

# Start backend
cd backend && go run ./cmd/server

# Start frontend (in another terminal)
cd frontend && npm install && npm run dev
```

## Code Style

### Backend (Go)
- Run `golangci-lint run` before committing
- Follow standard Go conventions
- Use table-driven tests

### Frontend (TypeScript/React)
- Run `npm run lint` before committing
- Use TypeScript strict mode (no `any` without justification)
- Follow React best practices

## Testing

```bash
# Backend tests
cd backend && go test ./...

# Frontend tests
cd frontend && npm test
```

## Commit Messages

We use [Conventional Commits](https://conventionalcommits.org):

- `feat(scope): add new feature`
- `fix(scope): fix bug`
- `chore(scope): maintenance task`

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Fill out the PR template
4. Request review from maintainers

## Reporting Issues

- Use the bug report template for bugs
- Use the feature request template for enhancements
- Search existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the AGPL-3.0 License.
