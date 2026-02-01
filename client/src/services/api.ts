import axios from 'axios';
import type { FileNode, BreadcrumbItem } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fileApi = {
  // Get files in a folder
  getFiles: async (parentId: string | null): Promise<FileNode[]> => {
    const params = parentId ? { parentId } : {};
    const { data } = await api.get('/files', { params });
    return data;
  },

  // Get a single file
  getFile: async (id: string): Promise<FileNode> => {
    const { data } = await api.get(`/files/${id}`);
    return data;
  },

  // Get all folders
  getAllFolders: async (): Promise<FileNode[]> => {
    const { data } = await api.get('/files/folders');
    return data;
  },

  // Get folder children
  getFolderChildren: async (folderId: string | null): Promise<FileNode[]> => {
    const { data } = await api.get(`/files/folders/${folderId || 'root'}/children`);
    return data;
  },

  // Get breadcrumb
  getBreadcrumb: async (folderId: string | null): Promise<BreadcrumbItem[]> => {
    const { data } = await api.get(`/files/breadcrumb/${folderId || 'root'}`);
    return data;
  },

  // Search files
  searchFiles: async (query: string): Promise<FileNode[]> => {
    const { data } = await api.get('/files/search', { params: { q: query } });
    return data;
  },

  // Create folder
  createFolder: async (name: string, parentId: string | null): Promise<FileNode> => {
    const { data } = await api.post('/files', {
      name,
      type: 'folder',
      parentId,
    });
    return data;
  },

  // Rename file/folder
  renameFile: async (id: string, name: string): Promise<FileNode> => {
    const { data } = await api.patch(`/files/${id}`, { name });
    return data;
  },

  // Move file/folder
  moveFile: async (id: string, parentId: string | null): Promise<FileNode> => {
    const { data } = await api.patch(`/files/${id}`, { parentId });
    return data;
  },

  // Delete file/folder
  deleteFile: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`);
  },

  // Delete multiple files
  deleteFiles: async (ids: string[]): Promise<void> => {
    await Promise.all(ids.map(id => api.delete(`/files/${id}`)));
  },

  // Upload files
  uploadFiles: async (
    files: File[],
    parentId: string | null,
    onProgress?: (progress: number) => void
  ): Promise<FileNode[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (parentId) {
      formData.append('parentId', parentId);
    }

    const { data } = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return data;
  },

  // Download file
  downloadFile: async (id: string, fileName: string): Promise<void> => {
    const { data } = await api.get(`/files/${id}/download`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
