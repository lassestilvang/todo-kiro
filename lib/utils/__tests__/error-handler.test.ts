/**
 * Tests for error handling utilities
 */

import { describe, test, expect } from 'bun:test';
import { handleApiError, handleDatabaseError, handleValidationError } from '../error-handler';

describe('Error Handler Utilities', () => {
  describe('handleApiError', () => {
    test('should format generic error', () => {
      const error = new Error('Something went wrong');
      const result = handleApiError(error);
      
      expect(result.message).toBe('Something went wrong');
      expect(result.status).toBe(500);
    });

    test('should handle error with status code', () => {
      const error = new Error('Not found') as Error & { status?: number };
      error.status = 404;
      const result = handleApiError(error);
      
      expect(result.message).toBe('Not found');
      expect(result.status).toBe(404);
    });

    test('should handle unknown error types', () => {
      const result = handleApiError('string error');
      
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.status).toBe(500);
    });
  });

  describe('handleDatabaseError', () => {
    test('should format database constraint error', () => {
      const error = new Error('UNIQUE constraint failed');
      const result = handleDatabaseError(error);
      
      expect(result.message).toContain('constraint');
      expect(result.status).toBe(400);
    });

    test('should format foreign key error', () => {
      const error = new Error('FOREIGN KEY constraint failed');
      const result = handleDatabaseError(error);
      
      expect(result.message).toContain('constraint');
      expect(result.status).toBe(400);
    });

    test('should handle generic database errors', () => {
      const error = new Error('Database connection failed');
      const result = handleDatabaseError(error);
      
      expect(result.message).toBe('Database connection failed');
      expect(result.status).toBe(500);
    });
  });

  describe('handleValidationError', () => {
    test('should format validation error with issues', () => {
      const error = {
        issues: [
          { path: ['name'], message: 'Required' },
          { path: ['email'], message: 'Invalid email' }
        ]
      };
      const result = handleValidationError(error);
      
      expect(result.message).toContain('name');
      expect(result.message).toContain('Required');
      expect(result.status).toBe(400);
    });

    test('should handle validation error without issues', () => {
      const error = { message: 'Validation failed' };
      const result = handleValidationError(error);
      
      expect(result.message).toBe('Validation failed');
      expect(result.status).toBe(400);
    });
  });
});
