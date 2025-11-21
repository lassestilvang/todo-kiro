'use client';

import { AnimatePresence } from 'framer-motion';
import { TaskItem } from './task-item';
import { useUIStore } from '@/lib/store/ui-store';
import type { Task } from '@/types';
import { Loader2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  emptyMessage?: string;
  onTaskClick?: (task: Task) => void;
  groupBy?: 'date' | 'list' | 'none';
}

export function TaskList({ 
  tasks, 
  loading = false, 
  emptyMessage = 'No tasks found',
  onTaskClick,
  groupBy = 'none'
}: TaskListProps) {
  const showCompletedTasks = useUIStore((state) => state.showCompletedTasks);
  
  // Filter tasks based on completion status
  const filteredTasks = showCompletedTasks 
    ? tasks 
    : tasks.filter((task) => !task.completed);
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  // Empty state
  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  
  // Group tasks if needed
  if (groupBy === 'date') {
    return <GroupedByDateTaskList tasks={filteredTasks} onTaskClick={onTaskClick} />;
  }
  
  if (groupBy === 'list') {
    return <GroupedByListTaskList tasks={filteredTasks} onTaskClick={onTaskClick} />;
  }
  
  // Render flat list
  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {filteredTasks.map((task) => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onClick={() => onTaskClick?.(task)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Helper component for date-grouped tasks
function GroupedByDateTaskList({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick?: (task: Task) => void }) {
  // Group tasks by date
  const groupedTasks = tasks.reduce<Record<string, Task[]>>((groups, task) => {
    let dateKey: string;
    if (task.date) {
      const date = new Date(task.date);
      dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } else {
      dateKey = 'no-date';
    }
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey]!.push(task);
    return groups;
  }, {});
  
  // Sort groups by date
  const sortedGroups = Object.entries(groupedTasks).sort((a, b) => {
    const [dateA] = a;
    const [dateB] = b;
    if (dateA === 'no-date') return 1;
    if (dateB === 'no-date') return -1;
    return dateA.localeCompare(dateB);
  });
  
  return (
    <div className="space-y-6">
      {sortedGroups.map(([dateKey, groupTasks]) => (
        <div key={dateKey} className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground px-1">
            {dateKey === 'no-date' ? 'No Date' : formatDateGroup(dateKey)}
          </h3>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {groupTasks.map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onClick={() => onTaskClick?.(task)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper component for list-grouped tasks
function GroupedByListTaskList({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick?: (task: Task) => void }) {
  // Group tasks by list
  const groupedTasks = tasks.reduce<Record<string, Task[]>>((groups, task) => {
    const listId = task.listId;
    if (!groups[listId]) {
      groups[listId] = [];
    }
    groups[listId].push(task);
    return groups;
  }, {});
  
  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([listId, groupTasks]) => (
        <div key={listId} className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground px-1">
            List: {listId}
          </h3>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {groupTasks.map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onClick={() => onTaskClick?.(task)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function to format date group headers
function formatDateGroup(dateStr: string): string {
  // Parse date string as local date to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year!, month! - 1, day);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dateKey = dateStr;
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const tomorrowKey = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  
  if (dateKey === todayKey) return 'Today';
  if (dateKey === tomorrowKey) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}
