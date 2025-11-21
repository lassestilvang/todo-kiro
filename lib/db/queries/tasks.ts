import { getDatabase } from '../connection';

export interface Task {
  id: string;
  name: string;
  description: string | null;
  list_id: string;
  date: string | null;
  deadline: string | null;
  estimated_time: number | null;
  actual_time: number | null;
  priority: 'high' | 'medium' | 'low' | 'none';
  completed: number;
  completed_at: string | null;
  parent_task_id: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get all tasks
 */
export function getAllTasks(): Task[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM tasks ORDER BY position ASC').all() as Task[];
}

/**
 * Get task by ID
 */
export function getTaskById(id: string): Task | undefined {
  const db = getDatabase();
  const result = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | null;
  return result ?? undefined;
}

/**
 * Get tasks by list ID
 */
export function getTasksByListId(listId: string): Task[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM tasks WHERE list_id = ? ORDER BY position ASC').all(listId) as Task[];
}

/**
 * Get tasks by parent task ID (subtasks)
 */
export function getSubtasks(parentTaskId: string): Task[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM tasks WHERE parent_task_id = ? ORDER BY position ASC').all(parentTaskId) as Task[];
}

/**
 * Get tasks by date
 */
export function getTasksByDate(date: string): Task[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM tasks WHERE date = ? ORDER BY position ASC').all(date) as Task[];
}

/**
 * Get tasks by date range
 */
export function getTasksByDateRange(startDate: string, endDate: string): Task[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM tasks WHERE date >= ? AND date <= ? ORDER BY date ASC, position ASC').all(startDate, endDate) as Task[];
}

/**
 * Get full task objects by label ID
 */
export function getTasksWithLabelId(labelId: string): Task[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT t.* FROM tasks t
    INNER JOIN task_labels tl ON t.id = tl.task_id
    WHERE tl.label_id = ?
    ORDER BY t.position ASC
  `).all(labelId) as Task[];
}

/**
 * Get overdue tasks
 */
export function getOverdueTasks(): Task[] {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0] as string;
  return db.prepare('SELECT * FROM tasks WHERE deadline < ? AND completed = 0 ORDER BY deadline ASC').all(today) as Task[];
}

/**
 * Create a new task
 */
export function createTask(data: {
  name: string;
  description?: string | null;
  list_id: string;
  date?: string | null;
  deadline?: string | null;
  estimated_time?: number | null;
  actual_time?: number | null;
  priority?: 'high' | 'medium' | 'low' | 'none';
  parent_task_id?: string | null;
  position: number;
}): Task {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO tasks (
      id, name, description, list_id, date, deadline, estimated_time, actual_time,
      priority, completed, completed_at, parent_task_id, position, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name,
    data.description ?? null,
    data.list_id,
    data.date ?? null,
    data.deadline ?? null,
    data.estimated_time ?? null,
    data.actual_time ?? null,
    data.priority ?? 'none',
    0,
    null,
    data.parent_task_id ?? null,
    data.position,
    now,
    now
  );

  return getTaskById(id)!;
}

/**
 * Update a task
 */
export function updateTask(id: string, data: Partial<{
  name: string;
  description: string | null;
  list_id: string;
  date: string | null;
  deadline: string | null;
  estimated_time: number | null;
  actual_time: number | null;
  priority: 'high' | 'medium' | 'low' | 'none';
  completed: number;
  completed_at: string | null;
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
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.list_id !== undefined) {
    updates.push('list_id = ?');
    values.push(data.list_id);
  }
  if (data.date !== undefined) {
    updates.push('date = ?');
    values.push(data.date);
  }
  if (data.deadline !== undefined) {
    updates.push('deadline = ?');
    values.push(data.deadline);
  }
  if (data.estimated_time !== undefined) {
    updates.push('estimated_time = ?');
    values.push(data.estimated_time);
  }
  if (data.actual_time !== undefined) {
    updates.push('actual_time = ?');
    values.push(data.actual_time);
  }
  if (data.priority !== undefined) {
    updates.push('priority = ?');
    values.push(data.priority);
  }
  if (data.completed !== undefined) {
    updates.push('completed = ?');
    values.push(data.completed);
    
    // Set completed_at when marking as completed
    if (data.completed === 1) {
      updates.push('completed_at = ?');
      values.push(now);
    } else {
      updates.push('completed_at = ?');
      values.push(null);
    }
  }
  if (data.position !== undefined) {
    updates.push('position = ?');
    values.push(data.position);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);
}

/**
 * Delete a task
 */
export function deleteTask(id: string): void {
  const db = getDatabase();
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  db.prepare('DELETE FROM tasks WHERE parent_task_id = ?').run(id);
}

/**
 * Toggle task completion status
 */
export function toggleTaskComplete(id: string): void {
  const task = getTaskById(id);
  
  if (!task) return;

  const newCompleted = task.completed === 1 ? 0 : 1;
  updateTask(id, { completed: newCompleted });
}
