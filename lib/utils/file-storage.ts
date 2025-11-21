import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { getAttachmentById } from '@/lib/db/queries/attachments';

// Directory where attachments are stored
const ATTACHMENTS_DIR = path.join(process.cwd(), 'attachments');

/**
 * Get the full path to an attachment file
 */
export function getAttachmentPath(relativePath: string): string {
  return path.join(ATTACHMENTS_DIR, relativePath);
}

/**
 * Read an attachment file (server-side only)
 */
export async function readAttachment(attachmentId: string): Promise<Buffer | null> {
  const attachment = getAttachmentById(attachmentId);
  if (!attachment) {
    return null;
  }

  try {
    const fullPath = getAttachmentPath(attachment.file_path);
    return await fs.readFile(fullPath);
  } catch (error) {
    console.error('Failed to read attachment:', error);
    return null;
  }
}
