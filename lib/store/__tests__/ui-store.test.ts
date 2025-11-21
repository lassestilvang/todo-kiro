import { describe, test, expect, beforeEach } from 'bun:test';
import { useUIStore } from '../ui-store';

describe('UIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      theme: 'system',
      sidebarOpen: false,
      showCompletedTasks: false,
      searchQuery: '',
      isTaskFormOpen: false,
      taskFormDefaultListId: null,
      isTaskEditOpen: false,
      taskEditId: null,
    });
  });

  describe('toggleSidebar', () => {
    test('should toggle sidebar open state', () => {
      const { toggleSidebar } = useUIStore.getState();
      
      expect(useUIStore.getState().sidebarOpen).toBe(false);
      
      toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
      
      toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });
  });

  describe('toggleShowCompleted', () => {
    test('should toggle show completed tasks state', () => {
      const { toggleShowCompleted } = useUIStore.getState();
      
      expect(useUIStore.getState().showCompletedTasks).toBe(false);
      
      toggleShowCompleted();
      expect(useUIStore.getState().showCompletedTasks).toBe(true);
      
      toggleShowCompleted();
      expect(useUIStore.getState().showCompletedTasks).toBe(false);
    });
  });

  describe('setSearchQuery', () => {
    test('should update search query', () => {
      const { setSearchQuery } = useUIStore.getState();
      
      expect(useUIStore.getState().searchQuery).toBe('');
      
      setSearchQuery('test query');
      expect(useUIStore.getState().searchQuery).toBe('test query');
      
      setSearchQuery('');
      expect(useUIStore.getState().searchQuery).toBe('');
    });
  });

  describe('openTaskForm', () => {
    test('should open task form without default list', () => {
      const { openTaskForm } = useUIStore.getState();
      
      openTaskForm();
      
      expect(useUIStore.getState().isTaskFormOpen).toBe(true);
      expect(useUIStore.getState().taskFormDefaultListId).toBeNull();
    });

    test('should open task form with default list', () => {
      const { openTaskForm } = useUIStore.getState();
      
      openTaskForm('list-1');
      
      expect(useUIStore.getState().isTaskFormOpen).toBe(true);
      expect(useUIStore.getState().taskFormDefaultListId).toBe('list-1');
    });
  });

  describe('closeTaskForm', () => {
    test('should close task form and clear default list', () => {
      const { openTaskForm, closeTaskForm } = useUIStore.getState();
      
      openTaskForm('list-1');
      expect(useUIStore.getState().isTaskFormOpen).toBe(true);
      
      closeTaskForm();
      expect(useUIStore.getState().isTaskFormOpen).toBe(false);
      expect(useUIStore.getState().taskFormDefaultListId).toBeNull();
    });
  });

  describe('setTheme', () => {
    test('should update theme', () => {
      const { setTheme } = useUIStore.getState();
      
      expect(useUIStore.getState().theme).toBe('system');
      
      setTheme('dark');
      expect(useUIStore.getState().theme).toBe('dark');
      
      setTheme('light');
      expect(useUIStore.getState().theme).toBe('light');
    });

    test('should handle system theme', () => {
      const { setTheme } = useUIStore.getState();
      
      setTheme('system');
      expect(useUIStore.getState().theme).toBe('system');
    });

    test('should cycle through all themes', () => {
      const { setTheme } = useUIStore.getState();
      const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
      
      themes.forEach(theme => {
        setTheme(theme);
        expect(useUIStore.getState().theme).toBe(theme);
      });
    });
  });

  describe('openTaskEdit', () => {
    test('should open task edit dialog with task ID', () => {
      const { openTaskEdit } = useUIStore.getState();
      
      openTaskEdit('task-123');
      
      expect(useUIStore.getState().isTaskEditOpen).toBe(true);
      expect(useUIStore.getState().taskEditId).toBe('task-123');
    });

    test('should update task ID when opening different task', () => {
      const { openTaskEdit } = useUIStore.getState();
      
      openTaskEdit('task-1');
      expect(useUIStore.getState().taskEditId).toBe('task-1');
      
      openTaskEdit('task-2');
      expect(useUIStore.getState().taskEditId).toBe('task-2');
    });
  });

  describe('closeTaskEdit', () => {
    test('should close task edit dialog and clear task ID', () => {
      const { openTaskEdit, closeTaskEdit } = useUIStore.getState();
      
      openTaskEdit('task-123');
      expect(useUIStore.getState().isTaskEditOpen).toBe(true);
      expect(useUIStore.getState().taskEditId).toBe('task-123');
      
      closeTaskEdit();
      expect(useUIStore.getState().isTaskEditOpen).toBe(false);
      expect(useUIStore.getState().taskEditId).toBeNull();
    });
  });

  describe('state persistence', () => {
    test('should have initial state values', () => {
      const state = useUIStore.getState();
      
      expect(state.theme).toBe('system');
      expect(state.sidebarOpen).toBe(false);
      expect(state.showCompletedTasks).toBe(false);
      expect(state.searchQuery).toBe('');
      expect(state.isTaskFormOpen).toBe(false);
      expect(state.taskFormDefaultListId).toBeNull();
      expect(state.isTaskEditOpen).toBe(false);
      expect(state.taskEditId).toBeNull();
    });
  });

  describe('complex workflows', () => {
    test('should handle opening form then edit', () => {
      const { openTaskForm, openTaskEdit } = useUIStore.getState();
      
      openTaskForm('list-1');
      expect(useUIStore.getState().isTaskFormOpen).toBe(true);
      
      openTaskEdit('task-1');
      expect(useUIStore.getState().isTaskEditOpen).toBe(true);
      expect(useUIStore.getState().isTaskFormOpen).toBe(true); // Both can be open
    });

    test('should handle multiple state changes', () => {
      const { toggleSidebar, setSearchQuery, toggleShowCompleted } = useUIStore.getState();
      
      toggleSidebar();
      setSearchQuery('test');
      toggleShowCompleted();
      
      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(true);
      expect(state.searchQuery).toBe('test');
      expect(state.showCompletedTasks).toBe(true);
    });
  });
});
