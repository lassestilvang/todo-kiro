# Design Document

## Overview

The Daily Task Planner is a modern web application built with Next.js 16 (App Router), TypeScript, and Tailwind CSS. The architecture follows a client-side state management pattern using Zustand, with local SQLite database for persistence. The application uses a split-view layout with a sidebar for navigation and a main panel for task display and interaction.

The design emphasizes performance, type safety, and user experience with smooth animations, real-time feedback, and responsive design patterns. The application supports both light and dark themes with system preference detection.

## Architecture

### Technology Stack

- **Framework**: Next.js 16 with App Router
- **Runtime**: Bun (package manager and test runner)
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui component library
- **Animations**: Framer Motion for component animations, View Transition API for page transitions
- **State Management**: Zustand for global state
- **Database**: SQLite (better-sqlite3) for local data persistence
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation
- **Search**: Fuse.js for fuzzy search implementation
- **Testing**: Bun Test for unit and integration tests

### Application Structure

```
daily-task-planner/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with theme provider
│   │   ├── page.tsx            # Home page (redirects to inbox)
│   │   ├── inbox/              # Inbox view
│   │   ├── today/              # Today view
│   │   ├── upcoming/           # Upcoming view
│   │   ├── next-7-days/        # Next 7 days view
│   │   ├── all/                # All tasks view
│   │   └── list/[id]/          # Custom list view
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components (Sidebar, Header)
│   │   ├── task/               # Task-related components
│   │   ├── list/               # List management components
│   │   └── search/             # Search components
│   ├── lib/                    # Utility functions and configurations
│   │   ├── db/                 # Database setup and queries
│   │   ├── store/              # Zustand stores
│   │   ├── utils/              # Helper functions
│   │   └── validations/        # Zod schemas
│   ├── types/                  # TypeScript type definitions
│   └── hooks/                  # Custom React hooks
├── public/                     # Static assets
├── tests/                      # Test files
└── database/                   # SQLite database file location
```

## Components and Interfaces

### Core Data Models

#### Task Model

```typescript
interface Task {
  id: string;
  name: string;
  description: string | null;
  listId: string;
  date: Date | null;
  deadline: Date | null;
  estimatedTime: number | null; // in minutes
  actualTime: number | null; // in minutes
  priority: 'high' | 'medium' | 'low' | 'none';
  completed: boolean;
  completedAt: Date | null;
  parentTaskId: string | null;
  position: number; // for ordering
  createdAt: Date;
  updatedAt: Date;
}
```

#### List Model

