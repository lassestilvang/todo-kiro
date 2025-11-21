import { useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/lib/store/task-store';

interface KeyboardShortcutConfig {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (e?: KeyboardEvent) => void;
  description: string;
}

/**
 * Custom hook for managing keyboard shortcuts throughout the application
 */
export function useKeyboardShortcuts() {
  const router = useRouter();
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId);
  const toggleTaskComplete = useTaskStore((state) => state.toggleTaskComplete);

  // Handler for Add Task shortcut (Cmd/Ctrl + K)
  const handleAddTask = useCallback(() => {
    // Trigger the Add Task button click
    const addTaskButton = document.querySelector('[data-add-task-button]') as HTMLButtonElement;
    if (addTaskButton) {
      addTaskButton.click();
    }
  }, []);

  // Handler for Search focus shortcut (Cmd/Ctrl + F)
  const handleSearchFocus = useCallback((e?: KeyboardEvent) => {
    if (e) e.preventDefault();
    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  // Handler for navigation shortcuts
  const handleNavigateToInbox = useCallback(() => {
    router.push('/inbox');
  }, [router]);

  const handleNavigateToToday = useCallback(() => {
    router.push('/today');
  }, [router]);

  const handleNavigateToUpcoming = useCallback(() => {
    router.push('/upcoming');
  }, [router]);

  const handleNavigateToNext7Days = useCallback(() => {
    router.push('/next-7-days');
  }, [router]);

  const handleNavigateToAll = useCallback(() => {
    router.push('/all');
  }, [router]);

  // Handler for task completion toggle (Cmd/Ctrl + Enter)
  const handleToggleTaskComplete = useCallback(async () => {
    if (selectedTaskId) {
      try {
        await toggleTaskComplete(selectedTaskId);
      } catch (error) {
        console.error('Failed to toggle task completion:', error);
      }
    }
  }, [selectedTaskId, toggleTaskComplete]);

  // Define all keyboard shortcuts
  const shortcuts: KeyboardShortcutConfig[] = useMemo(() => [
    {
      key: 'k',
      ctrlOrCmd: true,
      handler: handleAddTask,
      description: 'Add new task',
    },
    {
      key: 'f',
      ctrlOrCmd: true,
      handler: handleSearchFocus,
      description: 'Focus search',
    },
    {
      key: '1',
      ctrlOrCmd: true,
      handler: handleNavigateToInbox,
      description: 'Go to Inbox',
    },
    {
      key: '2',
      ctrlOrCmd: true,
      handler: handleNavigateToToday,
      description: 'Go to Today',
    },
    {
      key: '3',
      ctrlOrCmd: true,
      handler: handleNavigateToUpcoming,
      description: 'Go to Upcoming',
    },
    {
      key: '4',
      ctrlOrCmd: true,
      handler: handleNavigateToNext7Days,
      description: 'Go to Next 7 Days',
    },
    {
      key: '5',
      ctrlOrCmd: true,
      handler: handleNavigateToAll,
      description: 'Go to All Tasks',
    },
    {
      key: 'Enter',
      ctrlOrCmd: true,
      handler: handleToggleTaskComplete,
      description: 'Toggle task completion',
    },
  ], [handleAddTask, handleSearchFocus, handleNavigateToInbox, handleNavigateToToday, handleNavigateToUpcoming, handleNavigateToNext7Days, handleNavigateToAll, handleToggleTaskComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input, textarea, or contenteditable element
      const target = e.target as HTMLElement;
      const isTyping = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Find matching shortcut
      for (const shortcut of shortcuts) {
        const ctrlOrCmdPressed = e.metaKey || e.ctrlKey;
        const shiftPressed = e.shiftKey;
        const altPressed = e.altKey;

        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlOrCmdMatches = shortcut.ctrlOrCmd ? ctrlOrCmdPressed : !ctrlOrCmdPressed;
        const shiftMatches = shortcut.shift ? shiftPressed : !shiftPressed;
        const altMatches = shortcut.alt ? altPressed : !altPressed;

        if (keyMatches && ctrlOrCmdMatches && shiftMatches && altMatches) {
          // Special handling for search focus - allow even when typing
          if (shortcut.key === 'f' && shortcut.ctrlOrCmd) {
            shortcut.handler(e);
            return;
          }

          // For other shortcuts, skip if user is typing (except Cmd/Ctrl+Enter for task completion)
          if (isTyping && !(shortcut.key === 'Enter' && shortcut.ctrlOrCmd)) {
            continue;
          }

          e.preventDefault();
          shortcut.handler(e);
          return;
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);

  return {
    shortcuts,
  };
}
