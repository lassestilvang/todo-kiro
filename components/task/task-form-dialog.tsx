'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TaskForm } from './task-form';
import { useUIStore } from '@/lib/store/ui-store';
import { useTaskStore } from '@/lib/store/task-store';
import { useListStore } from '@/lib/store/list-store';
import type { TaskInputFormData } from '@/lib/validations';

/**
 * Global task form dialog that can be triggered from anywhere in the app
 */
export function TaskFormDialog() {
  const isOpen = useUIStore((state) => state.isTaskFormOpen);
  const closeTaskForm = useUIStore((state) => state.closeTaskForm);
  const taskFormDefaultListId = useUIStore((state) => state.taskFormDefaultListId);
  const addTask = useTaskStore((state) => state.addTask);
  const inbox = useListStore((state) => state.getInbox());

  const handleSubmit = async (
    data: TaskInputFormData,
    labelIds: string[],
    recurringPattern?: {
      pattern: 'none' | 'daily' | 'weekly' | 'weekday' | 'monthly' | 'yearly' | 'custom';
      customPattern?: string | null;
      endDate?: Date | null;
    },
    reminders?: Date[]
  ) => {
    try {
      // Use the default list ID from the store, or fall back to inbox
      const listId = taskFormDefaultListId || data.listId || inbox?.id;
      
      if (!listId) {
        throw new Error('No list available for task creation');
      }

      await addTask(
        {
          name: data.name,
          description: data.description || null,
          listId,
          date: data.date || null,
          deadline: data.deadline || null,
          estimatedTime: data.estimatedTime || null,
          actualTime: data.actualTime || null,
          priority: data.priority || 'none',
          completed: false,
          parentTaskId: data.parentTaskId || null,
        },
        labelIds,
        recurringPattern,
        reminders
      );

      closeTaskForm();
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeTaskForm}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your list. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          defaultListId={taskFormDefaultListId || inbox?.id}
          onSubmit={handleSubmit}
          onCancel={closeTaskForm}
          submitLabel="Create Task"
        />
      </DialogContent>
    </Dialog>
  );
}
