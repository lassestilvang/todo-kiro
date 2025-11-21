/**
 * Tests for recurring pattern database functions
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { initializeDatabase } from '../../init';
import { createTask } from '../tasks';
import { 
  createRecurringPattern, 
  getRecurringPatternByTaskId, 
  updateRecurringPattern,
  deleteRecurringPattern 
} from '../recurring-patterns';
import { getInboxList } from '../lists';

describe('Recurring Pattern Database Functions', () => {
  beforeEach(async () => {
    await initializeDatabase();
  });

  describe('createRecurringPattern', () => {
    test('should create a daily recurring pattern', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Daily Task', listId: inbox!.id });

      const pattern = await createRecurringPattern({
        taskId: task.id,
        type: 'daily',
        interval: 1
      });

      expect(pattern.type).toBe('daily');
      expect(pattern.interval).toBe(1);
      expect(pattern.taskId).toBe(task.id);
    });

    test('should create a weekly recurring pattern', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Weekly Task', listId: inbox!.id });

      const pattern = await createRecurringPattern({
        taskId: task.id,
        type: 'weekly',
        interval: 1
      });

      expect(pattern.type).toBe('weekly');
    });

    test('should create pattern with end date', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Limited Task', listId: inbox!.id });
      const endDate = new Date('2025-12-31');

      const pattern = await createRecurringPattern({
        taskId: task.id,
        type: 'daily',
        interval: 1,
        endDate
      });

      expect(pattern.endDate).toEqual(endDate);
    });
  });

  describe('getRecurringPatternByTaskId', () => {
    test('should retrieve pattern by task ID', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Recurring Task', listId: inbox!.id });

      await createRecurringPattern({
        taskId: task.id,
        type: 'monthly',
        interval: 1
      });

      const pattern = await getRecurringPatternByTaskId(task.id);
      expect(pattern).toBeDefined();
      expect(pattern?.type).toBe('monthly');
    });

    test('should return undefined for task without pattern', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Regular Task', listId: inbox!.id });

      const pattern = await getRecurringPatternByTaskId(task.id);
      expect(pattern).toBeUndefined();
    });
  });

  describe('updateRecurringPattern', () => {
    test('should update pattern interval', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Recurring Task', listId: inbox!.id });

      const pattern = await createRecurringPattern({
        taskId: task.id,
        type: 'daily',
        interval: 1
      });

      await updateRecurringPattern(pattern.id, { interval: 2 });

      const updated = await getRecurringPatternByTaskId(task.id);
      expect(updated?.interval).toBe(2);
    });

    test('should update pattern type', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Recurring Task', listId: inbox!.id });

      const pattern = await createRecurringPattern({
        taskId: task.id,
        type: 'daily',
        interval: 1
      });

      await updateRecurringPattern(pattern.id, { type: 'weekly' });

      const updated = await getRecurringPatternByTaskId(task.id);
      expect(updated?.type).toBe('weekly');
    });
  });

  describe('deleteRecurringPattern', () => {
    test('should delete a recurring pattern', async () => {
      const inbox = await getInboxList();
      const task = await createTask({ name: 'Recurring Task', listId: inbox!.id });

      const pattern = await createRecurringPattern({
        taskId: task.id,
        type: 'daily',
        interval: 1
      });

      await deleteRecurringPattern(pattern.id);

      const deleted = await getRecurringPatternByTaskId(task.id);
      expect(deleted).toBeUndefined();
    });
  });
});
