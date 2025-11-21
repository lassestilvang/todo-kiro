import { NextRequest, NextResponse } from 'next/server';
import { getTaskById, updateTask, deleteTask } from '@/lib/db/queries/tasks';
import { setTaskLabels } from '@/lib/db/queries/task-labels';
import { setRecurringPattern } from '@/lib/db/queries/recurring-patterns';
import { createReminder, deleteTaskReminders } from '@/lib/db/queries/reminders';
import { createChangeLogs } from '@/lib/db/queries/change-logs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = getTaskById(id);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { updates, labelIds, recurringPattern, reminders, oldTask } = body;

    updateTask(id, updates);

    if (labelIds !== undefined) {
      setTaskLabels(id, labelIds);
    }

    if (recurringPattern) {
      setRecurringPattern(
        id,
        recurringPattern.pattern,
        recurringPattern.customPattern,
        recurringPattern.endDate
      );
    }

    if (reminders !== undefined) {
      deleteTaskReminders(id);
      for (const reminderTime of reminders) {
        createReminder({
          taskId: id,
          reminderTime,
        });
      }
    }

    if (oldTask) {
      const changes: Array<{
        task_id: string;
        field: string;
        old_value: string | null;
        new_value: string | null;
      }> = [];

      // Track changes for change log
      Object.keys(updates).forEach((key) => {
        if (updates[key] !== oldTask[key]) {
          changes.push({
            task_id: id,
            field: key,
            old_value: oldTask[key]?.toString() ?? null,
            new_value: updates[key]?.toString() ?? null,
          });
        }
      });

      if (changes.length > 0) {
        createChangeLogs(changes);
      }
    }

    const updatedTask = getTaskById(id);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteTask(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
