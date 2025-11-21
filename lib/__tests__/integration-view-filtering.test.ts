/**
 * Integration tests for view filtering
 * Tests the filtering logic for Today, Next 7 Days, Upcoming, and All views
 * 
 * Note: These tests use the Zustand store selectors to test filtering logic
 */
import { describe, test, expect, beforeEach } from 'bun:test';
import { useTaskStore } from '../store/task-store';
import { startOfDay, addDays, subDays } from 'date-fns';
import type { Task } from '@/types';

// Helper to create a mock task
function createMockTask(overrides: Partial<Task>): Task {
  return {
    id: Math.random().toString(36).substring(7),
    name: 'Test Task',
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
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('Integration Tests - View Filtering', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTaskStore.setState({
      tasks: [],
      selectedTaskId: null,
      isLoading: false,
      isSubmitting: false,
    });
  });

  describe('Today View Filtering', () => {
    test('should return only tasks scheduled for today', () => {
      const today = startOfDay(new Date());
      const yesterday = subDays(today, 1);
      const tomorrow = addDays(today, 1);

      const tasks = [
        createMockTask({ id: '1', name: 'Today Task 1', date: today }),
        createMockTask({ id: '2', name: 'Today Task 2', date: today }),
        createMockTask({ id: '3', name: 'Yesterday Task', date: yesterday }),
        createMockTask({ id: '4', name: 'Tomorrow Task', date: tomorrow }),
        createMockTask({ id: '5', name: 'No Date Task', date: null }),
      ];

      useTaskStore.setState({ tasks });

      const { getTodayTasks } = useTaskStore.getState();
      const todayTasks = getTodayTasks();

      expect(todayTasks).toHaveLength(2);
      expect(todayTasks.map(t => t.id)).toContain('1');
      expect(todayTasks.map(t => t.id)).toContain('2');
      expect(todayTasks.map(t => t.id)).not.toContain('3');
      expect(todayTasks.map(t => t.id)).not.toContain('4');
      expect(todayTasks.map(t => t.id)).not.toContain('5');
    });

    test('should exclude subtasks from today view', () => {
      const today = startOfDay(new Date());

      const tasks = [
        createMockTask({ id: '1', name: 'Parent Task', date: today, parentTaskId: null }),
        createMockTask({ id: '2', name: 'Subtask', date: today, parentTaskId: '1' }),
      ];

      useTaskStore.setState({ tasks });

      const { getTodayTasks } = useTaskStore.getState();
      const todayTasks = getTodayTasks();

      expect(todayTasks).toHaveLength(1);
      expect(todayTasks[0]?.id).toBe('1');
    });

    test('should include completed tasks in today view', () => {
      const today = startOfDay(new Date());

      const tasks = [
        createMockTask({ id: '1', name: 'Incomplete Task', date: today, completed: false }),
        createMockTask({ id: '2', name: 'Completed Task', date: today, completed: true }),
      ];

      useTaskStore.setState({ tasks });

      const { getTodayTasks } = useTaskStore.getState();
      const todayTasks = getTodayTasks();

      expect(todayTasks).toHaveLength(2);
    });
  });

  describe('Next 7 Days View Filtering', () => {
    test('should return tasks scheduled within next 7 days', () => {
      const today = startOfDay(new Date());
      const day3 = addDays(today, 3);
      const day7 = addDays(today, 7);
      const day8 = addDays(today, 8);
      const yesterday = subDays(today, 1);

      const tasks = [
        createMockTask({ id: '1', name: 'Today Task', date: today }),
        createMockTask({ id: '2', name: 'Day 3 Task', date: day3 }),
        createMockTask({ id: '3', name: 'Day 7 Task', date: day7 }),
        createMockTask({ id: '4', name: 'Day 8 Task', date: day8 }),
        createMockTask({ id: '5', name: 'Yesterday Task', date: yesterday }),
      ];

      useTaskStore.setState({ tasks });

      const { getNext7DaysTasks } = useTaskStore.getState();
      const next7DaysTasks = getNext7DaysTasks();

      expect(next7DaysTasks).toHaveLength(3);
      expect(next7DaysTasks.map(t => t.id)).toContain('1');
      expect(next7DaysTasks.map(t => t.id)).toContain('2');
      expect(next7DaysTasks.map(t => t.id)).toContain('3');
      expect(next7DaysTasks.map(t => t.id)).not.toContain('4');
      expect(next7DaysTasks.map(t => t.id)).not.toContain('5');
    });

    test('should exclude subtasks from next 7 days view', () => {
      const today = startOfDay(new Date());
      const day5 = addDays(today, 5);

      const tasks = [
        createMockTask({ id: '1', name: 'Parent Task', date: day5, parentTaskId: null }),
        createMockTask({ id: '2', name: 'Subtask', date: day5, parentTaskId: '1' }),
      ];

      useTaskStore.setState({ tasks });

      const { getNext7DaysTasks } = useTaskStore.getState();
      const next7DaysTasks = getNext7DaysTasks();

      expect(next7DaysTasks).toHaveLength(1);
      expect(next7DaysTasks[0]?.id).toBe('1');
    });

    test('should exclude tasks without dates', () => {
      const today = startOfDay(new Date());

      const tasks = [
        createMockTask({ id: '1', name: 'Task with date', date: today }),
        createMockTask({ id: '2', name: 'Task without date', date: null }),
      ];

      useTaskStore.setState({ tasks });

      const { getNext7DaysTasks } = useTaskStore.getState();
      const next7DaysTasks = getNext7DaysTasks();

      expect(next7DaysTasks).toHaveLength(1);
      expect(next7DaysTasks[0]?.id).toBe('1');
    });
  });

  describe('Upcoming View Filtering', () => {
    test('should return tasks scheduled for today and future dates', () => {
      const today = startOfDay(new Date());
      const yesterday = subDays(today, 1);
      const tomorrow = addDays(today, 1);
      const nextWeek = addDays(today, 7);
      const nextMonth = addDays(today, 30);

      const tasks = [
        createMockTask({ id: '1', name: 'Today Task', date: today }),
        createMockTask({ id: '2', name: 'Tomorrow Task', date: tomorrow }),
        createMockTask({ id: '3', name: 'Next Week Task', date: nextWeek }),
        createMockTask({ id: '4', name: 'Next Month Task', date: nextMonth }),
        createMockTask({ id: '5', name: 'Yesterday Task', date: yesterday }),
        createMockTask({ id: '6', name: 'No Date Task', date: null }),
      ];

      useTaskStore.setState({ tasks });

      const { getUpcomingTasks } = useTaskStore.getState();
      const upcomingTasks = getUpcomingTasks();

      expect(upcomingTasks).toHaveLength(4);
      expect(upcomingTasks.map(t => t.id)).toContain('1');
      expect(upcomingTasks.map(t => t.id)).toContain('2');
      expect(upcomingTasks.map(t => t.id)).toContain('3');
      expect(upcomingTasks.map(t => t.id)).toContain('4');
      expect(upcomingTasks.map(t => t.id)).not.toContain('5');
      expect(upcomingTasks.map(t => t.id)).not.toContain('6');
    });

    test('should exclude subtasks from upcoming view', () => {
      const today = startOfDay(new Date());
      const tomorrow = addDays(today, 1);

      const tasks = [
        createMockTask({ id: '1', name: 'Parent Task', date: tomorrow, parentTaskId: null }),
        createMockTask({ id: '2', name: 'Subtask', date: tomorrow, parentTaskId: '1' }),
      ];

      useTaskStore.setState({ tasks });

      const { getUpcomingTasks } = useTaskStore.getState();
      const upcomingTasks = getUpcomingTasks();

      expect(upcomingTasks).toHaveLength(1);
      expect(upcomingTasks[0]?.id).toBe('1');
    });

    test('should include both completed and incomplete tasks', () => {
      const today = startOfDay(new Date());
      const tomorrow = addDays(today, 1);

      const tasks = [
        createMockTask({ id: '1', name: 'Incomplete Task', date: tomorrow, completed: false }),
        createMockTask({ id: '2', name: 'Completed Task', date: tomorrow, completed: true }),
      ];

      useTaskStore.setState({ tasks });

      const { getUpcomingTasks } = useTaskStore.getState();
      const upcomingTasks = getUpcomingTasks();

      expect(upcomingTasks).toHaveLength(2);
    });
  });

  describe('All View Display', () => {
    test('should return all tasks from a specific list', () => {
      const tasks = [
        createMockTask({ id: '1', name: 'Task 1', listId: 'list-1' }),
        createMockTask({ id: '2', name: 'Task 2', listId: 'list-1' }),
        createMockTask({ id: '3', name: 'Task 3', listId: 'list-2' }),
        createMockTask({ id: '4', name: 'Task 4', listId: 'list-1' }),
      ];

      useTaskStore.setState({ tasks });

      const { getTasksByList } = useTaskStore.getState();
      const list1Tasks = getTasksByList('list-1');

      expect(list1Tasks).toHaveLength(3);
      expect(list1Tasks.map(t => t.id)).toContain('1');
      expect(list1Tasks.map(t => t.id)).toContain('2');
      expect(list1Tasks.map(t => t.id)).toContain('4');
      expect(list1Tasks.map(t => t.id)).not.toContain('3');
    });

    test('should exclude subtasks from all view', () => {
      const tasks = [
        createMockTask({ id: '1', name: 'Parent Task 1', listId: 'list-1', parentTaskId: null }),
        createMockTask({ id: '2', name: 'Subtask 1', listId: 'list-1', parentTaskId: '1' }),
        createMockTask({ id: '3', name: 'Parent Task 2', listId: 'list-1', parentTaskId: null }),
        createMockTask({ id: '4', name: 'Subtask 2', listId: 'list-1', parentTaskId: '3' }),
      ];

      useTaskStore.setState({ tasks });

      const { getTasksByList } = useTaskStore.getState();
      const list1Tasks = getTasksByList('list-1');

      expect(list1Tasks).toHaveLength(2);
      expect(list1Tasks.map(t => t.id)).toContain('1');
      expect(list1Tasks.map(t => t.id)).toContain('3');
    });

    test('should include tasks with and without dates', () => {
      const today = startOfDay(new Date());

      const tasks = [
        createMockTask({ id: '1', name: 'Task with date', listId: 'list-1', date: today }),
        createMockTask({ id: '2', name: 'Task without date', listId: 'list-1', date: null }),
      ];

      useTaskStore.setState({ tasks });

      const { getTasksByList } = useTaskStore.getState();
      const list1Tasks = getTasksByList('list-1');

      expect(list1Tasks).toHaveLength(2);
    });

    test('should include both completed and incomplete tasks', () => {
      const tasks = [
        createMockTask({ id: '1', name: 'Incomplete Task', listId: 'list-1', completed: false }),
        createMockTask({ id: '2', name: 'Completed Task', listId: 'list-1', completed: true }),
      ];

      useTaskStore.setState({ tasks });

      const { getTasksByList } = useTaskStore.getState();
      const list1Tasks = getTasksByList('list-1');

      expect(list1Tasks).toHaveLength(2);
    });
  });

  describe('Cross-View Consistency', () => {
    test('should maintain consistent filtering across different views', () => {
      const today = startOfDay(new Date());
      const tomorrow = addDays(today, 1);
      const day5 = addDays(today, 5);
      const day10 = addDays(today, 10);

      const tasks = [
        createMockTask({ id: '1', name: 'Today Task', listId: 'list-1', date: today }),
        createMockTask({ id: '2', name: 'Tomorrow Task', listId: 'list-1', date: tomorrow }),
        createMockTask({ id: '3', name: 'Day 5 Task', listId: 'list-1', date: day5 }),
        createMockTask({ id: '4', name: 'Day 10 Task', listId: 'list-1', date: day10 }),
      ];

      useTaskStore.setState({ tasks });

      const { getTodayTasks, getNext7DaysTasks, getUpcomingTasks, getTasksByList } = useTaskStore.getState();

      // Today view should have 1 task
      expect(getTodayTasks()).toHaveLength(1);

      // Next 7 days should have 3 tasks (today, tomorrow, day 5)
      expect(getNext7DaysTasks()).toHaveLength(3);

      // Upcoming should have all 4 tasks
      expect(getUpcomingTasks()).toHaveLength(4);

      // All view should have all 4 tasks
      expect(getTasksByList('list-1')).toHaveLength(4);
    });
  });
});
