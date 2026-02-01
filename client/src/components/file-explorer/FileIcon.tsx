import { memo } from 'react';
import {
  Folder,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  FileType,
  Presentation,
} from 'lucide-react';
import { getFileTypeCategory } from '../../utils/formatters';

interface FileIconProps {
  type: 'file' | 'folder';
  mimeType: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export const FileIcon = memo(function FileIcon({ type, mimeType, size = 'md' }: FileIconProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const iconClass = sizeClasses[size];

  if (type === 'folder') {
    return <Folder className={`${iconClass} text-primary-500`} />;
  }

  const category = getFileTypeCategory(mimeType);

  switch (category) {
    case 'image':
      return <FileImage className={`${iconClass} text-green-500`} />;
    case 'video':
      return <FileVideo className={`${iconClass} text-purple-500`} />;
    case 'audio':
      return <FileAudio className={`${iconClass} text-pink-500`} />;
    case 'pdf':
      return <FileType className={`${iconClass} text-red-500`} />;
    case 'document':
      return <FileText className={`${iconClass} text-blue-500`} />;
    case 'spreadsheet':
      return <FileSpreadsheet className={`${iconClass} text-green-600`} />;
    case 'presentation':
      return <Presentation className={`${iconClass} text-orange-500`} />;
    case 'archive':
      return <FileArchive className={`${iconClass} text-amber-500`} />;
    case 'code':
    case 'text':
      return <FileCode className={`${iconClass} text-slate-500`} />;
    default:
      return <File className={`${iconClass} text-slate-400`} />;
  }
});
