/**
 * Tests for task-label relationship database functions
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { initializeDatabase } from '../../init';
import { createTask } from '../tasks';
import { createLabel } from '../labels';
import { 
  addLabelToTask, 
  removeLabelFromTask, 
  getTaskLabels, 
  getTasksByLabelId 
} from '../task-labels';
import { getInboxList } from '../lists';

describe('Task-Label Database Functions', () => {
  beforeEach(async () => {
    await initializeDatabase();
  });

  describe('addLabelToTask', () => {
    test('should add label to task', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Test Task', listId: inbox!.id });
      const label = await createLabel({ name: 'Important', icon: '⭐', color: '#ef4444' });

      await addLabelToTask(task.id, label.id);
      const labels = await getTaskLabels(task.id);

      expect(labels).toHaveLength(1);
      expect(labels[0].id).toBe(label.id);
    });

    test('should not add duplicate labels', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Test Task', listId: inbox!.id });
      const label = await createLabel({ name: 'Important', icon: '⭐', color: '#ef4444' });

      await addLabelToTask(task.id, label.id);
      await addLabelToTask(task.id, label.id); // Try to add again

      const labels = await getTaskLabels(task.id);
      expect(labels).toHaveLength(1);
    });
  });

  describe('removeLabelFromTask', () => {
    test('should remove label from task', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Test Task', listId: inbox!.id });
      const label = await createLabel({ name: 'Important', icon: '⭐', color: '#ef4444' });

      await addLabelToTask(task.id, label.id);
      await removeLabelFromTask(task.id, label.id);

      const labels = await getTaskLabels(task.id);
      expect(labels).toHaveLength(0);
    });

    test('should handle removing non-existent label', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Test Task', listId: inbox!.id });

      // Should not throw
      await removeLabelFromTask(task.id, 'non-existent-id');
      const labels = await getTaskLabels(task.id);
      expect(labels).toHaveLength(0);
    });
  });

  describe('getTaskLabels', () => {
    test('should return all labels for a task', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Test Task', listId: inbox!.id });
      const label1 = await createLabel({ name: 'Important', icon: '⭐', color: '#ef4444' });
      const label2 = await createLabel({ name: 'Urgent', icon: '🔥', color: '#f59e0b' });

      await addLabelToTask(task.id, label1.id);
      await addLabelToTask(task.id, label2.id);

      const labels = await getTaskLabels(task.id);
      expect(labels).toHaveLength(2);
      expect(labels.map(l => l.id)).toContain(label1.id);
      expect(labels.map(l => l.id)).toContain(label2.id);
    });

    test('should return empty array for task with no labels', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Test Task', listId: inbox!.id });

      const labels = await getTaskLabels(task.id);
      expect(labels).toHaveLength(0);
    });
  });

  describe('getTasksByLabelId', () => {
    test('should return all task IDs with a specific label', async () => {
      const inbox = await getInboxList();
      const task1 = await createTask({ name: 'Task 1', listId: inbox!.id });
      const task2 = await createTask({ name: 'Task 2', listId: inbox!.id });
      const label = await createLabel({ name: 'Important', icon: '⭐', color: '#ef4444' });

      await addLabelToTask(task1.id, label.id);
      await addLabelToTask(task2.id, label.id);

      const taskIds = await getTasksByLabelId(label.id);
      expect(taskIds).toHaveLength(2);
      expect(taskIds).toContain(task1.id);
      expect(taskIds).toContain(task2.id);
    });

    test('should return empty array for label with no tasks', async () => {
      const label = await createLabel({ name: 'Important', icon: '⭐', color: '#ef4444' });

      const taskIds = await getTasksByLabelId(label.id);
      expect(taskIds).toHaveLength(0);
    });
  });
});
