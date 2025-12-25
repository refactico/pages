import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import type { TextBlock as TextBlockType, Theme } from '../types';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
} from '../icons';
import { useToolbarPosition } from '../hooks/useToolbarPosition';

interface TextBlockProps {
  block: TextBlockType;
  onUpdate: (block: TextBlockType) => void;
  readOnly?: boolean;
  theme?: Theme;
}

const fontSizeMap = {
  sm: 'text-sm leading-relaxed',
  base: 'text-base leading-relaxed',
  lg: 'text-lg leading-relaxed',
  xl: 'text-xl leading-relaxed',
} as const;

const alignmentMap = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
} as const;

const TextBlockComponent: React.FC<TextBlockProps> = ({
  block,
  onUpdate,
  readOnly,
  theme = 'light',
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // Smart toolbar positioning - flip below if not enough space above
  const { showBelow } = useToolbarPosition({
    containerRef,
    isVisible: showToolbar && !readOnly,
    minSpaceAbove: 60,
  });

  // Auto-resize on mount and content change
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [block.content]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate({ ...block, content: e.target.value });
    },
    [block, onUpdate],
  );

  const toggleStyle = useCallback(
    (style: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => {
      onUpdate({
        ...block,
        style: {
          ...block.style,
          [style]: !block.style?.[style],
        },
      });
    },
    [block, onUpdate],
  );

  const setAlignment = useCallback(
    (alignment: 'left' | 'center' | 'right' | 'justify') => {
      onUpdate({ ...block, alignment });
    },
    [block, onUpdate],
  );

  const setFontSize = useCallback(
    (fontSize: 'sm' | 'base' | 'lg' | 'xl') => {
      onUpdate({ ...block, fontSize });
    },
    [block, onUpdate],
  );

  const handleFocus = useCallback(() => setShowToolbar(true), []);
  const handleBlur = useCallback((e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setShowToolbar(false);
    }
  }, []);

  const textStyle = {
    fontWeight: block.style?.bold ? 'bold' : 'normal',
    fontStyle: block.style?.italic ? 'italic' : 'normal',
    textDecoration: block.style?.underline
      ? 'underline'
      : block.style?.strikethrough
        ? 'line-through'
        : 'none',
    color: block.style?.color || undefined,
    backgroundColor: block.style?.backgroundColor || 'transparent',
  };

  const toolbarBtnClass = (isActive?: boolean) =>
    `p-2 rounded-lg transition-colors ${
      isActive
        ? isDark
          ? 'bg-slate-600 text-white'
          : 'bg-slate-200 text-slate-900'
        : isDark
          ? 'hover:bg-slate-700 text-slate-300'
          : 'hover:bg-slate-100 text-slate-600'
    }`;

  return (
    <div
      ref={containerRef}
      className="group relative"
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {/* Toolbar - positions above or below based on available space */}
      {showToolbar && !readOnly && (
        <div
          className={`absolute left-0 flex items-center gap-1 p-1.5 rounded-xl shadow-lg border z-10 ${
            showBelow ? 'top-full mt-2' : '-top-12'
          } ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}
        >
          <button
            onClick={() => toggleStyle('bold')}
            className={toolbarBtnClass(block.style?.bold)}
            title="Bold"
          >
            <BoldIcon size={16} />
          </button>
          <button
            onClick={() => toggleStyle('italic')}
            className={toolbarBtnClass(block.style?.italic)}
            title="Italic"
          >
            <ItalicIcon size={16} />
          </button>
          <button
            onClick={() => toggleStyle('underline')}
            className={toolbarBtnClass(block.style?.underline)}
            title="Underline"
          >
            <UnderlineIcon size={16} />
          </button>
          <div className={`w-px h-6 mx-1 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
          <button
            onClick={() => setAlignment('left')}
            className={toolbarBtnClass(block.alignment === 'left')}
            title="Align Left"
          >
            <AlignLeftIcon size={16} />
          </button>
          <button
            onClick={() => setAlignment('center')}
            className={toolbarBtnClass(block.alignment === 'center')}
            title="Align Center"
          >
            <AlignCenterIcon size={16} />
          </button>
          <button
            onClick={() => setAlignment('right')}
            className={toolbarBtnClass(block.alignment === 'right')}
            title="Align Right"
          >
            <AlignRightIcon size={16} />
          </button>
          <div className={`w-px h-6 mx-1 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
          <select
            value={block.fontSize || 'base'}
            onChange={(e) => setFontSize(e.target.value as 'sm' | 'base' | 'lg' | 'xl')}
            className={`px-2 py-1.5 text-sm rounded-lg border ${
              isDark
                ? 'bg-slate-700 border-slate-600 text-slate-200'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="sm">Small</option>
            <option value="base">Normal</option>
            <option value="lg">Large</option>
            <option value="xl">X-Large</option>
          </select>
        </div>
      )}

      {readOnly ? (
        <div
          style={textStyle}
          className={`w-full whitespace-pre-wrap break-words ${fontSizeMap[block.fontSize || 'base']} ${alignmentMap[block.alignment || 'left']} ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}
        >
          {block.content || (
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Empty text block</span>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={handleChange}
          placeholder="Start typing..."
          style={textStyle}
          className={`w-full min-h-[2.5rem] p-2 resize-none outline-none bg-transparent ${fontSizeMap[block.fontSize || 'base']} ${alignmentMap[block.alignment || 'left']} ${
            isDark
              ? 'text-slate-200 placeholder:text-slate-500'
              : 'text-slate-800 placeholder:text-slate-400'
          }`}
          rows={1}
        />
      )}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const TextBlock = memo(TextBlockComponent);
export default TextBlock;
