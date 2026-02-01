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

export interface CreateFileDto {
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
}

export interface UpdateFileDto {
  name?: string;
  parentId?: string | null;
}
