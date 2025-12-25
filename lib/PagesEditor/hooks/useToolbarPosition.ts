import { useState, useEffect, useCallback, type RefObject } from 'react';

interface UseToolbarPositionOptions {
  /** Ref to the container element */
  containerRef: RefObject<HTMLElement | null>;
  /** Whether the toolbar is currently visible */
  isVisible: boolean;
  /** Minimum space required above the element (in pixels) */
  minSpaceAbove?: number;
  /** Offset from viewport top to account for fixed headers */
  topOffset?: number;
}

interface UseToolbarPositionReturn {
  /** Whether to show the toolbar below instead of above */
  showBelow: boolean;
  /** Recalculate position */
  recalculate: () => void;
}

/**
 * Custom hook to determine toolbar position based on available viewport space.
 * Returns whether the toolbar should be shown below the element when there's
 * not enough space above.
 */
export function useToolbarPosition({
  containerRef,
  isVisible,
  minSpaceAbove = 60,
  topOffset = 0,
}: UseToolbarPositionOptions): UseToolbarPositionReturn {
  const [showBelow, setShowBelow] = useState(false);

  const recalculate = useCallback(() => {
    if (!containerRef.current || !isVisible) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const spaceAbove = rect.top - topOffset;
    
    // If not enough space above, show below
    setShowBelow(spaceAbove < minSpaceAbove);
  }, [containerRef, isVisible, minSpaceAbove, topOffset]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    // Calculate on mount and when visibility changes
    recalculate();

    // Recalculate on scroll and resize
    const handleScroll = () => recalculate();
    const handleResize = () => recalculate();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Also observe scroll on parent containers
    const scrollParents: HTMLElement[] = [];
    let scrollParent = containerRef.current?.parentElement;
    while (scrollParent) {
      scrollParent.addEventListener('scroll', handleScroll, { passive: true });
      scrollParents.push(scrollParent);
      scrollParent = scrollParent.parentElement;
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      
      scrollParents.forEach((parent) => {
        parent.removeEventListener('scroll', handleScroll);
      });
    };
  }, [isVisible, recalculate, containerRef]);

  return { showBelow, recalculate };
}
