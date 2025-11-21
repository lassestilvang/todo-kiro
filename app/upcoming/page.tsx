'use client';

import { useEffect, useMemo } from 'react';
import { TaskList } from '@/components/task';
import { useTaskStore } from '@/lib/store/task-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function UpcomingPage() {
  const allTasks = useTaskStore((state) => state.tasks);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const openTaskEdit = useUIStore((state) => state.openTaskEdit);
  const openTaskForm = useUIStore((state) => state.openTaskForm);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const tasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return allTasks.filter((t) => {
      if (t.parentTaskId) return false;
      if (!t.date) return false;
      const taskDate = new Date(t.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= today;
    });
  }, [allTasks]);

  const handleTaskClick = (task: { id: string }) => {
    openTaskEdit(task.id);
  };

  const handleAddTask = () => {
    openTaskForm();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Upcoming</h1>
        <Button onClick={handleAddTask} size="sm" className="min-h-[44px] w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      <TaskList
        tasks={tasks}
        emptyMessage="No upcoming tasks scheduled."
        onTaskClick={handleTaskClick}
        groupBy="date"
      />
    </div>
  );
}
