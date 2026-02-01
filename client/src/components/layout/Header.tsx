import { useState, useCallback } from 'react';
import { 
  Search, 
  Grid, 
  List, 
  Sun, 
  Moon, 
  Upload,
  FolderPlus,
  SortAsc,
  SortDesc,
  Filter,
  X
} from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';
import { useDebounce } from '../../hooks/useDebounce';
import { useEffect } from 'react';
import { CreateFolderModal } from '../modals/CreateFolderModal';
import { UploadModal } from '../modals/UploadModal';

const FILE_TYPES = [
  { value: null, label: 'All Types' },
  { value: 'folder', label: 'Folders' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Documents' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'spreadsheet', label: 'Spreadsheets' },
  { value: 'archive', label: 'Archives' },
  { value: 'code', label: 'Code' },
  { value: 'text', label: 'Text' },
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
  { value: 'date', label: 'Date' },
] as const;

export function Header() {
  const [searchInput, setSearchInput] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { 
    viewMode, 
    setViewMode, 
    theme, 
    toggleTheme,
    setSearchQuery,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    sortOrder,
    toggleSortOrder,
  } = useFileStore();

  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
  }, [setSearchQuery]);

  return (
    <>
      <header className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-4 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FM</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white hidden sm:block">
            File Manager
          </h1>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search files..."
              className="input pl-10 pr-10"
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`btn btn-ghost p-2 ${filterType ? 'text-primary-600 dark:text-primary-400' : ''}`}
              title="Filter"
            >
              <Filter className="w-5 h-5" />
            </button>
            {showFilterMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowFilterMenu(false)} 
                />
                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 min-w-[160px]">
                  {FILE_TYPES.map((type) => (
                    <button
                      key={type.value || 'all'}
                      onClick={() => {
                        setFilterType(type.value);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${
                        filterType === type.value ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="btn btn-ghost p-2"
              title="Sort"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-5 h-5" />
              ) : (
                <SortDesc className="w-5 h-5" />
              )}
            </button>
            {showSortMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowSortMenu(false)} 
                />
                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 min-w-[140px]">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (sortBy === option.value) {
                          toggleSortOrder();
                        } else {
                          setSortBy(option.value);
                        }
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between ${
                        sortBy === option.value ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {option.label}
                      {sortBy === option.value && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

          {/* Create folder */}
          <button
            onClick={() => setShowCreateFolder(true)}
            className="btn btn-ghost p-2"
            title="New folder"
          >
            <FolderPlus className="w-5 h-5" />
          </button>

          {/* Upload */}
          <button
            onClick={() => setShowUpload(true)}
            className="btn btn-primary"
          >
            <Upload className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost p-2"
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Modals */}
      {showCreateFolder && (
        <CreateFolderModal onClose={() => setShowCreateFolder(false)} />
      )}
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} />
      )}
    </>
  );
}
