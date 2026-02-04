import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import type { FileNode, CreateFileDto, UpdateFileDto } from '../types.js';

export class FileService {
  // Get all files in a folder (or root if parentId is null)
  getFiles(parentId: string | null): FileNode[] {
    const stmt = parentId 
      ? db.prepare('SELECT * FROM files WHERE parentId = ? ORDER BY type DESC, name ASC')
      : db.prepare('SELECT * FROM files WHERE parentId IS NULL ORDER BY type DESC, name ASC');
    
    return (parentId ? stmt.all(parentId) : stmt.all()) as FileNode[];
  }

  // Get a single file by ID
  getFileById(id: string): FileNode | null {
    const stmt = db.prepare('SELECT * FROM files WHERE id = ?');
    return stmt.get(id) as FileNode | null;
  }

  // Get all folders (for sidebar tree)
  getAllFolders(): FileNode[] {
    const stmt = db.prepare('SELECT * FROM files WHERE type = ? ORDER BY name ASC');
    return stmt.all('folder') as FileNode[];
  }

  // Get children of a folder (for tree expansion)
  getFolderChildren(folderId: string | null): FileNode[] {
    const stmt = folderId
      ? db.prepare('SELECT * FROM files WHERE parentId = ? AND type = ? ORDER BY name ASC')
      : db.prepare('SELECT * FROM files WHERE parentId IS NULL AND type = ? ORDER BY name ASC');
    
    return (folderId ? stmt.all(folderId, 'folder') : stmt.all('folder')) as FileNode[];
  }

  // Create a new file or folder
  createFile(data: CreateFileDto): FileNode {
    const id = uuidv4();
    const parentPath = data.parentId 
      ? (this.getFileById(data.parentId)?.path || '')
      : '';
    const path = `${parentPath}/${data.name}`;

    const stmt = db.prepare(`
      INSERT INTO files (id, name, type, parentId, path, size, mimeType, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    stmt.run(id, data.name, data.type, data.parentId, path, null, null);
    return this.getFileById(id)!;
  }

  // Create a file from upload
  createUploadedFile(
    name: string, 
    parentId: string | null, 
    size: number, 
    mimeType: string,
    cloudinaryUrl: string,
    cloudinaryId: string
  ): FileNode {
    const id = uuidv4();
    const parentPath = parentId 
      ? (this.getFileById(parentId)?.path || '')
      : '';
    const path = `${parentPath}/${name}`;

    const stmt = db.prepare(`
      INSERT INTO files (id, name, type, parentId, path, size, mimeType, cloudinaryUrl, cloudinaryId, createdAt, updatedAt)
      VALUES (?, ?, 'file', ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    stmt.run(id, name, parentId, path, size, mimeType, cloudinaryUrl, cloudinaryId);
    return this.getFileById(id)!;
  }

  // Update a file (rename or move)
  updateFile(id: string, data: UpdateFileDto): FileNode | null {
    const file = this.getFileById(id);
    if (!file) return null;

    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
      
      // Update path
      const parentPath = file.parentId 
        ? (this.getFileById(file.parentId)?.path || '')
        : '';
      updates.push('path = ?');
      values.push(`${parentPath}/${data.name}`);
    }

    if (data.parentId !== undefined) {
      updates.push('parentId = ?');
      values.push(data.parentId);
      
      // Update path based on new parent
      const parentPath = data.parentId 
        ? (this.getFileById(data.parentId)?.path || '')
        : '';
      const name = data.name || file.name;
      updates.push('path = ?');
      values.push(`${parentPath}/${name}`);
    }

    updates.push("updatedAt = datetime('now')");

    const stmt = db.prepare(`UPDATE files SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values, id);

    // If it's a folder, update children paths recursively
    if (file.type === 'folder') {
      this.updateChildrenPaths(id);
    }

    return this.getFileById(id);
  }

  // Recursively update children paths after a folder move/rename
  private updateChildrenPaths(folderId: string): void {
    const folder = this.getFileById(folderId);
    if (!folder) return;

    const children = this.getFiles(folderId);
    const updateStmt = db.prepare("UPDATE files SET path = ?, updatedAt = datetime('now') WHERE id = ?");

    for (const child of children) {
      const newPath = `${folder.path}/${child.name}`;
      updateStmt.run(newPath, child.id);
      
      if (child.type === 'folder') {
        this.updateChildrenPaths(child.id);
      }
    }
  }

  // Delete a file or folder (cascades to children)
  deleteFile(id: string): boolean {
    const file = this.getFileById(id);
    if (!file) return false;

    // If it's a folder, recursively delete children first
    if (file.type === 'folder') {
      const children = this.getFiles(id);
      for (const child of children) {
        this.deleteFile(child.id);
      }
    }

    const stmt = db.prepare('DELETE FROM files WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Search files by name
  searchFiles(query: string): FileNode[] {
    const stmt = db.prepare(`
      SELECT * FROM files 
      WHERE name LIKE ? 
      ORDER BY type DESC, name ASC 
      LIMIT 100
    `);
    return stmt.all(`%${query}%`) as FileNode[];
  }

  // Get breadcrumb path for a file/folder
  getBreadcrumb(id: string | null): Array<{ id: string | null; name: string }> {
    const breadcrumb: Array<{ id: string | null; name: string }> = [
      { id: null, name: 'Home' }
    ];

    if (!id) return breadcrumb;

    const path: Array<{ id: string; name: string }> = [];
    let currentId: string | null = id;

    while (currentId) {
      const file = this.getFileById(currentId);
      if (!file) break;
      path.unshift({ id: file.id, name: file.name });
      currentId = file.parentId;
    }

    return [...breadcrumb, ...path];
  }

  // Check if a name already exists in a folder
  nameExists(name: string, parentId: string | null, excludeId?: string): boolean {
    let stmt;
    if (excludeId) {
      stmt = parentId
        ? db.prepare('SELECT 1 FROM files WHERE name = ? AND parentId = ? AND id != ? LIMIT 1')
        : db.prepare('SELECT 1 FROM files WHERE name = ? AND parentId IS NULL AND id != ? LIMIT 1');
      return !!(parentId ? stmt.get(name, parentId, excludeId) : stmt.get(name, excludeId));
    } else {
      stmt = parentId
        ? db.prepare('SELECT 1 FROM files WHERE name = ? AND parentId = ? LIMIT 1')
        : db.prepare('SELECT 1 FROM files WHERE name = ? AND parentId IS NULL LIMIT 1');
      return !!(parentId ? stmt.get(name, parentId) : stmt.get(name));
    }
  }
}

export const fileService = new FileService();
