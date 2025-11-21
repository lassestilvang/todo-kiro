/**
 * Additional edge case tests for search functionality
 */

import { describe, test, expect } from 'bun:test';
import { searchTasks, highlightMatches } from '../search';
import type { Task } from '@/types';

describe('Search Edge Cases', () => {
  const createMockTask = (id: string, name: string, description?: string): Task => ({
    id,
    name,
    description: description || null,
    listId: '1',
    completed: false,
    priority: 'none',
    date: null,
    deadline: null,
    estimatedTime: null,
    actualTime: null,
    parentTaskId: null,
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null
  });

  describe('searchTasks edge cases', () => {
    test('should handle special characters in query', () => {
      const tasks = [
        createMockTask('1', 'Task with (parentheses)'),
        createMockTask('2', 'Task with [brackets]'),
        createMockTask('3', 'Task with {braces}')
      ];

      const results = searchTasks(tasks, '(parentheses)');
      expect(results.length).toBeGreaterThan(0);
    });

    test('should handle numeric queries', () => {
      const tasks = [
        createMockTask('1', 'Task 123'),
        createMockTask('2', 'Task 456'),
        createMockTask('3', 'Task ABC')
      ];

      const results = searchTasks(tasks, '123');
      expect(results).toHaveLength(1);
      expect(results[0].item.id).toBe('1');
    });

    test('should handle very long queries', () => {
      const tasks = [createMockTask('1', 'Short task')];
      const longQuery = 'a'.repeat(1000);

      const results = searchTasks(tasks, longQuery);
      expect(results).toHaveLength(0);
    });

    test('should handle queries with only whitespace', () => {
      const tasks = [createMockTask('1', 'Test task')];
      const results = searchTasks(tasks, '   ');
      expect(results).toHaveLength(0);
    });
  });

  describe('highlightMatches edge cases', () => {
    test('should handle overlapping indices', () => {
      const indices = [[0, 2], [1, 3], [2, 4]];
      const result = highlightMatches('hello', indices);
      expect(result).toContain('<mark>');
    });

    test('should handle indices at string boundaries', () => {
      const text = 'hello';
      const indices = [[0, 0], [4, 4]];
      const result = highlightMatches(text, indices);
      expect(result).toBeDefined();
    });

    test('should handle empty string', () => {
      const result = highlightMatches('', [[0, 0]]);
      expect(result).toBe('');
    });

    test('should handle out of bounds indices', () => {
      const result = highlightMatches('hello', [[10, 15]]);
      expect(result).toBe('hello');
    });
  });
});
