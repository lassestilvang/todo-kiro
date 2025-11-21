import { describe, test, expect } from 'bun:test';
import {
  taskInputSchema,
  taskUpdateSchema,
  taskInputWithDateValidationSchema,
  listInputSchema,
  listUpdateSchema,
  labelInputSchema,
  labelUpdateSchema,
  timeSchema,
  prioritySchema,
} from '../index';

describe('Validation Schemas', () => {
  describe('timeSchema', () => {
    test('should accept valid time formats', () => {
      expect(timeSchema.parse('09:30')).toBe('09:30');
      expect(timeSchema.parse('14:45')).toBe('14:45');
      expect(timeSchema.parse('00:00')).toBe('00:00');
      expect(timeSchema.parse('23:59')).toBe('23:59');
      expect(timeSchema.parse('9:30')).toBe('9:30');
    });

    test('should accept null and undefined', () => {
      expect(timeSchema.parse(null)).toBeNull();
      expect(timeSchema.parse(undefined)).toBeUndefined();
    });

    test('should reject invalid time formats', () => {
      expect(() => timeSchema.parse('25:00')).toThrow();
      expect(() => timeSchema.parse('12:60')).toThrow();
      expect(() => timeSchema.parse('12')).toThrow();
      expect(() => timeSchema.parse('abc')).toThrow();
    });
  });

  describe('prioritySchema', () => {
    test('should accept valid priority values', () => {
      expect(prioritySchema.parse('high')).toBe('high');
      expect(prioritySchema.parse('medium')).toBe('medium');
      expect(prioritySchema.parse('low')).toBe('low');
      expect(prioritySchema.parse('none')).toBe('none');
    });

    test('should reject invalid priority values', () => {
      expect(() => prioritySchema.parse('urgent')).toThrow();
      expect(() => prioritySchema.parse('')).toThrow();
      expect(() => prioritySchema.parse('HIGH')).toThrow();
    });
  });

  describe('taskInputSchema', () => {
    test('should accept valid task input', () => {
      const validTask = {
        name: 'Test Task',
        listId: 'list-1',
        priority: 'medium',
      };

      const result = taskInputSchema.parse(validTask);
      expect(result.name).toBe('Test Task');
      expect(result.listId).toBe('list-1');
      expect(result.priority).toBe('medium');
    });

    test('should reject task without name', () => {
      const invalidTask = {
        listId: 'list-1',
      };

      expect(() => taskInputSchema.parse(invalidTask)).toThrow();
    });

    test('should reject task without listId', () => {
      const invalidTask = {
        name: 'Test Task',
      };

      expect(() => taskInputSchema.parse(invalidTask)).toThrow();
    });

    test('should reject task with name too long', () => {
      const invalidTask = {
        name: 'a'.repeat(501),
        listId: 'list-1',
      };

      expect(() => taskInputSchema.parse(invalidTask)).toThrow();
    });

    test('should accept optional fields', () => {
      const validTask = {
        name: 'Test Task',
        listId: 'list-1',
        description: 'Test description',
        estimatedTime: 60,
        actualTime: 45,
      };

      const result = taskInputSchema.parse(validTask);
      expect(result.description).toBe('Test description');
      expect(result.estimatedTime).toBe(60);
      expect(result.actualTime).toBe(45);
    });

    test('should reject negative time values', () => {
      const invalidTask = {
        name: 'Test Task',
        listId: 'list-1',
        estimatedTime: -10,
      };

      expect(() => taskInputSchema.parse(invalidTask)).toThrow();
    });

    test('should reject time values exceeding maximum', () => {
      const invalidTask = {
        name: 'Test Task',
        listId: 'list-1',
        estimatedTime: 10081,
      };

      expect(() => taskInputSchema.parse(invalidTask)).toThrow();
    });
  });

  describe('taskInputWithDateValidationSchema', () => {
    test('should accept task with deadline after date', () => {
      const validTask = {
        name: 'Test Task',
        listId: 'list-1',
        date: new Date('2024-01-15'),
        deadline: new Date('2024-01-20'),
      };

      const result = taskInputWithDateValidationSchema.parse(validTask);
      expect(result).toBeDefined();
    });

    test('should accept task with deadline same as date', () => {
      const validTask = {
        name: 'Test Task',
        listId: 'list-1',
        date: new Date('2024-01-15'),
        deadline: new Date('2024-01-15'),
      };

      const result = taskInputWithDateValidationSchema.parse(validTask);
      expect(result).toBeDefined();
    });

    test('should reject task with deadline before date', () => {
      const invalidTask = {
        name: 'Test Task',
        listId: 'list-1',
        date: new Date('2024-01-20'),
        deadline: new Date('2024-01-15'),
      };

      expect(() => taskInputWithDateValidationSchema.parse(invalidTask)).toThrow();
    });

    test('should require custom pattern when custom recurring is selected', () => {
      const invalidTask = {
        name: 'Test Task',
        listId: 'list-1',
        recurringPattern: 'custom',
      };

      expect(() => taskInputWithDateValidationSchema.parse(invalidTask)).toThrow();
    });

    test('should accept custom pattern when custom recurring is selected', () => {
      const validTask = {
        name: 'Test Task',
        listId: 'list-1',
        recurringPattern: 'custom',
        customPattern: '0 0 * * 1',
      };

      const result = taskInputWithDateValidationSchema.parse(validTask);
      expect(result).toBeDefined();
    });
  });

  describe('taskUpdateSchema', () => {
    test('should accept partial task updates', () => {
      const update = {
        name: 'Updated Task',
      };

      const result = taskUpdateSchema.parse(update);
      expect(result.name).toBe('Updated Task');
    });

    test('should accept empty update object', () => {
      const update = {};
      const result = taskUpdateSchema.parse(update);
      expect(result).toBeDefined();
    });

    test('should reject invalid priority in update', () => {
      const update = {
        priority: 'invalid',
      };

      expect(() => taskUpdateSchema.parse(update)).toThrow();
    });
  });

  describe('listInputSchema', () => {
    test('should accept valid list input', () => {
      const validList = {
        name: 'Work',
        color: '#ef4444',
        emoji: '💼',
      };

      const result = listInputSchema.parse(validList);
      expect(result.name).toBe('Work');
      expect(result.color).toBe('#ef4444');
      expect(result.emoji).toBe('💼');
    });

    test('should reject list without name', () => {
      const invalidList = {
        color: '#ef4444',
        emoji: '💼',
      };

      expect(() => listInputSchema.parse(invalidList)).toThrow();
    });

    test('should reject invalid color format', () => {
      const invalidList = {
        name: 'Work',
        color: 'red',
        emoji: '💼',
      };

      expect(() => listInputSchema.parse(invalidList)).toThrow();
    });

    test('should accept valid hex colors', () => {
      const validList = {
        name: 'Work',
        color: '#ABCDEF',
        emoji: '💼',
      };

      const result = listInputSchema.parse(validList);
      expect(result.color).toBe('#ABCDEF');
    });

    test('should reject list with name too long', () => {
      const invalidList = {
        name: 'a'.repeat(101),
        color: '#ef4444',
        emoji: '💼',
      };

      expect(() => listInputSchema.parse(invalidList)).toThrow();
    });
  });

  describe('listUpdateSchema', () => {
    test('should accept partial list updates', () => {
      const update = {
        name: 'Updated List',
      };

      const result = listUpdateSchema.parse(update);
      expect(result.name).toBe('Updated List');
    });

    test('should accept color update only', () => {
      const update = {
        color: '#3b82f6',
      };

      const result = listUpdateSchema.parse(update);
      expect(result.color).toBe('#3b82f6');
    });
  });

  describe('labelInputSchema', () => {
    test('should accept valid label input', () => {
      const validLabel = {
        name: 'Urgent',
        icon: '🔥',
        color: '#ef4444',
      };

      const result = labelInputSchema.parse(validLabel);
      expect(result.name).toBe('Urgent');
      expect(result.icon).toBe('🔥');
      expect(result.color).toBe('#ef4444');
    });

    test('should reject label without name', () => {
      const invalidLabel = {
        icon: '🔥',
        color: '#ef4444',
      };

      expect(() => labelInputSchema.parse(invalidLabel)).toThrow();
    });

    test('should reject label with name too long', () => {
      const invalidLabel = {
        name: 'a'.repeat(51),
        icon: '🔥',
        color: '#ef4444',
      };

      expect(() => labelInputSchema.parse(invalidLabel)).toThrow();
    });

    test('should reject invalid color format', () => {
      const invalidLabel = {
        name: 'Urgent',
        icon: '🔥',
        color: 'red',
      };

      expect(() => labelInputSchema.parse(invalidLabel)).toThrow();
    });
  });

  describe('labelUpdateSchema', () => {
    test('should accept partial label updates', () => {
      const update = {
        name: 'Updated Label',
      };

      const result = labelUpdateSchema.parse(update);
      expect(result.name).toBe('Updated Label');
    });

    test('should accept icon update only', () => {
      const update = {
        icon: '⭐',
      };

      const result = labelUpdateSchema.parse(update);
      expect(result.icon).toBe('⭐');
    });
  });
});
