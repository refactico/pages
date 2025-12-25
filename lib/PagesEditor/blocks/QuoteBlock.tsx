import React, { useState, useRef, useEffect } from 'react';
import type { QuoteBlock as QuoteBlockType, Theme } from '../types';
import { useToolbarPosition } from '../hooks/useToolbarPosition';

interface QuoteBlockProps {
  block: QuoteBlockType;
  onUpdate: (block: QuoteBlockType) => void;
  readOnly?: boolean;
  theme?: Theme;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({
  block,
  onUpdate,
  readOnly,
  theme = 'light',
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // Smart toolbar positioning
  const { showBelow } = useToolbarPosition({
    containerRef,
    isVisible: showToolbar && !readOnly,
    minSpaceAbove: 60,
  });

  const styleClasses = {
    default: `border-l-4 pl-4 italic ${isDark ? 'border-slate-600' : 'border-slate-300'}`,
    bordered: `border-l-4 pl-4 py-3 rounded-r ${isDark ? 'border-indigo-500 bg-indigo-950/30' : 'border-indigo-500 bg-indigo-50'}`,
    modern: `relative pl-10 before:content-['"'] before:absolute before:left-0 before:top-0 before:text-5xl before:leading-none ${isDark ? 'before:text-slate-600' : 'before:text-slate-300'}`,
  };

  // Auto-resize on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [block.content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...block, content: e.target.value });
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...block, author: e.target.value });
  };

  const setStyle = (style: 'default' | 'bordered' | 'modern') => {
    onUpdate({ ...block, style });
  };

  const toolbarBtnClass = (isActive?: boolean) =>
    `px-3 py-1.5 text-sm rounded-lg transition-colors ${
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
      onFocus={() => setShowToolbar(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setShowToolbar(false);
        }
      }}
    >
      {/* Toolbar - positions above or below based on available space */}
      {showToolbar && !readOnly && (
        <div
          className={`absolute left-0 flex items-center gap-1 p-1.5 rounded-xl shadow-lg border z-10 ${
            showBelow ? 'top-full mt-2' : '-top-12'
          } ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}
        >
          <button
            onClick={() => setStyle('default')}
            className={toolbarBtnClass(block.style === 'default' || !block.style)}
          >
            Simple
          </button>
          <button
            onClick={() => setStyle('bordered')}
            className={toolbarBtnClass(block.style === 'bordered')}
          >
            Bordered
          </button>
          <button
            onClick={() => setStyle('modern')}
            className={toolbarBtnClass(block.style === 'modern')}
          >
            Modern
          </button>
        </div>
      )}

      <blockquote
        className={`${styleClasses[block.style || 'default']} ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
      >
        {readOnly ? (
          <>
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{block.content}</p>
            {block.author && (
              <cite
                className={`block mt-3 text-sm not-italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                — {block.author}
              </cite>
            )}
          </>
        ) : (
          <>
            <textarea
              ref={textareaRef}
              value={block.content}
              onChange={handleContentChange}
              placeholder="Enter quote..."
              className={`w-full text-lg leading-relaxed bg-transparent outline-none resize-none ${
                isDark ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400'
              }`}
              rows={1}
            />
            <input
              type="text"
              value={block.author || ''}
              onChange={handleAuthorChange}
              placeholder="— Author name"
              className={`w-full mt-2 text-sm bg-transparent outline-none ${
                isDark
                  ? 'text-slate-400 placeholder:text-slate-500'
                  : 'text-slate-500 placeholder:text-slate-400'
              }`}
            />
          </>
        )}
      </blockquote>
    </div>
  );
};

export default QuoteBlock;
