import { create } from 'zustand';
import type { Label } from '@/types';

interface TaskLabelStore {
  taskLabels: Record<string, Label[]>;
  isLoading: Record<string, boolean>;
  
  // Actions
  loadTaskLabels: (taskId: string, forceReload?: boolean) => Promise<void>;
  getTaskLabels: (taskId: string) => Label[];
}

export const useTaskLabelStore = create<TaskLabelStore>((set, get) => ({
  taskLabels: {},
  isLoading: {},

  // Load labels for a specific task (force reload if already loaded)
  loadTaskLabels: async (taskId: string, forceReload = false) => {
    // Don't reload if already loading
    if (!forceReload && get().isLoading[taskId]) {
      return;
    }
    
    // Skip if already loaded and not forcing reload
    if (!forceReload && get().taskLabels[taskId]) {
      return;
    }

    set((state) => ({
      isLoading: { ...state.isLoading, [taskId]: true },
    }));

    try {
      const response = await fetch(`/api/tasks/${taskId}/labels`);
      if (!response.ok) throw new Error('Failed to fetch task labels');
      
      const labels = await response.json();
      
      set((state) => ({
        taskLabels: { ...state.taskLabels, [taskId]: labels },
        isLoading: { ...state.isLoading, [taskId]: false },
      }));
    } catch (error) {
      console.error('Error loading task labels:', error);
      set((state) => ({
        isLoading: { ...state.isLoading, [taskId]: false },
      }));
    }
  },

  // Get labels for a task (returns empty array if not loaded)
  getTaskLabels: (taskId: string) => {
    return get().taskLabels[taskId] || [];
  },
}));
