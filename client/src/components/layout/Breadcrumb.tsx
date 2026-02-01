import { ChevronRight, Home } from 'lucide-react';
import { useBreadcrumb } from '../../hooks/useFiles';
import { useFileStore } from '../../stores/fileStore';

export function Breadcrumb() {
  const { currentFolderId, setCurrentFolder, clearSelection } = useFileStore();
  const { data: breadcrumb, isLoading } = useBreadcrumb(currentFolderId);

  const handleNavigate = (folderId: string | null) => {
    setCurrentFolder(folderId);
    clearSelection();
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-8">
        <div className="skeleton w-20 h-5 rounded" />
        <div className="skeleton w-4 h-4 rounded" />
        <div className="skeleton w-24 h-5 rounded" />
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto">
      {breadcrumb?.map((item, index) => (
        <div key={item.id || 'root'} className="flex items-center gap-1 flex-shrink-0">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          )}
          <button
            onClick={() => handleNavigate(item.id)}
            className={`
              flex items-center gap-1.5 px-2 py-1 rounded-md
              transition-colors
              ${index === breadcrumb.length - 1
                ? 'text-slate-900 dark:text-white font-medium cursor-default'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }
            `}
            disabled={index === breadcrumb.length - 1}
          >
            {index === 0 && <Home className="w-4 h-4" />}
            <span className="truncate max-w-[150px]">{item.name}</span>
          </button>
        </div>
      ))}
    </nav>
  );
}
