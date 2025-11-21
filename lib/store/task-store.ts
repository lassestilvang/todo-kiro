import { create } from 'zustand';
import { startOfDay, addDays, isAfter, isBefore, parseISO } from 'date-fns';
import type { Task } from '@/types';
import { showErrorToast } from '@/lib/utils/error-handler';

// Helper function to parse date string as local date (avoiding timezone issues)
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year!, month! - 1, day!);
}

// Helper function to convert database row to Task model
function rowToTask(row: {
  id: string;
  name: string;
  description: string | null;
  list_id: string;
  date: string | null;
  deadline: string | null;
  estimated_time: number | null;
  actual_time: number | null;
  priority: 'high' | 'medium' | 'low' | 'none';
  completed: number;
  completed_at: string | null;
  parent_task_id: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}): Task {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    listId: row.list_id,
    date: row.date ? parseLocalDate(row.date) : null,
    deadline: row.deadline ? parseLocalDate(row.deadline) : null,
    estimatedTime: row.estimated_time,
    actualTime: row.actual_time,
    priority: row.priority,
    completed: row.completed === 1,
    completedAt: row.completed_at ? parseISO(row.completed_at) : null,
    parentTaskId: row.parent_task_id,
    position: row.position,
    createdAt: parseISO(row.created_at),
    updatedAt: parseISO(row.updated_at),
  };
}

// Helper function to format date as local date string (YYYY-MM-DD)
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to convert Task model to database format
function taskToRow(task: Partial<Task>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  
  if (task.name !== undefined) row.name = task.name;
  if (task.description !== undefined) row.description = task.description;
  if (task.listId !== undefined) row.list_id = task.listId;
  if (task.date !== undefined) row.date = task.date ? formatLocalDate(task.date) : null;
  if (task.deadline !== undefined) row.deadline = task.deadline ? formatLocalDate(task.deadline) : null;
  if (task.estimatedTime !== undefined) row.estimated_time = task.estimatedTime;
  if (task.actualTime !== undefined) row.actual_time = task.actualTime;
  if (task.priority !== undefined) row.priority = task.priority;
  if (task.completed !== undefined) row.completed = task.completed ? 1 : 0;
  if (task.completedAt !== undefined) row.completed_at = task.completedAt ? task.completedAt.toISOString() : null;
  if (task.position !== undefined) row.position = task.position;
  
  return row;
}

// Helper function to create change log entries for task updates
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createChangeLogEntries(taskId: string, oldTask: Task, updates: Partial<Task>): void {
  const changes: Array<{
    task_id: string;
    field: string;
    old_value: string | null;
    new_value: string | null;
  }> = [];

  // Track changes for each field
  if (updates.name !== undefined && updates.name !== oldTask.name) {
    changes.push({
      task_id: taskId,
      field: 'name',
      old_value: oldTask.name,
      new_value: updates.name,
    });
  }

  if (updates.description !== undefined && updates.description !== oldTask.description) {
    changes.push({
      task_id: taskId,
      field: 'description',
      old_value: oldTask.description,
      new_value: updates.description,
    });
  }

  if (updates.listId !== undefined && updates.listId !== oldTask.listId) {
    changes.push({
      task_id: taskId,
      field: 'listId',
      old_value: oldTask.listId,
      new_value: updates.listId,
    });
  }

  if (updates.date !== undefined) {
    const oldDate = oldTask.date ? formatLocalDate(oldTask.date) : null;
    const newDate = updates.date ? formatLocalDate(updates.date) : null;
    if (oldDate !== newDate) {
      changes.push({
        task_id: taskId,
        field: 'date',
        old_value: oldDate ?? null,
        new_value: newDate ?? null,
      });
    }
  }

  if (updates.deadline !== undefined) {
    const oldDeadline = oldTask.deadline ? formatLocalDate(oldTask.deadline) : null;
    const newDeadline = updates.deadline ? formatLocalDate(updates.deadline) : null;
    if (oldDeadline !== newDeadline) {
      changes.push({
        task_id: taskId,
        field: 'deadline',
        old_value: oldDeadline ?? null,
        new_value: newDeadline ?? null,
      });
    }
  }

  if (updates.estimatedTime !== undefined && updates.estimatedTime !== oldTask.estimatedTime) {
    changes.push({
      task_id: taskId,
      field: 'estimatedTime',
      old_value: oldTask.estimatedTime?.toString() ?? null,
      new_value: updates.estimatedTime?.toString() ?? null,
    });
  }

  if (updates.actualTime !== undefined && updates.actualTime !== oldTask.actualTime) {
    changes.push({
      task_id: taskId,
      field: 'actualTime',
      old_value: oldTask.actualTime?.toString() ?? null,
      new_value: updates.actualTime?.toString() ?? null,
    });
  }

  if (updates.priority !== undefined && updates.priority !== oldTask.priority) {
    changes.push({
      task_id: taskId,
      field: 'priority',
      old_value: oldTask.priority,
      new_value: updates.priority,
    });
  }

  if (updates.completed !== undefined && updates.completed !== oldTask.completed) {
    changes.push({
      task_id: taskId,
      field: 'completed',
      old_value: oldTask.completed.toString(),
      new_value: updates.completed.toString(),
    });
  }

  // Note: Change logs are created on the server side in the API route
  // This function is kept for potential future use but does nothing now
}

