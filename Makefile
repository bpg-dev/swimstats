.PHONY: all help lint test build clean \
        backend-lint backend-test backend-build \
        frontend-install frontend-lint frontend-check frontend-test frontend-build \
        dev-up dev-down

all: lint test build ## Run lint, test, and build for all components

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Aggregate targets
lint: backend-lint frontend-lint ## Run linting for both backend and frontend

test: backend-test frontend-test ## Run tests for both backend and frontend

build: backend-build frontend-build ## Build Docker images for both backend and frontend

clean: ## Clean all build artifacts
	$(MAKE) -C backend clean
	$(MAKE) -C frontend clean

# Backend targets
backend-lint: ## Run backend linting
	$(MAKE) -C backend lint

backend-test: ## Run backend tests
	$(MAKE) -C backend test

backend-build: ## Build backend Docker image
	$(MAKE) -C backend build

# Frontend targets
frontend-install: ## Install frontend dependencies
	$(MAKE) -C frontend install

frontend-lint: ## Run frontend linting
	$(MAKE) -C frontend lint

frontend-check: ## Run all frontend checks (lint, format, typecheck)
	$(MAKE) -C frontend check

frontend-test: ## Run frontend tests
	$(MAKE) -C frontend test

frontend-build: ## Build frontend Docker image
	$(MAKE) -C frontend build

# Development
dev-up: ## Start development environment (postgres)
	docker-compose up -d postgres

dev-down: ## Stop development environment
	docker-compose down

# CI targets (used by GitHub Actions)
ci-backend-test: ## CI: Run backend tests (pass TEST_DB_* vars to override defaults)
	$(MAKE) -C backend test-migrate
	$(MAKE) -C backend test-run

ci-frontend-check: ## CI: Run frontend checks
	$(MAKE) -C frontend ci-check

ci-frontend-test: ## CI: Run frontend tests
	$(MAKE) -C frontend ci-test
