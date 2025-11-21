import { getDatabase } from '../connection';

export interface ChangeLog {
  id: string;
  task_id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
}

/**
 * Get all change logs for a task
 */
export function getTaskChangeLogs(taskId: string): ChangeLog[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM change_logs WHERE task_id = ? ORDER BY changed_at DESC').all(taskId) as ChangeLog[];
}

/**
 * Create a change log entry
 */
export function createChangeLog(data: {
  task_id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
}): ChangeLog {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO change_logs (id, task_id, field, old_value, new_value, changed_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, data.task_id, data.field, data.old_value, data.new_value, now);

  return {
    id,
    task_id: data.task_id,
    field: data.field,
    old_value: data.old_value,
    new_value: data.new_value,
    changed_at: now,
  };
}

/**
 * Create multiple change log entries (for batch updates)
 */
export function createChangeLogs(entries: Array<{
  task_id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
}>): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    const stmt = db.prepare(`
      INSERT INTO change_logs (id, task_id, field, old_value, new_value, changed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const entry of entries) {
      const id = crypto.randomUUID();
      stmt.run(id, entry.task_id, entry.field, entry.old_value, entry.new_value, now);
    }
  });

  transaction();
}

/**
 * Delete all change logs for a task
 */
export function deleteTaskChangeLogs(taskId: string): void {
  const db = getDatabase();
  db.prepare('DELETE FROM change_logs WHERE task_id = ?').run(taskId);
}
