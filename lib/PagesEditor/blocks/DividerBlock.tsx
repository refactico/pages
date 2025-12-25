import React from 'react';
import type { DividerBlock as DividerBlockType, Theme } from '../types';

interface DividerBlockProps {
  block: DividerBlockType;
  onUpdate: (block: DividerBlockType) => void;
  readOnly?: boolean;
  theme?: Theme;
}

const styleMap = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
};

export const DividerBlock: React.FC<DividerBlockProps> = ({ block, onUpdate, readOnly, theme = 'light' }) => {
  const isDark = theme === 'dark';
  
  const cycleStyle = () => {
    if (readOnly) return;
    const styles: ('solid' | 'dashed' | 'dotted')[] = ['solid', 'dashed', 'dotted'];
    const currentIndex = styles.indexOf(block.style || 'solid');
    const nextIndex = (currentIndex + 1) % styles.length;
    onUpdate({ ...block, style: styles[nextIndex] });
  };

  return (
    <div className="py-4 group">
      <hr
        onClick={cycleStyle}
        className={`border-t-2 ${styleMap[block.style || 'solid']} ${
          isDark 
            ? 'border-slate-700' + (!readOnly ? ' hover:border-slate-500' : '')
            : 'border-slate-200' + (!readOnly ? ' hover:border-slate-400' : '')
        } ${!readOnly ? 'cursor-pointer' : ''}`}
      />
      {!readOnly && (
        <p className={`text-xs text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Click to change style ({block.style || 'solid'})
        </p>
      )}
    </div>
  );
};

export default DividerBlock;
