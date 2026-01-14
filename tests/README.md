# MarkText Tests

This directory contains the test suite for MarkText.

## Test Structure

```
tests/
├── unit/           # Unit tests (Vitest)
│   ├── encoding.test.js       # Encoding utilities tests
│   ├── filesystem-paths.test.js   # Path utilities tests
│   └── config.test.js         # Configuration constants tests
├── e2e/            # End-to-end tests (Playwright)
│   └── app-launch.spec.js     # App launch smoke tests
├── fixtures/       # Test data files
│   ├── sample.md              # Sample markdown file
│   └── sample-crlf.md         # CRLF line ending test file
└── README.md
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run in watch mode (during development)
npm run test:unit:watch

# Run with coverage report
npm run test:unit:coverage
```

### E2E Tests

E2E tests verify build output and test fixtures by default.

```bash
# Run E2E tests (builds app first)
npm run test:e2e

# Run E2E tests with visible browser (for debugging)
npm run test:e2e:headed
```

#### Full E2E Tests (with packaged app)

Full E2E tests that launch the actual Electron app require a packaged binary.
This is due to electron-vite's module bundling approach.

```bash
# Build the packaged app first
npm run build:mac  # or build:win / build:linux

# Run full E2E with packaged app
MARKTEXT_E2E_FULL=1 MARKTEXT_APP_PATH=/path/to/MarkText.app/Contents/MacOS/marktext npx playwright test
```

### All Tests

```bash
# Run both unit and E2E tests
npm run test:all
```

## Test Philosophy

Tests focus on **behavior** rather than implementation details:

1. **Unit tests** - Pure functions without side effects (encoding, path utilities)
2. **E2E smoke tests** - Build output exists, fixtures are valid, app launch checks

This approach ensures tests remain valuable during refactoring while catching real regressions.

## Adding New Tests

### Unit Tests

Add `.test.js` files to `tests/unit/`. Tests should:
- Import from source using configured aliases (`common/`, `muya/`, etc.)
- Focus on pure functions that don't require Electron APIs
- Use `describe`/`it` blocks from Vitest

### E2E Tests

Add `.spec.js` files to `tests/e2e/`. Tests should:
- Use Playwright's Electron support
- Focus on user-facing behavior
- Clean up resources in `afterAll` hooks

## Configuration

- **Vitest**: `vitest.config.mjs` (path aliases match `electron.vite.config.mjs`)
- **Playwright**: `playwright.config.mjs`
