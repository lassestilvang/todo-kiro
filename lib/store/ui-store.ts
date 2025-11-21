import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface UIStore {
  theme: Theme;
  sidebarOpen: boolean;
  showCompletedTasks: boolean;
  searchQuery: string;
  isTaskFormOpen: boolean;
  taskFormDefaultListId: string | null;
  isTaskEditOpen: boolean;
  taskEditId: string | null;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  toggleShowCompleted: () => void;
  setSearchQuery: (query: string) => void;
  openTaskForm: (defaultListId?: string) => void;
  closeTaskForm: () => void;
  openTaskEdit: (taskId: string) => void;
  closeTaskEdit: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Initial state - sidebar closed on mobile by default
      theme: 'system',
      sidebarOpen: false,
      showCompletedTasks: false,
      searchQuery: '',
      isTaskFormOpen: false,
      taskFormDefaultListId: null,
      isTaskEditOpen: false,
      taskEditId: null,

      // Set theme
      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
            root.classList.remove('light', 'dark');
            root.classList.add(systemTheme);
          } else {
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
          }
        }
      },

      // Toggle sidebar open/closed
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      // Toggle showing completed tasks
      toggleShowCompleted: () => {
        set((state) => ({ showCompletedTasks: !state.showCompletedTasks }));
      },

      // Set search query
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      // Open task form
      openTaskForm: (defaultListId) => {
        set({ isTaskFormOpen: true, taskFormDefaultListId: defaultListId || null });
      },

      // Close task form
      closeTaskForm: () => {
        set({ isTaskFormOpen: false, taskFormDefaultListId: null });
      },

      // Open task edit
      openTaskEdit: (taskId) => {
        set({ isTaskEditOpen: true, taskEditId: taskId });
      },

      // Close task edit
      closeTaskEdit: () => {
        set({ isTaskEditOpen: false, taskEditId: null });
      },
    }),
    {
      name: 'ui-store', // localStorage key
      partialize: (state) => ({
        // Only persist theme preference
        theme: state.theme,
      }),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const store = useUIStore.getState();
  store.setTheme(store.theme);
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = useUIStore.getState().theme;
    if (currentTheme === 'system') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    }
  });
}
