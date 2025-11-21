import { getDatabase } from '../connection';

export interface List {
  id: string;
  name: string;
  color: string;
  emoji: string;
  is_default: number;
  position: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get all lists
 */
export function getAllLists(): List[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM lists ORDER BY position ASC').all() as List[];
}

/**
 * Get list by ID
 */
export function getListById(id: string): List | undefined {
  const db = getDatabase();
  const result = db.prepare('SELECT * FROM lists WHERE id = ?').get(id) as List | null;
  return result ?? undefined;
}

/**
 * Get the default Inbox list
 */
export function getInboxList(): List | undefined {
  const db = getDatabase();
  const result = db.prepare('SELECT * FROM lists WHERE is_default = 1').get() as List | null;
  return result ?? undefined;
}

/**
 * Create a new list
 */
export function createList(data: {
  name: string;
  color: string;
  emoji: string;
  position: number;
}): List {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO lists (id, name, color, emoji, is_default, position, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.name, data.color, data.emoji, 0, data.position, now, now);

  return getListById(id)!;
}

/**
 * Update a list
 */
export function updateList(id: string, data: Partial<{
  name: string;
  color: string;
  emoji: string;
  position: number;
}>): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.color !== undefined) {
    updates.push('color = ?');
    values.push(data.color);
  }
  if (data.emoji !== undefined) {
    updates.push('emoji = ?');
    values.push(data.emoji);
  }
  if (data.position !== undefined) {
    updates.push('position = ?');
    values.push(data.position);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.prepare(`UPDATE lists SET ${updates.join(', ')} WHERE id = ?`).run(...values);
}

/**
 * Delete a list
 */
export function deleteList(id: string): void {
  const db = getDatabase();
  
  // Prevent deletion of default Inbox list
  const list = getListById(id);
  if (list?.is_default === 1) {
    throw new Error('Cannot delete the default Inbox list');
  }

  db.prepare('DELETE FROM lists WHERE id = ?').run(id);
}
