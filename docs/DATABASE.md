# Database Schema Documentation

This document provides detailed information about the SQLite database schema used in the Daily Task Planner application.

## Overview

The application uses SQLite for local data persistence with the following characteristics:

- **Database File**: `database/tasks.db`
- **Driver**: better-sqlite3 (synchronous SQLite3 bindings)
- **Naming Convention**: Database columns use `snake_case`, TypeScript uses `camelCase`
- **Date Storage**: ISO 8601 strings (e.g., `2024-01-15T10:30:00.000Z`)
- **Boolean Storage**: Integers (0 = false, 1 = true)

## Tables

### lists

Stores task lists including the default Inbox and custom user-created lists.

```sql
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
```

**Columns**:
- `id` (TEXT, PRIMARY KEY): Unique identifier (UUID v4)
- `name` (TEXT, NOT NULL): Display name of the list
- `color` (TEXT, NOT NULL): Hex color code (e.g., `#3b82f6`)
- `emoji` (TEXT, NOT NULL): Emoji icon for the list
- `is_default` (INTEGER, NOT NULL): 1 if this is the Inbox, 0 otherwise
- `position` (INTEGER, NOT NULL): Sort order for display
- `created_at` (TEXT, NOT NULL): ISO 8601 timestamp
- `updated_at` (TEXT, NOT NULL): ISO 8601 timestamp

**Indexes**: None

**Default Data**:
```sql
INSERT INTO lists (id, name, color, emoji, is_default, position, created_at, updated_at)
VALUES ('inbox', 'Inbox', '#3b82f6', '📥', 1, 0, datetime('now'), datetime('now'));
```

---

### tasks

Stores all tasks with their properties and metadata.

```sql
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
```

**Columns**:
- `id` (TEXT, PRIMARY KEY): Unique identifier (UUID v4)
- `name` (TEXT, NOT NULL): Task title/name
- `description` (TEXT): Optional detailed description
- `list_id` (TEXT, NOT NULL): Foreign key to lists table
- `date` (TEXT): Scheduled date (ISO 8601)
- `deadline` (TEXT): Due date (ISO 8601)
- `estimated_time` (INTEGER): Estimated time in minutes
- `actual_time` (INTEGER): Actual time spent in minutes
- `priority` (TEXT, NOT NULL): One of: `high`, `medium`, `low`, `none`
- `completed` (INTEGER, NOT NULL): 0 = incomplete, 1 = complete
- `completed_at` (TEXT): Timestamp when task was completed
- `parent_task_id` (TEXT): Foreign key to tasks table for subtasks
- `position` (INTEGER, NOT NULL): Sort order within list
- `created_at` (TEXT, NOT NULL): ISO 8601 timestamp
- `updated_at` (TEXT, NOT NULL): ISO 8601 timestamp

**Indexes**:
```sql
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
```

**Foreign Keys**:
- `list_id` → `lists(id)` ON DELETE CASCADE
- `parent_task_id` → `tasks(id)` ON DELETE CASCADE

---

### labels

Stores custom labels that can be applied to tasks.

