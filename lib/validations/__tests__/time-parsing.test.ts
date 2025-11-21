import { describe, test, expect } from 'bun:test';
import { parseTimeToMinutes, formatMinutesToTime } from '../index';

describe('Time Parsing Utilities', () => {
  describe('parseTimeToMinutes', () => {
    test('should parse valid time format HH:mm', () => {
      expect(parseTimeToMinutes('09:30')).toBe(570); // 9*60 + 30
      expect(parseTimeToMinutes('14:45')).toBe(885); // 14*60 + 45
      expect(parseTimeToMinutes('00:00')).toBe(0);
      expect(parseTimeToMinutes('23:59')).toBe(1439); // 23*60 + 59
    });

    test('should parse single digit hours', () => {
      expect(parseTimeToMinutes('9:30')).toBe(570);
      expect(parseTimeToMinutes('1:15')).toBe(75);
    });

    test('should throw error for invalid format', () => {
      expect(() => parseTimeToMinutes('25:00')).toThrow('Invalid time format');
      expect(() => parseTimeToMinutes('12:60')).toThrow('Invalid time format');
      expect(() => parseTimeToMinutes('12')).toThrow('Invalid time format');
      expect(() => parseTimeToMinutes('12:5')).toThrow('Invalid time format');
      expect(() => parseTimeToMinutes('abc:def')).toThrow('Invalid time format');
    });
  });

  describe('formatMinutesToTime', () => {
    test('should format minutes to HH:mm', () => {
      expect(formatMinutesToTime(570)).toBe('09:30');
      expect(formatMinutesToTime(885)).toBe('14:45');
      expect(formatMinutesToTime(0)).toBe('00:00');
      expect(formatMinutesToTime(1439)).toBe('23:59');
    });

    test('should pad single digits with zero', () => {
      expect(formatMinutesToTime(75)).toBe('01:15');
      expect(formatMinutesToTime(5)).toBe('00:05');
      expect(formatMinutesToTime(60)).toBe('01:00');
    });

    test('should handle edge cases', () => {
      expect(formatMinutesToTime(1440)).toBe('24:00'); // Full day
      expect(formatMinutesToTime(1500)).toBe('25:00'); // Over 24 hours
    });
  });

  describe('round-trip conversion', () => {
    test('should maintain value through parse and format', () => {
      const times = ['09:30', '14:45', '00:00', '23:59', '12:00'];
      
      times.forEach(time => {
        const minutes = parseTimeToMinutes(time);
        const formatted = formatMinutesToTime(minutes);
        expect(formatted).toBe(time);
      });
    });
  });
});
