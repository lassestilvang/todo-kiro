import { getDatabase } from '../connection';

export interface Label {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all labels
 */
export function getAllLabels(): Label[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM labels ORDER BY name ASC').all() as Label[];
}

/**
 * Get label by ID
 */
export function getLabelById(id: string): Label | undefined {
  const db = getDatabase();
  const result = db.prepare('SELECT * FROM labels WHERE id = ?').get(id) as Label | null;
  return result ?? undefined;
}

/**
 * Create a new label
 */
export function createLabel(data: {
  name: string;
  icon: string;
  color: string;
}): Label {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO labels (id, name, icon, color, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, data.name, data.icon, data.color, now, now);

  return getLabelById(id)!;
}

/**
 * Update a label
 */
export function updateLabel(id: string, data: Partial<{
  name: string;
  icon: string;
  color: string;
}>): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.icon !== undefined) {
    updates.push('icon = ?');
    values.push(data.icon);
  }
  if (data.color !== undefined) {
    updates.push('color = ?');
    values.push(data.color);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.prepare(`UPDATE labels SET ${updates.join(', ')} WHERE id = ?`).run(...values);
}

/**
 * Delete a label
 */
export function deleteLabel(id: string): void {
  const db = getDatabase();
  db.prepare('DELETE FROM labels WHERE id = ?').run(id);
}
