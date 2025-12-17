.PHONY: build
build:
	@echo "Building ts code..."
	rm -rf dist
	pnpm tsc --module commonjs

.PHONY: test
test:
	pnpm vitest run

.PHONY: lint
lint:
	@echo "Linting code..."
	pnpm biome check ./src ./tests

.PHONY: format
format:
	@echo "Formatting code..."
	pnpm biome check --write ./src ./tests