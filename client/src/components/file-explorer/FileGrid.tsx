import { memo, useCallback } from 'react';
import { useFileStore } from '../../stores/fileStore';
import { FileIcon } from './FileIcon';
import { formatFileSize, formatDate } from '../../utils/formatters';
import type { FileNode } from '../../types';

interface FileGridProps {
  files: FileNode[];
  onDoubleClick: (file: FileNode) => void;
  onContextMenu: (e: React.MouseEvent, file: FileNode) => void;
}

export const FileGrid = memo(function FileGrid({ 
  files, 
  onDoubleClick, 
  onContextMenu 
}: FileGridProps) {
  return (
    <div className="file-explorer-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {files.map((file) => (
        <FileGridItem
          key={file.id}
          file={file}
          onDoubleClick={onDoubleClick}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  );
});

interface FileGridItemProps {
  file: FileNode;
  onDoubleClick: (file: FileNode) => void;
  onContextMenu: (e: React.MouseEvent, file: FileNode) => void;
}

const FileGridItem = memo(function FileGridItem({ 
  file, 
  onDoubleClick, 
  onContextMenu 
}: FileGridItemProps) {
  const { selectedIds, toggleSelection } = useFileStore();
  const isSelected = selectedIds.has(file.id);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelection(file.id, e.ctrlKey || e.metaKey);
  }, [file.id, toggleSelection]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick(file);
  }, [file, onDoubleClick]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSelected) {
      toggleSelection(file.id, false);
    }
    onContextMenu(e, file);
  }, [file, isSelected, toggleSelection, onContextMenu]);

  return (
    <div
      className={`
        group p-4 rounded-xl cursor-pointer
        transition-all duration-150
        hover:bg-slate-100 dark:hover:bg-slate-800
        ${isSelected 
          ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500' 
          : ''
        }
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-3">
          <FileIcon type={file.type} mimeType={file.mimeType} size="lg" />
        </div>
        <span 
          className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate w-full"
          title={file.name}
        >
          {file.name}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {file.type === 'folder' ? 'Folder' : formatFileSize(file.size)}
        </span>
      </div>
    </div>
  );
});
