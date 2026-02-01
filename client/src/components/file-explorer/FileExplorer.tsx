import { useRef, useCallback } from 'react';
import { useFiles, useFilteredFiles, useDeleteFiles } from '../../hooks/useFiles';
import { useFileStore } from '../../stores/fileStore';
import { Breadcrumb } from '../layout/Breadcrumb';
import { FileGrid } from './FileGrid';
import { FileList } from './FileList';
import { ContextMenu } from '../ui/ContextMenu';
import { useContextMenu } from '../../hooks/useContextMenu';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import type { FileNode } from '../../types';

export function FileExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    currentFolderId, 
    viewMode, 
    selectedIds,
    clearSelection,
    setCurrentFolder
  } = useFileStore();
  
  const { data: files, isLoading, error } = useFiles(currentFolderId);
  const filteredFiles = useFilteredFiles(files);
  const deleteFiles = useDeleteFiles();
  
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  const handleFileDoubleClick = useCallback((file: FileNode) => {
    if (file.type === 'folder') {
      setCurrentFolder(file.id);
      clearSelection();
    }
  }, [setCurrentFolder, clearSelection]);

  const handleContextMenu = useCallback((e: React.MouseEvent, file?: FileNode) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, file);
  }, [showContextMenu]);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    // Only clear selection if clicking on the container itself, not on files
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('file-explorer-grid')) {
      clearSelection();
    }
  }, [clearSelection]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size > 0) {
      deleteFiles.mutate(Array.from(selectedIds));
    }
    hideContextMenu();
  }, [selectedIds, deleteFiles, hideContextMenu]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load files</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-secondary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-full flex flex-col overflow-hidden"
      onClick={handleContainerClick}
      onContextMenu={(e) => handleContextMenu(e)}
    >
      {/* Header with breadcrumb and selection info */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <Breadcrumb />
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>{selectedIds.size} selected</span>
            <button
              onClick={() => clearSelection()}
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <Skeleton viewMode={viewMode} />
        ) : filteredFiles.length === 0 ? (
          <EmptyState 
            hasFiles={files?.length !== 0}
            searchQuery={useFileStore.getState().searchQuery}
          />
        ) : viewMode === 'grid' ? (
          <FileGrid 
            files={filteredFiles}
            onDoubleClick={handleFileDoubleClick}
            onContextMenu={handleContextMenu}
          />
        ) : (
          <FileList
            files={filteredFiles}
            onDoubleClick={handleFileDoubleClick}
            onContextMenu={handleContextMenu}
          />
        )}
      </div>

      {/* Context menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          onClose={hideContextMenu}
          onDelete={handleDeleteSelected}
        />
      )}
    </div>
  );
}
