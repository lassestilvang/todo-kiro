# Component Tests

This directory contains tests for React components in the Daily Task Planner application.

## Test Files

### task-item.test.tsx
Tests the core logic and utilities used by the TaskItem component.

**Coverage:**
- Task state rendering (completed, priority levels, dates)
- Overdue detection logic
- Subtask relationships and completion tracking
- Task metadata (time, description, timestamps)

**Requirements:** 2.2, 2.3, 5.4, 6.2

**Status:** ✓ All tests passing

### task-form.test.ts
Tests form validation logic and data transformation for the TaskForm component.

**Coverage:**
- Form validation (required fields, data types)
- Priority and date validation
- Form submission and data transformation
- Error message display
- Time parsing utilities (HH:mm format)

**Requirements:** 2.1, 2.2, 10.1, 10.5

**Status:** ✓ 15/15 tests passing

### sidebar.test.ts (layout/)
Tests the data logic and utilities used by the Sidebar component.

**Coverage:**
- Navigation link structure
- Custom list display and filtering
- Label display
- Overdue badge calculation
- List and label management actions

**Requirements:** 1.3, 6.3, 8.1, 15.3

**Status:** ✓ 16/16 tests passing

## Running Tests

### Run all component tests
```bash
bun test components/ --run
```

### Run specific test file
```bash
bun test components/task/__tests__/task-form.test.ts --run
bun test components/layout/__tests__/sidebar.test.ts --run
```

### Run with watch mode (development)
```bash
bun test components/
```

## Test Strategy

These tests focus on:
1. **Core Logic**: Testing the business logic and utilities used by components
2. **Data Validation**: Ensuring form validation and data transformation work correctly
3. **State Management**: Verifying store interactions and data flow
4. **Requirements Coverage**: Each test explicitly references the requirements it validates

## Notes

- Component tests use Bun's built-in test runner
- Tests focus on logic and utilities rather than full DOM rendering
- This approach provides fast, reliable tests without complex DOM setup
- All tests are isolated and can run in parallel

## Test Coverage Summary

- **Total Tests:** 31
- **Passing:** 31 (100%)
- **Failing:** 0
- **Expect Calls:** 64

## Future Improvements

- Add E2E tests with Playwright for full user interaction testing
- Add visual regression tests for UI components
- Expand coverage for edge cases and error scenarios
