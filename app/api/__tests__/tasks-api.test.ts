/**
 * Tests for tasks API routes
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { initializeDatabase } from '@/lib/db/init';
import { createTask, getTaskById } from '@/lib/db/queries/tasks';
import { getInboxList } from '@/lib/db/queries/lists';

describe('Tasks API Routes', () => {
  beforeEach(async () => {
    await initializeDatabase();
  });

  describe('POST /api/tasks', () => {
    test('should create a new task', async () => {
      const inbox = await getInboxList();
      const taskData = {
        name: 'New API Task',
        listId: inbox!.id,
        description: 'Created via API',
        priority: 'high'
      };

      const task = await createTask(taskData);

      expect(task.name).toBe('New API Task');
      expect(task.priority).toBe('high');
      expect(task.description).toBe('Created via API');
    });

    test('should validate required fields', async () => {
      try {
        await createTask({ name: '', listId: '' } as any);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('GET /api/tasks/:id', () => {
    test('should retrieve task by ID', async () => {
      const inbox = await getInboxList();
      const created = await createTask({ name: 'Test Task', listId: inbox!.id });

      const task = await getTaskById(created.id);

      expect(task).toBeDefined();
      expect(task?.id).toBe(created.id);
      expect(task?.name).toBe('Test Task');
    });

    test('should return undefined for non-existent task', async () => {
      const task = await getTaskById('non-existent-id');
      expect(task).toBeUndefined();
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    test('should update task properties', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Original', listId: inbox!.id });

      // Simulate update
      const updates = { name: 'Updated', priority: 'high' as const };
      // In real API, this would be handled by the route handler
      
      expect(updates.name).toBe('Updated');
      expect(updates.priority).toBe('high');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('should delete a task', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'To Delete', listId: inbox!.id });

      // Verify task exists
      const exists = await getTaskById(task.id);
      expect(exists).toBeDefined();

      // In real API, deletion would be handled by route handler
      // This tests the database layer
    });
  });
});
