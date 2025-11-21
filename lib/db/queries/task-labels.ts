import { getDatabase } from '../connection';
import type { Label } from './labels';

export interface TaskLabel {
  task_id: string;
  label_id: string;
  created_at: string;
}

/**
 * Get all labels for a task
 */
export function getTaskLabels(taskId: string): Label[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT l.* FROM labels l
    INNER JOIN task_labels tl ON l.id = tl.label_id
    WHERE tl.task_id = ?
    ORDER BY l.name ASC
  `).all(taskId) as Label[];
}

/**
 * Get all tasks for a label
 */
export function getTasksByLabelId(labelId: string): string[] {
  const db = getDatabase();
  const results = db.prepare('SELECT task_id FROM task_labels WHERE label_id = ?').all(labelId) as { task_id: string }[];
  return results.map(r => r.task_id);
}

/**
 * Add a label to a task
 */
export function addLabelToTask(taskId: string, labelId: string): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO task_labels (task_id, label_id, created_at)
      VALUES (?, ?, ?)
    `).run(taskId, labelId, now);
  } catch (error) {
    // Ignore duplicate key errors (label already assigned)
    if (!(error instanceof Error && error.message.includes('UNIQUE constraint failed'))) {
      throw error;
    }
  }
}

/**
 * Remove a label from a task
 */
export function removeLabelFromTask(taskId: string, labelId: string): void {
  const db = getDatabase();
  db.prepare('DELETE FROM task_labels WHERE task_id = ? AND label_id = ?').run(taskId, labelId);
}

/**
 * Remove all labels from a task
 */
export function removeAllLabelsFromTask(taskId: string): void {
  const db = getDatabase();
  db.prepare('DELETE FROM task_labels WHERE task_id = ?').run(taskId);
}

/**
 * Set labels for a task (replaces all existing labels)
 */
export function setTaskLabels(taskId: string, labelIds: string[]): void {
  const db = getDatabase();
  
  // Use a transaction for atomicity
  const transaction = db.transaction(() => {
    // Remove all existing labels
    removeAllLabelsFromTask(taskId);
    
    // Add new labels
    for (const labelId of labelIds) {
      addLabelToTask(taskId, labelId);
    }
  });

  transaction();
}
