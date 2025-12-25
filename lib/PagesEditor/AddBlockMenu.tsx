import React, { useRef, useEffect } from 'react';
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

const blockOptions: { type: BlockType; label: string; description: string; icon: React.FC<{ className?: string; size?: number }> }[] = [
  { type: 'text', label: 'Text', description: 'Plain text paragraph', icon: TextIcon },
  { type: 'heading', label: 'Heading', description: 'Section heading', icon: HeadingIcon },
  { type: 'image', label: 'Image', description: 'Upload or embed image', icon: ImageIcon },
  { type: 'code', label: 'Code', description: 'Code block with syntax highlighting', icon: CodeIcon },
  { type: 'table', label: 'Table', description: 'Insert a table', icon: TableIcon },
  { type: 'list', label: 'List', description: 'Bullet, numbered, or checklist', icon: ListIcon },
  { type: 'quote', label: 'Quote', description: 'Blockquote', icon: QuoteIcon },
  { type: 'callout', label: 'Callout', description: 'Info, warning, or tip box', icon: CalloutIcon },
  { type: 'divider', label: 'Divider', description: 'Horizontal line separator', icon: DividerIcon },
];

export const AddBlockMenu: React.FC<AddBlockMenuProps> = ({ onAdd, onClose, theme = 'light' }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={`absolute z-50 mt-2 w-72 max-h-80 overflow-y-auto rounded-xl shadow-xl border animate-in fade-in slide-in-from-top-2 duration-200 ${
        isDark 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="p-2">
        <p className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Add Block
        </p>
        <div className="space-y-1">
          {blockOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                onClick={() => {
                  onAdd(option.type);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left group ${
                  isDark 
                    ? 'hover:bg-slate-700' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-slate-700 group-hover:bg-slate-600' 
                    : 'bg-slate-100 group-hover:bg-slate-200'
                }`}>
                  <Icon className={isDark ? 'text-slate-300' : 'text-slate-600'} size={20} />
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
