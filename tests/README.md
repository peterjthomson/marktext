# MarkText Tests

This directory contains the test suite for MarkText.

## Test Structure

```
tests/
├── unit/           # Unit tests (Vitest)
│   ├── encoding.test.js          # Encoding utilities
│   ├── filesystem-paths.test.js  # Path utilities
│   └── config.test.js            # Regex patterns
├── e2e/            # End-to-end tests (Playwright)
│   └── app-launch.spec.js        # Build verification & smoke tests
├── fixtures/       # Test data files
│   ├── sample.md                 # Sample markdown file
│   └── sample-crlf.md            # CRLF line ending test file
└── README.md
```

## Running Tests

### Unit Tests

```bash
npm run test:unit           # Run all unit tests
npm run test:unit:watch     # Watch mode
npm run test:unit:coverage  # With coverage report
```

### E2E Tests

E2E tests verify build output and test fixtures by default.

```bash
npm run test:e2e         # Run E2E tests (builds app first)
npm run test:e2e:headed  # With visible browser (debugging)
```

#### Full E2E Tests (with packaged app)

Full E2E tests that launch the actual Electron app require a packaged binary.

```bash
# Build the packaged app first
npm run build:mac  # or build:win / build:linux

# Run full E2E with packaged app
MARKTEXT_E2E_FULL=1 MARKTEXT_APP_PATH=/path/to/MarkText.app/Contents/MacOS/marktext npx playwright test
```

### All Tests

```bash
npm run test:all  # Run both unit and E2E tests
```

## Test Philosophy

Tests focus on **behavior** rather than implementation details:

- **Unit tests** verify function behavior (inputs → outputs)
- **E2E tests** verify build artifacts and app launch

We avoid tests that merely "assert the implementation" such as checking that arrays are frozen or contain specific internal values. Tests should catch real regressions, not implementation changes.

## Adding New Tests

### Unit Tests

Add `.test.js` files to `tests/unit/`. Tests should:

- Import from source using configured aliases (`common/`, `muya/`, etc.)
- Focus on pure functions that don't require Electron APIs
- Test observable behavior, not internal implementation

### E2E Tests

Add `.spec.js` files to `tests/e2e/`. Tests should:

- Use Playwright's Electron support
- Focus on user-facing behavior
- Clean up resources in `afterAll` hooks

## Configuration

- **Vitest**: `vitest.config.mjs`
- **Playwright**: `playwright.config.mjs`
