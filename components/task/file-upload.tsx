'use client';

import { useCallback, useState } from 'react';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => Promise<void>;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  maxSizeMB = 10,
  acceptedTypes = [],
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    // Check file type if restrictions exist
    if (acceptedTypes.length > 0) {
      const fileType = file.type;
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      
      const isAccepted = acceptedTypes.some(
        (type) =>
          type === fileType ||
          type === fileExtension ||
          (type.endsWith('/*') && fileType.startsWith(type.replace('/*', '')))
      );

      if (!isAccepted) {
        return `File type not accepted. Allowed types: ${acceptedTypes.join(', ')}`;
      }
    }

    return null;
  }, [maxSizeMB, acceptedTypes]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      await onFileSelect(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [validateFile, onFileSelect]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && files[0]) {
        handleFile(files[0]);
      }
    },
    [disabled, isUploading, handleFile]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      handleFile(files[0]);
    }
    // Reset input value to allow uploading the same file again
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          isDragging && 'border-primary bg-primary/5',
          !isDragging && 'border-muted-foreground/25',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && !isUploading && 'cursor-pointer hover:border-primary/50'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="sr-only"
          onChange={handleFileInputChange}
          disabled={disabled || isUploading}
          accept={acceptedTypes.length > 0 ? acceptedTypes.join(',') : undefined}
        />
        
        <label
          htmlFor="file-upload"
          className={cn(
            'flex flex-col items-center justify-center gap-2',
            !disabled && !isUploading && 'cursor-pointer'
          )}
        >
          {isUploading ? (
            <>
              <File className="h-8 w-8 text-primary animate-pulse" />
              <div className="text-center">
                <p className="text-sm font-medium">Uploading...</p>
                <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
              </div>
              <div className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drop file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: {maxSizeMB}MB
                  {acceptedTypes.length > 0 && (
                    <span className="block mt-0.5">
                      Accepted: {acceptedTypes.join(', ')}
                    </span>
                  )}
                </p>
              </div>
            </>
          )}
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 w-6 p-0"
            onClick={() => setError(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
