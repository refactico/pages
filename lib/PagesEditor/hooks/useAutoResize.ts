import { useEffect, useRef, type RefObject } from 'react';

/**
 * Custom hook to auto-resize a textarea based on its content.
 * Returns a ref to attach to the textarea element.
 */
export function useAutoResize<T extends HTMLTextAreaElement>(
  content: string
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  }, [content]);

  return ref;
}
