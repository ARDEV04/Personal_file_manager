import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FolderOpen,
  Download,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';
import { fileApi } from '../../services/api';
import { RenameModal } from '../modals/RenameModal';
import { DeleteConfirmModal } from '../modals/DeleteConfirmModal';
import type { FileNode } from '../../types';

interface ContextMenuProps {
  x: number;
  y: number;
  file?: FileNode;
  onClose: () => void;
  onDelete: () => void;
}

export function ContextMenu({ x, y, file, onClose, onDelete }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { selectedIds, setCurrentFolder, clearSelection } = useFileStore();
  const [showRename, setShowRename] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleOpen = () => {
    if (file?.type === 'folder') {
      setCurrentFolder(file.id);
      clearSelection();
    }
    onClose();
  };

  const handleDownload = async () => {
    if (file && file.type === 'file') {
      await fileApi.downloadFile(file.id, file.name);
    }
    onClose();
  };

  const handleRename = () => {
    setShowRename(true);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  // Determine what items to show
  const hasSelection = selectedIds.size > 0;
  const isSingleFile = file && !hasSelection;
  const isFolder = file?.type === 'folder';

  const menuItems = [
    ...(isFolder ? [{
      icon: FolderOpen,
      label: 'Open',
      onClick: handleOpen,
    }] : []),
    ...(isSingleFile && !isFolder ? [{
      icon: Download,
      label: 'Download',
      onClick: handleDownload,
    }] : []),
    { divider: true },
    ...(isSingleFile ? [{
      icon: Pencil,
      label: 'Rename',
      onClick: handleRename,
      shortcut: 'F2',
    }] : []),
    {
      icon: Trash2,
      label: hasSelection ? `Delete (${selectedIds.size})` : 'Delete',
      onClick: handleDelete,
      danger: true,
      shortcut: 'Del',
    },
  ].filter(item => item);

  return createPortal(
    <>
      <div
        ref={menuRef}
        className="context-menu"
        style={{ left: x, top: y }}
      >
        {menuItems.map((item, index) => {
          if ('divider' in item && item.divider) {
            return (
              <div 
                key={`divider-${index}`} 
                className="border-t border-slate-200 dark:border-slate-700 my-1" 
              />
            );
          }

          const menuItem = item as {
            icon: React.ElementType;
            label: string;
            onClick: () => void;
            danger?: boolean;
            shortcut?: string;
          };

          return (
            <button
              key={menuItem.label}
              onClick={menuItem.onClick}
              className={`context-menu-item ${menuItem.danger ? 'danger' : ''}`}
            >
              <menuItem.icon className="w-4 h-4" />
              <span className="flex-1">{menuItem.label}</span>
              {menuItem.shortcut && (
                <span className="text-xs text-slate-400">{menuItem.shortcut}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Rename Modal */}
      {showRename && file && (
        <RenameModal
          file={file}
          onClose={() => {
            setShowRename(false);
            onClose();
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          count={hasSelection ? selectedIds.size : 1}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            onClose();
          }}
        />
      )}
    </>,
    document.body
  );
}
