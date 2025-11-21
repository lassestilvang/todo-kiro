'use client';

import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes keyboard shortcuts for the entire application
 */
export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  return <>{children}</>;
}
