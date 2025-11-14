# ClarityVid AI - E2E Tests

End-to-end tests using Playwright to ensure critical user flows work correctly.

## Setup

```bash
npm install
npx playwright install chromium
```

## Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug

# View last report
npm run report
```

## Test Coverage

- **Authentication**: Registration, login, logout, error handling
- **API Health**: Endpoint availability, authentication requirements
- **Dashboard**: User data loading, navigation

## CI/CD Integration

Tests run automatically after each deployment to verify the app is working correctly.

## Writing New Tests

Add test files to `tests/` directory following Playwright best practices:
- Use descriptive test names
- Keep tests independent
- Use page object pattern for complex flows
- Add appropriate waits and assertions
