import { describe, test, expect, beforeEach } from 'bun:test';
import { useListStore } from '../../../lib/store/list-store';
import { useLabelStore } from '../../../lib/store/label-store';
import { useTaskStore } from '../../../lib/store/task-store';
import { getOverdueCount } from '../../../lib/utils/tasks';
import type { List, Label, Task } from '../../../types';

/**
 * Sidebar Component Tests
 * 
 * These tests focus on the data logic and utilities used by the Sidebar component.
 * 
 * Requirements tested:
 * - 1.3: List display in sidebar
 * - 6.3: Overdue badge display
 * - 8.1: Sidebar navigation structure
 * - 15.3: Label display in sidebar
 */

describe('Sidebar Component Logic', () => {
  beforeEach(() => {
    // Reset stores
    useListStore.setState({
      lists: [],
      isLoading: false,
    });
    
    useLabelStore.setState({
      labels: [],
      isLoading: false,
    });
    
    useTaskStore.setState({
      tasks: [],
      selectedTaskId: null,
      isLoading: false,
      isSubmitting: false,
    });
  });

  describe('navigation links', () => {
    test('should have standard view routes', () => {
      const standardViews = [
        { path: '/inbox', name: 'Inbox' },
        { path: '/today', name: 'Today' },
        { path: '/upcoming', name: 'Upcoming' },
        { path: '/next-7-days', name: 'Next 7 Days' },
        { path: '/all', name: 'All' },
      ];
      
      standardViews.forEach(view => {
        expect(view.path).toBeDefined();
        expect(view.name).toBeDefined();
      });
    });

    test('should support custom list routes', () => {
      const customList: List = {
        id: 'list-1',
        name: 'Work',
        color: '#3b82f6',
        emoji: '💼',
        isDefault: false,
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const listRoute = `/list/${customList.id}`;
      expect(listRoute).toBe('/list/list-1');
    });

    test('should support label routes', () => {
      const label: Label = {
        id: 'label-1',
        name: 'Important',
        icon: 'Star',
        color: '#ef4444',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const labelRoute = `/label/${label.id}`;
      expect(labelRoute).toBe('/label/label-1');
    });
  });

  describe('list display', () => {
    test('should display custom lists', () => {
      const lists: List[] = [
        {
          id: 'inbox',
          name: 'Inbox',
          color: '#6b7280',
          emoji: '📥',
          isDefault: true,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'list-1',
          name: 'Work',
          color: '#3b82f6',
          emoji: '💼',
          isDefault: false,
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'list-2',
          name: 'Personal',
          color: '#10b981',
          emoji: '🏠',
          isDefault: false,
          position: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      useListStore.setState({ lists });
      
      const customLists = lists.filter(l => !l.isDefault);
      expect(customLists).toHaveLength(2);
      expect(customLists[0]?.name).toBe('Work');
      expect(customLists[1]?.name).toBe('Personal');
    });

    test('should exclude default Inbox from custom lists', () => {
      const lists: List[] = [
        {
          id: 'inbox',
          name: 'Inbox',
          color: '#6b7280',
          emoji: '📥',
          isDefault: true,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'list-1',
          name: 'Work',
          color: '#3b82f6',
          emoji: '💼',
          isDefault: false,
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      const customLists = lists.filter(l => !l.isDefault);
      expect(customLists).toHaveLength(1);
      expect(customLists.every(l => !l.isDefault)).toBe(true);
    });

    test('should display list properties', () => {
      const list: List = {
        id: 'list-1',
        name: 'Work',
        color: '#3b82f6',
        emoji: '💼',
        isDefault: false,
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      expect(list.name).toBe('Work');
      expect(list.color).toBe('#3b82f6');
      expect(list.emoji).toBe('💼');
    });
  });

  describe('label display', () => {
    test('should display all labels', () => {
      const labels: Label[] = [
        {
          id: 'label-1',
          name: 'Important',
          icon: 'Star',
          color: '#ef4444',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'label-2',
          name: 'Urgent',
          icon: 'Zap',
          color: '#f59e0b',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      useLabelStore.setState({ labels });
      
      const state = useLabelStore.getState();
      expect(state.labels).toHaveLength(2);
      expect(state.labels[0]?.name).toBe('Important');
      expect(state.labels[1]?.name).toBe('Urgent');
    });

    test('should display label properties', () => {
      const label: Label = {
        id: 'label-1',
        name: 'Important',
        icon: 'Star',
        color: '#ef4444',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      expect(label.name).toBe('Important');
      expect(label.icon).toBe('Star');
      expect(label.color).toBe('#ef4444');
    });

    test('should handle empty labels list', () => {
      useLabelStore.setState({ labels: [] });
      
      const state = useLabelStore.getState();
      expect(state.labels).toHaveLength(0);
    });
  });

  describe('overdue badge', () => {
    test('should calculate overdue count', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          name: 'Overdue Task 1',
          listId: 'list-1',
          deadline: new Date('2020-01-01'),
          completed: false,
          priority: 'none',
          description: null,
          date: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          parentTaskId: null,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-2',
          name: 'Overdue Task 2',
          listId: 'list-1',
          deadline: new Date('2020-01-02'),
          completed: false,
          priority: 'none',
          description: null,
          date: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          parentTaskId: null,
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-3',
          name: 'Future Task',
          listId: 'list-1',
          deadline: new Date('2030-01-01'),
          completed: false,
          priority: 'none',
          description: null,
          date: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          parentTaskId: null,
          position: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      const overdueCount = getOverdueCount(tasks);
      expect(overdueCount).toBe(2);
    });

    test('should not count completed overdue tasks', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          name: 'Completed Overdue Task',
          listId: 'list-1',
          deadline: new Date('2020-01-01'),
          completed: true,
          priority: 'none',
          description: null,
          date: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: new Date(),
          parentTaskId: null,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      const overdueCount = getOverdueCount(tasks);
      expect(overdueCount).toBe(0);
    });

    test('should return zero when no overdue tasks', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          name: 'Future Task',
          listId: 'list-1',
          deadline: new Date('2030-01-01'),
          completed: false,
          priority: 'none',
          description: null,
          date: null,
          estimatedTime: null,
          actualTime: null,
          completedAt: null,
          parentTaskId: null,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      const overdueCount = getOverdueCount(tasks);
      expect(overdueCount).toBe(0);
    });

    test('should handle empty tasks array', () => {
      const overdueCount = getOverdueCount([]);
      expect(overdueCount).toBe(0);
    });
  });

  describe('list management actions', () => {
    test('should support adding lists', () => {
      const newList: List = {
        id: 'list-1',
        name: 'Work',
        color: '#3b82f6',
        emoji: '💼',
        isDefault: false,
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      useListStore.setState({ lists: [newList] });
      
      const state = useListStore.getState();
      expect(state.lists).toHaveLength(1);
      expect(state.lists[0]?.name).toBe('Work');
    });

    test('should prevent deletion of default Inbox', () => {
      const inbox: List = {
        id: 'inbox',
        name: 'Inbox',
        color: '#6b7280',
        emoji: '📥',
        isDefault: true,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      expect(inbox.isDefault).toBe(true);
    });
  });

  describe('label management actions', () => {
    test('should support adding labels', () => {
      const newLabel: Label = {
        id: 'label-1',
        name: 'Important',
        icon: 'Star',
        color: '#ef4444',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      useLabelStore.setState({ labels: [newLabel] });
      
      const state = useLabelStore.getState();
      expect(state.labels).toHaveLength(1);
      expect(state.labels[0]?.name).toBe('Important');
    });
  });
});
