import React, { useState, useRef } from 'react';
import type { HeadingBlock as HeadingBlockType, Theme } from '../types';
import { AlignLeftIcon, AlignCenterIcon, AlignRightIcon } from '../icons';

interface HeadingBlockProps {
  block: HeadingBlockType;
  onUpdate: (block: HeadingBlockType) => void;
  readOnly?: boolean;
  theme?: Theme;
}

const headingSizeMap = {
  1: 'text-4xl font-bold tracking-tight',
  2: 'text-3xl font-bold tracking-tight',
  3: 'text-2xl font-semibold',
  4: 'text-xl font-semibold',
  5: 'text-lg font-medium',
  6: 'text-base font-medium',
};

const alignmentMap = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ block, onUpdate, readOnly, theme = 'light' }) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...block, content: e.target.value });
  };

  const setLevel = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    onUpdate({ ...block, level });
  };

  const setAlignment = (alignment: 'left' | 'center' | 'right') => {
    onUpdate({ ...block, alignment });
  };

  const toolbarBtnClass = (isActive?: boolean) => `p-2 rounded-lg transition-colors ${
    isActive 
      ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-900')
      : (isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600')
  }`;

  return (
    <div
      className="group relative"
      onFocus={() => setShowToolbar(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setShowToolbar(false);
        }
      }}
    >
      {/* Toolbar */}
      {showToolbar && !readOnly && (
        <div className={`absolute -top-12 left-0 flex items-center gap-1 p-1.5 rounded-xl shadow-lg border z-10 ${
          isDark 
            ? 'bg-slate-800 border-slate-600' 
            : 'bg-white border-slate-200'
        }`}>
          <select
            value={block.level}
            onChange={(e) => setLevel(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6)}
            className={`px-2 py-1.5 text-sm rounded-lg border ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-slate-200' 
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value={1}>Heading 1</option>
            <option value={2}>Heading 2</option>
            <option value={3}>Heading 3</option>
            <option value={4}>Heading 4</option>
            <option value={5}>Heading 5</option>
            <option value={6}>Heading 6</option>
          </select>
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
        </div>
      )}

      {readOnly ? (
        <div
          className={`w-full p-2 ${headingSizeMap[block.level]} ${alignmentMap[block.alignment || 'left']} ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {block.content || <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Empty heading</span>}
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={block.content}
          onChange={handleChange}
          placeholder={`Heading ${block.level}`}
          className={`w-full p-2 outline-none bg-transparent ${headingSizeMap[block.level]} ${alignmentMap[block.alignment || 'left']} ${
            isDark 
              ? 'text-white placeholder:text-slate-500' 
              : 'text-slate-900 placeholder:text-slate-400'
          }`}
        />
      )}
    </div>
  );
};

export default HeadingBlock;
