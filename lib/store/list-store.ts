import { create } from 'zustand';
import { parseISO } from 'date-fns';
import type { List } from '@/types';
import { showErrorToast } from '@/lib/utils/error-handler';

// Helper function to convert database row to List model
function rowToList(row: { id: string; name: string; color: string; emoji: string; is_default: number; position: number; created_at: string; updated_at: string }): List {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    emoji: row.emoji,
    isDefault: row.is_default === 1,
    position: row.position,
    createdAt: parseISO(row.created_at),
    updatedAt: parseISO(row.updated_at),
  };
}

interface ListStore {
  lists: List[];
  isLoading: boolean;
  isSubmitting: boolean;
  
  // Actions
  addList: (list: Omit<List, 'id' | 'createdAt' | 'updatedAt' | 'isDefault' | 'position'>) => Promise<List>;
  updateList: (id: string, updates: Partial<List>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  loadLists: () => Promise<void>;
  
  // Computed selectors
  getInbox: () => List | undefined;
}

export const useListStore = create<ListStore>((set, get) => ({
  lists: [],
  isLoading: false,
  isSubmitting: false,

  // Load all lists from database
  loadLists: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/lists');
      if (!response.ok) throw new Error('Failed to fetch lists');
      const rows = await response.json();
      const lists = rows.map(rowToList);
      set({ lists, isLoading: false });
    } catch (error) {
      showErrorToast(error, 'Loading lists');
      set({ isLoading: false });
      throw error;
    }
  },

  // Add a new list
  addList: async (listInput) => {
    set({ isSubmitting: true });
    try {
      // Get the highest position
      const maxPosition = get().lists.reduce((max, l) => Math.max(max, l.position), -1);
      
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: listInput.name,
          color: listInput.color,
          emoji: listInput.emoji,
          position: maxPosition + 1,
        }),
      });

      if (!response.ok) throw new Error('Failed to create list');
      const row = await response.json();
      const newList = rowToList(row);
      set((state) => ({ lists: [...state.lists, newList], isSubmitting: false }));
      
      return newList;
    } catch (error) {
      showErrorToast(error, 'Creating list');
      set({ isSubmitting: false });
      throw error;
    }
  },

  // Update an existing list
  updateList: async (id, updates) => {
    set({ isSubmitting: true });
    try {
      const rowUpdates: Record<string, unknown> = {};
      
      if (updates.name !== undefined) rowUpdates.name = updates.name;
      if (updates.color !== undefined) rowUpdates.color = updates.color;
      if (updates.emoji !== undefined) rowUpdates.emoji = updates.emoji;
      if (updates.position !== undefined) rowUpdates.position = updates.position;

      const response = await fetch(`/api/lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rowUpdates),
      });

      if (!response.ok) throw new Error('Failed to update list');
      const updatedRow = await response.json();
      const updatedList = rowToList(updatedRow);
      
      set((state) => ({
        lists: state.lists.map((l) => (l.id === id ? updatedList : l)),
        isSubmitting: false,
      }));
    } catch (error) {
      showErrorToast(error, 'Updating list');
      set({ isSubmitting: false });
      throw error;
    }
  },

  // Delete a list
  deleteList: async (id) => {
    set({ isSubmitting: true });
    try {
      const response = await fetch(`/api/lists/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete list');
      
      set((state) => ({
        lists: state.lists.filter((l) => l.id !== id),
        isSubmitting: false,
      }));
    } catch (error) {
      showErrorToast(error, 'Deleting list');
      set({ isSubmitting: false });
      throw error;
    }
  },

  // Get the Inbox list
  getInbox: () => {
    return get().lists.find((l) => l.isDefault);
  },
}));
