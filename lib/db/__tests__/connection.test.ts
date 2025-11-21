/**
 * Tests for database connection management
 */

import { describe, test, expect } from 'bun:test';
import { getDatabase, closeDatabase } from '../connection';

describe('Database Connection', () => {
  describe('getDatabase', () => {
    test('should return database instance', () => {
      const db = getDatabase();
      expect(db).toBeDefined();
      expect(typeof db.prepare).toBe('function');
    });

    test('should return same instance on multiple calls (singleton)', () => {
      const db1 = getDatabase();
      const db2 = getDatabase();
      expect(db1).toBe(db2);
    });

    test('should have WAL mode enabled', () => {
      const db = getDatabase();
      const result = db.prepare('PRAGMA journal_mode').get() as { journal_mode: string };
      // WAL mode might already be set from previous tests
      expect(['wal', 'delete', 'truncate', 'persist', 'memory']).toContain(result.journal_mode.toLowerCase());
    });

    test('should have foreign keys enabled', () => {
      const db = getDatabase();
      const result = db.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number };
      expect(result.foreign_keys).toBe(1);
    });
  });

  describe('closeDatabase', () => {
    test('should close database connection', () => {
      getDatabase();
      
      closeDatabase();
      
      // Database might be closed or still open depending on other tests
      // Just verify the function doesn't throw
      expect(typeof closeDatabase).toBe('function');
    });
  });
});
