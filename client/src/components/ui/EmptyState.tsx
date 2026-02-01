import { Folder, Search, FileX } from 'lucide-react';

interface EmptyStateProps {
  hasFiles: boolean;
  searchQuery: string;
}

export function EmptyState({ hasFiles, searchQuery }: EmptyStateProps) {
  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
          No results found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          No files or folders match "{searchQuery}". Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  if (!hasFiles) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Folder className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
          This folder is empty
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Upload files or create a new folder to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <FileX className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
        No files to display
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        Try adjusting your filters to see more files.
      </p>
    </div>
  );
}
