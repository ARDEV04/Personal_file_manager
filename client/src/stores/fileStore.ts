import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ViewMode, SortBy, SortOrder, Theme } from '../types'

interface FileStore {
  // Navigation
  currentFolderId: string | null;
  
  // Selection
  selectedIds: Set<string>;
  
  // View preferences
  viewMode: ViewMode;
  theme: Theme;
  
  // Search and filters
  searchQuery: string;
  filterType: string | null;
  
  // Sorting
  sortBy: SortBy;
  sortOrder: SortOrder;
  
  // Sidebar
  sidebarCollapsed: boolean;
  expandedFolders: Set<string>;
  
  // Actions
  setCurrentFolder: (id: string | null) => void;
  toggleSelection: (id: string, multiSelect?: boolean) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setViewMode: (mode: ViewMode) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (type: string | null) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
  toggleSidebar: () => void;
  toggleFolderExpanded: (folderId: string) => void;
  setFolderExpanded: (folderId: string, expanded: boolean) => void;
}

export const useFileStore = create<FileStore>()(
  persist(
    (set) => ({
      // Initial state
      currentFolderId: null,
      selectedIds: new Set(),
      viewMode: 'grid',
      theme: 'light',
      searchQuery: '',
      filterType: null,
      sortBy: 'name',
      sortOrder: 'asc',
      sidebarCollapsed: false,
      expandedFolders: new Set(),

      // Actions
      setCurrentFolder: (id) => set({ currentFolderId: id, selectedIds: new Set() }),
      
      toggleSelection: (id, multiSelect = false) => set((state) => {
        const newSelected = new Set(multiSelect ? state.selectedIds : [])
        if (newSelected.has(id)) {
          newSelected.delete(id)
        } else {
          newSelected.add(id)
        }
        return { selectedIds: newSelected }
      }),
      
      selectAll: (ids) => set({ selectedIds: new Set(ids) }),
      
      clearSelection: () => set({ selectedIds: new Set() }),
      
      setViewMode: (mode) => set({ viewMode: mode }),
      
      setTheme: (theme) => set({ theme }),
      
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setFilterType: (type) => set({ filterType: type }),
      
      setSortBy: (sortBy) => set({ sortBy }),
      
      setSortOrder: (order) => set({ sortOrder: order }),
      
      toggleSortOrder: () => set((state) => ({ 
        sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' 
      })),
      
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      toggleFolderExpanded: (folderId) => set((state) => {
        const newExpanded = new Set(state.expandedFolders)
        if (newExpanded.has(folderId)) {
          newExpanded.delete(folderId)
        } else {
          newExpanded.add(folderId)
        }
        return { expandedFolders: newExpanded }
      }),
      
      setFolderExpanded: (folderId, expanded) => set((state) => {
        const newExpanded = new Set(state.expandedFolders)
        if (expanded) {
          newExpanded.add(folderId)
        } else {
          newExpanded.delete(folderId)
        }
        return { expandedFolders: newExpanded }
      }),
    }),
    {
      name: 'file-manager-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        theme: state.theme,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
