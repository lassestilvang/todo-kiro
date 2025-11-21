'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { TaskList } from '@/components/task';
import { useTaskStore } from '@/lib/store/task-store';
import { useListStore } from '@/lib/store/list-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ListPage() {
  const params = useParams();
  const listId = params.id as string;
  
  const lists = useListStore((state) => state.lists);
  const allTasks = useTaskStore((state) => state.tasks);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const loadLists = useListStore((state) => state.loadLists);
  const openTaskEdit = useUIStore((state) => state.openTaskEdit);
  const openTaskForm = useUIStore((state) => state.openTaskForm);

  useEffect(() => {
    loadLists();
    loadTasks();
  }, [loadLists, loadTasks]);

  const list = lists.find((l) => l.id === listId);

  const tasks = useMemo(() => {
    return allTasks.filter((t) => t.listId === listId && !t.parentTaskId);
  }, [allTasks, listId]);
  
  if (!list) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-2">List Not Found</h1>
          <p className="text-muted-foreground">
            The list you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  const handleTaskClick = (task: { id: string }) => {
    openTaskEdit(task.id);
  };

  const handleAddTask = () => {
    openTaskForm(listId);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl">{list.emoji}</span>
          <h1 className="text-2xl md:text-3xl font-bold">{list.name}</h1>
        </div>
        <Button onClick={handleAddTask} size="sm" className="min-h-[44px] w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      <TaskList
        tasks={tasks}
        emptyMessage={`No tasks in ${list.name}. Add a task to get started!`}
        onTaskClick={handleTaskClick}
      />
    </div>
  );
}
