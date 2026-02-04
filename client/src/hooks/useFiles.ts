import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileApi } from '../services/api';
import { useFileStore } from '../stores/fileStore';
import toast from 'react-hot-toast';
import type { FileNode } from '../types';
import { useMemo } from 'react';
import { getFileTypeCategory } from '../utils/formatters';

// Query keys
export const fileKeys = {
  all: ['files'] as const,
  lists: () => [...fileKeys.all, 'list'] as const,
  list: (parentId: string | null) => [...fileKeys.lists(), parentId] as const,
  details: () => [...fileKeys.all, 'detail'] as const,
  detail: (id: string) => [...fileKeys.details(), id] as const,
  folders: () => [...fileKeys.all, 'folders'] as const,
  folderChildren: (folderId: string | null) => [...fileKeys.folders(), 'children', folderId] as const,
  breadcrumb: (folderId: string | null) => [...fileKeys.all, 'breadcrumb', folderId] as const,
  search: (query: string) => [...fileKeys.all, 'search', query] as const,
};

// Hook to get files in current folder
export function useFiles(parentId: string | null) {
  return useQuery({
    queryKey: fileKeys.list(parentId),
    queryFn: () => fileApi.getFiles(parentId),
  });
}

// Hook to get folder children (for tree)
export function useFolderChildren(folderId: string | null) {
  return useQuery({
    queryKey: fileKeys.folderChildren(folderId),
    queryFn: () => fileApi.getFolderChildren(folderId),
  });
}

// Hook to get breadcrumb
export function useBreadcrumb(folderId: string | null) {
  return useQuery({
    queryKey: fileKeys.breadcrumb(folderId),
    queryFn: () => fileApi.getBreadcrumb(folderId),
  });
}

// Hook for filtered and sorted files
export function useFilteredFiles(files: FileNode[] | undefined) {
  const { searchQuery, filterType, sortBy, sortOrder } = useFileStore();

  return useMemo(() => {
    if (!files) return [];

    let filtered = [...files];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType) {
      filtered = filtered.filter(file => {
        if (file.type === 'folder') return filterType === 'folder';
        return getFileTypeCategory(file.mimeType) === filterType;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      // Folders always come first
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'date':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [files, searchQuery, filterType, sortBy, sortOrder]);
}

// Hook to create folder
export function useCreateFolder() {
  const queryClient = useQueryClient();
  const { currentFolderId } = useFileStore();

  return useMutation({
    mutationFn: (name: string) => fileApi.createFolder(name, currentFolderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.list(currentFolderId) });
      queryClient.invalidateQueries({ queryKey: fileKeys.folders() });
      toast.success('Folder created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create folder');
    },
  });
}

// Hook to rename file
export function useRenameFile() {
  const queryClient = useQueryClient();
  const { currentFolderId } = useFileStore();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => fileApi.renameFile(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.list(currentFolderId) });
      queryClient.invalidateQueries({ queryKey: fileKeys.folders() });
      toast.success('Renamed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to rename');
    },
  });
}

// Hook to delete files
export function useDeleteFiles() {
  const queryClient = useQueryClient();
  const { currentFolderId, clearSelection } = useFileStore();

  return useMutation({
    mutationFn: (ids: string[]) => fileApi.deleteFiles(ids),
    onMutate: async (ids) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: fileKeys.list(currentFolderId) });

      // Snapshot the previous value
      const previousFiles = queryClient.getQueryData<FileNode[]>(fileKeys.list(currentFolderId));

      // Optimistically update
      if (previousFiles) {
        queryClient.setQueryData<FileNode[]>(
          fileKeys.list(currentFolderId),
          previousFiles.filter(file => !ids.includes(file.id))
        );
      }

      return { previousFiles };
    },
    onError: (_err, _ids, context) => {
      // Rollback on error
      if (context?.previousFiles) {
        queryClient.setQueryData(fileKeys.list(currentFolderId), context.previousFiles);
      }
      toast.error('Failed to delete');
    },
    onSuccess: (_data, ids) => {
      clearSelection();
      queryClient.invalidateQueries({ queryKey: fileKeys.folders() });
      toast.success(`Deleted ${ids.length} item${ids.length > 1 ? 's' : ''}`);
    },
  });
}

// Hook to upload files
export function useUploadFiles() {
  const queryClient = useQueryClient();
  const { currentFolderId } = useFileStore();

  return useMutation({
    mutationFn: ({ files, onProgress }: { files: File[]; onProgress?: (progress: number) => void }) => 
      fileApi.uploadFiles(files, currentFolderId, onProgress),
    onSuccess: (uploadedFiles) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.list(currentFolderId) });
      toast.success(`Uploaded ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}`);
    },
    onError: () => {
      toast.error('Failed to upload files');
    },
  });
}
