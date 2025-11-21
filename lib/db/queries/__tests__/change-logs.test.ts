/**
 * Tests for change log database functions
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { initializeDatabase } from '../../init';
import { createTask, updateTask } from '../tasks';
import { getTaskChangeLogs, createChangeLog } from '../change-logs';
import { getInboxList } from '../lists';

describe('Change Log Database Functions', () => {
  beforeEach(async () => {
    await initializeDatabase();
  });

  describe('createChangeLog', () => {
    test('should create a change log entry', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Test Task', listId: inbox!.id });

      await createChangeLog({
        task_id: task.id,
        field: 'name',
        old_value: 'Test Task',
        new_value: 'Updated Task'
      });

      const logs = await getTaskChangeLogs(task.id);
      expect(logs).toHaveLength(1);
      expect(logs[0].field).toBe('name');
      expect(logs[0].old_value).toBe('Test Task');
      expect(logs[0].new_value).toBe('Updated Task');
    });

    test('should handle null values', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Test Task', listId: inbox!.id });

      await createChangeLog({
        task_id: task.id,
        field: 'description',
        old_value: null,
        new_value: 'New description'
      });

      const logs = await getTaskChangeLogs(task.id);
      expect(logs).toHaveLength(1);
      expect(logs[0].old_value).toBeNull();
    });
  });

  describe('getTaskChangeLogs', () => {
    test('should return all change logs for a task', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Test Task', listId: inbox!.id });

      await createChangeLog({
        task_id: task.id,
        field: 'name',
        old_value: 'Test Task',
        new_value: 'Updated Task'
      });

      await createChangeLog({
        task_id: task.id,
        field: 'priority',
        old_value: 'none',
        new_value: 'high'
      });

      const logs = await getTaskChangeLogs(task.id);
      expect(logs).toHaveLength(2);
    });

    test('should return logs in reverse chronological order', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Test Task', listId: inbox!.id });

      const log1 = await createChangeLog({
        task_id: task.id,
        field: 'name',
        old_value: 'Test Task',
        new_value: 'Updated Task'
      });

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const log2 = await createChangeLog({
        task_id: task.id,
        field: 'priority',
        old_value: 'none',
        new_value: 'high'
      });

      const logs = await getTaskChangeLogs(task.id);
      // Logs are returned in DESC order (newest first)
      expect(logs[0].changed_at >= logs[1].changed_at).toBe(true);
    });

    test('should return empty array for task with no changes', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Test Task', listId: inbox!.id });

      const logs = await getTaskChangeLogs(task.id);
      expect(logs).toHaveLength(0);
    });
  });

  describe('manual change tracking', () => {
    test('should manually track name changes', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Original Name', listId: inbox!.id });

      // Manually create change log (updateTask doesn't auto-track in current implementation)
      await createChangeLog({
        task_id: task.id,
        field: 'name',
        old_value: 'Original Name',
        new_value: 'New Name'
      });

      const logs = await getTaskChangeLogs(task.id);
      const nameChange = logs.find(log => log.field === 'name');
      expect(nameChange).toBeDefined();
      expect(nameChange?.old_value).toBe('Original Name');
      expect(nameChange?.new_value).toBe('New Name');
    });

    test('should manually track priority changes', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Test Task', listId: inbox!.id, priority: 'none' });

      await createChangeLog({
        task_id: task.id,
        field: 'priority',
        old_value: 'none',
        new_value: 'high'
      });

      const logs = await getTaskChangeLogs(task.id);
      const priorityChange = logs.find(log => log.field === 'priority');
      expect(priorityChange).toBeDefined();
    });

    test('should manually track completion status changes', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Test Task', listId: inbox!.id });

      await createChangeLog({
        task_id: task.id,
        field: 'completed',
        old_value: 'false',
        new_value: 'true'
      });

      const logs = await getTaskChangeLogs(task.id);
      const completedChange = logs.find(log => log.field === 'completed');
      expect(completedChange).toBeDefined();
    });
  });
});