```sql
CREATE TABLE labels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**Columns**:
- `id` (TEXT, PRIMARY KEY): Unique identifier (UUID v4)
- `name` (TEXT, NOT NULL): Label name
- `icon` (TEXT, NOT NULL): Icon identifier (e.g., Lucide icon name)
- `color` (TEXT, NOT NULL): Hex color code
- `created_at` (TEXT, NOT NULL): ISO 8601 timestamp
- `updated_at` (TEXT, NOT NULL): ISO 8601 timestamp

**Indexes**: None

---

### task_labels

Junction table for many-to-many relationship between tasks and labels.

```sql
CREATE TABLE task_labels (
  task_id TEXT NOT NULL,
  label_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (task_id, label_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
);
```

**Columns**:
- `task_id` (TEXT, NOT NULL): Foreign key to tasks table
- `label_id` (TEXT, NOT NULL): Foreign key to labels table
- `created_at` (TEXT, NOT NULL): ISO 8601 timestamp

**Indexes**:
```sql
CREATE INDEX idx_task_labels_task_id ON task_labels(task_id);
CREATE INDEX idx_task_labels_label_id ON task_labels(label_id);
```

**Foreign Keys**:
- `task_id` → `tasks(id)` ON DELETE CASCADE
- `label_id` → `labels(id)` ON DELETE CASCADE

---

### reminders

Stores reminders associated with tasks.

```sql
CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  reminder_time TEXT NOT NULL,
  triggered INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

**Columns**:
- `id` (TEXT, PRIMARY KEY): Unique identifier (UUID v4)
- `task_id` (TEXT, NOT NULL): Foreign key to tasks table
- `reminder_time` (TEXT, NOT NULL): When to trigger reminder (ISO 8601)
- `triggered` (INTEGER, NOT NULL): 0 = not triggered, 1 = triggered
- `created_at` (TEXT, NOT NULL): ISO 8601 timestamp

**Indexes**: None

**Foreign Keys**:
- `task_id` → `tasks(id)` ON DELETE CASCADE

---

### recurring_patterns

Stores recurring patterns for tasks that repeat on a schedule.

```sql
CREATE TABLE recurring_patterns (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  pattern TEXT NOT NULL,
  custom_pattern TEXT,
  end_date TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

**Columns**:
- `id` (TEXT, PRIMARY KEY): Unique identifier (UUID v4)
- `task_id` (TEXT, NOT NULL): Foreign key to tasks table
- `pattern` (TEXT, NOT NULL): One of: `daily`, `weekly`, `weekday`, `monthly`, `yearly`, `custom`
- `custom_pattern` (TEXT): Custom pattern definition (for `pattern='custom'`)
- `end_date` (TEXT): When to stop recurring (ISO 8601)
- `created_at` (TEXT, NOT NULL): ISO 8601 timestamp

**Indexes**: None

**Foreign Keys**:
- `task_id` → `tasks(id)` ON DELETE CASCADE

---

### attachments

Stores metadata for files attached to tasks.

```sql
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
```

**Columns**:
- `id` (TEXT, PRIMARY KEY): Unique identifier (UUID v4)
- `task_id` (TEXT, NOT NULL): Foreign key to tasks table
- `file_name` (TEXT, NOT NULL): Original filename
- `file_path` (TEXT, NOT NULL): Path to file in `attachments/` directory
- `file_size` (INTEGER, NOT NULL): File size in bytes
- `mime_type` (TEXT, NOT NULL): MIME type (e.g., `image/png`)
- `created_at` (TEXT, NOT NULL): ISO 8601 timestamp

**Indexes**: None

**Foreign Keys**:
- `task_id` → `tasks(id)` ON DELETE CASCADE

**Note**: Actual files are stored in the `attachments/` directory on the filesystem.

---

### change_logs

Stores a history of all changes made to tasks.

```sql
CREATE TABLE change_logs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

**Columns**:
- `id` (TEXT, PRIMARY KEY): Unique identifier (UUID v4)
- `task_id` (TEXT, NOT NULL): Foreign key to tasks table
- `field` (TEXT, NOT NULL): Name of the field that changed
- `old_value` (TEXT): Previous value (JSON string for complex types)
- `new_value` (TEXT): New value (JSON string for complex types)
- `changed_at` (TEXT, NOT NULL): ISO 8601 timestamp

**Indexes**:
```sql
CREATE INDEX idx_change_logs_task_id ON change_logs(task_id);
```

**Foreign Keys**:
- `task_id` → `tasks(id)` ON DELETE CASCADE

---

## Relationships

### Entity Relationship Diagram

```
lists (1) ──────< (N) tasks
                       │
                       ├──< (N) task_labels >──< (N) labels
                       │
                       ├──< (N) reminders
                       │
                       ├──< (N) recurring_patterns
                       │
                       ├──< (N) attachments
                       │
                       ├──< (N) change_logs
                       │
                       └──< (N) tasks (subtasks)
```

### Relationship Details

1. **lists → tasks**: One-to-many
   - Each list can have many tasks
   - Each task belongs to exactly one list
   - Cascade delete: Deleting a list deletes all its tasks

2. **tasks → tasks**: One-to-many (self-referencing)
   - Each task can have many subtasks
   - Each subtask has one parent task
   - Cascade delete: Deleting a parent deletes all subtasks

3. **tasks ↔ labels**: Many-to-many (via task_labels)
   - Each task can have many labels
   - Each label can be applied to many tasks
   - Cascade delete: Deleting a task or label removes the association

4. **tasks → reminders**: One-to-many
   - Each task can have many reminders
   - Each reminder belongs to one task
   - Cascade delete: Deleting a task deletes all its reminders

5. **tasks → recurring_patterns**: One-to-one
   - Each task can have one recurring pattern
   - Each pattern belongs to one task
   - Cascade delete: Deleting a task deletes its pattern

6. **tasks → attachments**: One-to-many
   - Each task can have many attachments
   - Each attachment belongs to one task
   - Cascade delete: Deleting a task deletes attachment records (files remain)

7. **tasks → change_logs**: One-to-many
   - Each task can have many change log entries
   - Each log entry belongs to one task
   - Cascade delete: Deleting a task deletes its history

---

## Data Type Conversions

### Database → TypeScript

The application uses helper functions to convert between database rows and TypeScript objects:

```typescript
// Database uses snake_case
const row = {
  id: 'abc123',
  list_id: 'inbox',
  created_at: '2024-01-15T10:30:00.000Z',
  completed: 1
};

// TypeScript uses camelCase
const task: Task = {
  id: 'abc123',
  listId: 'inbox',
  createdAt: new Date('2024-01-15T10:30:00.000Z'),
  completed: true
};
```

### Type Mapping

| Database Type | TypeScript Type | Notes |
|--------------|----------------|-------|
| TEXT | string | Direct mapping |
| INTEGER | number | Direct mapping |
| INTEGER (boolean) | boolean | 0 → false, 1 → true |
| TEXT (date) | Date | ISO 8601 string → Date object |
| TEXT (enum) | union type | e.g., `'high' \| 'medium' \| 'low' \| 'none'` |

---

## Queries

### Common Query Patterns

**Get all tasks for a list**:
```sql
SELECT * FROM tasks 
WHERE list_id = ? AND completed = 0 
ORDER BY position ASC;
```

**Get today's tasks**:
```sql
SELECT * FROM tasks 
WHERE date(date) = date('now') 
ORDER BY position ASC;
```

**Get tasks with a specific label**:
```sql
SELECT t.* FROM tasks t
INNER JOIN task_labels tl ON t.id = tl.task_id
WHERE tl.label_id = ?
ORDER BY t.position ASC;
```

**Get subtasks for a task**:
```sql
SELECT * FROM tasks 
WHERE parent_task_id = ? 
ORDER BY position ASC;
```

**Get change history for a task**:
```sql
SELECT * FROM change_logs 
WHERE task_id = ? 
ORDER BY changed_at DESC;
```

---

## Migrations

The database schema is initialized automatically on first run. Future schema changes should be handled through the migration system in `lib/db/migrations.ts`.

### Migration Pattern

```typescript
export const migrations = [
  {
    version: 1,
    up: (db: Database) => {
      // Initial schema creation
    }
  },
  {
    version: 2,
    up: (db: Database) => {
      // Add new column or table
      db.exec('ALTER TABLE tasks ADD COLUMN new_field TEXT;');
    }
  }
];
```

---

## Performance Considerations

### Indexes

Indexes are created on frequently queried columns:
- `tasks.list_id` - For filtering by list
- `tasks.date` - For date-based views
- `tasks.deadline` - For overdue calculations
- `tasks.completed` - For filtering completed tasks
- `tasks.parent_task_id` - For subtask queries
- `task_labels.task_id` - For label lookups
- `task_labels.label_id` - For reverse label lookups
- `change_logs.task_id` - For change history

### Query Optimization

- Use prepared statements for repeated queries
- Limit result sets where appropriate
- Use indexes for WHERE and ORDER BY clauses
- Avoid SELECT * in production code (specify columns)

### Database Size

Typical database sizes:
- Empty database: ~100 KB
- 1,000 tasks: ~500 KB - 1 MB
- 10,000 tasks: ~5-10 MB

SQLite handles databases up to 281 TB, so size is not a concern for typical usage.

---

## Backup and Recovery

### Manual Backup

```bash
# Copy the database file
cp database/tasks.db database/tasks.db.backup

# Or use SQLite backup command
sqlite3 database/tasks.db ".backup database/tasks.db.backup"
```

### Restore from Backup

```bash
# Replace current database with backup
cp database/tasks.db.backup database/tasks.db
```

### Export to SQL

```bash
sqlite3 database/tasks.db .dump > backup.sql
```

### Import from SQL

```bash
sqlite3 database/tasks.db < backup.sql
```

---

## Troubleshooting

### Database Locked

If you see "database is locked" errors:
- Ensure only one process is accessing the database
- Check for long-running transactions
- Restart the application

### Corrupted Database

If the database becomes corrupted:
1. Stop the application
2. Delete `database/tasks.db`, `database/tasks.db-shm`, `database/tasks.db-wal`
3. Restart the application (database will be recreated)
4. Restore from backup if available

### Schema Mismatch

If you see schema-related errors:
1. Check the migration version
2. Delete the database and let it reinitialize
3. Or manually run missing migrations

---

## References

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [SQLite Data Types](https://www.sqlite.org/datatype3.html)
- [SQLite Foreign Keys](https://www.sqlite.org/foreignkeys.html)
