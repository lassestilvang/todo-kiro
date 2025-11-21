/**
 * Tests for error handling utilities
 */

import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { showErrorToast, getErrorMessage, withErrorHandling } from '../error-handler';

// Mock the toast function
const mockToast = mock(() => {});
mock.module('@/hooks/use-toast', () => ({
  toast: mockToast
}));

describe('Error Handler Utilities', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  describe('getErrorMessage', () => {
    test('should extract message from Error object', () => {
      const error = new Error('Something went wrong');
      const message = getErrorMessage(error);
      
      expect(message).toBe('Something went wrong');
    });

    test('should handle string errors', () => {
      const message = getErrorMessage('String error');
      
      expect(message).toBe('String error');
    });

    test('should handle unknown error types', () => {
      const message = getErrorMessage({ unknown: 'object' });
      
      expect(message).toBe('An unexpected error occurred');
    });

    test('should handle null and undefined', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
    });

    test('should handle number errors', () => {
      const message = getErrorMessage(404);
      
      expect(message).toBe('An unexpected error occurred');
    });
  });

  describe('showErrorToast', () => {
    test('should show toast with Error object', () => {
      const error = new Error('Test error');
      showErrorToast(error);
      
      expect(mockToast).toHaveBeenCalled();
    });

    test('should show toast with context', () => {
      const error = new Error('Test error');
      showErrorToast(error, 'Loading data');
      
      expect(mockToast).toHaveBeenCalled();
    });

    test('should show toast with string error', () => {
      showErrorToast('String error');
      
      expect(mockToast).toHaveBeenCalled();
    });

    test('should show toast with unknown error', () => {
      showErrorToast({ unknown: 'error' });
      
      expect(mockToast).toHaveBeenCalled();
    });

    test('should log error to console', () => {
      const consoleSpy = mock(() => {});
      const originalError = console.error;
      console.error = consoleSpy;
      
      const error = new Error('Test error');
      showErrorToast(error, 'Test context');
      
      expect(consoleSpy).toHaveBeenCalled();
      
      console.error = originalError;
    });
  });

  describe('withErrorHandling', () => {
    test('should wrap async function and handle success', async () => {
      const fn = async (x: number) => x * 2;
      const wrapped = withErrorHandling(fn, 'Test operation');
      
      const result = await wrapped(5);
      expect(result).toBe(10);
    });

    test('should catch and re-throw errors', async () => {
      const fn = async () => {
        throw new Error('Test error');
      };
      const wrapped = withErrorHandling(fn, 'Test operation');
      
      try {
        await wrapped();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(mockToast).toHaveBeenCalled();
      }
    });

    test('should preserve function arguments', async () => {
      const fn = async (a: number, b: string, c: boolean) => {
        return { a, b, c };
      };
      const wrapped = withErrorHandling(fn);
      
      const result = await wrapped(42, 'test', true);
      expect(result).toEqual({ a: 42, b: 'test', c: true });
    });

    test('should work without context', async () => {
      const fn = async () => {
        throw new Error('No context error');
      };
      const wrapped = withErrorHandling(fn);
      
      try {
        await wrapped();
      } catch (error) {
        expect(mockToast).toHaveBeenCalled();
      }
    });
  });
});
