import { startOfDay, isBefore } from 'date-fns';
import type { Task } from '@/types';

/**
 * Check if a task is overdue
 * A task is overdue if:
 * - It has a deadline
 * - It is not completed
 * - The deadline is before today
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.deadline) return false;
  if (task.completed) return false;
  
  const today = startOfDay(new Date());
  const deadlineDate = startOfDay(task.deadline);
  
  return isBefore(deadlineDate, today);
}

/**
 * Get count of overdue tasks from a list of tasks
 */
export function getOverdueCount(tasks: Task[]): number {
  return tasks.filter(task => isTaskOverdue(task)).length;
}
