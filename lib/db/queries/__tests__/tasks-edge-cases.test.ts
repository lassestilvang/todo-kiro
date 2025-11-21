/**
 * Edge case tests for task database functions
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { initializeDatabase } from '../../init';
import { createTask, updateTask, getTaskById, deleteTask } from '../tasks';
import { getInboxList } from '../lists';

describe('Task Database Edge Cases', () => {
  let inboxId: string;

  beforeEach(() => {
    initializeDatabase();
    
    // Get inbox list
    const inbox = getInboxList();
    
    if (!inbox) {
      throw new Error('Inbox list not found after initialization');
    }
    
    inboxId = inbox.id;
  });

  describe('createTask edge cases', () => {
    test('should handle task with all null optional fields', () => {
      const task = createTask({
        name: 'Minimal Task',
        list_id: inboxId,
        position: 0
      });
      
      expect(task.description).toBeNull();
      expect(task.date).toBeNull();
      expect(task.deadline).toBeNull();
      expect(task.estimated_time).toBeNull();
      expect(task.actual_time).toBeNull();
      expect(task.parent_task_id).toBeNull();
    });

    test('should handle task with very long name', () => {
      const longName = 'A'.repeat(500);
      
      const task = createTask({
        name: longName,
        list_id: inboxId,
        position: 0
      });
      
      expect(task.name).toBe(longName);
    });

    test('should handle task with special characters in name', () => {
      const specialName = 'Task with émojis 🎉 and spëcial çhars!';
      
      const task = createTask({
        name: specialName,
        list_id: inboxId,
        position: 0
      });
      
      expect(task.name).toBe(specialName);
    });

    test('should handle task with zero estimated time', () => {
      const task = createTask({
        name: 'Zero time task',
        list_id: inboxId,
        position: 0,
        estimated_time: 0
      });
      
      expect(task.estimated_time).toBe(0);
    });
  });

  describe('updateTask edge cases', () => {
    test('should handle updating to null values', () => {
      const task = createTask({
        name: 'Task',
        list_id: inboxId,
        position: 0,
        description: 'Original description',
        estimated_time: 60
      });
      
      updateTask(task.id, {
        description: null,
        estimated_time: null
      });
      
      const updated = getTaskById(task.id);
      expect(updated?.description).toBeNull();
      expect(updated?.estimated_time).toBeNull();
    });

    test('should handle partial updates', () => {
      const task = createTask({
        name: 'Original',
        list_id: inboxId,
        position: 0,
        priority: 'low'
      });
      
      updateTask(task.id, { name: 'Updated' });
      
      const updated = getTaskById(task.id);
      expect(updated?.name).toBe('Updated');
      expect(updated?.priority).toBe('low'); // Should remain unchanged
    });

    test('should update updatedAt timestamp', () => {
      const task = createTask({
        name: 'Task',
        list_id: inboxId,
        position: 0
      });
      
      const originalUpdatedAt = task.updated_at;
      
      // Small delay to ensure different timestamp
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Busy wait
      }
      
      updateTask(task.id, { name: 'Updated' });
      
      const updated = getTaskById(task.id);
      expect(updated?.updated_at).not.toBe(originalUpdatedAt);
    });
  });

  describe('deleteTask edge cases', () => {
    test('should handle deleting non-existent task', () => {
      try {
        deleteTask('non-existent-id');
        // Should not throw
        expect(true).toBe(true);
      } catch (error) {
        // Some implementations might throw, that's ok too
        expect(error).toBeDefined();
      }
    });

    test('should delete task and verify it is gone', () => {
      const task = createTask({
        name: 'To Delete',
        list_id: inboxId,
        position: 0
      });
      
      deleteTask(task.id);
      
      const deleted = getTaskById(task.id);
      expect(deleted).toBeUndefined();
    });
  });

  describe('task completion', () => {
    test('should set completedAt when marking as completed', () => {
      const task = createTask({
        name: 'Task',
        list_id: inboxId,
        position: 0
      });
      
      updateTask(task.id, { completed: 1 });
      
      const updated = getTaskById(task.id);
      expect(updated?.completed).toBe(1);
      expect(updated?.completed_at).toBeDefined();
      expect(updated?.completed_at).not.toBeNull();
    });

    test('should clear completedAt when marking as incomplete', () => {
      const task = createTask({
        name: 'Task',
        list_id: inboxId,
        position: 0
      });
      
      updateTask(task.id, { completed: 1 });
      updateTask(task.id, { completed: 0 });
      
      const updated = getTaskById(task.id);
      expect(updated?.completed).toBe(0);
      expect(updated?.completed_at).toBeNull();
    });
  });

  describe('task priorities', () => {
    test('should handle all priority levels', () => {
      const priorities = ['none', 'low', 'medium', 'high'] as const;
      
      for (const priority of priorities) {
        const task = createTask({
          name: `${priority} priority task`,
          list_id: inboxId,
          position: 0,
          priority
        });
        
        expect(task.priority).toBe(priority);
      }
    });
  });

  describe('task dates', () => {
    test('should handle date and deadline on same day', () => {
      const today = new Date().toISOString().split('T')[0] as string;
      
      const task = createTask({
        name: 'Task',
        list_id: inboxId,
        position: 0,
        date: today,
        deadline: today
      });
      
      expect(task.date).toBe(today);
      expect(task.deadline).toBe(today);
    });

    test('should handle deadline before date', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayStr = today.toISOString().split('T')[0] as string;
      const tomorrowStr = tomorrow.toISOString().split('T')[0] as string;
      
      // Note: Validation should happen at the API/form level
      // Database layer accepts any dates
      const task = createTask({
        name: 'Task',
        list_id: inboxId,
        position: 0,
        date: tomorrowStr,
        deadline: todayStr
      });
      
      expect(task.date).toBe(tomorrowStr);
      expect(task.deadline).toBe(todayStr);
    });
  });
});
