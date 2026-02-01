import { 
  ChevronLeft, 
  ChevronRight,
  Home,
  HardDrive,
  Clock,
  Star,
  Trash2
} from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';
import { FolderTree } from '../tree/FolderTree';

export function Sidebar() {
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    currentFolderId,
    setCurrentFolder 
  } = useFileStore();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', folderId: null },
    { id: 'my-drive', icon: HardDrive, label: 'My Drive', folderId: null },
    { id: 'recent', icon: Clock, label: 'Recent', folderId: null, disabled: true },
    { id: 'starred', icon: Star, label: 'Starred', folderId: null, disabled: true },
    { id: 'trash', icon: Trash2, label: 'Trash', folderId: null, disabled: true },
  ];

  return (
    <aside 
      className={`
        border-r border-slate-200 dark:border-slate-700 
        bg-slate-50 dark:bg-slate-800/50
        flex flex-col
        transition-all duration-300
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Toggle button */}
      <div className="flex justify-end p-2">
        <button
          onClick={toggleSidebar}
          className="btn btn-ghost p-1.5"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-2 space-y-1">
        {navItems.slice(0, 2).map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && setCurrentFolder(item.folderId)}
            disabled={item.disabled}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg
              transition-colors
              ${item.disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'
              }
              ${currentFolderId === item.folderId && item.id === 'home'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'text-slate-700 dark:text-slate-300'
              }
            `}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="truncate text-sm font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Folder tree */}
      {!sidebarCollapsed && (
        <div className="flex-1 overflow-y-auto mt-4">
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Folders
            </h3>
          </div>
          <FolderTree parentId={null} depth={0} />
        </div>
      )}

      {/* Bottom nav */}
      <div className="border-t border-slate-200 dark:border-slate-700 px-2 py-2 mt-auto">
        {navItems.slice(2).map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && setCurrentFolder(item.folderId)}
            disabled={item.disabled}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg
              transition-colors
              ${item.disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'
              }
              text-slate-700 dark:text-slate-300
            `}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="truncate text-sm font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}
