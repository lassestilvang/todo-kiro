import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, createTask } from '@/lib/db/queries/tasks';
import { setTaskLabels } from '@/lib/db/queries/task-labels';
import { setRecurringPattern } from '@/lib/db/queries/recurring-patterns';
import { createReminder } from '@/lib/db/queries/reminders';

export async function GET() {
  try {
    const tasks = getAllTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task, labelIds = [], recurringPattern, reminders = [] } = body;

    const newTask = createTask(task);

    if (labelIds.length > 0) {
      setTaskLabels(newTask.id, labelIds);
    }

    if (recurringPattern && recurringPattern.pattern !== 'none') {
      setRecurringPattern(
        newTask.id,
        recurringPattern.pattern,
        recurringPattern.customPattern,
        recurringPattern.endDate
      );
    }

    if (reminders.length > 0) {
      for (const reminderTime of reminders) {
        createReminder({
          taskId: newTask.id,
          reminderTime,
        });
      }
    }

    return NextResponse.json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
