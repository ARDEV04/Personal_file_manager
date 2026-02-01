import { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { useRenameFile } from '../../hooks/useFiles';
import { isValidFileName } from '../../utils/formatters';
import type { FileNode } from '../../types';

interface RenameModalProps {
  file: FileNode;
  onClose: () => void;
}

export function RenameModal({ file, onClose }: RenameModalProps) {
  const [name, setName] = useState(file.name);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const renameFile = useRenameFile();

  useEffect(() => {
    inputRef.current?.focus();
    // Select filename without extension for files
    if (file.type === 'file') {
      const lastDot = file.name.lastIndexOf('.');
      if (lastDot > 0) {
        inputRef.current?.setSelectionRange(0, lastDot);
      } else {
        inputRef.current?.select();
      }
    } else {
      inputRef.current?.select();
    }
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Name is required');
      return;
    }

    if (trimmedName === file.name) {
      onClose();
      return;
    }

    if (!isValidFileName(trimmedName)) {
      setError('Invalid name');
      return;
    }

    try {
      await renameFile.mutateAsync({ id: file.id, name: trimmedName });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to rename');
    }
  };

  return (
    <Modal title={`Rename ${file.type === 'folder' ? 'Folder' : 'File'}`} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label 
              htmlFor="file-name" 
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Name
            </label>
            <input
              ref={inputRef}
              id="file-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter name"
              className="input"
              autoComplete="off"
            />
            {error && (
              <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={renameFile.isPending}
              className="btn btn-primary"
            >
              {renameFile.isPending ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
