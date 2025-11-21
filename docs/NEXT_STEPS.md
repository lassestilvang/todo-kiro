# Next Steps to Reach 80% Coverage

## Current Status
- **Line Coverage**: 74.55% → Target: 80% (5.45% gap)
- **Function Coverage**: 78.65% → Target: 80% (1.35% gap)
- **Tests**: 302 passing, 49 pending

## High Priority (Will reach 80%+)

### 1. Store API Integration Tests (+6% coverage)
**Impact**: High - Stores are at 40% coverage

**Files to test**:
- `lib/store/task-store.ts` (24% → 80%)
- `lib/store/list-store.ts` (14% → 80%)
- `lib/store/label-store.ts` (14% → 80%)

**Approach**:
```typescript
// Use MSW (Mock Service Worker) or similar for API mocking
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/tasks', () => {
    return HttpResponse.json([/* mock tasks */]);
  })
);

// Test actual store behavior with mocked API
test('should load tasks from API', async () => {
  const { useTaskStore } = await import('../task-store');
  await useTaskStore.getState().loadTasks();
  expect(useTaskStore.getState().tasks).toHaveLength(2);
});
```

**Estimated effort**: 4-6 hours
**Coverage gain**: +6%

### 2. Database Query Edge Cases (+2% coverage)
**Impact**: Medium - Queries at 85% coverage

**Missing coverage**:
- `lib/db/queries/tasks.ts` - Lines 57-58, 65-66, 73-79, 86-88
- `lib/db/queries/task-labels.ts` - Lines 44, 46-47, 55-56
- `lib/db/queries/change-logs.ts` - Currently 7.84% coverage

**Approach**:
- Test error scenarios (invalid IDs, constraint violations)
- Test transaction rollbacks
- Test concurrent operations

**Estimated effort**: 2-3 hours
**Coverage gain**: +2%

### 3. UI Store Complete Coverage (+1% coverage)
**Impact**: Low - UI store at 60% coverage

**Missing coverage**:
- `lib/store/ui-store.ts` - Lines 46, 48-56, 87, 92, 98-100

**Approach**:
```typescript
test('should persist theme preference', () => {
  const { useUIStore } = require('../ui-store');
  useUIStore.getState().setTheme('dark');
  // Verify localStorage or persistence
});
```

**Estimated effort**: 1-2 hours
**Coverage gain**: +1%

## Medium Priority (Polish & Best Practices)

### 4. API Route Integration Tests
**Current**: 60% coverage
**Target**: 80%

**Approach**:
- Use Next.js test utilities
- Test request/response handling
- Test error scenarios
- Test authentication (if applicable)

**Estimated effort**: 3-4 hours
**Coverage gain**: +1%

### 5. Component Integration Tests
**Current**: 80% coverage
**Target**: 90%

**Approach**:
- Use React Testing Library
- Test user interactions
- Test accessibility
- Test error states

**Estimated effort**: 4-6 hours
**Coverage gain**: +1%

## Low Priority (Nice to Have)

### 6. E2E Tests with Playwright
**Purpose**: Catch integration issues

**Scenarios**:
- Complete task creation flow
- Task completion and recurring generation
- List and label management
- Search functionality

**Estimated effort**: 8-12 hours
**Coverage gain**: Indirect (catches bugs)

### 7. Visual Regression Tests
**Purpose**: Prevent UI regressions

**Tools**: Playwright + Percy or Chromatic

**Estimated effort**: 4-6 hours
**Coverage gain**: Indirect

### 8. Performance Tests
**Purpose**: Ensure scalability

**Scenarios**:
- Search with 1000+ tasks
- Rendering large task lists
- Database query performance

**Estimated effort**: 2-4 hours
**Coverage gain**: Indirect

## Recommended Implementation Order

### Week 1: Reach 80% Coverage
1. **Day 1-2**: Store API integration tests (+6%)
2. **Day 3**: Database query edge cases (+2%)
3. **Day 4**: UI store complete coverage (+1%)
4. **Day 5**: Buffer for fixes and documentation

**Result**: 74.55% → 83.55% coverage ✅

### Week 2: Polish & Best Practices
1. **Day 1-2**: API route integration tests
2. **Day 3-4**: Component integration tests
3. **Day 5**: Documentation and CI/CD improvements

**Result**: 83.55% → 85%+ coverage ✅

### Week 3: Advanced Testing (Optional)
1. **Day 1-3**: E2E tests with Playwright
2. **Day 4**: Visual regression setup
3. **Day 5**: Performance tests

**Result**: Comprehensive test coverage with E2E safety net ✅

## Quick Wins (Can do today)

### 1. Fix Pending Tests (30 minutes)
The 49 pending tests are mostly due to database initialization issues. Fix by:
- Ensuring proper test isolation
- Using in-memory databases per test
- Cleaning up after each test

### 2. Add Missing Error Tests (1 hour)
Test error scenarios in:
- Database connection failures
- API network errors
- Invalid input handling

### 3. Document Test Patterns (30 minutes)
Create examples for:
- Testing async operations
- Mocking external dependencies
- Testing React hooks

## Tools & Libraries Needed

### For Store Testing
```bash
bun add -d msw
```

### For Component Testing
```bash
bun add -d @testing-library/react @testing-library/jest-dom
```

### For E2E Testing
```bash
bun add -d @playwright/test
```

## Success Metrics

- ✅ 80%+ line coverage
- ✅ 80%+ function coverage
- ✅ All critical paths at 90%+ coverage
- ✅ Test suite runs in < 1 second
- ✅ Zero flaky tests
- ✅ CI/CD enforces coverage thresholds

## Resources

- [MSW Documentation](https://mswjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [Bun Test Runner](https://bun.sh/docs/cli/test)

---

**Last Updated**: November 21, 2025
**Current Coverage**: 74.55% line, 78.65% function
**Target**: 80%+ by end of week
