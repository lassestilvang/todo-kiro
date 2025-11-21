/**
 * Tests for useToast hook
 */

import { describe, test, expect } from 'bun:test';
import { toast, reducer } from '../use-toast';

describe('Toast Hook', () => {
  describe('reducer', () => {
    test('should add toast to state', () => {
      const state = { toasts: [] };
      const action = {
        type: 'ADD_TOAST' as const,
        toast: {
          id: '1',
          title: 'Test Toast',
          open: true
        }
      };
      
      const newState = reducer(state, action);
      
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].id).toBe('1');
      expect(newState.toasts[0].title).toBe('Test Toast');
    });

    test('should limit toasts to TOAST_LIMIT', () => {
      const state = { toasts: [] };
      
      // Add first toast
      let newState = reducer(state, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Toast 1', open: true }
      });
      
      // Add second toast (should replace first due to limit of 1)
      newState = reducer(newState, {
        type: 'ADD_TOAST',
        toast: { id: '2', title: 'Toast 2', open: true }
      });
      
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].id).toBe('2');
    });

    test('should update existing toast', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Original', open: true }
        ]
      };
      
      const action = {
        type: 'UPDATE_TOAST' as const,
        toast: {
          id: '1',
          title: 'Updated'
        }
      };
      
      const newState = reducer(state, action);
      
      expect(newState.toasts[0].title).toBe('Updated');
      expect(newState.toasts[0].open).toBe(true);
    });

    test('should dismiss specific toast', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true }
        ]
      };
      
      const action = {
        type: 'DISMISS_TOAST' as const,
        toastId: '1'
      };
      
      const newState = reducer(state, action);
      
      expect(newState.toasts[0].open).toBe(false);
      expect(newState.toasts[1].open).toBe(true);
    });

    test('should dismiss all toasts when no toastId provided', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true }
        ]
      };
      
      const action = {
        type: 'DISMISS_TOAST' as const
      };
      
      const newState = reducer(state, action);
      
      expect(newState.toasts[0].open).toBe(false);
      expect(newState.toasts[1].open).toBe(false);
    });

    test('should remove specific toast', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true }
        ]
      };
      
      const action = {
        type: 'REMOVE_TOAST' as const,
        toastId: '1'
      };
      
      const newState = reducer(state, action);
      
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].id).toBe('2');
    });

    test('should remove all toasts when no toastId provided', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true }
        ]
      };
      
      const action = {
        type: 'REMOVE_TOAST' as const
      };
      
      const newState = reducer(state, action);
      
      expect(newState.toasts).toHaveLength(0);
    });
  });

  describe('toast function', () => {
    test('should create toast with title', () => {
      const result = toast({ title: 'Test Toast' });
      
      expect(result.id).toBeDefined();
      expect(typeof result.dismiss).toBe('function');
      expect(typeof result.update).toBe('function');
    });

    test('should create toast with description', () => {
      const result = toast({
        title: 'Test Toast',
        description: 'Test description'
      });
      
      expect(result.id).toBeDefined();
    });

    test('should create toast with variant', () => {
      const result = toast({
        title: 'Error Toast',
        variant: 'destructive'
      });
      
      expect(result.id).toBeDefined();
    });

    test('should return dismiss function', () => {
      const result = toast({ title: 'Test' });
      
      expect(typeof result.dismiss).toBe('function');
      result.dismiss(); // Should not throw
    });

    test('should return update function', () => {
      const result = toast({ title: 'Test' });
      
      expect(typeof result.update).toBe('function');
      result.update({ title: 'Updated', id: result.id, open: true }); // Should not throw
    });

    test('should generate unique IDs', () => {
      const toast1 = toast({ title: 'Toast 1' });
      const toast2 = toast({ title: 'Toast 2' });
      
      expect(toast1.id).not.toBe(toast2.id);
    });
  });
});