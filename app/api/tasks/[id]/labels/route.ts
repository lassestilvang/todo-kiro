import { NextRequest, NextResponse } from 'next/server';
import { getTaskLabels, addLabelToTask, removeLabelFromTask } from '@/lib/db/queries/task-labels';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const labelRows = getTaskLabels(id);
    
    // Convert snake_case to camelCase for frontend
    const labels = labelRows.map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      color: row.color,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
    
    return NextResponse.json(labels);
  } catch (error) {
    console.error('Error fetching task labels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task labels' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { labelId } = await request.json();
    addLabelToTask(id, labelId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding label to task:', error);
    return NextResponse.json(
      { error: 'Failed to add label to task' },
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
    const { searchParams } = new URL(request.url);
    const labelId = searchParams.get('labelId');
    
    if (!labelId) {
      return NextResponse.json(
        { error: 'labelId is required' },
        { status: 400 }
      );
    }
    
    removeLabelFromTask(id, labelId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing label from task:', error);
    return NextResponse.json(
      { error: 'Failed to remove label from task' },
      { status: 500 }
    );
  }
}
