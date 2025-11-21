'use client';

import { useEffect, useState } from 'react';
import { useListStore } from '@/lib/store/list-store';
import { useLabelStore } from '@/lib/store/label-store';
import { useTaskStore } from '@/lib/store/task-store';

/**
 * AppInitializer component
 * Handles loading all application data on mount
 */
export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadLists = useListStore((state) => state.loadLists);
  const loadLabels = useLabelStore((state) => state.loadLabels);
  const loadTasks = useTaskStore((state) => state.loadTasks);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Load all data in parallel
        await Promise.all([
          loadLists(),
          loadLabels(),
          loadTasks(),
        ]);
        
        setIsInitialized(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize application';
        console.error('Initialization error:', errorMessage);
        setError(errorMessage);
        setIsInitialized(true); // Still set to true to show the error state
      }
    }

    initializeApp();
  }, [loadLists, loadLabels, loadTasks]);

  // Show error state if initialization failed
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4 p-6 max-w-md">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600">Initialization Error</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Failed to load application data. Please refresh the page to try again.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading application...</p>
        </div>
      </div>
    );
  }

  // Render children once initialized
  return <>{children}</>;
}
