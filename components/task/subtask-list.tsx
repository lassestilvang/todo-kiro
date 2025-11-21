'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTaskStore } from '@/lib/store/task-store';

interface SubtaskListProps {
  parentTaskId: string;
}

export function SubtaskList({ parentTaskId }: SubtaskListProps) {
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const getSubtasks = useTaskStore((state) => state.getSubtasks);
  const tasks = useTaskStore((state) => state.tasks);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  
  // Get parent task to inherit listId
  const parentTask = tasks.find((t) => t.id === parentTaskId);
  const subtasks = getSubtasks(parentTaskId);
  
  const handleAddSubtask = async () => {
    if (!newSubtaskName.trim() || !parentTask) return;
    
    try {
      await addTask({
        name: newSubtaskName.trim(),
        description: null,
        listId: parentTask.listId,
        date: null,
        deadline: null,
        estimatedTime: null,
        actualTime: null,
        priority: 'none',
        completed: false,
        parentTaskId: parentTaskId,
      });
      
      setNewSubtaskName('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };
  
  const handleToggleSubtask = async (subtaskId: string) => {
    const subtask = subtasks.find((st) => st.id === subtaskId);
    if (!subtask) return;
    
    try {
      await updateTask(subtaskId, {
        completed: !subtask.completed,
        completedAt: !subtask.completed ? new Date() : null,
      });
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
    }
  };
  
  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await deleteTask(subtaskId);
    } catch (error) {
      console.error('Failed to delete subtask:', error);
    }
  };
  
  const completedCount = subtasks.filter((st) => st.completed).length;
  const totalCount = subtasks.length;
  
  return (
    <div className="space-y-3">
      {/* Subtask progress header */}
      {subtasks.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Subtasks</span>
          <span className="text-muted-foreground">
            {completedCount} of {totalCount} completed
          </span>
        </div>
      )}
      
      {/* Subtask list */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 group"
          >
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => handleToggleSubtask(subtask.id)}
            />
            <span
              className={cn(
                'flex-1 text-sm',
                subtask.completed && 'line-through text-muted-foreground'
              )}
            >
              {subtask.name}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeleteSubtask(subtask.id)}
            >
              <span className="sr-only">Delete subtask</span>
              <span className="text-destructive">×</span>
            </Button>
          </div>
        ))}
      </div>
      
      {/* Add subtask input */}
      {isAdding ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Subtask name"
            value={newSubtaskName}
            onChange={(e) => setNewSubtaskName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddSubtask();
              } else if (e.key === 'Escape') {
                setIsAdding(false);
                setNewSubtaskName('');
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={handleAddSubtask}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setNewSubtaskName('');
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4" />
          Add Subtask
        </Button>
      )}
    </div>
  );
}
