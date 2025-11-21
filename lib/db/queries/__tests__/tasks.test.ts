import { describe, test, expect, beforeEach } from 'bun:test';
import {
  getAllTasks,
  getTaskById,
  getTasksByListId,
  getSubtasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
} from '../tasks';
import { initializeDatabase } from '../../init';
import { createList } from '../lists';

describe('Task Database Functions', () => {
  beforeEach(async () => {
    // Initialize database before each test
    await initializeDatabase();
  });

  describe('createTask', () => {
    test('should create a new task', () => {
      const list = createList({
        name: 'Test List',
        color: '#3b82f6',
        emoji: '📝',
        position: 0,
      });

      const task = createTask({
        name: 'Test Task',
        list_id: list.id,
        position: 0,
      });

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.name).toBe('Test Task');
      expect(task.list_id).toBe(list.id);
      expect(task.completed).toBe(0);
    });

    test('should create task with all optional fields', () => {
      const list = createList({
        name: 'Test List',
        color: '#3b82f6',
        emoji: '📝',
        position: 0,
      });

      const task = createTask({
        name: 'Detailed Task',
        description: 'Task description',
        list_id: list.id,
        date: '2024-01-15',
        deadline: '2024-01-20',
        estimated_time: 60,
        actual_time: 45,
        priority: 'high',
        position: 0,
      });

      expect(task.description).toBe('Task description');
      expect(task.date).toBe('2024-01-15');
      expect(task.deadline).toBe('2024-01-20');
      expect(task.estimated_time).toBe(60);
      expect(task.actual_time).toBe(45);
      expect(task.priority).toBe('high');
    });
  });

  describe('getTaskById', () => {
    test('should retrieve task by ID', () => {
      const list = createList({
        name: 'Test List',
        color: '#3b82f6',
        emoji: '📝',
        position: 0,
      });

      const created = createTask({
        name: 'Test Task',
        list_id: list.id,
        position: 0,
      });

      const retrieved = getTaskById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test Task');
    });

    test('should return undefined for non-existent task', () => {
      const task = getTaskById('non-existent-id');
      expect(task).toBeUndefined();
    });
  });

  describe('getAllTasks', () => {
    test('should return all tasks', () => {
      const list = createList({
        name: 'Test List',
        color: '#3b82f6',
        emoji: '📝',
        position: 0,
      });

      createTask({ name: 'Task 1', list_id: list.id, position: 0 });
      createTask({ name: 'Task 2', list_id: list.id, position: 1 });

      const tasks = getAllTasks();
      expect(tasks.length).toBeGreaterThanOrEqual(2);
    });

    test('should return tasks ordered by position', () => {
      const list = createList({
        name: 'Test List',
        color: '#3b82f6',
        emoji: '📝',
        position: 0,
      });

      createTask({ name: 'Task 2', list_id: list.id, position: 1 });
      createTask({ name: 'Task 1', list_id: list.id, position: 0 });

      const tasks = getAllTasks();
      const listTasks = tasks.filter(t => t.list_id === list.id);
      
      expect(listTasks[0]?.name).toBe('Task 1');
      expect(listTasks[1]?.name).toBe('Task 2');
    });
  });

  describe('getTasksByListId', () => {
    test('should return tasks for specific list', () => {
      const list1 = createList({
        name: 'List 1',
        color: '#3b82f6',
        emoji: '📝',
        position: 0,
      });

      const list2 = createList({
        name: 'List 2',
        color: '#ef4444',
        emoji: '📋',
        position: 1,
      });

      createTask({ name: 'Task 1', list_id: list1.id, position: 0 });
      createTask({ name: 'Task 2', list_id: list2.id, position: 0 });

      const list1Tasks = getTasksByListId(list1.id);
      
      expect(list1Tasks).toHaveLength(1);
      expect(list1Tasks[0]?.name).toBe('Task 1');
    });
  });

  describe('getSubtasks', () => {
    test('should return subtasks for parent task', () => {
      const list = createList({
        name: 'Test List',
        color: '#3b82f6',
        emoji: '📝',
        position: 0,
      });

      const parent = createTask({
        name: 'Parent Task',
        list_id: list.id,
        position: 0,
      });

      createTask({
        name: 'Subtask 1',
        list_id: list.id,
        parent_task_id: parent.id,
        position: 0,
      });

      createTask({
        name: 'Subtask 2',
        list_id: list.id,
        parent_task_id: parent.id,
        position: 1,
      });

      const subtasks = getSubtasks(parent.id);
      
      expect(subtasks).toHaveLength(2);
      expect(subtasks[0]?.name).toBe('Subtask 1');
      expect(subtasks[1]?.name).toBe('Subtask 2');
    });
  });

  describe('updateTask', () => {
    test('should update task name', () => {
      const list = createList({
        name: 'Test List',
        color: '#3b82f6',
        emoji: '📝',
        position: 0,
      });

      const task = createTask({
        name: 'Original Name',
        list_id: list.id,
        position: 0,
      });

      updateTask(task.id, { name: 'Updated Name' });

      const updated = getTaskById(task.id);
      expect(updated?.name).toBe('Updated Name');
    });

    test('should update multiple fields', () => {
      const list = createList({
        name: 'Test List',
        color: '#3b82f6',
        emoji: '📝',
        position: 0,
      });

      const task = createTask({
        name: 'Test Task',
        list_id: list.id,
        position: 0,
      });

      updateTask(task.id, {
        name: 'Updated Task',
        priority: 'high',
        estimated_time: 120,
      });

      const updated = getTaskById(task.id);
      expect(updated?.name).toBe('Updated Task');
      expect(updated?.priority).toBe('high');
      expect(updated?.estimated_time).toBe(120);
    });

    test('should set completed_at when marking as completed', () => {
      const list = createList({
        name: 'Test List',
        color: '#3b82f6',
        emoji: '📝',
        position: 0,
      });

      const task = createTask({
        name: 'Test Task',
        list_id: list.id,
        position: 0,
      });

      updateTask(task.id, { completed: 1 });

      const updated = getTaskById(task.id);
      expect(updated?.completed).toBe(1);
      expect(updated?.completed_at).toBeDefined();
      expect(updated?.completed_at).not.toBeNull();
    });
  });

  describe('deleteTask', () => {
    test('should delete a task', () => {
      const list = createList({
        name: 'Test List',
        color: '#3b82f6',
        emoji: '📝',
        position: 0,
      });

      const task = createTask({
        name: 'Test Task',
        list_id: list.id,
        position: 0,
      });

      deleteTask(task.id);

      const deleted = getTaskById(task.id);
      expect(deleted).toBeUndefined();
    });
  });

  describe('toggleTaskComplete', () => {
    test('should toggle task completion status', () => {
      const list = createList({
        name: 'Test List',
        color: '#3b82f6',
        emoji: '📝',
        position: 0,
      });

      const task = createTask({
        name: 'Test Task',
        list_id: list.id,
        position: 0,
      });

      expect(task.completed).toBe(0);

      toggleTaskComplete(task.id);
      const completed = getTaskById(task.id);
      expect(completed?.completed).toBe(1);

      toggleTaskComplete(task.id);
      const uncompleted = getTaskById(task.id);
      expect(uncompleted?.completed).toBe(0);
    });
  });
});
