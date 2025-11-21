import { NextRequest, NextResponse } from 'next/server';
import { getTaskChangeLogs } from '@/lib/db/queries/change-logs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const changeLogs = getTaskChangeLogs(id);
    return NextResponse.json(changeLogs);
  } catch (error) {
    console.error('Error fetching task change logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task change logs' },
      { status: 500 }
    );
  }
}
