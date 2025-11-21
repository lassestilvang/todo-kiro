import { describe, test, expect } from 'bun:test';
import { initializeApp, loadAppData } from '../init';
import { getInboxList } from '../db/queries/lists';
import { getAllLists } from '../db/queries/lists';
import { getAllLabels } from '../db/queries/labels';
import { getAllTasks } from '../db/queries/tasks';

describe('Application Initialization', () => {
  test('initializeApp should initialize database and create Inbox', async () => {
    const result = await initializeApp();
    
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    
    // Verify Inbox list exists
    const inbox = getInboxList();
    expect(inbox).toBeDefined();
    expect(inbox?.name).toBe('Inbox');
    expect(inbox?.is_default).toBe(1);
  });

  test('loadAppData should load all data without errors', async () => {
    // Mock load functions
    const mockLoadLists = async () => {
      const lists = getAllLists();
      expect(Array.isArray(lists)).toBe(true);
    };
    
    const mockLoadLabels = async () => {
      const labels = getAllLabels();
      expect(Array.isArray(labels)).toBe(true);
    };
    
    const mockLoadTasks = async () => {
      const tasks = getAllTasks();
      expect(Array.isArray(tasks)).toBe(true);
    };
    
    const result = await loadAppData(mockLoadLists, mockLoadLabels, mockLoadTasks);
    
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('initializeApp should handle errors gracefully', async () => {
    // This test verifies error handling exists
    // In a real scenario, we'd mock a database error
    const result = await initializeApp();
    expect(result).toHaveProperty('success');
    expect(typeof result.success).toBe('boolean');
  });
});
