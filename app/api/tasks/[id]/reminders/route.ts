import { NextRequest, NextResponse } from 'next/server';
import { getTaskReminders } from '@/lib/db/queries/reminders';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reminders = getTaskReminders(id);
    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Error fetching task reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task reminders' },
      { status: 500 }
    );
  }
}
