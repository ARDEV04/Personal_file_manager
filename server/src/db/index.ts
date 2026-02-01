import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/filemanager.db');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('file', 'folder')),
      parentId TEXT,
      path TEXT NOT NULL,
      size INTEGER,
      mimeType TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (parentId) REFERENCES files(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_files_parentId ON files(parentId);
    CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);
    CREATE INDEX IF NOT EXISTS idx_files_name ON files(name);
  `);

  // Seed initial data if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM files').get() as { count: number };
  
  if (count.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  const insert = db.prepare(`
    INSERT INTO files (id, name, type, parentId, path, size, mimeType, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const transaction = db.transaction(() => {
    // Root folders
    const documentsId = uuidv4();
    const imagesId = uuidv4();
    const projectsId = uuidv4();
    const downloadsId = uuidv4();

    insert.run(documentsId, 'Documents', 'folder', null, '/Documents', null, null);
    insert.run(imagesId, 'Images', 'folder', null, '/Images', null, null);
    insert.run(projectsId, 'Projects', 'folder', null, '/Projects', null, null);
    insert.run(downloadsId, 'Downloads', 'folder', null, '/Downloads', null, null);

    // Documents subfolders and files
    const workId = uuidv4();
    const personalId = uuidv4();
    insert.run(workId, 'Work', 'folder', documentsId, '/Documents/Work', null, null);
    insert.run(personalId, 'Personal', 'folder', documentsId, '/Documents/Personal', null, null);
    
    insert.run(uuidv4(), 'resume.pdf', 'file', documentsId, '/Documents/resume.pdf', 245760, 'application/pdf');
    insert.run(uuidv4(), 'notes.txt', 'file', documentsId, '/Documents/notes.txt', 1024, 'text/plain');
    insert.run(uuidv4(), 'report.docx', 'file', workId, '/Documents/Work/report.docx', 52428, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    insert.run(uuidv4(), 'meeting-notes.txt', 'file', workId, '/Documents/Work/meeting-notes.txt', 2048, 'text/plain');
    insert.run(uuidv4(), 'budget.xlsx', 'file', personalId, '/Documents/Personal/budget.xlsx', 35840, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Images subfolders and files
    const vacationId = uuidv4();
    const screenshotsId = uuidv4();
    insert.run(vacationId, 'Vacation', 'folder', imagesId, '/Images/Vacation', null, null);
    insert.run(screenshotsId, 'Screenshots', 'folder', imagesId, '/Images/Screenshots', null, null);
    
    insert.run(uuidv4(), 'profile.jpg', 'file', imagesId, '/Images/profile.jpg', 102400, 'image/jpeg');
    insert.run(uuidv4(), 'background.png', 'file', imagesId, '/Images/background.png', 2097152, 'image/png');
    insert.run(uuidv4(), 'beach.jpg', 'file', vacationId, '/Images/Vacation/beach.jpg', 3145728, 'image/jpeg');
    insert.run(uuidv4(), 'mountain.jpg', 'file', vacationId, '/Images/Vacation/mountain.jpg', 2621440, 'image/jpeg');
    insert.run(uuidv4(), 'sunset.jpg', 'file', vacationId, '/Images/Vacation/sunset.jpg', 1835008, 'image/jpeg');
    insert.run(uuidv4(), 'screenshot-01.png', 'file', screenshotsId, '/Images/Screenshots/screenshot-01.png', 524288, 'image/png');
    insert.run(uuidv4(), 'screenshot-02.png', 'file', screenshotsId, '/Images/Screenshots/screenshot-02.png', 614400, 'image/png');

    // Projects subfolders and files
    const webAppId = uuidv4();
    const mobileAppId = uuidv4();
    insert.run(webAppId, 'web-app', 'folder', projectsId, '/Projects/web-app', null, null);
    insert.run(mobileAppId, 'mobile-app', 'folder', projectsId, '/Projects/mobile-app', null, null);
    
    insert.run(uuidv4(), 'README.md', 'file', projectsId, '/Projects/README.md', 4096, 'text/markdown');
    insert.run(uuidv4(), 'index.html', 'file', webAppId, '/Projects/web-app/index.html', 2048, 'text/html');
    insert.run(uuidv4(), 'styles.css', 'file', webAppId, '/Projects/web-app/styles.css', 8192, 'text/css');
    insert.run(uuidv4(), 'app.js', 'file', webAppId, '/Projects/web-app/app.js', 16384, 'application/javascript');
    insert.run(uuidv4(), 'App.tsx', 'file', mobileAppId, '/Projects/mobile-app/App.tsx', 12288, 'text/typescript');
    insert.run(uuidv4(), 'package.json', 'file', mobileAppId, '/Projects/mobile-app/package.json', 1024, 'application/json');

    // Downloads files
    insert.run(uuidv4(), 'installer.exe', 'file', downloadsId, '/Downloads/installer.exe', 52428800, 'application/octet-stream');
    insert.run(uuidv4(), 'archive.zip', 'file', downloadsId, '/Downloads/archive.zip', 10485760, 'application/zip');
    insert.run(uuidv4(), 'video.mp4', 'file', downloadsId, '/Downloads/video.mp4', 104857600, 'video/mp4');
    insert.run(uuidv4(), 'music.mp3', 'file', downloadsId, '/Downloads/music.mp3', 5242880, 'audio/mpeg');
    insert.run(uuidv4(), 'presentation.pptx', 'file', downloadsId, '/Downloads/presentation.pptx', 3145728, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  });

  transaction();
  console.log('Database seeded with initial data');
}
