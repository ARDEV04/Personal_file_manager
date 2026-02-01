import { memo, useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useFileStore } from '../../stores/fileStore';
import { FileIcon } from './FileIcon';
import { formatFileSize, formatDate } from '../../utils/formatters';
import type { FileNode } from '../../types';

interface FileListProps {
  files: FileNode[];
  onDoubleClick: (file: FileNode) => void;
  onContextMenu: (e: React.MouseEvent, file: FileNode) => void;
}

export const FileList = memo(function FileList({ 
  files, 
  onDoubleClick, 
  onContextMenu 
}: FileListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Modified</div>
      </div>

      {/* Virtualized list */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: Math.min(files.length * 52, 600) }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const file = files[virtualRow.index];
            return (
              <div
                key={file.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <FileListItem
                  file={file}
                  onDoubleClick={onDoubleClick}
                  onContextMenu={onContextMenu}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

interface FileListItemProps {
  file: FileNode;
  onDoubleClick: (file: FileNode) => void;
  onContextMenu: (e: React.MouseEvent, file: FileNode) => void;
}

const FileListItem = memo(function FileListItem({ 
  file, 
  onDoubleClick, 
  onContextMenu 
}: FileListItemProps) {
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

  const getFileType = () => {
    if (file.type === 'folder') return 'Folder';
    if (!file.mimeType) return 'File';
    
    const parts = file.mimeType.split('/');
    if (parts.length === 2) {
      return parts[1].toUpperCase();
    }
    return 'File';
  };

  return (
    <div
      className={`
        grid grid-cols-12 gap-4 px-4 py-3 items-center cursor-pointer
        transition-colors duration-150
        hover:bg-slate-100 dark:hover:bg-slate-800
        ${isSelected 
          ? 'bg-primary-50 dark:bg-primary-900/20' 
          : ''
        }
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="col-span-6 flex items-center gap-3 min-w-0">
        <FileIcon type={file.type} mimeType={file.mimeType} size="sm" />
        <span 
          className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate"
          title={file.name}
        >
          {file.name}
        </span>
      </div>
      <div className="col-span-2 text-sm text-slate-500 dark:text-slate-400">
        {file.type === 'folder' ? '-' : formatFileSize(file.size)}
      </div>
      <div className="col-span-2 text-sm text-slate-500 dark:text-slate-400 truncate">
        {getFileType()}
      </div>
      <div className="col-span-2 text-sm text-slate-500 dark:text-slate-400">
        {formatDate(file.updatedAt)}
      </div>
    </div>
  );
});
