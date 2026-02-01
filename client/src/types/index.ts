export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  path: string;
  size: number | null;
  mimeType: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'size' | 'date';
export type SortOrder = 'asc' | 'desc';
export type Theme = 'light' | 'dark';

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface FileFilter {
  type: string | null;
  searchQuery: string;
}
