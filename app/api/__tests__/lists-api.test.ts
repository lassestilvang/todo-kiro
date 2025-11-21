/**
 * Tests for lists API routes
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { initializeDatabase } from '@/lib/db/init';
import { createList, getListById, getAllLists } from '@/lib/db/queries/lists';

describe('Lists API Routes', () => {
  beforeEach(async () => {
    await initializeDatabase();
  });

  describe('POST /api/lists', () => {
    test('should create a new list', async () => {
      const listData = {
        name: 'Work',
        emoji: '💼',
        color: '#3b82f6'
      };

      const list = await createList(listData);

      expect(list.name).toBe('Work');
      expect(list.emoji).toBe('💼');
      expect(list.color).toBe('#3b82f6');
    });

    test('should create list with default values', async () => {
      const list = await createList({ name: 'Simple List' });

      expect(list.name).toBe('Simple List');
      expect(list.emoji).toBeNull();
      expect(list.color).toBeNull();
    });
  });

  describe('GET /api/lists', () => {
    test('should retrieve all lists', async () => {
      await createList({ name: 'List 1' });
      await createList({ name: 'List 2' });

      const lists = await getAllLists();

      expect(lists.length).toBeGreaterThanOrEqual(3); // Including Inbox
    });

    test('should include default Inbox list', async () => {
      const lists = await getAllLists();
      const inbox = lists.find(l => l.isDefault);

      expect(inbox).toBeDefined();
      expect(inbox?.name).toBe('Inbox');
    });
  });

  describe('GET /api/lists/:id', () => {
    test('should retrieve list by ID', async () => {
      const created = await createList({ name: 'Test List' });
      const list = await getListById(created.id);

      expect(list).toBeDefined();
      expect(list?.id).toBe(created.id);
      expect(list?.name).toBe('Test List');
    });

    test('should return undefined for non-existent list', async () => {
      const list = await getListById('non-existent-id');
      expect(list).toBeUndefined();
    });
  });
});
