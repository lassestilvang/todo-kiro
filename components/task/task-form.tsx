'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  X,
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
  Bell,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { taskInputWithDateValidationSchema } from '@/lib/validations';
import type { TaskInputFormData } from '@/lib/validations';
import type { Task } from '@/types';
import { useListStore } from '@/lib/store/list-store';
import { useLabelStore } from '@/lib/store/label-store';
import { useState, useEffect } from 'react';

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

interface TaskFormProps {
  task?: Task;
  defaultListId?: string;
  onSubmit: (
    data: TaskInputFormData, 
    labelIds: string[],
    recurringPattern?: {
      pattern: 'none' | 'daily' | 'weekly' | 'weekday' | 'monthly' | 'yearly' | 'custom';
      customPattern?: string | null;
      endDate?: Date | null;
    },
    reminders?: Date[]
  ) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function TaskForm({ 
  task, 
  defaultListId,
  onSubmit, 
  onCancel,
  submitLabel = 'Save Task'
}: TaskFormProps) {
  const lists = useListStore((state) => state.lists);
  const labels = useLabelStore((state) => state.labels);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recurringPatternData, setRecurringPatternData] = useState<{
    pattern: 'none' | 'daily' | 'weekly' | 'weekday' | 'monthly' | 'yearly' | 'custom';
    customPattern: string | null;
    endDate: Date | null;
  }>({
    pattern: 'none',
    customPattern: null,
    endDate: null,
  });
  const [reminders, setReminders] = useState<Date[]>([]);

