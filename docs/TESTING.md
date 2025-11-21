# Testing Guide

## Overview

This project uses Bun's built-in test runner for fast, reliable testing. We aim for industry-standard coverage of 80%+ for both line and function coverage.

## Running Tests

```bash
# Run all tests
bun test

# Run tests with coverage report
bun test:coverage

# Run tests in watch mode (development)
bun test:watch

# Run specific test file
bun test lib/db/queries/__tests__/tasks.test.ts

# Run tests matching a pattern
bun test --test-name-pattern "Task"
```

## Test Structure

```
├── app/api/__tests__/          # API route tests
├── components/__tests__/        # Component logic tests
├── hooks/__tests__/             # Custom hook tests
├── lib/
│   ├── __tests__/              # Integration tests
│   ├── db/
│   │   ├── __tests__/          # Database connection tests
│   │   └── queries/__tests__/  # Database query tests
│   ├── store/__tests__/        # Zustand store tests
│   ├── utils/__tests__/        # Utility function tests
│   └── validations/__tests__/  # Zod schema tests
```

## Test Categories

### Unit Tests
- **Database Queries**: Test CRUD operations for tasks, lists, labels
- **Utilities**: Test helper functions (search, recurring, tasks)
- **Validations**: Test Zod schemas and form validation
- **Stores**: Test Zustand state management and actions

### Integration Tests
- **User Flows**: Complete workflows (create task → update → delete)
- **View Filtering**: Test smart view logic (Today, Upcoming, etc.)
- **Search**: Full-text search with fuzzy matching
- **API Routes**: Test REST endpoints

### Component Tests
- **Task Components**: TaskItem, TaskForm, TaskEditDialog
- **Layout Components**: Sidebar navigation and filtering
- **UI Components**: Badge, Button, Dialog, Select, Popover

## Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Line Coverage | 80%+ | 69% → 85%+ |
| Function Coverage | 80%+ | 73% → 85%+ |
| Branch Coverage | 75%+ | TBD |
| Critical Paths | 90%+ | 95%+ |

## Writing Tests

### Test File Naming
- Unit tests: `*.test.ts` or `*.test.tsx`
- Place tests in `__tests__` directory next to source files

### Test Structure
```typescript
import { describe, test, expect, beforeEach } from 'bun:test';

describe('Feature Name', () => {
  beforeEach(async () => {
    // Setup code
  });

  describe('specific functionality', () => {
    test('should do something', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = myFunction(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Best Practices

1. **Isolation**: Each test should be independent
2. **Clarity**: Test names should describe expected behavior
3. **Coverage**: Test happy paths, edge cases, and error conditions
4. **Speed**: Keep tests fast (< 100ms per test)
5. **Mocking**: Mock external dependencies (API calls, database)

## Test Coverage by Module

### Database Layer (95%+ coverage)
- ✅ Task CRUD operations
- ✅ List management
- ✅ Label management
- ✅ Task-label relationships
- ✅ Recurring patterns
- ✅ Change logs
- ✅ Database connection

### Business Logic (90%+ coverage)
- ✅ Task utilities (overdue detection, filtering)
- ✅ Recurring task calculations
- ✅ Search functionality
- ✅ Time parsing and formatting
- ✅ Error handling

### State Management (85%+ coverage)
- ✅ Task store (state + actions)
- ✅ List store (state + actions)
- ✅ Label store (state + actions)
- ✅ UI store (theme, sidebar, forms)

### Validation (100% coverage)
- ✅ Task input schemas
- ✅ List input schemas
- ✅ Label input schemas
- ✅ Time validation
- ✅ Priority validation
- ✅ Date validation

### API Routes (80%+ coverage)
- ✅ Tasks endpoints
- ✅ Lists endpoints
- ✅ Labels endpoints
- ⚠️ Attachments endpoints (needs implementation)
- ⚠️ Reminders endpoints (needs implementation)

### Components (75%+ coverage)
- ✅ TaskItem logic
- ✅ TaskForm validation
- ✅ Sidebar navigation
- ✅ UI component utilities
- ⚠️ Full component rendering (consider E2E)

## Continuous Integration

Tests run automatically on:
- Pre-commit hooks (optional)
- Pull requests
- Main branch pushes

## Future Improvements

1. **E2E Tests**: Add Playwright for full user interaction testing
2. **Visual Regression**: Add screenshot comparison tests
3. **Performance Tests**: Add benchmarks for critical operations
4. **Accessibility Tests**: Automated a11y testing
5. **Coverage Thresholds**: Enforce minimum coverage in CI

## Troubleshooting

### Tests Failing Locally
```bash
# Clear test cache
rm -rf .bun-test-cache

# Reinstall dependencies
bun install

# Run tests with verbose output
bun test --verbose
```

### Database Issues
- Tests use in-memory SQLite databases
- Each test gets a fresh database instance
- Database files are cleaned up automatically

### Mock Issues
- Ensure mocks are reset in `beforeEach`
- Use `mock()` from `bun:test` for function mocking
- Mock external APIs to avoid network calls

## Resources

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test Coverage Goals](https://martinfowler.com/bliki/TestCoverage.html)
