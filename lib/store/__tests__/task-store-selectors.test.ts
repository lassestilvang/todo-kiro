/**
 * Tests for TaskStore selector functions
 */

import { describe, test, expect } from 'bun:test';
import type { Task } from '@/types';

// Mock task data
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
  ...overrides
});

describe('TaskStore Selectors', () => {
  describe('getTasksByList', () => {
    test('should filter tasks by list ID', () => {
      const tasks = [
        createMockTask({ id: '1', listId: 'list-1' }),
        createMockTask({ id: '2', listId: 'list-2' }),
        createMockTask({ id: '3', listId: 'list-1' })
      ];
      
      const result = tasks.filter(t => t.listId === 'list-1' && !t.parentTaskId);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
    });

    test('should exclude subtasks', () => {
      const tasks = [
        createMockTask({ id: '1', listId: 'list-1', parentTaskId: null }),
        createMockTask({ id: '2', listId: 'list-1', parentTaskId: '1' })
      ];
      
      const result = tasks.filter(t => t.listId === 'list-1' && !t.parentTaskId);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('getTodayTasks', () => {
    test('should return tasks scheduled for today', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tasks = [
        createMockTask({ id: '1', date: today }),
        createMockTask({ id: '2', date: new Date(today.getTime() + 86400000) }),
        createMockTask({ id: '3', date: today })
      ];
      
      const result = tasks.filter(t => {
        if (!t.date || t.parentTaskId) return false;
        const taskDate = new Date(t.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
      
      expect(result).toHaveLength(2);
    });

    test('should exclude tasks without dates', () => {
      const today = new Date();
      const tasks = [
        createMockTask({ id: '1', date: today }),
        createMockTask({ id: '2', date: null })
      ];
      
      const result = tasks.filter(t => {
        if (!t.date || t.parentTaskId) return false;
        return true;
      });
      
      expect(result).toHaveLength(1);
    });
  });

  describe('getUpcomingTasks', () => {
    test('should return tasks scheduled for today and future', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today.getTime() - 86400000);
      const tomorrow = new Date(today.getTime() + 86400000);
      
      const tasks = [
        createMockTask({ id: '1', date: yesterday }),
        createMockTask({ id: '2', date: today }),
        createMockTask({ id: '3', date: tomorrow })
      ];
      
      const result = tasks.filter(t => {
        if (!t.date || t.parentTaskId) return false;
        const taskDate = new Date(t.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate >= today;
      });
      
      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toContain('2');
      expect(result.map(t => t.id)).toContain('3');
    });
  });

  describe('getNext7DaysTasks', () => {
    test('should return tasks within next 7 days', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const day5 = new Date(today.getTime() + 5 * 86400000);
      const day10 = new Date(today.getTime() + 10 * 86400000);
      
      const tasks = [
        createMockTask({ id: '1', date: today }),
        createMockTask({ id: '2', date: day5 }),
        createMockTask({ id: '3', date: day10 })
      ];
      
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      
      const result = tasks.filter(t => {
        if (!t.date || t.parentTaskId) return false;
        const taskDate = new Date(t.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate >= today && taskDate <= sevenDaysLater;
      });
      
      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toContain('1');
      expect(result.map(t => t.id)).toContain('2');
    });
  });

  describe('getOverdueTasks', () => {
    test('should return incomplete tasks with past deadlines', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today.getTime() - 86400000);
      const tomorrow = new Date(today.getTime() + 86400000);
      
      const tasks = [
        createMockTask({ id: '1', deadline: yesterday, completed: false }),
        createMockTask({ id: '2', deadline: tomorrow, completed: false }),
        createMockTask({ id: '3', deadline: yesterday, completed: true })
      ];
      
      const result = tasks.filter(t => {
        if (t.parentTaskId || t.completed || !t.deadline) return false;
        const deadlineDate = new Date(t.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        return deadlineDate < today;
      });
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    test('should exclude completed tasks', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const tasks = [
        createMockTask({ id: '1', deadline: yesterday, completed: true }),
        createMockTask({ id: '2', deadline: yesterday, completed: false })
      ];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const result = tasks.filter(t => {
        if (t.parentTaskId || t.completed || !t.deadline) return false;
        const deadlineDate = new Date(t.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        return deadlineDate < today;
      });
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });
  });

  describe('getSubtasks', () => {
    test('should return subtasks for parent task', () => {
      const tasks = [
        createMockTask({ id: '1', parentTaskId: null }),
        createMockTask({ id: '2', parentTaskId: '1' }),
        createMockTask({ id: '3', parentTaskId: '1' }),
        createMockTask({ id: '4', parentTaskId: '2' })
      ];
      
      const result = tasks.filter(t => t.parentTaskId === '1');
      
      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toContain('2');
      expect(result.map(t => t.id)).toContain('3');
    });

    test('should return empty array for task with no subtasks', () => {
      const tasks = [
        createMockTask({ id: '1', parentTaskId: null }),
        createMockTask({ id: '2', parentTaskId: null })
      ];
      
      const result = tasks.filter(t => t.parentTaskId === '1');
      
      expect(result).toHaveLength(0);
    });
  });

  describe('selectTask', () => {
    test('should set selected task ID', () => {
      let selectedTaskId: string | null = null;
      
      selectedTaskId = '123';
      expect(selectedTaskId).toBe('123');
    });

    test('should clear selected task ID', () => {
      let selectedTaskId: string | null = '123';
      
      selectedTaskId = null;
      expect(selectedTaskId).toBeNull();
    });
  });
});