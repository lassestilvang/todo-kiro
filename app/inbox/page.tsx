'use client';

import { useEffect, useMemo } from 'react';
import { TaskList } from '@/components/task';
import { useTaskStore } from '@/lib/store/task-store';
import { useListStore } from '@/lib/store/list-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function InboxPage() {
  const allTasks = useTaskStore((state) => state.tasks);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const inbox = useListStore((state) => state.getInbox());
  const openTaskEdit = useUIStore((state) => state.openTaskEdit);
  const loadLists = useListStore((state) => state.loadLists);

  useEffect(() => {
    loadLists();
    loadTasks();
  }, [loadLists, loadTasks]);

  const inboxTasks = useMemo(() => {
    if (!inbox) return [];
    return allTasks.filter((t) => t.listId === inbox.id && !t.parentTaskId);
  }, [allTasks, inbox]);

  const handleTaskClick = (task: { id: string }) => {
    openTaskEdit(task.id);
  };

  const openTaskForm = useUIStore((state) => state.openTaskForm);

  const handleAddTask = () => {
    openTaskForm(inbox?.id);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Inbox</h1>
        <Button onClick={handleAddTask} size="sm" className="min-h-[44px] w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      <TaskList
        tasks={inboxTasks}
        emptyMessage="No tasks in your inbox. Add a task to get started!"
        onTaskClick={handleTaskClick}
      />
    </div>
  );
}
