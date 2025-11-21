import { describe, test, expect, beforeEach } from 'bun:test';
import { useListStore } from '../list-store';

describe('ListStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useListStore.setState({
      lists: [],
      isLoading: false,
      isSubmitting: false,
    });
  });

  describe('getInbox', () => {
    test('should return the default inbox list', () => {
      const lists = [
        {
          id: 'inbox-1',
          name: 'Inbox',
          color: '#3b82f6',
          emoji: '📥',
          isDefault: true,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'list-1',
          name: 'Work',
          color: '#ef4444',
          emoji: '💼',
          isDefault: false,
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      useListStore.setState({ lists });

      const { getInbox } = useListStore.getState();
      const inbox = getInbox();
      
      expect(inbox).toBeDefined();
      expect(inbox?.id).toBe('inbox-1');
      expect(inbox?.isDefault).toBe(true);
    });

    test('should return undefined when no inbox exists', () => {
      const lists = [
        {
          id: 'list-1',
          name: 'Work',
          color: '#ef4444',
          emoji: '💼',
          isDefault: false,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      useListStore.setState({ lists });

      const { getInbox } = useListStore.getState();
      const inbox = getInbox();
      
      expect(inbox).toBeUndefined();
    });
  });

  describe('state management', () => {
    test('should initialize with empty lists', () => {
      const { lists } = useListStore.getState();
      expect(lists).toEqual([]);
    });

    test('should update loading state', () => {
      useListStore.setState({ isLoading: true });
      expect(useListStore.getState().isLoading).toBe(true);
      
      useListStore.setState({ isLoading: false });
      expect(useListStore.getState().isLoading).toBe(false);
    });

    test('should update submitting state', () => {
      useListStore.setState({ isSubmitting: true });
      expect(useListStore.getState().isSubmitting).toBe(true);
      
      useListStore.setState({ isSubmitting: false });
      expect(useListStore.getState().isSubmitting).toBe(false);
    });
  });
});
