'use client';

import { useEffect, useMemo } from 'react';
import { TaskList } from '@/components/task';
import { useTaskStore } from '@/lib/store/task-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TodayPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const openTaskEdit = useUIStore((state) => state.openTaskEdit);
  const openTaskForm = useUIStore((state) => state.openTaskForm);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const { todayTasks, overdueTasks } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const todayFiltered = tasks.filter((t) => {
      if (t.parentTaskId) return false;
      if (!t.date) return false;
      const taskDate = new Date(t.date);
      const taskDateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
      return taskDateStr === todayStr;
    });

    const overdueFiltered = tasks.filter((t) => {
      if (t.parentTaskId) return false;
      if (t.completed) return false;
      if (!t.deadline) return false;
      const deadlineDate = new Date(t.deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      return deadlineDate < today;
    });

    return { todayTasks: todayFiltered, overdueTasks: overdueFiltered };
  }, [tasks]);
  
  // Combine overdue and today tasks, with overdue tasks first
  const allTasks = [...overdueTasks, ...todayTasks.filter(t => !overdueTasks.find(ot => ot.id === t.id))];

  const handleTaskClick = (task: { id: string }) => {
    openTaskEdit(task.id);
  };

  const handleAddTask = () => {
    openTaskForm();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Today</h1>
          {overdueTasks.length > 0 && (
            <p className="text-sm text-destructive mt-1">
              {overdueTasks.length} overdue {overdueTasks.length === 1 ? 'task' : 'tasks'}
            </p>
          )}
        </div>
        <Button onClick={handleAddTask} size="sm" className="min-h-[44px] w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      <TaskList
        tasks={allTasks}
        emptyMessage="No tasks scheduled for today. Enjoy your day!"
        onTaskClick={handleTaskClick}
      />
    </div>
  );
}
