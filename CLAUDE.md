# SwimStats — Quick Workflow Guide

## Bug Fix

```
git checkout main && git pull
git checkout -b fix/short-description
# make changes, then verify:
cd backend && make lint && make test
cd frontend && make check && make test
# commit and push:
git add <files> && git commit -m "fix(scope): description"
git push -u origin fix/short-description
gh pr create
```

## New Feature (with speckit)

```
/speckit.specify <describe the feature>
/speckit.clarify          # optional: refine the spec
/speckit.plan             # generate technical plan
/speckit.tasks            # break into implementation tasks
/speckit.analyze          # check consistency (optional)
/speckit.implement        # execute the tasks
```

## Quick Commands

| Action | Command |
|--------|---------|
| Full dev env | `make serve` |
| Backend lint + test | `cd backend && make lint && make test` |
| Frontend checks + test | `cd frontend && make check && make test` |
| Unit tests only (no DB) | `cd backend && make test-unit` |
| Generate sqlc | `cd backend && make sqlc` |
| Run migrations | `cd backend && go run ./cmd/server migrate` |

## Rules

- **Never commit to `main`** — always use `feature/*` or `fix/*` branches
- **Conventional commits required** — `feat(scope):`, `fix(scope):`, `chore(scope):`
- **TDD for new features** — tests first, then implement
- **Run quality gates before PR** — lint, typecheck, format, tests must pass
- **Never merge PRs** — human maintainer responsibility

See `.claude/rules/specify-rules.md` for full project guidelines.
