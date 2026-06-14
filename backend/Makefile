# Backend quality gate. Run `make verify` before review / in CI.
SHELL := /bin/bash
GO    ?= go

# Resolve golangci-lint from PATH, falling back to GOPATH/bin.
GOPATH_BIN    := $(shell $(GO) env GOPATH)/bin
GOLANGCI_LINT ?= $(shell command -v golangci-lint 2>/dev/null || echo $(GOPATH_BIN)/golangci-lint)

# Spectral runs via npx — no global install needed.
SPECTRAL      ?= npx --yes @stoplight/spectral-cli

SPECS_DIR      := ../specs
SPECTRAL_RULES := ../.spectral.yaml
COVER_PROFILE  := coverage.out
COVER_MIN      ?= 70

.DEFAULT_GOAL := help
.PHONY: help verify fmt vet lint unit acceptance test cover contract-lint mod-verify tidy install-tools

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort \
		| awk 'BEGIN {FS=":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

verify: mod-verify fmt vet lint test cover ## Full Go quality gate (fmt, vet, lint, tests, coverage)

mod-verify: ## Verify module dependencies are intact
	$(GO) mod verify

tidy: ## Tidy go.mod / go.sum
	$(GO) mod tidy

fmt: ## Fail if any file needs gofmt
	@out=$$(gofmt -l . 2>/dev/null); \
	if [ -n "$$out" ]; then echo "gofmt needed in:"; echo "$$out"; exit 1; fi; \
	echo "gofmt: ok"

vet: ## Run go vet
	$(GO) vet ./...

lint: ## Run golangci-lint
	@if [ ! -x "$(GOLANGCI_LINT)" ] && ! command -v golangci-lint >/dev/null 2>&1; then \
		echo "golangci-lint not found -> run 'make install-tools'"; exit 1; fi
	$(GOLANGCI_LINT) run ./...

unit: ## Run unit tests with coverage (domain packages)
	@if find internal -name '*.go' 2>/dev/null | grep -q .; then \
		$(GO) test ./internal/... -race -covermode=atomic -coverprofile=$(COVER_PROFILE); \
	else echo "no internal packages yet — skipping unit tests"; fi

acceptance: ## Run Gherkin acceptance tests (godog over specs/)
	$(GO) test ./test/acceptance/...

test: unit acceptance ## Run unit + acceptance tests

cover: ## Enforce coverage threshold (COVER_MIN, default 70)
	@if [ ! -f $(COVER_PROFILE) ]; then echo "no coverage profile — skipping threshold"; exit 0; fi; \
	total=$$($(GO) tool cover -func=$(COVER_PROFILE) | awk '/^total:/ {gsub("%","",$$3); print $$3}'); \
	echo "coverage: $$total% (min $(COVER_MIN)%)"; \
	awk -v t=$$total -v m=$(COVER_MIN) 'BEGIN { exit (t+0 < m+0) }' \
		|| { echo "coverage below threshold"; exit 1; }

contract-lint: ## Lint OpenAPI contracts with Spectral (needs network for npx)
	@files=$$(find $(SPECS_DIR) -path '*/contract/openapi.yaml' 2>/dev/null); \
	if [ -z "$$files" ]; then echo "no contracts to lint yet"; exit 0; fi; \
	$(SPECTRAL) lint --ruleset $(SPECTRAL_RULES) $$files

install-tools: ## Install golangci-lint into GOPATH/bin
	$(GO) install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@latest
