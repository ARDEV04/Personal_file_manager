import { useEffect, useCallback } from 'react';
import { useFileStore } from '../stores/fileStore';
import { useQueryClient } from '@tanstack/react-query';
import { fileKeys, useFiles, useDeleteFiles } from './useFiles';

export function useKeyboardShortcuts() {
  const {
    currentFolderId,
    selectedIds,
    selectAll,
    clearSelection,
    setCurrentFolder,
  } = useFileStore();
  
  const queryClient = useQueryClient();
  const { data: files } = useFiles(currentFolderId);
  const deleteFiles = useDeleteFiles();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle shortcuts when typing in inputs
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement).isContentEditable
    ) {
      return;
    }

    // Delete selected files
    if (e.key === 'Delete' && selectedIds.size > 0) {
      e.preventDefault();
      deleteFiles.mutate(Array.from(selectedIds));
      return;
    }

    // Select all (Ctrl/Cmd + A)
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      if (files) {
        selectAll(files.map(f => f.id));
      }
      return;
    }

    // Clear selection (Escape)
    if (e.key === 'Escape') {
      e.preventDefault();
      clearSelection();
      return;
    }

    // Navigate up (Backspace)
    if (e.key === 'Backspace' && currentFolderId) {
      e.preventDefault();
      // Get parent folder from breadcrumb
      const breadcrumb = queryClient.getQueryData<Array<{ id: string | null; name: string }>>(
        fileKeys.breadcrumb(currentFolderId)
      );
      if (breadcrumb && breadcrumb.length >= 2) {
        const parent = breadcrumb[breadcrumb.length - 2];
        setCurrentFolder(parent.id);
      }
      return;
    }

    // Enter to open selected folder
    if (e.key === 'Enter' && selectedIds.size === 1) {
      e.preventDefault();
      const selectedId = Array.from(selectedIds)[0];
      const selectedFile = files?.find(f => f.id === selectedId);
      if (selectedFile?.type === 'folder') {
        setCurrentFolder(selectedFile.id);
        clearSelection();
      }
      return;
    }
  }, [currentFolderId, selectedIds, files, selectAll, clearSelection, setCurrentFolder, deleteFiles, queryClient]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
