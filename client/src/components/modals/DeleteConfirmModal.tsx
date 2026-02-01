import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ count, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <Modal title="Confirm Delete" onClose={onCancel} size="sm">
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-slate-900 dark:text-white">
              Are you sure you want to delete {count === 1 ? 'this item' : `these ${count} items`}?
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
