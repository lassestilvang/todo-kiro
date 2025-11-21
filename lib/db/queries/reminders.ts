import { getDatabase } from '../connection';
import type { ReminderRow } from '@/types';

/**
 * Get all reminders for a task
 */
export function getTaskReminders(taskId: string): ReminderRow[] {
  const db = getDatabase();
  return db
    .prepare('SELECT * FROM reminders WHERE task_id = ? ORDER BY reminder_time ASC')
    .all(taskId) as ReminderRow[];
}

/**
 * Get a reminder by ID
 */
export function getReminderById(id: string): ReminderRow | undefined {
  const db = getDatabase();
  const result = db.prepare('SELECT * FROM reminders WHERE id = ?').get(id) as ReminderRow | null;
  return result ?? undefined;
}

/**
 * Create a new reminder
 */
export function createReminder(data: {
  taskId: string;
  reminderTime: string;
}): ReminderRow {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO reminders (id, task_id, reminder_time, triggered, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, data.taskId, data.reminderTime, 0, now);

  return getReminderById(id)!;
}

/**
 * Delete a reminder
 */
export function deleteReminder(id: string): void {
  const db = getDatabase();
  db.prepare('DELETE FROM reminders WHERE id = ?').run(id);
}

/**
 * Delete all reminders for a task
 */
export function deleteTaskReminders(taskId: string): void {
  const db = getDatabase();
  db.prepare('DELETE FROM reminders WHERE task_id = ?').run(taskId);
}

/**
 * Update reminder triggered status
 */
export function updateReminderTriggered(id: string, triggered: boolean): void {
  const db = getDatabase();
  db.prepare('UPDATE reminders SET triggered = ? WHERE id = ?').run(triggered ? 1 : 0, id);
}

/**
 * Get all untriggered reminders that are due
 */
export function getDueReminders(): ReminderRow[] {
  const db = getDatabase();
  const now = new Date().toISOString();
  return db
    .prepare('SELECT * FROM reminders WHERE triggered = 0 AND reminder_time <= ? ORDER BY reminder_time ASC')
    .all(now) as ReminderRow[];
}
