import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { BlockType, Theme } from './types';
import {
  TextIcon,
  HeadingIcon,
  ImageIcon,
  CodeIcon,
  TableIcon,
  DividerIcon,
  QuoteIcon,
  ListIcon,
  CalloutIcon,
} from './icons';

interface AddBlockMenuProps {
  onAdd: (type: BlockType) => void;
  onClose: () => void;
  position?: { top: number; left: number };
  theme?: Theme;
}

const blockOptions: {
  type: BlockType;
  label: string;
  description: string;
  icon: React.FC<{ className?: string; size?: number }>;
}[] = [
  { type: 'text', label: 'Text', description: 'Plain text paragraph', icon: TextIcon },
  { type: 'heading', label: 'Heading', description: 'Section heading', icon: HeadingIcon },
  { type: 'image', label: 'Image', description: 'Upload or embed image', icon: ImageIcon },
  {
    type: 'code',
    label: 'Code',
    description: 'Code block with syntax highlighting',
    icon: CodeIcon,
  },
  { type: 'table', label: 'Table', description: 'Insert a table', icon: TableIcon },
  { type: 'list', label: 'List', description: 'Bullet, numbered, or checklist', icon: ListIcon },
  { type: 'quote', label: 'Quote', description: 'Blockquote', icon: QuoteIcon },
  {
    type: 'callout',
    label: 'Callout',
    description: 'Info, warning, or tip box',
    icon: CalloutIcon,
  },
  {
    type: 'divider',
    label: 'Divider',
    description: 'Horizontal line separator',
    icon: DividerIcon,
  },
];

export const AddBlockMenu: React.FC<AddBlockMenuProps> = ({ onAdd, onClose, theme = 'light' }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [alignment, setAlignment] = useState<'left' | 'right' | 'center'>('left');
  const isDark = theme === 'dark';

  // Adjust menu position to stay within viewport
  useEffect(() => {
    const adjustPosition = () => {
      if (!menuRef.current) return;

      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const menuWidth = rect.width;
      const padding = 8; // 8px padding from edges
      const parentRect = menu.parentElement?.getBoundingClientRect();

      if (!parentRect) return;

      // Check if aligning left would overflow right
      const leftAlignedRight = parentRect.left + menuWidth;
      const overflowsRight = leftAlignedRight > viewportWidth - padding;

      // Check if aligning right would overflow left
      const rightAlignedLeft = parentRect.right - menuWidth;
      const overflowsLeft = rightAlignedLeft < padding;

      if (overflowsRight && overflowsLeft) {
        // No space on either side - center it
        setAlignment('center');
      } else if (overflowsRight) {
        // No space on right - align to right of button
        setAlignment('right');
      } else {
        // Default - align to left of button
        setAlignment('left');
      }
    };

    // Use a small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      adjustPosition();
    }, 0);

    window.addEventListener('resize', adjustPosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', adjustPosition);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % blockOptions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + blockOptions.length) % blockOptions.length);
          break;
        case 'Enter':
        case ' ': {
          e.preventDefault();
          const option = blockOptions[focusedIndex];
          if (option) {
            onAdd(option.type);
            onClose();
          }
          break;
        }
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Tab':
          // Allow normal tab behavior but close menu
          onClose();
          break;
      }
    },
    [focusedIndex, onAdd, onClose],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleGlobalEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleGlobalEscape);

    // Focus the menu on mount for keyboard navigation
    menuRef.current?.focus();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleGlobalEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Add block menu"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`absolute z-50 top-full mt-2 w-72 max-w-[calc(100vw-16px)] max-h-80 overflow-y-auto rounded-xl shadow-xl border animate-in fade-in slide-in-from-top-2 duration-200 focus:outline-none ${
        alignment === 'center'
          ? 'left-1/2 -translate-x-1/2'
          : alignment === 'right'
            ? 'right-0'
            : 'left-0'
      } ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
    >
      <div className="p-2">
        <p
          className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
          id="add-block-menu-label"
        >
          Add Block
        </p>
        <div
          className="space-y-1"
          role="group"
          aria-labelledby="add-block-menu-label"
        >
          {blockOptions.map((option, index) => {
            const Icon = option.icon;
            const isFocused = index === focusedIndex;
            return (
              <button
                key={option.type}
                role="menuitem"
                type="button"
                tabIndex={-1}
                onClick={() => {
                  onAdd(option.type);
                  onClose();
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                aria-label={`Add ${option.label} block: ${option.description}`}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left group ${
                  isFocused
                    ? isDark
                      ? 'bg-slate-700'
                      : 'bg-slate-100'
                    : isDark
                      ? 'hover:bg-slate-700'
                      : 'hover:bg-slate-50'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                    isDark
                      ? 'bg-slate-700 group-hover:bg-slate-600'
                      : 'bg-slate-100 group-hover:bg-slate-200'
                  }`}
                >
                  <Icon
                    className={isDark ? 'text-slate-300' : 'text-slate-600'}
                    size={20}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {option.label}
                  </p>
                  <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AddBlockMenu;
