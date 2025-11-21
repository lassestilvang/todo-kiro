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
  });
});
