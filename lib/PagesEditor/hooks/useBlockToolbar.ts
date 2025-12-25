import { useState, useCallback } from 'react';

interface UseBlockToolbarOptions {
  readOnly?: boolean;
}

interface UseBlockToolbarReturn {
  showToolbar: boolean;
  handleFocus: () => void;
  handleBlur: (e: React.FocusEvent) => void;
  containerProps: {
    onFocus: () => void;
    onBlur: (e: React.FocusEvent) => void;
  };
}

/**
 * Custom hook to manage toolbar visibility for block components.
 * Uses focus/blur pattern to show toolbar when block is focused.
 */
export function useBlockToolbar({ readOnly = false }: UseBlockToolbarOptions = {}): UseBlockToolbarReturn {
  const [showToolbar, setShowToolbar] = useState(false);

  const handleFocus = useCallback(() => {
    if (!readOnly) {
      setShowToolbar(true);
    }
  }, [readOnly]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Only hide toolbar if focus leaves the container entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setShowToolbar(false);
    }
  }, []);

  return {
    showToolbar: showToolbar && !readOnly,
    handleFocus,
    handleBlur,
    containerProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
}
