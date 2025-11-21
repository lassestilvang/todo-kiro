'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  Tag, 
  FileText, 
  History,
  Trash2,
  X,
  Heart,
  Star,
  Zap,
  Flag,
  CheckCircle,
  Info,
  Bookmark,
  Target,
  TrendingUp,
  Award,
  Gift,
  Bell,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Task, RecurringPatternType } from '@/types';
import { useTaskStore } from '@/lib/store/task-store';
import { useLabelStore } from '@/lib/store/label-store';
import { useTaskLabelStore } from '@/lib/store/task-label-store';
import { SubtaskList } from './subtask-list';
import { AttachmentList } from './attachment-list';
import { ChangeHistory } from './change-history';
import { getRecurringPatternDescription } from '@/lib/utils/recurring';
import { Repeat } from 'lucide-react';
import { useEffect } from 'react';

// Map icon names to Lucide icon components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Tag,
  Heart,
  Star,
  Zap,
  Flag,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Bookmark,
  Target,
  TrendingUp,
  Award,
  Gift,
};

interface TaskDetailProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetail({ task, open, onOpenChange }: TaskDetailProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<{ pattern: string; custom_pattern: string | null; end_date: string | null } | null>(null);
  const [reminders, setReminders] = useState<{ id: string; reminder_time: string; triggered: number }[]>([]);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const labels = useLabelStore((state) => state.labels);
  const loadTaskLabels = useTaskLabelStore((state) => state.loadTaskLabels);
  const getTaskLabelsFromStore = useTaskLabelStore((state) => state.getTaskLabels);
  
  // Load task data when task changes
  useEffect(() => {
    if (task?.id) {
      loadTaskLabels(task.id);
      
      // Load recurring pattern
      fetch(`/api/tasks/${task.id}/recurring-pattern`)
        .then(res => res.ok ? res.json() : null)
        .then(pattern => setRecurringPattern(pattern))
        .catch(err => console.error('Failed to load recurring pattern:', err));
      
      // Load reminders
      fetch(`/api/tasks/${task.id}/reminders`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setReminders(data))
        .catch(err => console.error('Failed to load reminders:', err));
    }
  }, [task?.id, loadTaskLabels]);
  
  if (!task) return null;
  
  const taskLabels = getTaskLabelsFromStore(task.id);
  const recurringDescription = recurringPattern 
    ? getRecurringPatternDescription(
        recurringPattern.pattern as RecurringPatternType,
        recurringPattern.custom_pattern,
        recurringPattern.end_date ? new Date(recurringPattern.end_date) : null
      )
    : null;
  
  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };
  
  const handleToggleLabel = async (labelId: string) => {
    const hasLabel = taskLabels.some((l) => l.id === labelId);
    
    try {
      if (hasLabel) {
        await fetch(`/api/tasks/${task.id}/labels?labelId=${labelId}`, {
          method: 'DELETE',
        });
      } else {
        await fetch(`/api/tasks/${task.id}/labels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ labelId }),
        });
      }
      // Force reload labels
      await loadTaskLabels(task.id, true);
    } catch (error) {
      console.error('Failed to toggle label:', error);
    }
  };
  
  const priorityColors = {
    high: 'text-red-500 dark:text-red-400',
    medium: 'text-orange-500 dark:text-orange-400',
    low: 'text-blue-500 dark:text-blue-400',
    none: 'text-gray-400 dark:text-gray-500',
  };
  
  const priorityLabels = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    none: 'None',
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0" aria-describedby="task-detail-description">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">{task.name}</DialogTitle>
          <p id="task-detail-description" className="sr-only">
            View and manage task details, including description, metadata, labels, subtasks, and attachments
          </p>
        </DialogHeader>
        
        {/* Tabs */}
        <div className="flex gap-4 px-6 border-b" role="tablist" aria-label="Task information tabs">
          <button
            role="tab"
            aria-selected={activeTab === 'details'}
            aria-controls="details-panel"
            id="details-tab"
            className={cn(
              'pb-2 text-sm font-medium transition-colors border-b-2',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'history'}
            aria-controls="history-panel"
            id="history-tab"
            className={cn(
              'pb-2 text-sm font-medium transition-colors border-b-2',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('history')}
          >
            <History className="inline h-4 w-4 mr-1" aria-hidden="true" />
            History
          </button>
        </div>
        
        <ScrollArea className="flex-1 px-6">
          {activeTab === 'details' ? (
            <div 
              id="details-panel" 
              role="tabpanel" 
              aria-labelledby="details-tab" 
              className="space-y-6 pb-6"
            >
              {/* Description */}
              {task.description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    Description
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}
              
              {/* Metadata */}
              <div className="space-y-3">
                {/* Priority */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Priority</span>
                  <Badge
                    variant="outline"
                    className={cn('gap-1', priorityColors[task.priority])}
                  >
                    {priorityLabels[task.priority]}
                  </Badge>
                </div>
                
                {/* Date */}
                {task.date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Date</span>
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(task.date, 'PPP')}
                    </Badge>
                  </div>
                )}
                
                {/* Deadline */}
                {task.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Deadline</span>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {format(task.deadline, 'PPP')}
                    </Badge>
                  </div>
                )}
                
                {/* Estimated Time */}
                {task.estimatedTime !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Estimated Time</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(task.estimatedTime / 60)}h {task.estimatedTime % 60}m
                    </span>
                  </div>
                )}
                
                {/* Actual Time */}
                {task.actualTime !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Actual Time</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(task.actualTime / 60)}h {task.actualTime % 60}m
                    </span>
                  </div>
                )}
                
                {/* Completed */}
                {task.completed && task.completedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm text-muted-foreground">
                      {format(task.completedAt, 'PPP')}
                    </span>
                  </div>
                )}
                
                {/* Recurring Pattern */}
                {recurringPattern && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Recurring</span>
                    <Badge variant="outline" className="gap-1">
                      <Repeat className="h-3 w-3" />
                      {recurringDescription}
                    </Badge>
                  </div>
                )}
                
                {/* Reminders */}
                {reminders.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Reminders</span>
                    <div className="space-y-1">
                      {reminders.map((reminder) => (
                        <div key={reminder.id} className="flex items-center gap-2">
                          <Bell className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {format(parseISO(reminder.reminder_time), 'PPP p')}
                          </span>
                          {reminder.triggered === 1 && (
                            <Badge variant="secondary" className="text-xs">
                              Triggered
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Labels */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4" />
                  Labels
                </div>
                <div className="flex flex-wrap gap-2">
                  {labels.map((label) => {
                    const isSelected = taskLabels.some((tl) => tl.id === label.id);
                    const IconComponent = ICON_MAP[label.icon] || Tag;
                    return (
                      <Badge
                        key={label.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer gap-1"
                        style={
                          isSelected
                            ? {
                                backgroundColor: label.color,
                                borderColor: label.color,
                              }
                            : {
                                borderColor: `${label.color}40`,
                                color: label.color,
                              }
                        }
                        onClick={() => handleToggleLabel(label.id)}
                      >
                        <IconComponent className="h-3 w-3" />
                        <span>{label.name}</span>
                        {isSelected && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    );
                  })}
                </div>
                {labels.length === 0 && (
                  <p className="text-sm text-muted-foreground">No labels available</p>
                )}
              </div>
              
              <Separator />
              
              {/* Subtasks */}
              <SubtaskList parentTaskId={task.id} />
              
              <Separator />
              
              {/* Attachments */}
              <div className="space-y-3">
                <div className="text-sm font-medium">Attachments</div>
                <AttachmentList taskId={task.id} />
              </div>
            </div>
          ) : (
            <div 
              id="history-panel" 
              role="tabpanel" 
              aria-labelledby="history-tab" 
              className="pb-6"
            >
              <ChangeHistory taskId={task.id} />
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="px-6 pb-6">
          {showDeleteConfirm ? (
            <div className="flex items-center justify-between w-full" role="alert" aria-live="assertive">
              <span className="text-sm text-muted-foreground">
                Are you sure you want to delete this task?
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  aria-label="Cancel delete"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  aria-label="Confirm delete task"
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="Delete this task"
              >
                <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                Delete Task
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} aria-label="Close task details">
                Close
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
