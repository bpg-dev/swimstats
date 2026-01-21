.PHONY: install lint format format-check typecheck test test-watch build clean help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

lint: ## Run ESLint
	npm run lint

format: ## Format code with Prettier
	npm run format

format-check: ## Check code formatting with Prettier
	npm run format:check

typecheck: ## Run TypeScript type checking
	npx tsc --noEmit

check: lint format-check typecheck ## Run all checks (lint, format, typecheck)

test: ## Run tests with coverage
	npm run test:coverage

test-watch: ## Run tests in watch mode
	npm run test

build: ## Build Docker image
	docker build -t swimstats-frontend:latest .

build-local: ## Build production bundle locally
	npm run build

dev: ## Start development server
	npm run dev

clean: ## Clean build artifacts
	rm -rf dist coverage node_modules/.cache

# CI targets
ci-install: ## CI: Install dependencies with npm ci
	npm ci

ci-check: ci-install check ## CI: Install and run all checks

ci-test: ci-install test ## CI: Install and run tests
