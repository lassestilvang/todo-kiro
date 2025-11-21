'use client';

import { format } from 'date-fns';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { fadeInVariants, layoutTransition } from '@/lib/utils/animations';
import type { Task, RecurringPatternType } from '@/types';
import { useTaskStore } from '@/lib/store/task-store';
import { useTaskLabelStore } from '@/lib/store/task-label-store';
import { useListStore } from '@/lib/store/list-store';
import { useUIStore } from '@/lib/store/ui-store';
import { isTaskOverdue } from '@/lib/utils/tasks';
import { getRecurringPatternDescription } from '@/lib/utils/recurring';
import { Repeat } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLucideIcon } from '@/lib/utils/icons';

interface TaskItemProps {
  task: Task;
  onClick?: () => void;
}

export function TaskItem({ task, onClick }: TaskItemProps) {
  const toggleTaskComplete = useTaskStore((state) => state.toggleTaskComplete);
  const getSubtasks = useTaskStore((state) => state.getSubtasks);
  const loadTaskLabels = useTaskLabelStore((state) => state.loadTaskLabels);
  const getTaskLabelsFromStore = useTaskLabelStore((state) => state.getTaskLabels);
  const lists = useListStore((state) => state.lists);
  const openTaskEdit = useUIStore((state) => state.openTaskEdit);
  const [recurringPattern, setRecurringPattern] = useState<{ pattern: string; custom_pattern: string | null; end_date: string | null } | null>(null);
  
  // Load task labels
  useEffect(() => {
    loadTaskLabels(task.id);
  }, [task.id, loadTaskLabels]);
  
  // Load recurring pattern
  useEffect(() => {
    const loadRecurringPattern = async () => {
      try {
        const response = await fetch(`/api/tasks/${task.id}/recurring-pattern`);
        if (response.ok) {
          const pattern = await response.json();
          setRecurringPattern(pattern);
        }
      } catch (error) {
        console.error('Failed to load recurring pattern:', error);
      }
    };
    
    loadRecurringPattern();
  }, [task.id]);
  
  // Get task labels
  const taskLabels = getTaskLabelsFromStore(task.id);
  
  // Get task list
  const taskList = lists.find((list) => list.id === task.listId);
  
  // Get subtasks count
  const subtasks = getSubtasks(task.id);
  const completedSubtasks = subtasks.filter((st) => st.completed).length;
  
  // Check if task is overdue
  const isOverdue = isTaskOverdue(task);
  
  // Get recurring description
  const recurringDescription = recurringPattern 
    ? getRecurringPatternDescription(
        recurringPattern.pattern as RecurringPatternType,
        recurringPattern.custom_pattern,
        recurringPattern.end_date ? new Date(recurringPattern.end_date) : null
      )
    : null;
  
  // Priority colors
  const priorityColors = {
    high: 'text-red-500 dark:text-red-400',
    medium: 'text-orange-500 dark:text-orange-400',
    low: 'text-blue-500 dark:text-blue-400',
    none: 'text-gray-400 dark:text-gray-500',
  };
  
  const handleCheckboxChange = async () => {
    await toggleTaskComplete(task.id);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      openTaskEdit(task.id);
    }
  };
  
  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      transition={layoutTransition}
      className={cn(
        'group flex items-start gap-3 p-3 md:p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer',
        'active:scale-[0.98] transition-transform min-h-[60px]',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        task.completed && 'opacity-60'
      )}
      onClick={handleClick}
      role="article"
      aria-label={`Task: ${task.name}${task.completed ? ' (completed)' : ''}`}
    >
      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()} className="min-h-[44px] flex items-center">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleCheckboxChange}
          className="mt-0.5 h-5 w-5 md:h-4 md:w-4"
          aria-label={`Mark task "${task.name}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
      </div>
      
      {/* Priority indicator */}
      <div 
        className={cn('w-1 h-1 rounded-full mt-2 shrink-0', priorityColors[task.priority])} 
        aria-label={`Priority: ${task.priority}`}
        role="img"
      />
      
      {/* Task content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Task name */}
        <div className={cn(
          'font-medium text-sm md:text-sm',
          task.completed && 'line-through text-muted-foreground'
        )}>
          {task.name}
        </div>
        
        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-xs" role="list" aria-label="Task metadata">
          {/* Date badge */}
          {task.date && (
            <Badge variant="outline" className="gap-1" role="listitem">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              <span aria-label={`Scheduled for ${format(task.date, 'MMMM d')}`}>
                {format(task.date, 'MMM d')}
              </span>
            </Badge>
          )}
          
          {/* Deadline badge */}
          {task.deadline && (
            <Badge 
              variant={isOverdue ? 'destructive' : 'outline'} 
              className="gap-1"
              role="listitem"
            >
              {isOverdue && <AlertCircle className="h-3 w-3" aria-hidden="true" />}
              <Clock className="h-3 w-3" aria-hidden="true" />
              <span aria-label={`Deadline: ${format(task.deadline, 'MMMM d')}${isOverdue ? ' (overdue)' : ''}`}>
                {format(task.deadline, 'MMM d')}
              </span>
            </Badge>
          )}
          
          {/* List badge */}
          {taskList && (
            <Badge
              variant="secondary"
              className="gap-1"
              style={{ 
                backgroundColor: `${taskList.color}20`,
                color: taskList.color,
                borderColor: `${taskList.color}40`
              }}
              role="listitem"
              aria-label={`List: ${taskList.name}`}
            >
              <span aria-hidden="true">{taskList.emoji}</span>
              <span>{taskList.name}</span>
            </Badge>
          )}
          
          {/* Label chips */}
          {taskLabels.map((label) => {
            const IconComponent = getLucideIcon(label.icon);
            return (
              <Badge
                key={label.id}
                variant="secondary"
                className="gap-1"
                style={{ 
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                  borderColor: `${label.color}40`
                }}
                role="listitem"
                aria-label={`Tag: ${label.name}`}
              >
                <IconComponent className="h-3 w-3" aria-hidden="true" />
                <span>{label.name}</span>
              </Badge>
            );
          })}
          
          {/* Subtask count indicator */}
          {subtasks.length > 0 && (
            <Badge variant="outline" className="gap-1" role="listitem">
              <span className="text-muted-foreground" aria-label={`${completedSubtasks} of ${subtasks.length} subtasks completed`}>
                {completedSubtasks}/{subtasks.length}
              </span>
            </Badge>
          )}
          
          {/* Recurring indicator */}
          {recurringPattern && (
            <Badge 
              variant="outline" 
              className="gap-1" 
              title={recurringDescription || undefined}
              role="listitem"
              aria-label={`Recurring: ${recurringDescription || 'Custom pattern'}`}
            >
              <Repeat className="h-3 w-3" aria-hidden="true" />
              <span className="text-muted-foreground">
                {recurringPattern.pattern === 'daily' && 'Daily'}
                {recurringPattern.pattern === 'weekly' && 'Weekly'}
                {recurringPattern.pattern === 'weekday' && 'Weekdays'}
                {recurringPattern.pattern === 'monthly' && 'Monthly'}
                {recurringPattern.pattern === 'yearly' && 'Yearly'}
                {recurringPattern.pattern === 'custom' && 'Custom'}
              </span>
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}