  // Load existing labels, recurring pattern, and reminders for the task
  useEffect(() => {
    if (task?.id) {
      const loadTaskData = async () => {
        try {
          // Load labels
          const labelsResponse = await fetch(`/api/tasks/${task.id}/labels`);
          if (labelsResponse.ok) {
            const taskLabels = await labelsResponse.json();
            setSelectedLabelIds(taskLabels.map((label: { id: string }) => label.id));
          }
          
          // Load recurring pattern
          const patternResponse = await fetch(`/api/tasks/${task.id}/recurring-pattern`);
          if (patternResponse.ok) {
            const recurringPattern = await patternResponse.json();
            if (recurringPattern) {
              setRecurringPatternData({
                pattern: recurringPattern.pattern,
                customPattern: recurringPattern.custom_pattern,
                endDate: recurringPattern.end_date ? new Date(recurringPattern.end_date) : null,
              });
            }
          }
          
          // Load reminders
          const remindersResponse = await fetch(`/api/tasks/${task.id}/reminders`);
          if (remindersResponse.ok) {
            const taskReminders = await remindersResponse.json();
            setReminders(taskReminders.map((r: { reminder_time: string }) => new Date(r.reminder_time)));
          }
        } catch (error) {
          console.error('Failed to load task data:', error);
        }
      };
      
      loadTaskData();
    }
  }, [task?.id]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(taskInputWithDateValidationSchema),
    defaultValues: {
      name: task?.name || '',
      description: task?.description || '',
      listId: task?.listId || defaultListId || lists[0]?.id || '',
      date: task?.date || null,
      deadline: task?.deadline || null,
      estimatedTime: task?.estimatedTime || null,
      actualTime: task?.actualTime || null,
      priority: task?.priority || 'none',
      completed: task?.completed || false,
      parentTaskId: task?.parentTaskId || null,
      recurringPattern: 'none',
      customPattern: null,
      recurringEndDate: null,
    },
  });

  // Update form when recurring pattern data is loaded
  useEffect(() => {
    if (task?.id && recurringPatternData.pattern !== 'none') {
      reset({
        name: task.name,
        description: task.description,
        listId: task.listId,
        date: task.date,
        deadline: task.deadline,
        estimatedTime: task.estimatedTime,
        actualTime: task.actualTime,
        priority: task.priority,
        completed: task.completed,
        parentTaskId: task.parentTaskId,
        recurringPattern: recurringPatternData.pattern,
        customPattern: recurringPatternData.customPattern,
        recurringEndDate: recurringPatternData.endDate,
      });
    }
  }, [task, recurringPatternData, reset]);

  const handleFormSubmit = async (data: TaskInputFormData & { recurringPattern?: string; customPattern?: string | null; recurringEndDate?: Date | null }) => {
    setIsSubmitting(true);
    try {
      // Extract recurring pattern data
      const recurringPattern = {
        pattern: data.recurringPattern || 'none',
        customPattern: data.customPattern || null,
        endDate: data.recurringEndDate || null,
      };
      
      // Remove recurring and reminder fields from task data
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { recurringPattern: _rp, customPattern: _cp, recurringEndDate: _red, ...taskData } = data;
      
      await onSubmit(taskData as TaskInputFormData, selectedLabelIds, recurringPattern, reminders);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addReminder = () => {
    const newReminder = new Date();
    newReminder.setHours(newReminder.getHours() + 1);
    newReminder.setMinutes(0);
    newReminder.setSeconds(0);
    newReminder.setMilliseconds(0);
    setReminders([...reminders, newReminder]);
  };

  const removeReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const updateReminder = (index: number, newDate: Date) => {
    const updatedReminders = [...reminders];
    updatedReminders[index] = newDate;
    setReminders(updatedReminders);
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Task Name */}
      <div className="space-y-2.5">
        <label htmlFor="name" className="text-sm font-medium">
          Task Name <span className="text-destructive" aria-label="required">*</span>
        </label>
        <Input
          id="name"
          placeholder="Enter task name"
          {...register('name')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-required="true"
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2.5">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          placeholder="Add a description..."
          rows={4}
          {...register('description')}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-destructive" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* List Selection */}
      <div className="space-y-2.5">
        <label htmlFor="listId" className="text-sm font-medium">
          List <span className="text-destructive" aria-label="required">*</span>
        </label>
        <Controller
          name="listId"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="listId" aria-required="true" aria-invalid={!!errors.listId} aria-describedby={errors.listId ? 'listId-error' : undefined}>
                <SelectValue placeholder="Select a list" />
              </SelectTrigger>
              <SelectContent>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true">{list.emoji}</span>
                      <span>{list.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.listId && (
          <p id="listId-error" className="text-sm text-destructive" role="alert">
            {errors.listId.message}
          </p>
        )}
      </div>

      {/* Date and Deadline */}
      <div className="grid grid-cols-2 gap-4">
        {/* Date */}
        <div className="space-y-2.5">
          <label className="text-sm font-medium">Date</label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-11',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value as Date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
                  <Calendar
                    mode="single"
                    selected={field.value as Date | undefined}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        {/* Deadline */}
        <div className="space-y-2.5">
          <label className="text-sm font-medium">Deadline</label>
          <Controller
            name="deadline"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-11',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value as Date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
                  <Calendar
                    mode="single"
                    selected={field.value as Date | undefined}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.deadline && (
            <p className="text-sm text-destructive">{errors.deadline.message}</p>
          )}
        </div>
      </div>

      {/* Estimated Time */}
      <div className="space-y-2.5">
        <label htmlFor="estimatedTime" className="text-sm font-medium">
          Estimated Time (minutes)
        </label>
        <Input
          id="estimatedTime"
          type="number"
          placeholder="e.g., 60"
          {...register('estimatedTime', { valueAsNumber: true })}
        />
        {errors.estimatedTime && (
          <p className="text-sm text-destructive">{errors.estimatedTime.message}</p>
        )}
      </div>

      {/* Priority */}
      <div className="space-y-2.5">
        <label htmlFor="priority" className="text-sm font-medium">
          Priority
        </label>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.priority && (
          <p className="text-sm text-destructive">{errors.priority.message}</p>
        )}
      </div>

      {/* Labels */}
      <div className="space-y-2.5">
        <label className="text-sm font-medium" id="labels-label">Labels</label>
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby="labels-label">
          {labels.map((label) => {
            const IconComponent = ICON_MAP[label.icon] || Tag;
            const isSelected = selectedLabelIds.includes(label.id);
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
                onClick={() => toggleLabel(label.id)}
                role="checkbox"
                aria-checked={isSelected}
                aria-label={`${label.name} label`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleLabel(label.id);
                  }
                }}
              >
                <IconComponent className="h-3 w-3" aria-hidden="true" />
                <span>{label.name}</span>
                {isSelected && (
                  <X className="h-3 w-3 ml-1" aria-hidden="true" />
                )}
              </Badge>
            );
          })}
        </div>
        {labels.length === 0 && (
          <p className="text-sm text-muted-foreground">No labels available</p>
        )}
      </div>

      {/* Recurring Pattern */}
      <div className="space-y-2.5">
        <label htmlFor="recurringPattern" className="text-sm font-medium">
          Recurring Pattern
        </label>
        <Controller
          name="recurringPattern"
          control={control}
          render={({ field }) => (
            <Select value={field.value || 'none'} onValueChange={field.onChange}>
              <SelectTrigger id="recurringPattern">
                <SelectValue placeholder="No recurrence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No recurrence</SelectItem>
                <SelectItem value="daily">Every day</SelectItem>
                <SelectItem value="weekly">Every week</SelectItem>
                <SelectItem value="weekday">Every weekday</SelectItem>
                <SelectItem value="monthly">Every month</SelectItem>
                <SelectItem value="yearly">Every year</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.recurringPattern && (
          <p className="text-sm text-destructive">{errors.recurringPattern.message}</p>
        )}
      </div>

      {/* Custom Pattern Input - shown when custom is selected */}
      {watch('recurringPattern') === 'custom' && (
        <div className="space-y-2.5">
          <label htmlFor="customPattern" className="text-sm font-medium">
            Custom Pattern
          </label>
          <Input
            id="customPattern"
            placeholder="e.g., Every 2 weeks on Monday"
            {...register('customPattern')}
          />
          <p className="text-xs text-muted-foreground">
            Describe your custom recurring pattern
          </p>
          {errors.customPattern && (
            <p className="text-sm text-destructive">{errors.customPattern.message}</p>
          )}
        </div>
      )}

      {/* Recurring End Date - shown when any recurring pattern is selected */}
      {watch('recurringPattern') && watch('recurringPattern') !== 'none' && (
        <div className="space-y-2.5">
          <label className="text-sm font-medium">Recurring End Date (Optional)</label>
          <Controller
            name="recurringEndDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-11',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value as Date, 'PPP') : 'No end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
                  <Calendar
                    mode="single"
                    selected={field.value as Date | undefined}
                    onSelect={field.onChange}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for recurring tasks that never end
          </p>
          {errors.recurringEndDate && (
            <p className="text-sm text-destructive">{errors.recurringEndDate.message}</p>
          )}
        </div>
      )}

      {/* Reminders */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Reminders</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addReminder}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Reminder
          </Button>
        </div>
        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reminders set</p>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder, index) => (
              <div key={index} className="flex items-center gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'flex-1 justify-start text-left font-normal h-11'
                      )}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      {format(reminder, 'PPP p')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
                    <Calendar
                      mode="single"
                      selected={reminder}
                      onSelect={(date) => {
                        if (date) {
                          // Preserve the time when changing the date
                          const newDate = new Date(date);
                          newDate.setHours(reminder.getHours());
                          newDate.setMinutes(reminder.getMinutes());
                          updateReminder(index, newDate);
                        }
                      }}
                    />
                    <div className="p-4 border-t bg-muted/30">
                      <label className="text-sm font-medium mb-2 block">Time</label>
                      <Input
                        type="time"
                        value={format(reminder, 'HH:mm')}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':').map(Number);
                          const newDate = new Date(reminder);
                          newDate.setHours(hours || 0);
                          newDate.setMinutes(minutes || 0);
                          updateReminder(index, newDate);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReminder(index)}
                  className="h-10 w-10 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
