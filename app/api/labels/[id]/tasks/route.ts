import { NextRequest, NextResponse } from 'next/server';
import { getTasksWithLabelId } from '@/lib/db/queries/tasks';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tasks = getTasksWithLabelId(id);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by label:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
