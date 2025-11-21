import { describe, test, expect } from 'bun:test';
import { taskInputWithDateValidationSchema, parseTimeToMinutes, formatMinutesToTime } from '../../../lib/validations';

/**
 * TaskForm Component Tests
 * 
 * These tests focus on form validation logic and data transformation
 * used by the TaskForm component.
 * 
 * Requirements tested:
 * - 2.1: Task name requirement
 * - 2.2: Task properties validation
 * - 10.1: Form validation with error messages
 * - 10.5: Real-time validation feedback
 */

describe('TaskForm Validation Logic', () => {
  describe('form validation', () => {
    test('should require task name', () => {
      const result = taskInputWithDateValidationSchema.safeParse({
        name: '',
        listId: 'list-1',
        priority: 'none',
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('name'))).toBe(true);
      }
    });

    test('should accept valid task data', () => {
      const result = taskInputWithDateValidationSchema.safeParse({
        name: 'Test Task',
        description: 'Test description',
        listId: 'list-1',
        priority: 'medium',
        date: new Date('2025-01-15'),
        deadline: new Date('2025-01-20'),
        estimatedTime: 60,
        completed: false,
      });
      
      expect(result.success).toBe(true);
    });

    test('should validate priority values', () => {
      const validPriorities = ['high', 'medium', 'low', 'none'];
      
      validPriorities.forEach(priority => {
        const result = taskInputWithDateValidationSchema.safeParse({
          name: 'Test Task',
          listId: 'list-1',
          priority,
        });
        
        expect(result.success).toBe(true);
      });
    });

    test('should reject invalid priority', () => {
      const result = taskInputWithDateValidationSchema.safeParse({
        name: 'Test Task',
        listId: 'list-1',
        priority: 'invalid',
      });
      
      expect(result.success).toBe(false);
    });

    test('should validate estimated time as number', () => {
      const result = taskInputWithDateValidationSchema.safeParse({
        name: 'Test Task',
        listId: 'list-1',
        priority: 'none',
        estimatedTime: 120,
      });
      
      expect(result.success).toBe(true);
    });

    test('should accept null for optional fields', () => {
      const result = taskInputWithDateValidationSchema.safeParse({
        name: 'Test Task',
        listId: 'list-1',
        priority: 'none',
        description: null,
        date: null,
        deadline: null,
        estimatedTime: null,
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('form submission', () => {
    test('should transform form data correctly', () => {
      const formData = {
        name: 'Test Task',
        description: 'Test description',
        listId: 'list-1',
        priority: 'high' as const,
        date: new Date('2025-01-15'),
        deadline: new Date('2025-01-20'),
        estimatedTime: 60,
        completed: false,
      };
      
      const result = taskInputWithDateValidationSchema.parse(formData);
      
      expect(result.name).toBe('Test Task');
      expect(result.priority).toBe('high');
      expect(result.estimatedTime).toBe(60);
    });

    test('should handle empty description', () => {
      const result = taskInputWithDateValidationSchema.parse({
        name: 'Test Task',
        listId: 'list-1',
        priority: 'none',
        description: '',
      });
      
      expect(result.description).toBeDefined();
    });
  });

  describe('error display', () => {
    test('should provide error messages for missing name', () => {
      const result = taskInputWithDateValidationSchema.safeParse({
        name: '',
        listId: 'list-1',
        priority: 'none',
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find(issue => issue.path.includes('name'));
        expect(nameError).toBeDefined();
        expect(nameError?.message).toBeDefined();
      }
    });

    test('should provide error messages for invalid data types', () => {
      const result = taskInputWithDateValidationSchema.safeParse({
        name: 'Test Task',
        listId: 'list-1',
        priority: 'none',
        estimatedTime: 'invalid',
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('time parsing utilities', () => {
    test('should parse time string to minutes', () => {
      expect(parseTimeToMinutes('01:30')).toBe(90);
      expect(parseTimeToMinutes('02:00')).toBe(120);
      expect(parseTimeToMinutes('00:45')).toBe(45);
    });

    test('should format minutes to time string', () => {
      expect(formatMinutesToTime(90)).toBe('01:30');
      expect(formatMinutesToTime(120)).toBe('02:00');
      expect(formatMinutesToTime(45)).toBe('00:45');
    });

    test('should handle edge cases', () => {
      expect(parseTimeToMinutes('00:00')).toBe(0);
      expect(formatMinutesToTime(0)).toBe('00:00');
    });
  });

  describe('date validation', () => {
    test('should accept valid dates', () => {
      const result = taskInputWithDateValidationSchema.safeParse({
        name: 'Test Task',
        listId: 'list-1',
        priority: 'none',
        date: new Date('2025-01-15'),
      });
      
      expect(result.success).toBe(true);
    });

    test('should accept null dates', () => {
      const result = taskInputWithDateValidationSchema.safeParse({
        name: 'Test Task',
        listId: 'list-1',
        priority: 'none',
        date: null,
      });
      
      expect(result.success).toBe(true);
    });
  });
});
