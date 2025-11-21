'use client';

import { useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, AlertCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { searchTasks, highlightMatches, type SearchResult } from '@/lib/utils/search';
import { useTaskStore } from '@/lib/store/task-store';
import { useListStore } from '@/lib/store/list-store';
import { useUIStore } from '@/lib/store/ui-store';
import { useTaskLabelStore } from '@/lib/store/task-label-store';
import { startOfDay, isBefore } from 'date-fns';
import { getLucideIcon } from '@/lib/utils/icons';

interface SearchResultsProps {
  onTaskClick?: (taskId: string) => void;
  className?: string;
}

interface HighlightedTextProps {
  text: string;
  indices: readonly (readonly [number, number])[];
}

function HighlightedText({ text, indices }: HighlightedTextProps) {
  const segments = highlightMatches(text, indices);
  
  return (
    <span>
      {segments.map((segment, index) => (
        segment.highlight ? (
          <mark
            key={index}
            className="bg-yellow-200 dark:bg-yellow-900/50 text-foreground font-medium rounded px-0.5"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      ))}
    </span>
  );
}

interface SearchResultItemProps {
  result: SearchResult;
  onTaskClick?: (taskId: string) => void;
}

function SearchResultItem({ result, onTaskClick }: SearchResultItemProps) {
  const { task, matches } = result;
  const lists = useListStore((state) => state.lists);
  const loadTaskLabels = useTaskLabelStore((state) => state.loadTaskLabels);
  const getTaskLabelsFromStore = useTaskLabelStore((state) => state.getTaskLabels);
  
  // Get task list
  const taskList = lists.find((l) => l.id === task.listId);
  
  // Load task labels on mount
  useEffect(() => {
    loadTaskLabels(task.id);
  }, [task.id, loadTaskLabels]);
  
  // Get task labels from store
  const taskLabels = getTaskLabelsFromStore(task.id);
  
  // Check if task is overdue
  const isOverdue = task.deadline && !task.completed && isBefore(startOfDay(task.deadline), startOfDay(new Date()));
  
  // Find matches for name and description
  const nameMatch = matches.find((m) => m.key === 'name');
  const descriptionMatch = matches.find((m) => m.key === 'description');
  
  // Priority colors
  const priorityColors = {
    high: 'bg-red-500 dark:bg-red-400',
    medium: 'bg-orange-500 dark:bg-orange-400',
    low: 'bg-blue-500 dark:bg-blue-400',
    none: 'bg-gray-400 dark:bg-gray-500',
  };
  
  const handleClick = () => {
    if (onTaskClick) {
      onTaskClick(task.id);
    }
  };
  
  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer',
        task.completed && 'opacity-60'
      )}
      onClick={handleClick}
    >
      {/* Priority indicator */}
      <div className={cn('w-1.5 h-1.5 rounded-full mt-2 shrink-0', priorityColors[task.priority])} />
      
      {/* Task content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Task name with highlighting */}
        <div className={cn(
          'font-medium text-sm',
          task.completed && 'line-through text-muted-foreground'
        )}>
          {nameMatch ? (
            <HighlightedText text={task.name} indices={nameMatch.indices} />
          ) : (
            task.name
          )}
        </div>
        
        {/* Description with highlighting (if matched) */}
        {descriptionMatch && task.description && (
          <div className="text-xs text-muted-foreground line-clamp-2">
            <FileText className="inline h-3 w-3 mr-1" />
            <HighlightedText text={task.description} indices={descriptionMatch.indices} />
          </div>
        )}
        
        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* List badge */}
          {taskList && (
            <Badge variant="outline" className="gap-1">
              <span>{taskList.emoji}</span>
              <span>{taskList.name}</span>
            </Badge>
          )}
          
          {/* Date badge */}
          {task.date && (
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {format(task.date, 'MMM d')}
            </Badge>
          )}
          
          {/* Deadline badge */}
          {task.deadline && (
            <Badge 
              variant={isOverdue ? 'destructive' : 'outline'} 
              className="gap-1"
            >
              {isOverdue && <AlertCircle className="h-3 w-3" />}
              <Clock className="h-3 w-3" />
              {format(task.deadline, 'MMM d')}
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
              >
                <IconComponent className="h-3 w-3" aria-hidden="true" />
                <span>{label.name}</span>
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SearchResults({ onTaskClick, className }: SearchResultsProps) {
  const tasks = useTaskStore((state) => state.tasks);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const openTaskEdit = useUIStore((state) => state.openTaskEdit);
  
  // Perform search with memoization for performance
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return [];
    }
    
    // Filter out subtasks from search (only search parent tasks)
    const parentTasks = tasks.filter((t) => !t.parentTaskId);
    
    return searchTasks(parentTasks, searchQuery);
  }, [tasks, searchQuery]);
  
  const handleTaskClick = (taskId: string) => {
    openTaskEdit(taskId);
    if (onTaskClick) {
      onTaskClick(taskId);
    }
  };
  
  // Don't render if no search query
  if (!searchQuery || searchQuery.trim().length < 2) {
    return null;
  }
  
  return (
    <div className={cn('bg-background border rounded-lg shadow-lg', className)}>
      <div className="p-3 border-b">
        <h3 className="text-sm font-semibold">
          Search Results
          {searchResults.length > 0 && (
            <span className="ml-2 text-muted-foreground font-normal">
              ({searchResults.length} {searchResults.length === 1 ? 'task' : 'tasks'})
            </span>
          )}
        </h3>
      </div>
      
      <ScrollArea className="max-h-[400px]">
        {searchResults.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-muted-foreground text-sm">
              No tasks found matching &quot;{searchQuery}&quot;
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Try a different search term
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {searchResults.map((result) => (
              <SearchResultItem
                key={result.task.id}
                result={result}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
