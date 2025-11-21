# Architecture Documentation

This document provides detailed information about the architecture, design patterns, and complex logic in the Daily Task Planner application.

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [Data Flow](#data-flow)
5. [State Management](#state-management)
6. [Database Layer](#database-layer)
7. [API Routes](#api-routes)
8. [Component Architecture](#component-architecture)
9. [Complex Logic Explained](#complex-logic-explained)
10. [Performance Optimizations](#performance-optimizations)
11. [Testing Strategy](#testing-strategy)

---

## Overview

Daily Task Planner follows a modern React architecture using Next.js 16 with the App Router. The application is client-side heavy with local SQLite persistence, making it fast and offline-capable.

### Key Architectural Decisions

1. **Local-First**: All data stored locally in SQLite for speed and offline support
2. **Client-Side State**: Zustand for reactive state management
3. **Type Safety**: Strict TypeScript throughout the codebase
4. **Component Library**: shadcn/ui for consistent, accessible UI components
5. **Server Components**: Default to Server Components, use Client Components only when needed

---

## Technology Stack

### Core Technologies

- **Next.js 16**: React framework with App Router for file-based routing
- **Bun**: Fast JavaScript runtime and package manager
- **TypeScript**: Type-safe development with strict mode enabled
- **SQLite**: Embedded database via better-sqlite3 (synchronous API)

### UI Layer

- **Tailwind CSS v4**: Utility-first CSS framework
- **shadcn/ui**: Pre-built accessible components based on Radix UI
- **Framer Motion**: Animation library for smooth transitions
- **Lucide React**: Icon library

### State & Data

- **Zustand**: Lightweight state management (no boilerplate)
- **React Hook Form**: Form state management
- **Zod**: Schema validation for forms and API inputs
- **date-fns**: Date manipulation and formatting

### Search & Utilities

- **Fuse.js**: Fuzzy search implementation
- **clsx + tailwind-merge**: Conditional className utilities

---

## Architecture Patterns

### 1. Layered Architecture

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Components, Pages, UI)            │
├─────────────────────────────────────┤
│         Application Layer           │
│  (Stores, Hooks, Business Logic)   │
├─────────────────────────────────────┤
│         Data Access Layer           │
│  (Database Queries, API Routes)    │
├─────────────────────────────────────┤
│         Persistence Layer           │
│  (SQLite Database)                  │
└─────────────────────────────────────┘
```

### 2. Feature-Based Organization

Code is organized by feature/entity rather than by type:

```
lib/
├── db/
│   └── queries/
│       ├── tasks.ts      # Task-related queries
│       ├── lists.ts      # List-related queries
│       └── labels.ts     # Label-related queries
├── store/
│   ├── task-store.ts     # Task state management
│   ├── list-store.ts     # List state management
│   └── label-store.ts    # Label state management
```

### 3. Separation of Concerns

- **Components**: Pure presentation, minimal logic
- **Stores**: State management and business logic
- **Queries**: Database access only
- **API Routes**: HTTP interface to stores/queries
- **Utilities**: Reusable helper functions

---

## Data Flow

### Task Creation Flow

```
User Input (TaskForm)
    ↓
Form Validation (Zod)
    ↓
Store Action (taskStore.addTask)
    ↓
API Call (POST /api/tasks)
    ↓
Database Query (createTask)
    ↓
SQLite INSERT
    ↓
Return New Task
    ↓
Update Store State
    ↓
React Re-render
    ↓
UI Updates
```

### Task Update Flow with Change Logging

```
User Edit (TaskDetail)
    ↓
Store Action (taskStore.updateTask)
    ↓
API Call (PATCH /api/tasks/[id])
    ↓
Database Transaction:
  1. UPDATE tasks
  2. INSERT change_logs
    ↓
Return Updated Task
    ↓
Update Store State
    ↓
React Re-render
```

### View Filtering Flow

```
User Navigates to View (e.g., /today)
    ↓
Page Component Loads
    ↓
Store Selector (getTodayTasks)
    ↓
Filter Logic:
  - Filter by date = today
  - Filter by completed (if hidden)
  - Sort by position
    ↓
Return Filtered Tasks
    ↓
TaskList Renders
```

---

## State Management

### Zustand Store Pattern

Each store follows this pattern:

```typescript
interface Store {
  // State
  items: Item[];
  selectedId: string | null;
  
  // Actions
  addItem: (input: ItemInput) => Promise<Item>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  loadItems: () => Promise<void>;
  
  // Computed Selectors
  getItemById: (id: string) => Item | undefined;
  getFilteredItems: (filter: Filter) => Item[];
}
```

### Store Implementation Details

**Task Store** (`lib/store/task-store.ts`):
- Manages all task state
- Provides computed selectors for views (Today, Upcoming, etc.)
- Handles task CRUD operations
- Creates change log entries on updates
- Manages subtask relationships

**List Store** (`lib/store/list-store.ts`):
- Manages list state
- Provides Inbox accessor
- Handles list CRUD operations
- Prevents deletion of default Inbox

**Label Store** (`lib/store/label-store.ts`):
- Manages label state
- Handles label CRUD operations
- Manages task-label associations

**UI Store** (`lib/store/ui-store.ts`):
- Manages UI preferences (theme, sidebar state)
- Persists theme to localStorage
- Manages search query state
- Controls completed task visibility

### Why Zustand?

1. **Minimal Boilerplate**: No providers, actions, or reducers
2. **TypeScript Support**: Excellent type inference
3. **Performance**: Only re-renders components that use changed state
4. **DevTools**: Works with Redux DevTools
5. **Simple API**: Easy to learn and use

---

## Database Layer

### Connection Management

**Singleton Pattern** (`lib/db/connection.ts`):

```typescript
let db: Database | null = null;

export function getDatabase(): Database {
  if (!db) {
    db = new Database(DATABASE_PATH);
    db.pragma('journal_mode = WAL'); // Write-Ahead Logging
    db.pragma('foreign_keys = ON');  // Enable foreign keys
  }
  return db;
}
```

**Why Singleton?**
- SQLite works best with a single connection
- Prevents "database is locked" errors
- Ensures consistent state across the app

### Query Organization

Queries are organized by entity in `lib/db/queries/`:

- `tasks.ts`: Task CRUD, filtering, subtask queries
- `lists.ts`: List CRUD
- `labels.ts`: Label CRUD, task-label associations
- `attachments.ts`: Attachment CRUD, file metadata
- `change-logs.ts`: Change history queries
- `reminders.ts`: Reminder CRUD
- `recurring-patterns.ts`: Recurring pattern CRUD

### Type Conversion

**Database ↔ TypeScript Conversion**:

```typescript
// Database uses snake_case
const row = {
  list_id: 'inbox',
  created_at: '2024-01-15T10:30:00.000Z',
  completed: 1
};

// TypeScript uses camelCase
const task: Task = {
  listId: 'inbox',
  createdAt: new Date('2024-01-15T10:30:00.000Z'),
  completed: true
};
```

Helper functions `rowToTask()` and `taskToRow()` handle conversions.

### Transactions

Critical operations use transactions for atomicity:

```typescript
const transaction = db.transaction((taskId, updates) => {
  // Update task
  updateTaskQuery.run(updates, taskId);
  
  // Create change log entries
  for (const change of changes) {
    createChangeLogQuery.run(change);
  }
});

transaction(taskId, updates);
```

---

## API Routes

### RESTful Structure

```
/api/tasks              GET (list), POST (create)
/api/tasks/[id]         GET (read), PATCH (update), DELETE (delete)
/api/tasks/[id]/labels  GET (list), POST (add), DELETE (remove)
/api/tasks/[id]/attachments  GET (list), POST (upload), DELETE (remove)
/api/tasks/[id]/change-logs  GET (list)
/api/lists              GET (list), POST (create)
/api/lists/[id]         GET (read), PATCH (update), DELETE (delete)
/api/labels             GET (list), POST (create)
/api/labels/[id]        GET (read), PATCH (update), DELETE (delete)
```

### API Route Pattern

```typescript
export async function GET(request: Request) {
  try {
    // 1. Parse query parameters
    // 2. Call database query function
    // 3. Return JSON response
    return Response.json(data);
  } catch (error) {
    // 4. Handle errors
    return Response.json({ error: message }, { status: 500 });
  }
}
```

### Error Handling

All API routes follow consistent error handling:

```typescript
try {
  // Operation
} catch (error) {
  console.error('Operation failed:', error);
  return Response.json(
    { error: 'User-friendly message' },
    { status: 500 }
  );
}
```

---

## Component Architecture

### Component Hierarchy

```
App Layout (layout.tsx)
├── ThemeProvider
├── KeyboardShortcutsProvider
└── AppInitializer
    ├── Sidebar
    │   ├── Navigation Links
    │   ├── Lists Section
    │   └── Labels Section
    ├── Header
    │   ├── Search
    │   └── Theme Toggle
    └── Main Content
        ├── Page (Inbox, Today, etc.)
        └── TaskList
            └── TaskItem[]
                └── TaskDetail (Dialog)
```

### Component Types

**Server Components** (default):
- Pages (`app/*/page.tsx`)
- Layouts (`app/layout.tsx`)
- Static content components

**Client Components** (`'use client'`):
- Interactive components (forms, buttons)
- Components using hooks (useState, useEffect)
- Components using Zustand stores
- Animation components (Framer Motion)

### Component Patterns

**Compound Components**:
```typescript
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

**Render Props**:
```typescript
<SearchResults
  results={results}
  renderItem={(result) => <TaskItem task={result.task} />}
/>
```

**Controlled Components**:
```typescript
<Input
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

---

## Complex Logic Explained

### 1. Recurring Task Generation

**Location**: `lib/utils/recurring.ts`

**How It Works**:

1. User completes a recurring task
2. `calculateNextOccurrence()` determines the next date based on pattern:
   - `daily`: Add 1 day
   - `weekly`: Add 7 days
   - `weekday`: Add 1 day, skip weekends
   - `monthly`: Add 1 month (same date)
   - `yearly`: Add 1 year (same date)
3. Check if next date is before `endDate` (if specified)
4. Create new task with same properties but new date
5. Original task is marked complete

**Edge Cases**:
- Weekday pattern skips Saturday/Sunday
- Monthly pattern handles month-end dates (e.g., Jan 31 → Feb 28)
- End date stops generation

### 2. Fuzzy Search

**Location**: `lib/utils/search.ts`

**How It Works**:

1. User types in search box (debounced 200ms)
2. Fuse.js performs fuzzy matching on task names and descriptions
3. Results include:
   - Matched tasks
   - Match score (0-1, lower is better)
   - Match indices (for highlighting)
4. Results sorted by score (best matches first)
5. Matching text highlighted in UI

**Configuration**:
```typescript
{
  threshold: 0.4,        // Match tolerance
  distance: 100,         // Max distance for match
  minMatchCharLength: 2, // Min chars to match
  keys: [
    { name: 'name', weight: 0.7 },        // Name more important
    { name: 'description', weight: 0.3 }  // Description less important
  ]
}
```

### 3. View Filtering

**Location**: `lib/store/task-store.ts`

**Today View**:
```typescript
getTodayTasks: () => {
  const today = startOfDay(new Date());
  return get().tasks.filter(task => 
    task.date && 
    startOfDay(task.date).getTime() === today.getTime()
  );
}
```

**Upcoming View**:
```typescript
getUpcomingTasks: () => {
  const today = startOfDay(new Date());
  return get().tasks.filter(task =>
    task.date &&
    startOfDay(task.date).getTime() >= today.getTime()
  ).sort((a, b) => 
    (a.date?.getTime() || 0) - (b.date?.getTime() || 0)
  );
}
```

**Next 7 Days View**:
```typescript
getNext7DaysTasks: () => {
  const today = startOfDay(new Date());
  const sevenDaysFromNow = addDays(today, 7);
  return get().tasks.filter(task =>
    task.date &&
    task.date >= today &&
    task.date <= sevenDaysFromNow
  );
}
```

**Overdue Tasks**:
```typescript
getOverdueTasks: () => {
  const today = startOfDay(new Date());
  return get().tasks.filter(task =>
    !task.completed &&
    task.deadline &&
    startOfDay(task.deadline) < today
  );
}
```

### 4. Change Log Creation

**Location**: `lib/store/task-store.ts` (createChangeLogEntries function)

**How It Works**:

1. Before updating a task, get the old task state
2. Compare each field in the update with the old value
3. For each changed field, create a change log entry:
   ```typescript
   {
     task_id: taskId,
     field: 'priority',
     old_value: 'low',
     new_value: 'high',
     changed_at: new Date().toISOString()
   }
   ```
4. Insert all change log entries in a transaction with the task update
5. Change history is displayed in reverse chronological order

**Tracked Fields**:
- name, description, listId
- date, deadline
- estimatedTime, actualTime
- priority, completed
- labels (added/removed)

### 5. Subtask Management

**Location**: `lib/db/queries/tasks.ts`, `lib/store/task-store.ts`

**How It Works**:

1. Subtasks are tasks with `parent_task_id` set
2. Self-referencing foreign key: `tasks.parent_task_id → tasks.id`
3. Cascade delete: Deleting parent deletes all subtasks
4. Subtask queries filter by `parent_task_id`
5. Parent shows subtask count and completion status

**Completion Tracking**:
```typescript
const subtasks = getSubtasks(parentId);
const completed = subtasks.filter(t => t.completed).length;
const total = subtasks.length;
// Display: "2/5 subtasks complete"
```

### 6. File Upload and Storage

**Location**: `lib/utils/file-storage.ts`, `app/api/tasks/[id]/attachments/route.ts`

**How It Works**:

1. User selects file or drags into upload area
2. File validated (type, size < 10MB)
3. Generate unique filename: `${taskId}-${timestamp}-${originalName}`
4. Save file to `attachments/` directory
5. Create database record with metadata:
   ```typescript
   {
     id: uuid(),
     task_id: taskId,
     file_name: originalName,
     file_path: uniqueFilename,
     file_size: bytes,
     mime_type: 'image/png'
   }
   ```
6. Return attachment metadata to client

**Download**:
1. GET `/api/attachments/[id]`
2. Read file from `attachments/` directory
3. Stream file to client with correct MIME type

**Delete**:
1. DELETE `/api/attachments/[id]`
2. Delete database record
3. Delete file from filesystem

---

## Performance Optimizations

### 1. Database Indexes

Indexes on frequently queried columns:
```sql
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

**Impact**: 10-100x faster queries on large datasets

### 2. Write-Ahead Logging (WAL)

```typescript
db.pragma('journal_mode = WAL');
```

**Benefits**:
- Concurrent reads while writing
- Faster writes
- Better crash recovery

### 3. Prepared Statements

```typescript
const getTasksStmt = db.prepare('SELECT * FROM tasks WHERE list_id = ?');
// Reuse statement multiple times
const tasks1 = getTasksStmt.all('inbox');
const tasks2 = getTasksStmt.all('work');
```

**Impact**: 2-5x faster than re-parsing SQL each time

### 4. React Optimizations

**Memoization**:
```typescript
const filteredTasks = useMemo(
  () => tasks.filter(/* complex filter */),
  [tasks, filterCriteria]
);
```

**Callback Memoization**:
```typescript
const handleClick = useCallback(
  () => updateTask(id, updates),
  [id, updates]
);
```

**Component Lazy Loading**:
```typescript
const TaskDetail = lazy(() => import('./task-detail'));
```

### 5. Debouncing

**Search Input**:
```typescript
const debouncedSearch = useMemo(
  () => debounce((query) => setSearchQuery(query), 200),
  []
);
```

**Auto-save**:
```typescript
const debouncedSave = useMemo(
  () => debounce((updates) => updateTask(id, updates), 300),
  [id]
);
```

### 6. Virtual Scrolling

For large task lists (100+ items), use react-window:
```typescript
<FixedSizeList
  height={600}
  itemCount={tasks.length}
  itemSize={60}
>
  {({ index, style }) => (
    <TaskItem task={tasks[index]} style={style} />
  )}
</FixedSizeList>
```

---

## Testing Strategy

### Unit Tests

**What to Test**:
- Store actions and selectors
- Utility functions (date formatting, recurring logic)
- Validation schemas
- Database query functions

**Example**:
```typescript
describe('calculateNextOccurrence', () => {
  it('should add 1 day for daily pattern', () => {
    const date = new Date('2024-01-15');
    const next = calculateNextOccurrence(date, 'daily');
    expect(next).toEqual(new Date('2024-01-16'));
  });
});
```

### Integration Tests

**What to Test**:
- Complete user flows (create → update → delete)
- View filtering logic
- Search functionality
- Recurring task generation

**Example**:
```typescript
describe('Task Creation Flow', () => {
  it('should create task and update store', async () => {
    const store = useTaskStore.getState();
    const task = await store.addTask({ name: 'Test', listId: 'inbox' });
    expect(store.tasks).toContainEqual(task);
  });
});
```

### Component Tests

**What to Test**:
- Component rendering with various props
- User interactions (clicks, form submissions)
- Conditional rendering
- Accessibility features

**Example**:
```typescript
describe('TaskItem', () => {
  it('should toggle completion on checkbox click', () => {
    render(<TaskItem task={mockTask} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(mockToggleComplete).toHaveBeenCalledWith(mockTask.id);
  });
});
```

### Test Coverage Goals

- Unit Tests: 80%+ coverage
- Integration Tests: Critical flows covered
- Component Tests: All interactive components
- E2E Tests: (Future) Main user journeys

---

## Best Practices

### 1. Type Safety

- Use strict TypeScript mode
- Define interfaces for all data models
- Use Zod for runtime validation
- Avoid `any` type

### 2. Error Handling

- Try-catch all async operations
- Display user-friendly error messages
- Log errors for debugging
- Graceful degradation

### 3. Performance

- Use indexes for database queries
- Memoize expensive computations
- Debounce user input
- Lazy load heavy components

### 4. Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Support keyboard navigation
- Test with screen readers
- Respect reduced motion preference

### 5. Code Organization

- Group by feature, not by type
- Keep components small and focused
- Extract reusable logic to hooks/utilities
- Use barrel exports (index.ts)

---

## Future Enhancements

### 1. Natural Language Processing

Parse task input like "Lunch with Sarah at 1 PM tomorrow":
- Extract date/time with Chrono.js
- Extract task name
- Auto-populate form fields

### 2. Cloud Sync

- Sync database to cloud storage
- Multi-device support
- Conflict resolution
- Offline-first with sync

### 3. Collaboration

- Shared lists
- Task assignment
- Comments and mentions
- Real-time updates

### 4. Smart Scheduling

- Analyze completion patterns
- Suggest optimal task times
- Consider estimated time and calendar
- Machine learning predictions

### 5. Mobile App

- React Native version
- Native notifications
- Offline-first architecture
- Platform-specific features

---

## Conclusion

This architecture provides a solid foundation for a fast, reliable, and maintainable task management application. The local-first approach ensures excellent performance and offline capability, while the clean separation of concerns makes the codebase easy to understand and extend.

Key strengths:
- Type-safe throughout
- Fast and responsive
- Offline-capable
- Well-tested
- Accessible
- Maintainable

For questions or clarifications, refer to the code comments, tests, and other documentation files.
