/**
 * Integration tests for search functionality
 * Tests fuzzy search, result highlighting, and search performance
 */
import { describe, test, expect } from 'bun:test';
import { searchTasks, highlightMatches } from '../utils/search';
import type { Task } from '@/types';

// Helper to create a mock task
function createMockTask(overrides: Partial<Task>): Task {
  return {
    id: Math.random().toString(36).substring(7),
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
  };
}

describe('Integration Tests - Search Functionality', () => {
  describe('Fuzzy Search with Various Queries', () => {
    test('should find exact matches', () => {
      const tasks = [
        createMockTask({ name: 'Buy groceries' }),
        createMockTask({ name: 'Call dentist' }),
        createMockTask({ name: 'Write report' }),
      ];

      const results = searchTasks(tasks, 'groceries');

      expect(results).toHaveLength(1);
      expect(results[0]?.task.name).toBe('Buy groceries');
    });

    test('should find partial matches', () => {
      const tasks = [
        createMockTask({ name: 'Buy groceries' }),
        createMockTask({ name: 'Grocery shopping list' }),
        createMockTask({ name: 'Call dentist' }),
      ];

      const results = searchTasks(tasks, 'groc');

      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    test('should handle typos and fuzzy matching', () => {
      const tasks = [
        createMockTask({ name: 'Buy groceries' }),
        createMockTask({ name: 'Call dentist' }),
      ];

      const results = searchTasks(tasks, 'groceris');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.task.name).toBe('Buy groceries');
    });

    test('should search in task descriptions', () => {
      const tasks = [
        createMockTask({ name: 'Task 1', description: 'Buy milk and bread' }),
        createMockTask({ name: 'Task 2', description: 'Call the dentist' }),
        createMockTask({ name: 'Task 3', description: null }),
      ];

      const results = searchTasks(tasks, 'milk');

      expect(results).toHaveLength(1);
      expect(results[0]?.task.name).toBe('Task 1');
    });

    test('should be case-insensitive', () => {
      const tasks = [
        createMockTask({ name: 'Buy Groceries' }),
        createMockTask({ name: 'CALL DENTIST' }),
      ];

      const results1 = searchTasks(tasks, 'groceries');
      const results2 = searchTasks(tasks, 'GROCERIES');

      expect(results1).toHaveLength(1);
      expect(results2).toHaveLength(1);
    });

    test('should return empty array for short queries', () => {
      const tasks = [
        createMockTask({ name: 'Buy groceries' }),
      ];

      const results1 = searchTasks(tasks, '');
      const results2 = searchTasks(tasks, 'a');

      expect(results1).toHaveLength(0);
      expect(results2).toHaveLength(0);
    });

    test('should return empty array when no matches found', () => {
      const tasks = [
        createMockTask({ name: 'Buy groceries' }),
        createMockTask({ name: 'Call dentist' }),
      ];

      const results = searchTasks(tasks, 'xyz123');

      expect(results).toHaveLength(0);
    });
  });

  describe('Search Result Highlighting', () => {
    test('should highlight single match', () => {
      const text = 'Buy groceries';
      const indices: Array<[number, number]> = [[4, 12]];

      const segments = highlightMatches(text, indices);

      expect(segments).toHaveLength(2);
      expect(segments[0]).toEqual({ text: 'Buy ', highlight: false });
      expect(segments[1]).toEqual({ text: 'groceries', highlight: true });
    });

    test('should highlight multiple matches', () => {
      const text = 'Buy milk and bread';
      const indices: Array<[number, number]> = [[4, 7], [13, 17]];

      const segments = highlightMatches(text, indices);

      expect(segments.length).toBeGreaterThan(0);
    });

    test('should handle empty indices', () => {
      const text = 'Buy groceries';
      const indices: Array<[number, number]> = [];

      const segments = highlightMatches(text, indices);

      expect(segments).toHaveLength(1);
      expect(segments[0]).toEqual({ text: 'Buy groceries', highlight: false });
    });
  });

  describe('Search Performance', () => {
    test('should return results within 300ms for 100 tasks', () => {
      const tasks = Array.from({ length: 100 }, (_, i) =>
        createMockTask({
          name: `Task ${i}`,
          description: `Description for task ${i}`,
        })
      );

      const startTime = performance.now();
      const results = searchTasks(tasks, 'task');
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(300);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should return results within 300ms for 500 tasks', () => {
      const tasks = Array.from({ length: 500 }, (_, i) =>
        createMockTask({
          name: `Task ${i}`,
          description: `Description for task ${i}`,
        })
      );

      const startTime = performance.now();
      const results = searchTasks(tasks, 'task');
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(300);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Search Edge Cases', () => {
    test('should handle empty task list', () => {
      const tasks: Task[] = [];

      const results = searchTasks(tasks, 'test');

      expect(results).toHaveLength(0);
    });

    test('should handle tasks with null descriptions', () => {
      const tasks = [
        createMockTask({ name: 'Task 1', description: null }),
        createMockTask({ name: 'Task 2', description: null }),
      ];

      const results = searchTasks(tasks, 'task');

      expect(results.length).toBeGreaterThan(0);
    });

    test('should handle unicode characters', () => {
      const tasks = [
        createMockTask({ name: 'Buy 🛒 groceries' }),
        createMockTask({ name: 'Café meeting' }),
      ];

      const results1 = searchTasks(tasks, 'groceries');
      const results2 = searchTasks(tasks, 'café');

      expect(results1.length).toBeGreaterThan(0);
      expect(results2.length).toBeGreaterThan(0);
    });
  });

  describe('Search Integration', () => {
    test('should include match information in results', () => {
      const tasks = [
        createMockTask({ name: 'Buy groceries' }),
      ];

      const results = searchTasks(tasks, 'groceries');

      expect(results[0]).toHaveProperty('task');
      expect(results[0]).toHaveProperty('matches');
      expect(results[0]).toHaveProperty('score');
    });

    test('should provide match indices for highlighting', () => {
      const tasks = [
        createMockTask({ name: 'Buy groceries' }),
      ];

      const results = searchTasks(tasks, 'groceries');

      expect(results[0]?.matches).toBeDefined();
      expect(Array.isArray(results[0]?.matches)).toBe(true);
    });
  });
});
