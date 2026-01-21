.PHONY: lint test test-setup test-teardown test-migrate test-run build clean help

# Configuration (can be overridden for CI)
GOLANGCI_LINT_VERSION ?= v2.8.0
TEST_DB_CONTAINER := swimstats-test-postgres
TEST_DB_NAME ?= swimstats_test
TEST_DB_USER ?= swimstats
TEST_DB_PASSWORD ?= swimstats
TEST_DB_HOST ?= localhost
TEST_DB_PORT ?= 5433
TEST_DB_URL ?= postgres://$(TEST_DB_USER):$(TEST_DB_PASSWORD)@$(TEST_DB_HOST):$(TEST_DB_PORT)/$(TEST_DB_NAME)?sslmode=disable
POSTGRES_IMAGE := postgres:18-alpine@sha256:b40d931bd0e7ce6eecc59a5a6ac3b3c04a01e559750e73e7086b6dbd7f8bf545

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

lint: ## Run golangci-lint
	golangci-lint run

test: test-setup test-migrate ## Run tests with coverage (starts test database)
	@echo "Running tests..."
	DATABASE_URL=$(TEST_DB_URL) go test -v -race -coverprofile=coverage.out ./... || ($(MAKE) test-teardown && exit 1)
	$(MAKE) test-teardown

test-unit: ## Run tests without database (unit tests only)
	go test -v -race -short ./...

test-setup: test-teardown ## Start test database container
	@echo "Starting test database container..."
	docker run -d \
		--name $(TEST_DB_CONTAINER) \
		-e POSTGRES_USER=$(TEST_DB_USER) \
		-e POSTGRES_PASSWORD=$(TEST_DB_PASSWORD) \
		-e POSTGRES_DB=$(TEST_DB_NAME) \
		-p $(TEST_DB_PORT):5432 \
		$(POSTGRES_IMAGE)
	@echo "Waiting for database to be ready..."
	@until docker exec $(TEST_DB_CONTAINER) pg_isready -U $(TEST_DB_USER) -d $(TEST_DB_NAME) > /dev/null 2>&1; do \
		sleep 1; \
	done
	@echo "Database is ready."

test-teardown: ## Stop and remove test database container
	@docker rm -f $(TEST_DB_CONTAINER) 2>/dev/null || true

test-migrate: ## Run migrations on test database
	@echo "Running migrations..."
	@for f in $$(ls migrations/*.up.sql | sort); do \
		echo "Applying $$f..."; \
		PGPASSWORD=$(TEST_DB_PASSWORD) psql -h $(TEST_DB_HOST) -p $(TEST_DB_PORT) -U $(TEST_DB_USER) -d $(TEST_DB_NAME) -f $$f; \
	done

test-run: ## Run tests only (no setup/teardown, for CI)
	DATABASE_URL=$(TEST_DB_URL) go test -v -race -coverprofile=coverage.out ./...

build: ## Build Docker image
	docker build -t swimstats-backend:latest .

sqlc: ## Generate sqlc code
	sqlc generate

clean: ## Clean build artifacts
	rm -f coverage.out
	$(MAKE) test-teardown
