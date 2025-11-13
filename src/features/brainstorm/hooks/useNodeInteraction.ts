import { useState, useCallback } from 'react';
import { BasePost } from '../types';

/**
 * Hook for managing node interaction state (hover, select, breadcrumb navigation)
 * 
 * Milestone 5: Interaction Skeleton
 * - Tracks hovered and selected nodes
 * - Manages breadcrumb path for navigation
 * - Provides callbacks for node interactions
 */
export function useNodeInteraction() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [breadcrumbPath, setBreadcrumbPath] = useState<BasePost[]>([]);

  const handleHover = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  const handleSelect = useCallback((id: string, post?: BasePost) => {
    setSelectedId(id);
    
    // Update breadcrumb path when selecting a node
    if (post) {
      setBreadcrumbPath((prev) => {
        // If the selected post is already in the path, truncate to that point
        const existingIndex = prev.findIndex((p) => p.id === id);
        if (existingIndex >= 0) {
          return prev.slice(0, existingIndex + 1);
        }
        // Otherwise, append to path (max 10 items to prevent memory issues)
        const newPath = [...prev, post];
        return newPath.slice(-10);
      });
    }
  }, []);

  const handleDeselect = useCallback(() => {
    setSelectedId(undefined);
  }, []);

  const navigateToBreadcrumb = useCallback((index: number) => {
    if (index >= 0 && index < breadcrumbPath.length) {
      const post = breadcrumbPath[index];
      setSelectedId(post.id);
      // Truncate path to selected index
      setBreadcrumbPath((prev) => prev.slice(0, index + 1));
    }
  }, [breadcrumbPath]);

  const clearBreadcrumb = useCallback(() => {
    setBreadcrumbPath([]);
    setSelectedId(undefined);
  }, []);

  return {
    hoveredId,
    selectedId,
    breadcrumbPath,
    handleHover,
    handleSelect,
    handleDeselect,
    navigateToBreadcrumb,
    clearBreadcrumb,
  };
}

