import { useState, useRef, useCallback } from 'react';
import { Modal } from './Modal';
import { Upload, X, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useUploadFiles } from '../../hooks/useFiles';
import { formatFileSize } from '../../utils/formatters';

interface UploadModalProps {
  onClose: () => void;
}

interface FileItem {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export function UploadModal({ onClose }: UploadModalProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFiles = useUploadFiles();

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileItems: FileItem[] = Array.from(newFiles).map((file) => ({
      file,
      id: Math.random().toString(36).slice(2),
      status: 'pending' as const,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...fileItems]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  }, [addFiles]);

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    // Update all files to uploading status
    setFiles((prev) => 
      prev.map((f) => ({ ...f, status: 'uploading' as const }))
    );

    try {
      await uploadFiles.mutateAsync({
        files: files.map((f) => f.file),
        onProgress: (progress) => {
          setFiles((prev) =>
            prev.map((f) => ({ ...f, progress }))
          );
        },
      });

      // Update all files to success
      setFiles((prev) =>
        prev.map((f) => ({ ...f, status: 'success' as const, progress: 100 }))
      );

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) => ({ 
          ...f, 
          status: 'error' as const, 
          error: 'Upload failed' 
        }))
      );
    } finally {
      setIsUploading(false);
    }
  };

  const pendingFiles = files.filter((f) => f.status === 'pending');
  const canUpload = pendingFiles.length > 0 && !isUploading;

  return (
    <Modal title="Upload Files" onClose={onClose} size="lg">
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-colors
            ${isDragging 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            Drag & drop files here
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            or click to browse
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
              >
                <File className="w-8 h-8 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {fileItem.file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">
                      {formatFileSize(fileItem.file.size)}
                    </span>
                    {fileItem.status === 'uploading' && (
                      <>
                        <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500 transition-all duration-300"
                            style={{ width: `${fileItem.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">
                          {fileItem.progress}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {fileItem.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(fileItem.id);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {fileItem.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                  )}
                  {fileItem.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {fileItem.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!canUpload}
              className="btn btn-primary"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
