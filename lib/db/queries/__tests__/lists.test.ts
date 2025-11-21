import { describe, test, expect, beforeEach } from 'bun:test';
import {
  getAllLists,
  getListById,
  getInboxList,
  createList,
  updateList,
  deleteList,
} from '../lists';
import { initializeDatabase } from '../../init';

describe('List Database Functions', () => {
  beforeEach(async () => {
    // Initialize database before each test
    await initializeDatabase();
  });

  describe('getInboxList', () => {
    test('should return the default inbox list', () => {
      const inbox = getInboxList();
      
      expect(inbox).toBeDefined();
      expect(inbox?.name).toBe('Inbox');
      expect(inbox?.is_default).toBe(1);
    });
  });

  describe('createList', () => {
    test('should create a new list', () => {
      const list = createList({
        name: 'Work',
        color: '#ef4444',
        emoji: '💼',
        position: 1,
      });

      expect(list).toBeDefined();
      expect(list.id).toBeDefined();
      expect(list.name).toBe('Work');
      expect(list.color).toBe('#ef4444');
      expect(list.emoji).toBe('💼');
      expect(list.is_default).toBe(0);
    });
  });

  describe('getListById', () => {
    test('should retrieve list by ID', () => {
      const created = createList({
        name: 'Personal',
        color: '#3b82f6',
        emoji: '🏠',
        position: 1,
      });

      const retrieved = getListById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Personal');
    });

    test('should return undefined for non-existent list', () => {
      const list = getListById('non-existent-id');
      expect(list).toBeUndefined();
    });
  });

  describe('getAllLists', () => {
    test('should return all lists', () => {
      createList({
        name: 'Work',
        color: '#ef4444',
        emoji: '💼',
        position: 1,
      });

      createList({
        name: 'Personal',
        color: '#3b82f6',
        emoji: '🏠',
        position: 2,
      });

      const lists = getAllLists();
      expect(lists.length).toBeGreaterThanOrEqual(3); // Including Inbox
    });

    test('should return lists ordered by position', () => {
      createList({
        name: 'List 2',
        color: '#ef4444',
        emoji: '💼',
        position: 2,
      });

      createList({
        name: 'List 1',
        color: '#3b82f6',
        emoji: '🏠',
        position: 1,
      });

      const lists = getAllLists();
      const customLists = lists.filter(l => l.is_default === 0);
      
      expect(customLists[0]?.position).toBeLessThan(customLists[1]?.position ?? 0);
    });
  });

  describe('updateList', () => {
    test('should update list name', () => {
      const list = createList({
        name: 'Original Name',
        color: '#3b82f6',
        emoji: '📝',
        position: 1,
      });

      updateList(list.id, { name: 'Updated Name' });

      const updated = getListById(list.id);
      expect(updated?.name).toBe('Updated Name');
    });

    test('should update multiple fields', () => {
      const list = createList({
        name: 'Test List',
        color: '#3b82f6',
        emoji: '📝',
        position: 1,
      });

      updateList(list.id, {
        name: 'Updated List',
        color: '#ef4444',
        emoji: '💼',
      });

      const updated = getListById(list.id);
      expect(updated?.name).toBe('Updated List');
      expect(updated?.color).toBe('#ef4444');
      expect(updated?.emoji).toBe('💼');
    });
  });

  describe('deleteList', () => {
    test('should delete a custom list', () => {
      const list = createList({
        name: 'Test List',
        color: '#3b82f6',
        emoji: '📝',
        position: 1,
      });

      deleteList(list.id);

      const deleted = getListById(list.id);
      expect(deleted).toBeUndefined();
    });

    test('should throw error when deleting inbox list', () => {
      const inbox = getInboxList();
      
      expect(() => {
        if (inbox) {
          deleteList(inbox.id);
        }
      }).toThrow('Cannot delete the default Inbox list');
    });
  });
});
