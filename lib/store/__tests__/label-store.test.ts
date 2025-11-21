import { describe, test, expect, beforeEach } from 'bun:test';
import { useLabelStore } from '../label-store';

describe('LabelStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useLabelStore.setState({
      labels: [],
      isLoading: false,
      isSubmitting: false,
    });
  });

  describe('state management', () => {
    test('should initialize with empty labels', () => {
      const { labels } = useLabelStore.getState();
      expect(labels).toEqual([]);
    });

    test('should update loading state', () => {
      useLabelStore.setState({ isLoading: true });
      expect(useLabelStore.getState().isLoading).toBe(true);
      
      useLabelStore.setState({ isLoading: false });
      expect(useLabelStore.getState().isLoading).toBe(false);
    });

    test('should update submitting state', () => {
      useLabelStore.setState({ isSubmitting: true });
      expect(useLabelStore.getState().isSubmitting).toBe(true);
      
      useLabelStore.setState({ isSubmitting: false });
      expect(useLabelStore.getState().isSubmitting).toBe(false);
    });

    test('should store labels correctly', () => {
      const labels = [
        {
          id: 'label-1',
          name: 'Urgent',
          icon: '🔥',
          color: '#ef4444',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'label-2',
          name: 'Important',
          icon: '⭐',
          color: '#f59e0b',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      useLabelStore.setState({ labels });

      const { labels: storedLabels } = useLabelStore.getState();
      expect(storedLabels).toHaveLength(2);
      expect(storedLabels[0]?.id).toBe('label-1');
      expect(storedLabels[1]?.id).toBe('label-2');
    });
  });
});
