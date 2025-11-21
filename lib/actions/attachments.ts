'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { createAttachment, deleteAttachment, getAttachmentById } from '@/lib/db/queries/attachments';

// Directory where attachments are stored
const ATTACHMENTS_DIR = path.join(process.cwd(), 'attachments');

/**
 * Ensure the attachments directory exists
 */
async function ensureAttachmentsDir(): Promise<void> {
  try {
    await fs.access(ATTACHMENTS_DIR);
  } catch {
    await fs.mkdir(ATTACHMENTS_DIR, { recursive: true });
  }
}

/**
 * Generate a unique filename to avoid collisions
 */
function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalFilename);
  const nameWithoutExt = path.basename(originalFilename, ext);
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${timestamp}_${random}_${sanitized}${ext}`;
}

/**
 * Save a file to the attachments directory
 */
export async function saveAttachmentAction(
  taskId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string; attachment?: { id: string; fileName: string } }> {
  try {
    await ensureAttachmentsDir();

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = path.join(ATTACHMENTS_DIR, uniqueFilename);

    // Convert File to Buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Store metadata in database
    const attachment = createAttachment({
      task_id: taskId,
      file_name: file.name,
      file_path: uniqueFilename, // Store relative path
      file_size: file.size,
      mime_type: file.type || 'application/octet-stream',
    });

    return {
      success: true,
      attachment: {
        id: attachment.id,
        fileName: attachment.file_name,
      },
    };
  } catch (error) {
    console.error('Failed to save attachment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save attachment',
    };
  }
}

/**
 * Delete an attachment file and its database record
 */
export async function deleteAttachmentAction(
  attachmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const attachment = getAttachmentById(attachmentId);
    if (!attachment) {
      return { success: false, error: 'Attachment not found' };
    }

    // Delete the file
    try {
      const fullPath = path.join(ATTACHMENTS_DIR, attachment.file_path);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Failed to delete attachment file:', error);
      // Continue to delete database record even if file deletion fails
    }

    // Delete database record
    deleteAttachment(attachmentId);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete attachment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete attachment',
    };
  }
}
