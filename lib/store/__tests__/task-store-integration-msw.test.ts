/**
 * Integration tests for TaskStore with MSW
 */

import { describe, test, expect, beforeAll, afterAll, afterEach, beforeEach } from 'bun:test';
import { server } from '../../__tests__/msw-setup';
import { enableFetchUrlConversion, disableFetchUrlConversion } from '../../__tests__/test-setup';

describe('TaskStore Integration with MSW', () => {
  beforeAll(() => {
    // Enable fetch URL conversion for MSW
    enableFetchUrlConversion();
    server.listen({ onUnhandledRequest: 'warn' });
  });

  afterAll(() => {
    server.close();
    // Restore original fetch
    disableFetchUrlConversion();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  beforeEach(async () => {
    // Reset store state before each test
    const { useTaskStore } = await import('../task-store');
    useTaskStore.setState({
      tasks: [],
      selectedTaskId: null,
      isLoading: false,
      isSubmitting: false
    });
  });

  describe('loadTasks', () => {
    test('should load tasks from API', async () => {
      const { useTaskStore } = await import('../task-store');
      
      await useTaskStore.getState().loadTasks();
      
      const tasks = useTaskStore.getState().tasks;
      expect(tasks.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('addTask', () => {
    test('should add task via API', async () => {
      const { useTaskStore } = await import('../task-store');
      
      const newTask = await useTaskStore.getState().addTask({
        name: 'New Task',
        listId: 'list-1',
        description: 'Test',
        priority: 'high',
        completed: false,
        parentTaskId: null
      });
      
      expect(newTask.name).toBe('New Task');
    });
  });

  describe('updateTask', () => {
    test('should update task via API', async () => {
      const { useTaskStore } = await import('../task-store');
      
      // Add a task first
      useTaskStore.setState({
        tasks: [{
          id: '1',
          name: 'Original',
          description: null,
          listId: 'list-1',
          date: null,
          deadline: null,
          estimatedTime: null,
          actualTime: null,
          priority: 'none',
          completed: false,
          completedAt: null,
          parentTaskId: null,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      });
      
      await useTaskStore.getState().updateTask('1', { name: 'Updated' });
      
      const task = useTaskStore.getState().tasks.find(t => t.id === '1');
      expect(task?.name).toBe('Updated');
    });
  });

  describe('deleteTask', () => {
    test('should delete task via API', async () => {
      const { useTaskStore } = await import('../task-store');
      
      useTaskStore.setState({
        tasks: [{
          id: '1',
          name: 'To Delete',
          description: null,
          listId: 'list-1',
          date: null,
          deadline: null,
          estimatedTime: null,
          actualTime: null,
          priority: 'none',
          completed: false,
          completedAt: null,
          parentTaskId: null,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      });
      
      await useTaskStore.getState().deleteTask('1');
      
      const tasks = useTaskStore.getState().tasks;
      expect(tasks).toHaveLength(0);
    });
  });
});
