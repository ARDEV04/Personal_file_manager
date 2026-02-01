import { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { useCreateFolder } from '../../hooks/useFiles';
import { isValidFileName } from '../../utils/formatters';

interface CreateFolderModalProps {
  onClose: () => void;
}

export function CreateFolderModal({ onClose }: CreateFolderModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const createFolder = useCreateFolder();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Folder name is required');
      return;
    }

    if (!isValidFileName(trimmedName)) {
      setError('Invalid folder name');
      return;
    }

    try {
      await createFolder.mutateAsync(trimmedName);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create folder');
    }
  };

  return (
    <Modal title="Create New Folder" onClose={onClose} size="sm">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label 
              htmlFor="folder-name" 
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Folder Name
            </label>
            <input
              ref={inputRef}
              id="folder-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter folder name"
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
              disabled={createFolder.isPending}
              className="btn btn-primary"
            >
              {createFolder.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
