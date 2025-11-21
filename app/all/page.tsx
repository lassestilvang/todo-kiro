'use client';

import { useEffect } from 'react';
import { TaskList } from '@/components/task';
import { useTaskStore } from '@/lib/store/task-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AllTasksPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const openTaskEdit = useUIStore((state) => state.openTaskEdit);
  const openTaskForm = useUIStore((state) => state.openTaskForm);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Filter out subtasks (only show top-level tasks)
  const topLevelTasks = tasks.filter((task) => !task.parentTaskId);

  const handleTaskClick = (task: { id: string }) => {
    openTaskEdit(task.id);
  };

  const handleAddTask = () => {
    openTaskForm();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">All Tasks</h1>
        <Button onClick={handleAddTask} size="sm" className="min-h-[44px] w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      <TaskList
        tasks={topLevelTasks}
        emptyMessage="No tasks yet. Create your first task to get started!"
        onTaskClick={handleTaskClick}
      />
    </div>
  );
}
