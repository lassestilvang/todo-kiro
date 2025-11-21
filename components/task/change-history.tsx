'use client';

import { format, parseISO } from 'date-fns';
import { History } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ChangeHistoryProps {
  taskId: string;
}

// Format field names for display
function formatFieldName(field: string): string {
  // Convert snake_case or camelCase to Title Case
  return field
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

// Format field values for display
function formatFieldValue(field: string, value: string | null): string {
  if (value === null || value === '') {
    return '(empty)';
  }
  
  // Handle boolean values
  if (value === '0' || value === 'false') {
    return 'No';
  }
  if (value === '1' || value === 'true') {
    return 'Yes';
  }
  
  // Handle priority values
  if (field === 'priority') {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  
  // Handle date fields
  if (field === 'date' || field === 'deadline' || field === 'completed_at') {
    try {
      const date = parseISO(value);
      return format(date, 'PPP');
    } catch {
      return value;
    }
  }
  
  // Handle time fields (in minutes)
  if (field === 'estimated_time' || field === 'actual_time') {
    const minutes = parseInt(value, 10);
    if (!isNaN(minutes)) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours > 0 && mins > 0) {
        return `${hours}h ${mins}m`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else {
        return `${mins}m`;
      }
    }
  }
  
  return value;
}

interface ChangeLog {
  id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
}

export function ChangeHistory({ taskId }: ChangeHistoryProps) {
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadChangeLogs = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}/change-logs`);
        if (response.ok) {
          const data = await response.json();
          setChangeLogs(data);
        }
      } catch (error) {
        console.error('Failed to load change logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChangeLogs();
  }, [taskId]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading history...</p>
      </div>
    );
  }
  
  if (changeLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <History className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          No changes recorded yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Changes will appear here when you edit this task
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {changeLogs.map((log) => {
        const fieldName = formatFieldName(log.field);
        const oldValue = formatFieldValue(log.field, log.old_value);
        const newValue = formatFieldValue(log.field, log.new_value);
        
        return (
          <div
            key={log.id}
            className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">
                  {fieldName}
                </span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {format(parseISO(log.changed_at), 'PPp')}
              </span>
            </div>
            
            <div className="ml-6 space-y-1">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground min-w-[60px]">From:</span>
                <span className="text-muted-foreground line-through flex-1">
                  {oldValue}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground min-w-[60px]">To:</span>
                <span className="font-medium flex-1">
                  {newValue}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
