import { describe, test, expect } from 'bun:test';
import { isTaskOverdue, getOverdueCount } from '../tasks';
import { startOfDay, addDays } from 'date-fns';
import type { Task } from '@/types';

describe('Task Utilities', () => {
  const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: '1',
    name: 'Test Task',
    description: null,
    listId: 'list-1',
    date: null,
    deadline: null,
    estimatedTime: null,
    actualTime: null,
    priority: 'none',
    completed: false,
    completedAt: null,
    parentTaskId: null,
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('isTaskOverdue', () => {
    test('should return false for task without deadline', () => {
      const task = createMockTask({ deadline: null });
      expect(isTaskOverdue(task)).toBe(false);
    });

    test('should return false for completed task', () => {
      const yesterday = addDays(startOfDay(new Date()), -1);
      const task = createMockTask({
        deadline: yesterday,
        completed: true,
      });
      expect(isTaskOverdue(task)).toBe(false);
    });

    test('should return true for incomplete task with past deadline', () => {
      const yesterday = addDays(startOfDay(new Date()), -1);
      const task = createMockTask({
        deadline: yesterday,
        completed: false,
      });
      expect(isTaskOverdue(task)).toBe(true);
    });

    test('should return false for task with future deadline', () => {
      const tomorrow = addDays(startOfDay(new Date()), 1);
      const task = createMockTask({
        deadline: tomorrow,
        completed: false,
      });
      expect(isTaskOverdue(task)).toBe(false);
    });

    test('should return false for task with today deadline', () => {
      const today = startOfDay(new Date());
      const task = createMockTask({
        deadline: today,
        completed: false,
      });
      expect(isTaskOverdue(task)).toBe(false);
    });
  });

  describe('getOverdueCount', () => {
    test('should return 0 for empty task list', () => {
      expect(getOverdueCount([])).toBe(0);
    });

    test('should count only overdue tasks', () => {
      const yesterday = addDays(startOfDay(new Date()), -1);
      const tomorrow = addDays(startOfDay(new Date()), 1);

      const tasks = [
        createMockTask({ id: '1', deadline: yesterday, completed: false }),
        createMockTask({ id: '2', deadline: yesterday, completed: true }),
        createMockTask({ id: '3', deadline: tomorrow, completed: false }),
        createMockTask({ id: '4', deadline: null, completed: false }),
      ];

      expect(getOverdueCount(tasks)).toBe(1);
    });

    test('should return correct count for multiple overdue tasks', () => {
      const yesterday = addDays(startOfDay(new Date()), -1);
      const twoDaysAgo = addDays(startOfDay(new Date()), -2);

      const tasks = [
        createMockTask({ id: '1', deadline: yesterday, completed: false }),
        createMockTask({ id: '2', deadline: twoDaysAgo, completed: false }),
        createMockTask({ id: '3', deadline: yesterday, completed: false }),
      ];

      expect(getOverdueCount(tasks)).toBe(3);
    });
  });
});
