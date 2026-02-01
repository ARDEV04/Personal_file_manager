# Personal File Management System

A modern, full-stack file management application built with React and Node.js. Features a Google Drive-inspired interface with hierarchical folder structures, file operations, and a responsive design.

## Features

- **File & Folder Management**: Create, rename, delete files and folders with nested folder support
- **Navigation**: Sidebar folder tree with recursive rendering, breadcrumb navigation
- **View Modes**: Toggle between grid and list views
- **File Upload**: Multi-file upload with drag & drop and progress indicators
- **Search & Filter**: Debounced search, filter by file type, sort by name/size/date
- **Performance**: Virtualized lists for large datasets, optimistic UI updates, memoization
- **Themes**: Dark and light mode support with persistence
- **Keyboard Shortcuts**: Delete, F2 (rename), Ctrl+A (select all), Escape, Enter, Backspace

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management
- TanStack Query for server state
- TanStack Virtual for list virtualization
- Lucide React for icons

### Backend
- Node.js + Express + TypeScript
- SQLite (better-sqlite3) for data persistence
- Multer for file uploads

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development servers:
```bash
npm run dev
```

This will start:
- Frontend at http://localhost:5173
- Backend at http://localhost:3001

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
file-manager/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── layout/        # Sidebar, Header, Breadcrumb
│   │   │   ├── file-explorer/ # FileGrid, FileList, FileIcon
│   │   │   ├── tree/          # FolderTree recursive component
│   │   │   ├── modals/        # CreateFolder, Rename, Delete, Upload
│   │   │   └── ui/            # ContextMenu, EmptyState, Skeleton
│   │   ├── hooks/             # Custom React hooks
│   │   ├── stores/            # Zustand stores
│   │   ├── services/          # API client
│   │   ├── types/             # TypeScript interfaces
│   │   └── utils/             # Helper functions
│   └── index.html
├── server/                    # Backend (Express)
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── db/                # Database setup
│   └── uploads/               # File storage
└── package.json               # Workspace config
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/files | List files in folder |
| GET | /api/files/:id | Get file details |
| POST | /api/files | Create file/folder |
| PATCH | /api/files/:id | Rename/move file |
| DELETE | /api/files/:id | Delete file/folder |
| POST | /api/files/upload | Upload files |
| GET | /api/files/:id/download | Download file |
| GET | /api/files/search | Search files |
| GET | /api/files/breadcrumb/:id | Get breadcrumb path |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Delete | Delete selected items |
| F2 | Rename selected item |
| Ctrl/Cmd + A | Select all |
| Escape | Clear selection |
| Enter | Open selected folder |
| Backspace | Navigate to parent folder |

## License

MIT
