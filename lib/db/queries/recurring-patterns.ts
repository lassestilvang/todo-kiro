import { getDatabase } from '../connection';
import type { RecurringPatternRow } from '@/types';

/**
 * Get recurring pattern for a task
 */
export function getRecurringPattern(taskId: string): RecurringPatternRow | null {
  const db = getDatabase();
  const row = db
    .prepare('SELECT * FROM recurring_patterns WHERE task_id = ?')
    .get(taskId) as any;
  
  if (!row) return null;

  // Convert Date objects to ISO strings for JSON serialization
  return {
    ...row,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    end_date: row.end_date instanceof Date ? row.end_date.toISOString() : row.end_date,
  };
}

/**
 * Create a recurring pattern for a task
 */
export function createRecurringPattern(data: {
  task_id: string;
  pattern: 'daily' | 'weekly' | 'weekday' | 'monthly' | 'yearly' | 'custom';
  custom_pattern?: string | null;
  end_date?: string | null;
}): RecurringPatternRow {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO recurring_patterns (id, task_id, pattern, custom_pattern, end_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.task_id,
    data.pattern,
    data.custom_pattern || null,
    data.end_date || null,
    now
  );

  return {
    id,
    task_id: data.task_id,
    pattern: data.pattern,
    custom_pattern: data.custom_pattern || null,
    end_date: data.end_date || null,
    created_at: now,
  };
}

/**
 * Update a recurring pattern
 */
export function updateRecurringPattern(
  taskId: string,
  updates: {
    pattern?: 'daily' | 'weekly' | 'weekday' | 'monthly' | 'yearly' | 'custom';
    custom_pattern?: string | null;
    end_date?: string | null;
  }
): void {
  const db = getDatabase();
  
  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.pattern !== undefined) {
    fields.push('pattern = ?');
    values.push(updates.pattern);
  }

  if (updates.custom_pattern !== undefined) {
    fields.push('custom_pattern = ?');
    values.push(updates.custom_pattern);
  }

  if (updates.end_date !== undefined) {
    fields.push('end_date = ?');
    values.push(updates.end_date);
  }

  if (fields.length === 0) {
    return;
  }

  values.push(taskId);

  db.prepare(`
    UPDATE recurring_patterns
    SET ${fields.join(', ')}
    WHERE task_id = ?
  `).run(...values);
}

/**
 * Delete recurring pattern for a task
 */
export function deleteRecurringPattern(taskId: string): void {
  const db = getDatabase();
  db.prepare('DELETE FROM recurring_patterns WHERE task_id = ?').run(taskId);
}

/**
 * Set or update recurring pattern for a task
 * If pattern is 'none', deletes the recurring pattern
 * Otherwise, creates or updates the recurring pattern
 */
export function setRecurringPattern(
  taskId: string,
  pattern: 'none' | 'daily' | 'weekly' | 'weekday' | 'monthly' | 'yearly' | 'custom',
  customPattern?: string | null,
  endDate?: string | null
): void {
  if (pattern === 'none') {
    deleteRecurringPattern(taskId);
    return;
  }

  const existing = getRecurringPattern(taskId);
  
  if (existing) {
    updateRecurringPattern(taskId, {
      pattern,
      custom_pattern: customPattern,
      end_date: endDate,
    });
  } else {
    createRecurringPattern({
      task_id: taskId,
      pattern,
      custom_pattern: customPattern,
      end_date: endDate,
    });
  }
}
