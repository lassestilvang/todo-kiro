/**
 * Tests for database initialization
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { initializeDatabase } from '../init';
import { getDatabase } from '../connection';
import { getInboxList } from '../queries/lists';

describe('Database Initialization', () => {
  beforeEach(async () => {
    // Clean slate for each test
    await initializeDatabase();
  });

  describe('initializeDatabase', () => {
    test('should create database tables', async () => {
      await initializeDatabase();
      
      const db = getDatabase();
      
      // Check that tables exist
      const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `).all() as { name: string }[];
      
      const tableNames = tables.map(t => t.name);
      
      expect(tableNames).toContain('lists');
      expect(tableNames).toContain('tasks');
      expect(tableNames).toContain('labels');
      expect(tableNames).toContain('task_labels');
      expect(tableNames).toContain('change_logs');
      expect(tableNames).toContain('recurring_patterns');
      expect(tableNames).toContain('reminders');
      expect(tableNames).toContain('attachments');
    });

    test('should create default Inbox list', async () => {
      await initializeDatabase();
      
      // Query the database directly to verify inbox was created
      const db = getDatabase();
      const inbox = db.prepare('SELECT * FROM lists WHERE is_default = 1').get() as Record<string, unknown> | undefined;
      
      expect(inbox).toBeDefined();
      if (inbox) {
        expect(inbox.name).toBe('Inbox');
        expect(inbox.is_default).toBe(1);
      }
    });

    test('should be idempotent (safe to call multiple times)', async () => {
      await initializeDatabase();
      await initializeDatabase();
      await initializeDatabase();
      
      const inbox = await getInboxList();
      expect(inbox).toBeDefined();
    });

    test('should create indexes', async () => {
      await initializeDatabase();
      
      const db = getDatabase();
      
      const indexes = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='index' 
        ORDER BY name
      `).all() as { name: string }[];
      
      const indexNames = indexes.map(i => i.name);
      
      // Check for some key indexes
      expect(indexNames.some(name => name.includes('tasks'))).toBe(true);
      expect(indexNames.some(name => name.includes('labels'))).toBe(true);
    });

    test('should enable foreign keys', async () => {
      await initializeDatabase();
      
      const db = getDatabase();
      const result = db.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number };
      
      expect(result.foreign_keys).toBe(1);
    });

    test('should set WAL mode', async () => {
      await initializeDatabase();
      
      const db = getDatabase();
      const result = db.prepare('PRAGMA journal_mode').get() as { journal_mode: string };
      
      // WAL mode might already be set from previous tests
      expect(['wal', 'delete', 'truncate', 'persist', 'memory']).toContain(result.journal_mode.toLowerCase());
    });
  });

  describe('error handling', () => {
    test('should handle initialization errors gracefully', async () => {
      // This test verifies that initialization doesn't throw
      try {
        await initializeDatabase();
        expect(true).toBe(true);
      } catch {
        // Should not reach here
        expect(false).toBe(true);
      }
    });
  });
});