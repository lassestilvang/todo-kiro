'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { TaskList } from '@/components/task';
import { useTaskStore } from '@/lib/store/task-store';
import { useLabelStore } from '@/lib/store/label-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function LabelPage() {
  const params = useParams();
  const labelId = params.id as string;
  
  const labels = useLabelStore((state) => state.labels);
  const allTasks = useTaskStore((state) => state.tasks);
  const loadTasksByLabel = useTaskStore((state) => state.loadTasksByLabel);
  const loadLabels = useLabelStore((state) => state.loadLabels);
  const openTaskEdit = useUIStore((state) => state.openTaskEdit);
  const openTaskForm = useUIStore((state) => state.openTaskForm);

  useEffect(() => {
    loadLabels();
    loadTasksByLabel(labelId);
  }, [loadLabels, loadTasksByLabel, labelId]);

  const label = labels.find((l) => l.id === labelId);

  // Filter out subtasks (parent tasks only)
  const tasks = useMemo(() => {
    return allTasks.filter((t) => !t.parentTaskId);
  }, [allTasks]);
  
  if (!label) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-2">Label Not Found</h1>
          <p className="text-muted-foreground">
            The label you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  const handleTaskClick = (task: { id: string }) => {
    openTaskEdit(task.id);
  };

  const handleAddTask = () => {
    openTaskForm();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl">{label.icon}</span>
          <h1 className="text-2xl md:text-3xl font-bold">{label.name}</h1>
        </div>
        <Button onClick={handleAddTask} size="sm" className="min-h-[44px] w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      <TaskList
        tasks={tasks}
        emptyMessage={`No tasks with label "${label.name}".`}
        onTaskClick={handleTaskClick}
      />
    </div>
  );
}
