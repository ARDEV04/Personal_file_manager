import { useState, useCallback } from 'react';
import type { FileNode } from '../types';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  file?: FileNode;
}

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    file: undefined,
  });

  const showContextMenu = useCallback((x: number, y: number, file?: FileNode) => {
    // Adjust position if menu would overflow viewport
    const menuWidth = 200;
    const menuHeight = 250;
    
    const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
    const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y;

    setContextMenu({
      visible: true,
      x: Math.max(0, adjustedX),
      y: Math.max(0, adjustedY),
      file,
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
  };
}
