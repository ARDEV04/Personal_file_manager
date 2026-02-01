import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { fileService } from '../services/fileService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

export const filesRouter = Router();

// GET /api/files - List files in a folder
filesRouter.get('/', (req: Request, res: Response) => {
  try {
    const parentId = req.query.parentId as string | undefined;
    const files = fileService.getFiles(parentId || null);
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// GET /api/files/folders - Get all folders (for sidebar tree)
filesRouter.get('/folders', (_req: Request, res: Response) => {
  try {
    const folders = fileService.getAllFolders();
    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// GET /api/files/folders/:id/children - Get folder children
filesRouter.get('/folders/:id/children', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const children = fileService.getFolderChildren(id === 'root' ? null : id);
    res.json(children);
  } catch (error) {
    console.error('Error fetching folder children:', error);
    res.status(500).json({ error: 'Failed to fetch folder children' });
  }
});

// GET /api/files/search - Search files
filesRouter.get('/search', (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.json([]);
    }
    const files = fileService.searchFiles(query);
    res.json(files);
  } catch (error) {
    console.error('Error searching files:', error);
    res.status(500).json({ error: 'Failed to search files' });
  }
});

// GET /api/files/breadcrumb/:id - Get breadcrumb path
filesRouter.get('/breadcrumb/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const breadcrumb = fileService.getBreadcrumb(id === 'root' ? null : id);
    res.json(breadcrumb);
  } catch (error) {
    console.error('Error fetching breadcrumb:', error);
    res.status(500).json({ error: 'Failed to fetch breadcrumb' });
  }
});

// GET /api/files/:id - Get file details
filesRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = fileService.getFileById(id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(file);
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

// POST /api/files - Create a new file or folder
filesRouter.post('/', (req: Request, res: Response) => {
  try {
    const { name, type, parentId } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    if (type !== 'file' && type !== 'folder') {
      return res.status(400).json({ error: 'Type must be "file" or "folder"' });
    }

    // Check if name already exists in the folder
    if (fileService.nameExists(name, parentId || null)) {
      return res.status(409).json({ error: 'A file or folder with this name already exists' });
    }

    const file = fileService.createFile({ name, type, parentId: parentId || null });
    res.status(201).json(file);
  } catch (error) {
    console.error('Error creating file:', error);
    res.status(500).json({ error: 'Failed to create file' });
  }
});

// POST /api/files/upload - Upload files
filesRouter.post('/upload', upload.array('files', 10), (req: Request, res: Response) => {
  try {
    const parentId = req.body.parentId || null;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const uploadedFiles = files.map(file => {
      // Check for duplicate name
      let finalName = file.originalname;
      let counter = 1;
      while (fileService.nameExists(finalName, parentId)) {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        finalName = `${baseName} (${counter})${ext}`;
        counter++;
      }

      return fileService.createUploadedFile(
        finalName,
        parentId,
        file.size,
        file.mimetype,
        file.filename
      );
    });

    res.status(201).json(uploadedFiles);
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// PATCH /api/files/:id - Update file (rename or move)
filesRouter.patch('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;

    const existingFile = fileService.getFileById(id);
    if (!existingFile) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check for name conflicts
    const targetParentId = parentId !== undefined ? parentId : existingFile.parentId;
    const targetName = name !== undefined ? name : existingFile.name;
    
    if (fileService.nameExists(targetName, targetParentId, id)) {
      return res.status(409).json({ error: 'A file or folder with this name already exists' });
    }

    const updatedFile = fileService.updateFile(id, { name, parentId });
    res.json(updatedFile);
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

// DELETE /api/files/:id - Delete file or folder
filesRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = fileService.deleteFile(id);
    
    if (!success) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// GET /api/files/:id/download - Download file
filesRouter.get('/:id/download', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = fileService.getFileById(id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.type === 'folder') {
      return res.status(400).json({ error: 'Cannot download a folder' });
    }

    // For demo purposes, send a placeholder response
    // In a real app, you'd stream the actual file from storage
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.send(`This is a placeholder for file: ${file.name}`);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});
