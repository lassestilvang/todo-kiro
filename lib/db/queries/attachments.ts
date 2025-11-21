import { getDatabase } from '../connection';
import type { AttachmentRow } from '@/types';

/**
 * Get all attachments for a task
 */
export function getTaskAttachments(taskId: string): AttachmentRow[] {
  const db = getDatabase();
  return db
    .prepare('SELECT * FROM attachments WHERE task_id = ? ORDER BY created_at DESC')
    .all(taskId) as AttachmentRow[];
}

/**
 * Get attachment by ID
 */
export function getAttachmentById(id: string): AttachmentRow | undefined {
  const db = getDatabase();
  const result = db
    .prepare('SELECT * FROM attachments WHERE id = ?')
    .get(id) as AttachmentRow | null;
  return result ?? undefined;
}

/**
 * Create a new attachment
 */
export function createAttachment(data: {
  task_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
}): AttachmentRow {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO attachments (id, task_id, file_name, file_path, file_size, mime_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.task_id,
    data.file_name,
    data.file_path,
    data.file_size,
    data.mime_type,
    now
  );

  return getAttachmentById(id)!;
}

/**
 * Delete an attachment
 */
export function deleteAttachment(id: string): void {
  const db = getDatabase();
  db.prepare('DELETE FROM attachments WHERE id = ?').run(id);
}

/**
 * Delete all attachments for a task
 */
export function deleteTaskAttachments(taskId: string): void {
  const db = getDatabase();
  db.prepare('DELETE FROM attachments WHERE task_id = ?').run(taskId);
}
