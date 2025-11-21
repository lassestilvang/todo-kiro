import { getDatabase } from './connection';

/**
 * Create all database tables
 */
export function createSchema(): void {
  const db = getDatabase();

  // Lists table
  db.exec(`
    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      emoji TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
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
    )
  `);

  // Labels table
  db.exec(`
    CREATE TABLE IF NOT EXISTS labels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Task-Label junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_labels (
      task_id TEXT NOT NULL,
      label_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (task_id, label_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
    )
  `);

  // Reminders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      reminder_time TEXT NOT NULL,
      triggered INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `);

  // Recurring patterns table
  db.exec(`
    CREATE TABLE IF NOT EXISTS recurring_patterns (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      pattern TEXT NOT NULL,
      custom_pattern TEXT,
      end_date TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `);

  // Attachments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `);

  // Change logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS change_logs (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      field TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      changed_at TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `);
}

/**
 * Create indexes for performance optimization
 */
export function createIndexes(): void {
  const db = getDatabase();

  // Indexes for tasks table
  db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks(list_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id)');

  // Indexes for task_labels junction table
  db.exec('CREATE INDEX IF NOT EXISTS idx_task_labels_task_id ON task_labels(task_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_task_labels_label_id ON task_labels(label_id)');

  // Index for change_logs table
  db.exec('CREATE INDEX IF NOT EXISTS idx_change_logs_task_id ON change_logs(task_id)');
}

/**
 * Seed default data
 */
export function seedDefaultData(): void {
  const db = getDatabase();

  // Check if Inbox list already exists
  const existingInbox = db.prepare('SELECT COUNT(*) as count FROM lists WHERE is_default = 1').get() as { count: number };
  
  if (existingInbox.count === 0) {
    // Create default Inbox list
    const inboxId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO lists (id, name, color, emoji, is_default, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(inboxId, 'Inbox', '#3b82f6', '📥', 1, 0, now, now);
    
    console.log('Default Inbox list created');
  }
}