```typescript
interface List {
  id: string;
  name: string;
  color: string; // hex color code
  emoji: string;
  isDefault: boolean; // true for Inbox
  position: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Label Model

```typescript
interface Label {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### TaskLabel (Junction Table)

```typescript
interface TaskLabel {
  taskId: string;
  labelId: string;
  createdAt: Date;
}
```

#### Reminder Model

```typescript
interface Reminder {
  id: string;
  taskId: string;
  reminderTime: Date;
  triggered: boolean;
  createdAt: Date;
}
```

#### RecurringPattern Model

```typescript
interface RecurringPattern {
  id: string;
  taskId: string;
  pattern: 'daily' | 'weekly' | 'weekday' | 'monthly' | 'yearly' | 'custom';
  customPattern: string | null; // cron-like pattern for custom
  endDate: Date | null;
  createdAt: Date;
}
```

#### Attachment Model

```typescript
interface Attachment {
  id: string;
  taskId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}
```

#### ChangeLog Model

```typescript
interface ChangeLog {
  id: string;
  taskId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedAt: Date;
}
```

### Database Schema

```sql
-- Lists table
CREATE TABLE lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  emoji TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Tasks table
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  list_id TEXT NOT NULL,
  date TEXT,
  deadline TEXT,
  estimated_time INTEGER,
  actual_time INTEGER,
  priority TEXT NOT NULL DEFAULT 'none',
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  parent_task_id TEXT,
  position INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Labels table
CREATE TABLE labels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Task-Label junction table
CREATE TABLE task_labels (
  task_id TEXT NOT NULL,
  label_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (task_id, label_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
);

-- Reminders table
CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  reminder_time TEXT NOT NULL,
  triggered INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Recurring patterns table
CREATE TABLE recurring_patterns (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  pattern TEXT NOT NULL,
  custom_pattern TEXT,
  end_date TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Attachments table
CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Change logs table
CREATE TABLE change_logs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_task_labels_task_id ON task_labels(task_id);
CREATE INDEX idx_task_labels_label_id ON task_labels(label_id);
CREATE INDEX idx_change_logs_task_id ON change_logs(task_id);
```

### State Management (Zustand)

#### Task Store

```typescript
interface TaskStore {
  tasks: Task[];
  selectedTaskId: string | null;
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  selectTask: (id: string | null) => void;
  loadTasks: () => Promise<void>;
  
  // Computed
  getTasksByList: (listId: string) => Task[];
  getTasksByLabel: (labelId: string) => Task[];
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getNext7DaysTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getSubtasks: (parentId: string) => Task[];
}
```

#### List Store

```typescript
interface ListStore {
  lists: List[];
  
  // Actions
  addList: (list: Omit<List, 'id' | 'createdAt' | 'updatedAt'>) => Promise<List>;
  updateList: (id: string, updates: Partial<List>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  loadLists: () => Promise<void>;
  
  // Computed
  getInbox: () => List | undefined;
}
```

#### Label Store

```typescript
interface LabelStore {
  labels: Label[];
  
  // Actions
  addLabel: (label: Omit<Label, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Label>;
  updateLabel: (id: string, updates: Partial<Label>) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
  loadLabels: () => Promise<void>;
}
```

#### UI Store

```typescript
interface UIStore {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  showCompletedTasks: boolean;
  searchQuery: string;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  toggleShowCompleted: () => void;
  setSearchQuery: (query: string) => void;
}
```

### Key Components

#### Sidebar Component

Displays navigation with lists, views, and labels. Includes:
- Quick add task button
- Search input
- View links (Inbox, Today, Upcoming, Next 7 Days, All)
- Custom lists section
- Labels section
- Overdue badge count

#### TaskList Component

Displays tasks in the main panel with:
- Task items with checkbox, name, priority indicator
- Date/deadline badges
- Label chips
- Subtask count indicator
- Click to expand/edit
- Drag-and-drop reordering

#### TaskDetail Component

Modal or side panel showing full task details:
- All task properties
- Subtask list with add/remove
- Label management
- Attachment upload/display
- Change history tab
- Delete task action

#### TaskForm Component

Form for creating/editing tasks with:
- Name input (required)
- Description textarea
- Date picker
- Deadline picker
- Time estimate input (HH:mm format)
- Priority selector
- Label multi-select
- Recurring pattern selector
- Reminder configuration
- Attachment upload

#### SearchResults Component

Displays fuzzy search results with:
- Highlighted matching text
- Task metadata (list, date, labels)
- Click to navigate to task

## Data Flow

### Task Creation Flow

1. User clicks "Add Task" or presses keyboard shortcut
2. TaskForm component opens with empty state
3. User fills in task details and submits
4. Form validation runs (Zod schema)
5. If valid, Zustand action `addTask` is called
6. Database INSERT operation executes
7. New task is added to Zustand store
8. UI updates reactively
9. Success feedback shown to user

### Task Update Flow

1. User modifies task property
2. Change is debounced (300ms)
3. Zustand action `updateTask` is called
4. Database UPDATE operation executes
5. Change log entry is created
6. Task in Zustand store is updated
7. UI updates reactively

### View Filtering Flow

1. User navigates to a view (e.g., Today)
2. Route changes to `/today`
3. Page component loads
4. Computed selector from TaskStore is called (e.g., `getTodayTasks`)
5. Filtered tasks are returned
6. TaskList component renders filtered tasks
7. View Transition API animates the change

### Search Flow

1. User types in search input
2. Input is debounced (200ms)
3. UIStore `setSearchQuery` action updates query
4. Fuse.js performs fuzzy search on tasks
5. SearchResults component displays matches
6. User clicks result
7. Navigation to task detail occurs

## Error Handling

### Database Errors

- All database operations wrapped in try-catch blocks
- Failed operations trigger error toast notifications
- Errors logged to console for debugging
- Optimistic UI updates rolled back on failure

### Validation Errors

- Zod schemas validate all form inputs
- Field-level error messages displayed inline
- Form submission blocked until all errors resolved
- Clear, actionable error messages

### Network Errors

- Not applicable for local-only application
- Future consideration for sync features

### Graceful Degradation

- View Transition API: Falls back to instant navigation if unsupported
- Service Worker: Optional enhancement for offline support
- Local storage: Fallback for theme preference if needed

## Testing Strategy

### Unit Tests

- Test all Zustand store actions and selectors
- Test utility functions (date formatting, time parsing, etc.)
- Test validation schemas
- Test database query functions in isolation
- Target: 80% code coverage

### Integration Tests

- Test complete user flows (create task, update task, delete task)
- Test view filtering logic
- Test search functionality
- Test recurring task generation
- Test change log creation

### Component Tests

- Test component rendering with various props
- Test user interactions (clicks, form submissions)
- Test conditional rendering
- Test accessibility features

### E2E Tests (Future)

- Consider Playwright for critical user journeys
- Not included in initial implementation

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns (list_id, date, deadline)
- Prepared statements for repeated queries
- Batch operations where possible
- Connection pooling (single connection for better-sqlite3)

### React Optimization

- Memoization of expensive computations (useMemo)
- Callback memoization (useCallback)
- Component lazy loading for modals
- Virtual scrolling for large task lists (react-window)

### Bundle Optimization

- Code splitting by route
- Dynamic imports for heavy components
- Tree shaking enabled
- Minimal external dependencies

### Animation Performance

- CSS transforms for animations (GPU-accelerated)
- RequestAnimationFrame for smooth animations
- Reduced motion support for accessibility

## Accessibility

- Semantic HTML elements
- ARIA labels and roles where needed
- Keyboard navigation support
- Focus management for modals
- Color contrast compliance (WCAG AA)
- Screen reader testing
- Reduced motion preference support

## Security Considerations

- Input sanitization for all user inputs
- SQL injection prevention (parameterized queries)
- XSS prevention (React's built-in escaping)
- File upload validation (type, size limits)
- No sensitive data stored (local-only app)

## Future Enhancements

### Natural Language Processing

- Parse task input like "Lunch with Sarah at 1 PM tomorrow"
- Extract date, time, and task name automatically
- Use library like Chrono.js for date parsing

### Smart Scheduling

- Analyze task completion patterns
- Suggest optimal times for tasks
- Consider estimated time and available time slots
- Machine learning model for predictions

### Sync and Backup

- Cloud sync for multi-device access
- Export/import functionality
- Automatic backups

### Collaboration

- Shared lists
- Task assignment
- Comments and mentions

### Mobile App

- React Native version
- Native notifications
- Offline-first architecture
