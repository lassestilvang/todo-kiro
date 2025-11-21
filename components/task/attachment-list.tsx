'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Trash2, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from './file-upload';
import { saveAttachmentAction, deleteAttachmentAction } from '@/lib/actions/attachments';
import { formatFileSize, getFileIcon } from '@/lib/utils/file-helpers';
import { cn } from '@/lib/utils';

interface AttachmentListProps {
  taskId: string;
  onUpdate?: () => void;
}

interface Attachment {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

export function AttachmentList({ taskId, onUpdate }: AttachmentListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshAttachments = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/attachments`);
      if (response.ok) {
        const data = await response.json();
        setAttachments(data);
      }
    } catch (error) {
      console.error('Failed to load attachments:', error);
    }
    onUpdate?.();
  }, [taskId, onUpdate]);
  
  useEffect(() => {
    refreshAttachments();
  }, [refreshAttachments]);

  const handleFileSelect = async (file: File) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await saveAttachmentAction(taskId, formData);
      
      if (!result.success) {
        setError(result.error || 'Failed to upload file');
        throw new Error(result.error);
      }
      
      refreshAttachments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      throw err;
    }
  };

  const handleDownload = async (attachmentId: string, fileName: string) => {
    try {
      // Create a download link using the API route
      const link = document.createElement('a');
      link.href = `/api/attachments/${attachmentId}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
    }
  };

  const handleDelete = async (attachmentId: string) => {
    setDeletingId(attachmentId);
    setError(null);
    
    try {
      const result = await deleteAttachmentAction(attachmentId);
      if (result.success) {
        refreshAttachments();
      } else {
        setError(result.error || 'Failed to delete attachment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete attachment');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload
        onFileSelect={handleFileSelect}
        maxSizeMB={10}
      />

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Attached Files ({attachments.length})
          </div>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
                  deletingId === attachment.id && 'opacity-50'
                )}
              >
                <div className="text-2xl flex-shrink-0">
                  {getFileIcon(attachment.mime_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {attachment.file_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.file_size)}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDownload(attachment.id, attachment.file_name)}
                    disabled={deletingId === attachment.id}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(attachment.id)}
                    disabled={deletingId === attachment.id}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {attachments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No attachments yet
        </p>
      )}
    </div>
  );
}
