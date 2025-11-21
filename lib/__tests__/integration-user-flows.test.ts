/**
 * Integration tests for complete user flows
 * These tests verify end-to-end functionality across multiple database operations
 * 
 * Note: Run with NODE_ENV=test to avoid server-only module issues
 */
import { describe, test, expect, beforeEach } from 'bun:test';
import { initializeDatabase } from '../db/init';
import { createList, getAllLists, updateList, deleteList } from '../db/queries/lists';
import { createTask, getTaskById, updateTask, deleteTask, getAllTasks } from '../db/queries/tasks';
import { createLabel, getAllLabels, updateLabel, deleteLabel } from '../db/queries/labels';
import { setTaskLabels, getTaskLabels } from '../db/queries/task-labels';

describe('Integration Tests - Complete User Flows', () => {
  beforeEach(() => {
    initializeDatabase();
  });

  describe('Task Creation Flow', () => {
    test('should create a task with all properties', () => {
      // Create a list first
      const list = createList({
        name: 'Work',
        color: '#3b82f6',
        emoji: '💼',
        position: 0,
      });

      // Create a task with all properties
      const task = createTask({
        name: 'Complete project proposal',
        description: 'Write and submit the Q1 project proposal',
        list_id: list.id,
        date: '2024-01-15',
        deadline: '2024-01-20',
        estimated_time: 120,
        priority: 'high',
        position: 0,
      });

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.name).toBe('Complete project proposal');
      expect(task.description).toBe('Write and submit the Q1 project proposal');
      expect(task.list_id).toBe(list.id);
      expect(task.date).toBe('2024-01-15');
      expect(task.deadline).toBe('2024-01-20');
      expect(task.estimated_time).toBe(120);
      expect(task.priority).toBe('high');
      expect(task.completed).toBe(0);
    });

    test('should create a task with labels', () => {
      const list = createList({
        name: 'Personal',
        color: '#10b981',
        emoji: '🏠',
        position: 0,
      });

      const label1 = createLabel({
        name: 'Urgent',
        icon: '🔥',
        color: '#ef4444',
      });

      const label2 = createLabel({
        name: 'Important',
        icon: '⭐',
        color: '#f59e0b',
      });

      const task = createTask({
        name: 'Pay bills',
        list_id: list.id,
        position: 0,
      });

      // Assign labels to task
      setTaskLabels(task.id, [label1.id, label2.id]);

      // Verify labels are assigned
      const taskLabels = getTaskLabels(task.id);
      expect(taskLabels).toHaveLength(2);
      expect(taskLabels.map(l => l.id)).toContain(label1.id);
      expect(taskLabels.map(l => l.id)).toContain(label2.id);
    });

    test('should create a task with subtasks', () => {
      const list = createList({
        name: 'Projects',
        color: '#8b5cf6',
        emoji: '📁',
        position: 0,
      });

      // Create parent task
      const parentTask = createTask({
        name: 'Launch website',
        list_id: list.id,
        position: 0,
      });

      // Create subtasks
      const subtask1 = createTask({
        name: 'Design homepage',
        list_id: list.id,
        parent_task_id: parentTask.id,
        position: 0,
      });

      const subtask2 = createTask({
        name: 'Write content',
        list_id: list.id,
        parent_task_id: parentTask.id,
        position: 1,
      });

      const subtask3 = createTask({
        name: 'Deploy to production',
        list_id: list.id,
        parent_task_id: parentTask.id,
        position: 2,
      });

      // Verify subtasks are created
      expect(subtask1.parent_task_id).toBe(parentTask.id);
      expect(subtask2.parent_task_id).toBe(parentTask.id);
      expect(subtask3.parent_task_id).toBe(parentTask.id);
    });
  });

  describe('Task Update Flow', () => {
    test('should update task properties', () => {
      const list = createList({
        name: 'Tasks',
        color: '#3b82f6',
        emoji: '✅',
        position: 0,
      });

      const task = createTask({
        name: 'Original task',
        list_id: list.id,
        priority: 'none',
        position: 0,
      });

      // Update task
      updateTask(task.id, {
        name: 'Updated task',
        description: 'Added description',
        priority: 'high',
        estimated_time: 60,
      });

      const updatedTask = getTaskById(task.id);
      expect(updatedTask?.name).toBe('Updated task');
      expect(updatedTask?.description).toBe('Added description');
      expect(updatedTask?.priority).toBe('high');
      expect(updatedTask?.estimated_time).toBe(60);
    });

    test('should mark task as completed', () => {
      const list = createList({
        name: 'Tasks',
        color: '#3b82f6',
        emoji: '✅',
        position: 0,
      });

      const task = createTask({
        name: 'Task to complete',
        list_id: list.id,
        position: 0,
      });

      expect(task.completed).toBe(0);
      expect(task.completed_at).toBeNull();

      // Mark as completed
      updateTask(task.id, { completed: 1 });

      const completedTask = getTaskById(task.id);
      expect(completedTask?.completed).toBe(1);
      expect(completedTask?.completed_at).toBeDefined();
      expect(completedTask?.completed_at).not.toBeNull();
    });

    test('should update task labels', () => {
      const list = createList({
        name: 'Tasks',
        color: '#3b82f6',
        emoji: '✅',
        position: 0,
      });

      const label1 = createLabel({
        name: 'Work',
        icon: '💼',
        color: '#3b82f6',
      });

      const label2 = createLabel({
        name: 'Personal',
        icon: '🏠',
        color: '#10b981',
      });

      const label3 = createLabel({
        name: 'Urgent',
        icon: '🔥',
        color: '#ef4444',
      });

      const task = createTask({
        name: 'Task with labels',
        list_id: list.id,
        position: 0,
      });

      // Set initial labels
      setTaskLabels(task.id, [label1.id, label2.id]);
      let taskLabels = getTaskLabels(task.id);
      expect(taskLabels).toHaveLength(2);

      // Update labels
      setTaskLabels(task.id, [label2.id, label3.id]);
      taskLabels = getTaskLabels(task.id);
      expect(taskLabels).toHaveLength(2);
      expect(taskLabels.map(l => l.id)).toContain(label2.id);
      expect(taskLabels.map(l => l.id)).toContain(label3.id);
      expect(taskLabels.map(l => l.id)).not.toContain(label1.id);
    });
  });

  describe('Task Deletion Flow', () => {
    test('should delete a task', () => {
      const list = createList({
        name: 'Tasks',
        color: '#3b82f6',
        emoji: '✅',
        position: 0,
      });

      const task = createTask({
        name: 'Task to delete',
        list_id: list.id,
        position: 0,
      });

      expect(getTaskById(task.id)).toBeDefined();

      // Delete task
      deleteTask(task.id);

      expect(getTaskById(task.id)).toBeUndefined();
    });

    test('should delete task with labels', () => {
      const list = createList({
        name: 'Tasks',
        color: '#3b82f6',
        emoji: '✅',
        position: 0,
      });

      const label = createLabel({
        name: 'Test',
        icon: '🏷️',
        color: '#3b82f6',
      });

      const task = createTask({
        name: 'Task with label',
        list_id: list.id,
        position: 0,
      });

      setTaskLabels(task.id, [label.id]);
      expect(getTaskLabels(task.id)).toHaveLength(1);

      // Delete task (should cascade delete task_labels)
      deleteTask(task.id);

      expect(getTaskById(task.id)).toBeUndefined();
      expect(getTaskLabels(task.id)).toHaveLength(0);
    });
  });

  describe('List Creation and Management Flow', () => {
    test('should create a custom list', () => {
      const list = createList({
        name: 'Shopping',
        color: '#ec4899',
        emoji: '🛒',
        position: 0,
      });

      expect(list).toBeDefined();
      expect(list.id).toBeDefined();
      expect(list.name).toBe('Shopping');
      expect(list.color).toBe('#ec4899');
      expect(list.emoji).toBe('🛒');
      expect(list.is_default).toBe(0);
    });

    test('should update a list', () => {
      const list = createList({
        name: 'Original Name',
        color: '#3b82f6',
        emoji: '📝',
        position: 0,
      });

      updateList(list.id, {
        name: 'Updated Name',
        color: '#10b981',
        emoji: '✅',
      });

      const lists = getAllLists();
      const updatedList = lists.find(l => l.id === list.id);
      
      expect(updatedList?.name).toBe('Updated Name');
      expect(updatedList?.color).toBe('#10b981');
      expect(updatedList?.emoji).toBe('✅');
    });

    test('should delete a list and its tasks', () => {
      const list = createList({
        name: 'List to delete',
        color: '#3b82f6',
        emoji: '📝',
        position: 0,
      });

      // Create tasks in the list
      createTask({
        name: 'Task 1',
        list_id: list.id,
        position: 0,
      });

      createTask({
        name: 'Task 2',
        list_id: list.id,
        position: 1,
      });

      const tasksBeforeDelete = getAllTasks().filter(t => t.list_id === list.id);
      expect(tasksBeforeDelete).toHaveLength(2);

      // Delete list (should cascade delete tasks)
      deleteList(list.id);

      const lists = getAllLists();
      expect(lists.find(l => l.id === list.id)).toBeUndefined();

      const tasksAfterDelete = getAllTasks().filter(t => t.list_id === list.id);
      expect(tasksAfterDelete).toHaveLength(0);
    });
  });

  describe('Label Creation and Assignment Flow', () => {
    test('should create a label', () => {
      const label = createLabel({
        name: 'Priority',
        icon: '⭐',
        color: '#f59e0b',
      });

      expect(label).toBeDefined();
      expect(label.id).toBeDefined();
      expect(label.name).toBe('Priority');
      expect(label.icon).toBe('⭐');
      expect(label.color).toBe('#f59e0b');
    });

    test('should update a label', () => {
      const label = createLabel({
        name: 'Original',
        icon: '🏷️',
        color: '#3b82f6',
      });

      updateLabel(label.id, {
        name: 'Updated',
        icon: '✨',
        color: '#8b5cf6',
      });

      const labels = getAllLabels();
      const updatedLabel = labels.find(l => l.id === label.id);
      
      expect(updatedLabel?.name).toBe('Updated');
      expect(updatedLabel?.icon).toBe('✨');
      expect(updatedLabel?.color).toBe('#8b5cf6');
    });

    test('should delete a label and remove from tasks', () => {
      const list = createList({
        name: 'Tasks',
        color: '#3b82f6',
        emoji: '✅',
        position: 0,
      });

      const label = createLabel({
        name: 'Label to delete',
        icon: '🏷️',
        color: '#3b82f6',
      });

      const task = createTask({
        name: 'Task with label',
        list_id: list.id,
        position: 0,
      });

      setTaskLabels(task.id, [label.id]);
      expect(getTaskLabels(task.id)).toHaveLength(1);

      // Delete label (should cascade delete task_labels)
      deleteLabel(label.id);

      const labels = getAllLabels();
      expect(labels.find(l => l.id === label.id)).toBeUndefined();
      expect(getTaskLabels(task.id)).toHaveLength(0);
    });

    test('should assign multiple labels to a task', () => {
      const list = createList({
        name: 'Tasks',
        color: '#3b82f6',
        emoji: '✅',
        position: 0,
      });

      const labels = [
        createLabel({ name: 'Work', icon: '💼', color: '#3b82f6' }),
        createLabel({ name: 'Urgent', icon: '🔥', color: '#ef4444' }),
        createLabel({ name: 'Important', icon: '⭐', color: '#f59e0b' }),
      ];

      const task = createTask({
        name: 'Multi-label task',
        list_id: list.id,
        position: 0,
      });

      setTaskLabels(task.id, labels.map(l => l.id));

      const taskLabels = getTaskLabels(task.id);
      expect(taskLabels).toHaveLength(3);
      expect(taskLabels.map(l => l.name)).toContain('Work');
      expect(taskLabels.map(l => l.name)).toContain('Urgent');
      expect(taskLabels.map(l => l.name)).toContain('Important');
    });
  });
});
