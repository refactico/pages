import React, { useState, useRef } from 'react';
import type { CalloutBlock as CalloutBlockType, Theme } from '../types';
import { useToolbarPosition } from '../hooks/useToolbarPosition';

interface CalloutBlockProps {
  block: CalloutBlockType;
  onUpdate: (block: CalloutBlockType) => void;
  readOnly?: boolean;
  theme?: Theme;
}

const getVariantStyles = (isDark: boolean) => ({
  info: {
    bg: isDark ? 'bg-blue-950/40' : 'bg-blue-50',
    border: isDark ? 'border-blue-800' : 'border-blue-200',
    icon: 'text-blue-500',
    title: isDark ? 'text-blue-300' : 'text-blue-800',
    content: isDark ? 'text-blue-200' : 'text-blue-700',
  },
  warning: {
    bg: isDark ? 'bg-amber-950/40' : 'bg-amber-50',
    border: isDark ? 'border-amber-800' : 'border-amber-200',
    icon: 'text-amber-500',
    title: isDark ? 'text-amber-300' : 'text-amber-800',
    content: isDark ? 'text-amber-200' : 'text-amber-700',
  },
  success: {
    bg: isDark ? 'bg-emerald-950/40' : 'bg-emerald-50',
    border: isDark ? 'border-emerald-800' : 'border-emerald-200',
    icon: 'text-emerald-500',
    title: isDark ? 'text-emerald-300' : 'text-emerald-800',
    content: isDark ? 'text-emerald-200' : 'text-emerald-700',
  },
  error: {
    bg: isDark ? 'bg-red-950/40' : 'bg-red-50',
    border: isDark ? 'border-red-800' : 'border-red-200',
    icon: 'text-red-500',
    title: isDark ? 'text-red-300' : 'text-red-800',
    content: isDark ? 'text-red-200' : 'text-red-700',
  },
  tip: {
    bg: isDark ? 'bg-violet-950/40' : 'bg-violet-50',
    border: isDark ? 'border-violet-800' : 'border-violet-200',
    icon: 'text-violet-500',
    title: isDark ? 'text-violet-300' : 'text-violet-800',
    content: isDark ? 'text-violet-200' : 'text-violet-700',
  },
});

const variantIcons = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅',
  error: '❌',
  tip: '💡',
};

const variantLabels = {
  info: 'Info',
  warning: 'Warning',
  success: 'Success',
  error: 'Error',
  tip: 'Tip',
};

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ block, onUpdate, readOnly, theme = 'light' }) => {
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

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...block, content: e.target.value });
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...block, title: e.target.value });
  };

  const setVariant = (variant: 'info' | 'warning' | 'success' | 'error' | 'tip') => {
    onUpdate({ ...block, variant });
  };

  const variantStyles = getVariantStyles(isDark);
  const styles = variantStyles[block.variant];

  const toolbarBtnClass = (isActive?: boolean) => `px-2 py-1 text-sm rounded-lg transition-colors ${
    isActive
      ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-900')
      : (isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700')
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
        <div className={`absolute left-0 flex items-center gap-1 p-1.5 rounded-xl shadow-lg border z-10 ${
          showBelow ? 'top-full mt-2' : '-top-12'
        } ${
          isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'
        }`}>
          {(Object.keys(variantStyles) as Array<keyof typeof variantStyles>).map((variant) => (
            <button
              key={variant}
              onClick={() => setVariant(variant)}
              className={toolbarBtnClass(block.variant === variant)}
            >
              {variantIcons[variant]} {variantLabels[variant]}
            </button>
          ))}
        </div>
      )}

      <div className={`rounded-xl border ${styles.bg} ${styles.border} p-4`}>
        <div className="flex gap-3">
          <span className={`text-xl flex-shrink-0 ${styles.icon}`}>
            {variantIcons[block.variant]}
          </span>
          <div className="flex-1 min-w-0">
            {readOnly ? (
              <>
                {block.title && (
                  <p className={`font-semibold mb-1 ${styles.title}`}>{block.title}</p>
                )}
                <p className={`whitespace-pre-wrap break-words ${styles.content}`}>{block.content}</p>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={handleTitleChange}
                  placeholder={`${variantLabels[block.variant]} title (optional)`}
                  className={`w-full font-semibold mb-1 bg-transparent outline-none ${styles.title} ${
                    isDark ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400'
                  }`}
                />
                <textarea
                  ref={textareaRef}
                  value={block.content}
                  onChange={handleContentChange}
                  placeholder="Enter callout content..."
                  className={`w-full bg-transparent outline-none resize-none ${styles.content} ${
                    isDark ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400'
                  }`}
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalloutBlock;