interface TaskStore {
  tasks: Task[];
  selectedTaskId: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  
  // Actions
  addTask: (
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'position'>, 
    labelIds?: string[],
    recurringPattern?: {
      pattern: 'none' | 'daily' | 'weekly' | 'weekday' | 'monthly' | 'yearly' | 'custom';
      customPattern?: string | null;
      endDate?: Date | null;
    },
    reminders?: Date[]
  ) => Promise<Task>;
  updateTask: (
    id: string, 
    updates: Partial<Task>, 
    labelIds?: string[],
    recurringPattern?: {
      pattern: 'none' | 'daily' | 'weekly' | 'weekday' | 'monthly' | 'yearly' | 'custom';
      customPattern?: string | null;
      endDate?: Date | null;
    },
    reminders?: Date[]
  ) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  selectTask: (id: string | null) => void;
  loadTasks: () => Promise<void>;
  loadTasksByLabel: (labelId: string) => Promise<void>;
  
  // Computed selectors
  getTasksByList: (listId: string) => Task[];
  getTasksByLabel: (labelId: string) => Task[];
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getNext7DaysTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getSubtasks: (parentId: string) => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  isLoading: false,
  isSubmitting: false,

  // Load all tasks from database
  loadTasks: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const rows = await response.json();
      const tasks = rows.map(rowToTask);
      set({ tasks, isLoading: false });
    } catch (error) {
      showErrorToast(error, 'Loading tasks');
      set({ isLoading: false });
      throw error;
    }
  },

  // Add a new task
  addTask: async (taskInput, labelIds = [], recurringPattern, reminders = []) => {
    set({ isSubmitting: true });
    try {
      // Get the highest position for the list
      const tasksInList = get().getTasksByList(taskInput.listId);
      const maxPosition = tasksInList.reduce((max, t) => Math.max(max, t.position), -1);
      
      const taskData: {
        name: string;
        description?: string | null;
        list_id: string;
        date?: string | null;
        deadline?: string | null;
        estimated_time?: number | null;
        actual_time?: number | null;
        priority?: 'high' | 'medium' | 'low' | 'none';
        parent_task_id?: string | null;
        position: number;
      } = {
        name: taskInput.name,
        list_id: taskInput.listId,
        position: maxPosition + 1,
      };

      if (taskInput.description !== undefined) taskData.description = taskInput.description;
      if (taskInput.date) taskData.date = formatLocalDate(taskInput.date);
      if (taskInput.deadline) taskData.deadline = formatLocalDate(taskInput.deadline);
      if (taskInput.estimatedTime !== undefined) taskData.estimated_time = taskInput.estimatedTime;
      if (taskInput.actualTime !== undefined) taskData.actual_time = taskInput.actualTime;
      if (taskInput.priority !== undefined) taskData.priority = taskInput.priority;
      if (taskInput.parentTaskId !== undefined) taskData.parent_task_id = taskInput.parentTaskId;

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: taskData,
          labelIds,
          recurringPattern: recurringPattern && recurringPattern.pattern !== 'none' ? {
            pattern: recurringPattern.pattern,
            customPattern: recurringPattern.customPattern,
            endDate: recurringPattern.endDate ? formatLocalDate(recurringPattern.endDate) : null,
          } : undefined,
          reminders: reminders.map(r => r.toISOString()),
        }),
      });

      if (!response.ok) throw new Error('Failed to create task');
      const row = await response.json();
      const newTask = rowToTask(row);
      
      set((state) => ({ tasks: [...state.tasks, newTask], isSubmitting: false }));
      
      return newTask;
    } catch (error) {
      showErrorToast(error, 'Creating task');
      set({ isSubmitting: false });
      throw error;
    }
  },

  // Update an existing task
  updateTask: async (id, updates, labelIds, recurringPattern, reminders) => {
    set({ isSubmitting: true });
    try {
      const oldTask = get().tasks.find((t) => t.id === id);
      if (!oldTask) {
        set({ isSubmitting: false });
        throw new Error(`Task with id ${id} not found`);
      }

      // Convert updates to database format
      const rowUpdates = taskToRow(updates);
      
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: rowUpdates,
          labelIds,
          recurringPattern: recurringPattern ? {
            pattern: recurringPattern.pattern,
            customPattern: recurringPattern.customPattern,
            endDate: recurringPattern.endDate ? formatLocalDate(recurringPattern.endDate) : null,
          } : undefined,
          reminders: reminders?.map(r => r.toISOString()),
          oldTask: taskToRow(oldTask),
        }),
      });

      if (!response.ok) throw new Error('Failed to update task');
      const updatedRow = await response.json();
      const updatedTask = rowToTask(updatedRow);
      
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        isSubmitting: false,
      }));
    } catch (error) {
      showErrorToast(error, 'Updating task');
      set({ isSubmitting: false });
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (id) => {
    set({ isSubmitting: true });
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete task');
      
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
        isSubmitting: false,
      }));
    } catch (error) {
      showErrorToast(error, 'Deleting task');
      set({ isSubmitting: false });
      throw error;
    }
  },

  // Toggle task completion status
  toggleTaskComplete: async (id) => {
    try {
      const task = get().tasks.find((t) => t.id === id);
      if (!task) {
        throw new Error(`Task with id ${id} not found`);
      }

      const newCompleted = !task.completed;
      
      // Update the current task
      await get().updateTask(id, { 
        completed: newCompleted,
        completedAt: newCompleted ? new Date() : null,
      });
      
      // TODO: Handle recurring task generation on the server side
      // This logic should be moved to an API endpoint
    } catch (error) {
      showErrorToast(error, 'Toggling task completion');
      throw error;
    }
  },

  // Select a task
  selectTask: (id) => {
    set({ selectedTaskId: id });
  },

  // Get tasks by list ID
  getTasksByList: (listId) => {
    return get().tasks.filter((t) => t.listId === listId && !t.parentTaskId);
  },

  // Get tasks by label ID
  getTasksByLabel: (labelId) => {
    // Filter tasks that have the specified label
    // Note: This requires tasks to be loaded with label information
    // The label page should use loadTasksByLabel instead
    return get().tasks.filter((t) => !t.parentTaskId);
  },
  
  // Load tasks by label ID from the server
  loadTasksByLabel: async (labelId: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/labels/${labelId}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks by label');
      const rows = await response.json();
      const tasks = rows.map(rowToTask);
      set({ tasks, isLoading: false });
    } catch (error) {
      showErrorToast(error, 'Loading tasks by label');
      set({ isLoading: false });
      throw error;
    }
  },

  // Get today's tasks
  getTodayTasks: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    return get().tasks.filter((t) => {
      if (t.parentTaskId) return false;
      if (!t.date) return false;
      const taskDate = new Date(t.date);
      const taskDateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
      return taskDateStr === todayStr;
    });
  },

  // Get upcoming tasks (today and future)
  getUpcomingTasks: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return get().tasks.filter((t) => {
      if (t.parentTaskId) return false;
      if (!t.date) return false;
      const taskDate = new Date(t.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= today;
    });
  },

  // Get tasks for the next 7 days
  getNext7DaysTasks: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    return get().tasks.filter((t) => {
      if (t.parentTaskId) return false;
      if (!t.date) return false;
      const taskDate = new Date(t.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= today && taskDate <= sevenDaysLater;
    });
  },

  // Get overdue tasks
  getOverdueTasks: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return get().tasks.filter((t) => {
      if (t.parentTaskId) return false;
      if (t.completed) return false;
      if (!t.deadline) return false;
      const deadlineDate = new Date(t.deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      return deadlineDate < today;
    });
  },

  // Get subtasks for a parent task
  getSubtasks: (parentId) => {
    return get().tasks.filter((t) => t.parentTaskId === parentId);
  },
}));
