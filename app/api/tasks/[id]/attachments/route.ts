import { NextRequest, NextResponse } from 'next/server';
import { getTaskAttachments } from '@/lib/db/queries/attachments';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attachments = getTaskAttachments(id);
    return NextResponse.json(attachments);
  } catch (error) {
    console.error('Error fetching task attachments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task attachments' },
      { status: 500 }
    );
  }
}
