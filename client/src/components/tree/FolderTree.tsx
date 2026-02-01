import { memo } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { useFolderChildren } from '../../hooks/useFiles';
import { useFileStore } from '../../stores/fileStore';

interface FolderTreeProps {
  parentId: string | null;
  depth: number;
}

export const FolderTree = memo(function FolderTree({ parentId, depth }: FolderTreeProps) {
  const { data: folders, isLoading } = useFolderChildren(parentId);
  const { 
    currentFolderId, 
    setCurrentFolder, 
    expandedFolders, 
    toggleFolderExpanded,
    clearSelection
  } = useFileStore();

  if (isLoading && depth === 0) {
    return (
      <div className="px-2 space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5">
            <div className="skeleton w-4 h-4 rounded" />
            <div className="skeleton w-24 h-4 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!folders?.length) return null;

  return (
    <div className={depth > 0 ? 'ml-4' : 'px-2'}>
      {folders.map((folder) => (
        <FolderTreeItem
          key={folder.id}
          folder={folder}
          depth={depth}
          isExpanded={expandedFolders.has(folder.id)}
          isActive={currentFolderId === folder.id}
          onToggle={() => toggleFolderExpanded(folder.id)}
          onSelect={() => {
            setCurrentFolder(folder.id);
            clearSelection();
          }}
        />
      ))}
    </div>
  );
});

interface FolderTreeItemProps {
  folder: {
    id: string;
    name: string;
  };
  depth: number;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

const FolderTreeItem = memo(function FolderTreeItem({
  folder,
  depth,
  isExpanded,
  isActive,
  onToggle,
  onSelect,
}: FolderTreeItemProps) {
  const { data: children } = useFolderChildren(folder.id);
  const hasChildren = children && children.length > 0;

  return (
    <div>
      <div
        className={`
          flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer
          transition-colors group
          ${isActive 
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
            : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }
        `}
        onClick={onSelect}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`
            p-0.5 rounded transition-colors
            ${hasChildren 
              ? 'hover:bg-slate-300 dark:hover:bg-slate-600' 
              : 'invisible'
            }
          `}
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
        
        {isExpanded ? (
          <FolderOpen className="w-4 h-4 text-primary-500 flex-shrink-0" />
        ) : (
          <Folder className="w-4 h-4 text-primary-500 flex-shrink-0" />
        )}
        
        <span className="text-sm truncate flex-1">{folder.name}</span>
      </div>

      {isExpanded && hasChildren && (
        <FolderTree parentId={folder.id} depth={depth + 1} />
      )}
    </div>
  );
});
