import { NextRequest, NextResponse } from 'next/server';
import { readAttachment } from '@/lib/utils/file-storage';
import { getAttachmentById } from '@/lib/db/queries/attachments';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attachmentId } = await params;
    
    // Get attachment metadata
    const attachment = getAttachmentById(attachmentId);
    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await readAttachment(attachmentId);
    if (!fileBuffer) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': attachment.mime_type,
        'Content-Disposition': `attachment; filename="${attachment.file_name}"`,
        'Content-Length': attachment.file_size.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading attachment:', error);
    return NextResponse.json(
      { error: 'Failed to download attachment' },
      { status: 500 }
    );
  }
}
