import { describe, test, expect } from 'bun:test';
import {
  calculateNextOccurrence,
  shouldGenerateNextInstance,
  getRecurringPatternDescription,
} from '../recurring';
import { startOfDay, addDays, addWeeks, addMonths, addYears } from 'date-fns';

describe('Recurring Utilities', () => {
  const baseDate = startOfDay(new Date(2024, 0, 15)); // January 15, 2024 (Monday)

  describe('calculateNextOccurrence', () => {
    test('should calculate next daily occurrence', () => {
      const next = calculateNextOccurrence(baseDate, 'daily');
      const expected = addDays(baseDate, 1);
      expect(next?.toISOString()).toBe(expected.toISOString());
    });

    test('should calculate next weekly occurrence', () => {
      const next = calculateNextOccurrence(baseDate, 'weekly');
      const expected = addWeeks(baseDate, 1);
      expect(next?.toISOString()).toBe(expected.toISOString());
    });

    test('should calculate next weekday occurrence - Monday to Tuesday', () => {
      const monday = startOfDay(new Date(2024, 0, 15)); // Monday
      const next = calculateNextOccurrence(monday, 'weekday');
      const expected = addDays(monday, 1); // Tuesday
      expect(next?.toISOString()).toBe(expected.toISOString());
    });

    test('should calculate next weekday occurrence - Friday to Monday', () => {
      const friday = startOfDay(new Date(2024, 0, 19)); // Friday
      const next = calculateNextOccurrence(friday, 'weekday');
      const expected = startOfDay(new Date(2024, 0, 22)); // Monday
      expect(next?.toISOString()).toBe(expected.toISOString());
    });

    test('should calculate next weekday occurrence - Saturday to Monday', () => {
      const saturday = startOfDay(new Date(2024, 0, 20)); // Saturday
      const next = calculateNextOccurrence(saturday, 'weekday');
      const expected = startOfDay(new Date(2024, 0, 22)); // Monday
      expect(next?.toISOString()).toBe(expected.toISOString());
    });

    test('should calculate next monthly occurrence', () => {
      const next = calculateNextOccurrence(baseDate, 'monthly');
      const expected = addMonths(baseDate, 1);
      expect(next?.toISOString()).toBe(expected.toISOString());
    });

    test('should calculate next yearly occurrence', () => {
      const next = calculateNextOccurrence(baseDate, 'yearly');
      const expected = addYears(baseDate, 1);
      expect(next?.toISOString()).toBe(expected.toISOString());
    });

    test('should return null for custom pattern', () => {
      const next = calculateNextOccurrence(baseDate, 'custom', '0 0 * * 1');
      expect(next).toBeNull();
    });
  });

  describe('shouldGenerateNextInstance', () => {
    test('should return true for daily pattern without end date', () => {
      const result = shouldGenerateNextInstance(baseDate, 'daily');
      expect(result).toBe(true);
    });

    test('should return true when next occurrence is before end date', () => {
      const endDate = addDays(baseDate, 10);
      const result = shouldGenerateNextInstance(baseDate, 'daily', endDate);
      expect(result).toBe(true);
    });

    test('should return false when next occurrence is after end date', () => {
      const endDate = addDays(baseDate, 1);
      const result = shouldGenerateNextInstance(baseDate, 'weekly', endDate);
      expect(result).toBe(false);
    });

    test('should return false for custom pattern', () => {
      const result = shouldGenerateNextInstance(baseDate, 'custom');
      expect(result).toBe(false);
    });

    test('should return true when next occurrence equals end date', () => {
      const endDate = addDays(baseDate, 1);
      const result = shouldGenerateNextInstance(baseDate, 'daily', endDate);
      expect(result).toBe(true);
    });
  });

  describe('getRecurringPatternDescription', () => {
    test('should return description for daily pattern', () => {
      const desc = getRecurringPatternDescription('daily');
      expect(desc).toBe('Every day');
    });

    test('should return description for weekly pattern', () => {
      const desc = getRecurringPatternDescription('weekly');
      expect(desc).toBe('Every week');
    });

    test('should return description for weekday pattern', () => {
      const desc = getRecurringPatternDescription('weekday');
      expect(desc).toBe('Every weekday');
    });

    test('should return description for monthly pattern', () => {
      const desc = getRecurringPatternDescription('monthly');
      expect(desc).toBe('Every month');
    });

    test('should return description for yearly pattern', () => {
      const desc = getRecurringPatternDescription('yearly');
      expect(desc).toBe('Every year');
    });

    test('should return custom pattern description', () => {
      const desc = getRecurringPatternDescription('custom', '0 0 * * 1');
      expect(desc).toBe('0 0 * * 1');
    });

    test('should include end date in description', () => {
      const endDate = new Date(2024, 11, 31);
      const desc = getRecurringPatternDescription('daily', null, endDate);
      expect(desc).toContain('until');
      expect(desc).toContain('2024');
    });
  });
});
