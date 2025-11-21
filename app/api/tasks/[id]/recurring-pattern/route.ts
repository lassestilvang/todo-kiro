import { NextRequest, NextResponse } from 'next/server';
import { getRecurringPattern } from '@/lib/db/queries/recurring-patterns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pattern = getRecurringPattern(id);
    return NextResponse.json(pattern);
  } catch (error) {
    console.error('Error fetching recurring pattern:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring pattern' },
      { status: 500 }
    );
  }
}
