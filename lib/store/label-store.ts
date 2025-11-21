import { create } from 'zustand';
import { parseISO } from 'date-fns';
import type { Label } from '@/types';
import { showErrorToast } from '@/lib/utils/error-handler';

// Helper function to convert database row to Label model
function rowToLabel(row: { id: string; name: string; icon: string; color: string; created_at: string; updated_at: string }): Label {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    createdAt: parseISO(row.created_at),
    updatedAt: parseISO(row.updated_at),
  };
}

interface LabelStore {
  labels: Label[];
  isLoading: boolean;
  isSubmitting: boolean;
  
  // Actions
  addLabel: (label: Omit<Label, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Label>;
  updateLabel: (id: string, updates: Partial<Label>) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
  loadLabels: () => Promise<void>;
}

export const useLabelStore = create<LabelStore>((set, _get) => ({
  labels: [],
  isLoading: false,
  isSubmitting: false,

  // Load all labels from database
  loadLabels: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/labels');
      if (!response.ok) throw new Error('Failed to fetch labels');
      const rows = await response.json();
      const labels = rows.map(rowToLabel);
      set({ labels, isLoading: false });
    } catch (error) {
      showErrorToast(error, 'Loading labels');
      set({ isLoading: false });
      throw error;
    }
  },

  // Add a new label
  addLabel: async (labelInput) => {
    set({ isSubmitting: true });
    try {
      const response = await fetch('/api/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: labelInput.name,
          icon: labelInput.icon,
          color: labelInput.color,
        }),
      });

      if (!response.ok) throw new Error('Failed to create label');
      const row = await response.json();
      const newLabel = rowToLabel(row);
      set((state) => ({ labels: [...state.labels, newLabel], isSubmitting: false }));
      
      return newLabel;
    } catch (error) {
      showErrorToast(error, 'Creating label');
      set({ isSubmitting: false });
      throw error;
    }
  },

  // Update an existing label
  updateLabel: async (id, updates) => {
    set({ isSubmitting: true });
    try {
      const rowUpdates: Record<string, unknown> = {};
      
      if (updates.name !== undefined) rowUpdates.name = updates.name;
      if (updates.icon !== undefined) rowUpdates.icon = updates.icon;
      if (updates.color !== undefined) rowUpdates.color = updates.color;

      const response = await fetch(`/api/labels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rowUpdates),
      });

      if (!response.ok) throw new Error('Failed to update label');
      const updatedRow = await response.json();
      const updatedLabel = rowToLabel(updatedRow);
      
      set((state) => ({
        labels: state.labels.map((l) => (l.id === id ? updatedLabel : l)),
        isSubmitting: false,
      }));
    } catch (error) {
      showErrorToast(error, 'Updating label');
      set({ isSubmitting: false });
      throw error;
    }
  },

  // Delete a label
  deleteLabel: async (id) => {
    set({ isSubmitting: true });
    try {
      const response = await fetch(`/api/labels/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete label');
      
      set((state) => ({
        labels: state.labels.filter((l) => l.id !== id),
        isSubmitting: false,
      }));
    } catch (error) {
      showErrorToast(error, 'Deleting label');
      set({ isSubmitting: false });
      throw error;
    }
  },
}));
