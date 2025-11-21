'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TaskForm } from './task-form';
import { useUIStore } from '@/lib/store/ui-store';
import { useTaskStore } from '@/lib/store/task-store';
import type { TaskInputFormData } from '@/lib/validations';

/**
 * Global task edit dialog that can be triggered from anywhere in the app
 */
export function TaskEditDialog() {
  const isOpen = useUIStore((state) => state.isTaskEditOpen);
  const closeTaskEdit = useUIStore((state) => state.closeTaskEdit);
  const taskEditId = useUIStore((state) => state.taskEditId);
  const updateTask = useTaskStore((state) => state.updateTask);
  const tasks = useTaskStore((state) => state.tasks);

  // Find the task being edited
  const task = tasks.find((t) => t.id === taskEditId);

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
    if (!taskEditId) return;

    try {
      await updateTask(
        taskEditId,
        {
          name: data.name,
          description: data.description || null,
          listId: data.listId,
          date: data.date || null,
          deadline: data.deadline || null,
          estimatedTime: data.estimatedTime || null,
          actualTime: data.actualTime || null,
          priority: data.priority || 'none',
          parentTaskId: data.parentTaskId || null,
        },
        labelIds,
        recurringPattern,
        reminders
      );

      closeTaskEdit();
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeTaskEdit}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details below.
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          task={task}
          onSubmit={handleSubmit}
          onCancel={closeTaskEdit}
          submitLabel="Update Task"
        />
      </DialogContent>
    </Dialog>
  );
}
