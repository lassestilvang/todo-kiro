import { describe, test, expect, beforeEach } from 'bun:test';
import { useTaskStore } from '../task-store';
import { startOfDay, addDays } from 'date-fns';

describe('TaskStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTaskStore.setState({
      tasks: [],
      selectedTaskId: null,
      isLoading: false,
      isSubmitting: false,
    });
  });

  describe('selectTask', () => {
    test('should set selected task ID', () => {
      const { selectTask, selectedTaskId } = useTaskStore.getState();
      
      expect(selectedTaskId).toBeNull();
      
      selectTask('task-1');
      expect(useTaskStore.getState().selectedTaskId).toBe('task-1');
    });

    test('should clear selected task ID when null is passed', () => {
      const { selectTask } = useTaskStore.getState();
      
      selectTask('task-1');
      expect(useTaskStore.getState().selectedTaskId).toBe('task-1');
      
      selectTask(null);
      expect(useTaskStore.getState().selectedTaskId).toBeNull();
    });
  });

  describe('getTasksByList', () => {
    test('should return tasks for a specific list', () => {
      const tasks = [
        {
          id: '1',
          name: 'Task 1',
          listId: 'list-1',
          parentTaskId: null,
          completed: false,
          priority: 'none' as const,
          position: 0,
          description: null,
          date: null,
          deadline: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Task 2',
          listId: 'list-2',
          parentTaskId: null,
          completed: false,
          priority: 'none' as const,
          position: 0,
          description: null,
          date: null,
          deadline: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      useTaskStore.setState({ tasks });

      const { getTasksByList } = useTaskStore.getState();
      const list1Tasks = getTasksByList('list-1');
      
      expect(list1Tasks).toHaveLength(1);
      expect(list1Tasks[0]?.id).toBe('1');
    });

    test('should exclude subtasks', () => {
      const tasks = [
        {
          id: '1',
          name: 'Parent Task',
          listId: 'list-1',
          parentTaskId: null,
          completed: false,
          priority: 'none' as const,
          position: 0,
          description: null,
          date: null,
          deadline: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Subtask',
          listId: 'list-1',
          parentTaskId: '1',
          completed: false,
          priority: 'none' as const,
          position: 0,
          description: null,
          date: null,
          deadline: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      useTaskStore.setState({ tasks });

      const { getTasksByList } = useTaskStore.getState();
      const list1Tasks = getTasksByList('list-1');
      
      expect(list1Tasks).toHaveLength(1);
      expect(list1Tasks[0]?.id).toBe('1');
    });
  });

  describe('getTodayTasks', () => {
    test('should return tasks scheduled for today', () => {
      const today = startOfDay(new Date());
      const tomorrow = addDays(today, 1);

      const tasks = [
        {
          id: '1',
          name: 'Today Task',
          listId: 'list-1',
          date: today,
          parentTaskId: null,
          completed: false,
          priority: 'none' as const,
          position: 0,
          description: null,
          deadline: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Tomorrow Task',
          listId: 'list-1',
          date: tomorrow,
          parentTaskId: null,
          completed: false,
          priority: 'none' as const,
          position: 0,
          description: null,
          deadline: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      useTaskStore.setState({ tasks });

      const { getTodayTasks } = useTaskStore.getState();
      const todayTasks = getTodayTasks();
      
      expect(todayTasks).toHaveLength(1);
      expect(todayTasks[0]?.id).toBe('1');
    });
  });

  describe('getNext7DaysTasks', () => {
    test('should return tasks scheduled within next 7 days', () => {
      const today = startOfDay(new Date());
      const day5 = addDays(today, 5);
      const day10 = addDays(today, 10);

      const tasks = [
        {
          id: '1',
          name: 'Day 5 Task',
          listId: 'list-1',
          date: day5,
          parentTaskId: null,
          completed: false,
          priority: 'none' as const,
          position: 0,
          description: null,
          deadline: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Day 10 Task',
          listId: 'list-1',
          date: day10,
          parentTaskId: null,
          completed: false,
          priority: 'none' as const,
          position: 0,
          description: null,
          deadline: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      useTaskStore.setState({ tasks });

      const { getNext7DaysTasks } = useTaskStore.getState();
      const next7Days = getNext7DaysTasks();
      
      expect(next7Days).toHaveLength(1);
      expect(next7Days[0]?.id).toBe('1');
    });
  });

  describe('getOverdueTasks', () => {
    test('should return incomplete tasks with past deadlines', () => {
      const today = startOfDay(new Date());
      const yesterday = addDays(today, -1);

      const tasks = [
        {
          id: '1',
          name: 'Overdue Task',
          listId: 'list-1',
          deadline: yesterday,
          completed: false,
          parentTaskId: null,
          priority: 'none' as const,
          position: 0,
          description: null,
          date: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Completed Overdue Task',
          listId: 'list-1',
          deadline: yesterday,
          completed: true,
          parentTaskId: null,
          priority: 'none' as const,
          position: 0,
          description: null,
          date: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      useTaskStore.setState({ tasks });

      const { getOverdueTasks } = useTaskStore.getState();
      const overdue = getOverdueTasks();
      
      expect(overdue).toHaveLength(1);
      expect(overdue[0]?.id).toBe('1');
    });
  });

  describe('getSubtasks', () => {
    test('should return subtasks for a parent task', () => {
      const tasks = [
        {
          id: '1',
          name: 'Parent Task',
          listId: 'list-1',
          parentTaskId: null,
          completed: false,
          priority: 'none' as const,
          position: 0,
          description: null,
          date: null,
          deadline: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Subtask 1',
          listId: 'list-1',
          parentTaskId: '1',
          completed: false,
          priority: 'none' as const,
          position: 0,
          description: null,
          date: null,
          deadline: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          name: 'Subtask 2',
          listId: 'list-1',
          parentTaskId: '1',
          completed: false,
          priority: 'none' as const,
          position: 0,
          description: null,
          date: null,
          deadline: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      useTaskStore.setState({ tasks });

      const { getSubtasks } = useTaskStore.getState();
      const subtasks = getSubtasks('1');
      
      expect(subtasks).toHaveLength(2);
      expect(subtasks[0]?.id).toBe('2');
      expect(subtasks[1]?.id).toBe('3');
    });
  });
});
