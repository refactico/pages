import React, { useState, useRef, useEffect } from 'react';
import type { EditorBlock, Theme } from './types';
import { PlusIcon, DragIcon, TrashIcon, CopyIcon, ChevronUpIcon, ChevronDownIcon } from './icons';
import { AddBlockMenu } from './AddBlockMenu';
import {
  TextBlock,
  HeadingBlock,
  ImageBlock,
  CodeBlock,
  TableBlock,
  DividerBlock,
  QuoteBlock,
  ListBlock,
  CalloutBlock,
} from './blocks';

// Simple More icon for mobile
const MoreIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

interface BlockWrapperProps {
  block: EditorBlock;
  index: number;
  totalBlocks: number;
  onUpdate: (block: EditorBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddBlock: (type: string, afterIndex: number) => void;
  readOnly?: boolean;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  theme?: Theme;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  block,
  index,
  totalBlocks,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onAddBlock,
  readOnly,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  theme = 'light',
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsSelected(false);
        setShowAddMenu(false);
      }
    };

    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSelected]);

  const handleBlockClick = (e: React.MouseEvent) => {
    // Don't select if clicking on an input/textarea/button inside the block
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') {
      return;
    }
    if (!readOnly) {
      setIsSelected(true);
    }
  };

  const renderBlock = () => {
    switch (block.type) {
      case 'text':
        return <TextBlock block={block} onUpdate={onUpdate as (b: typeof block) => void} readOnly={readOnly} theme={theme} />;
      case 'heading':
        return <HeadingBlock block={block} onUpdate={onUpdate as (b: typeof block) => void} readOnly={readOnly} theme={theme} />;
      case 'image':
        return <ImageBlock block={block} onUpdate={onUpdate as (b: typeof block) => void} readOnly={readOnly} theme={theme} />;
      case 'code':
        return <CodeBlock block={block} onUpdate={onUpdate as (b: typeof block) => void} readOnly={readOnly} theme={theme} />;
      case 'table':
        return <TableBlock block={block} onUpdate={onUpdate as (b: typeof block) => void} readOnly={readOnly} theme={theme} />;
      case 'divider':
        return <DividerBlock block={block} onUpdate={onUpdate as (b: typeof block) => void} readOnly={readOnly} theme={theme} />;
      case 'quote':
        return <QuoteBlock block={block} onUpdate={onUpdate as (b: typeof block) => void} readOnly={readOnly} theme={theme} />;
      case 'list':
        return <ListBlock block={block} onUpdate={onUpdate as (b: typeof block) => void} readOnly={readOnly} theme={theme} />;
      case 'callout':
        return <CalloutBlock block={block} onUpdate={onUpdate as (b: typeof block) => void} readOnly={readOnly} theme={theme} />;
      default:
        return <div>Unknown block type</div>;
    }
  };

  const buttonBaseClass = `p-1.5 rounded-lg transition-all ${
    isDark 
      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' 
      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
  }`;

  const showControls = !readOnly && isSelected;

  // Base border style for edit mode (always visible)
  const editModeBorderClass = !readOnly
    ? isSelected
      ? (isDark ? 'ring-2 ring-indigo-500 rounded-lg bg-slate-800/30' : 'ring-2 ring-indigo-500 rounded-lg bg-indigo-50/30')
      : (isDark ? 'border border-slate-700 rounded-lg hover:border-slate-500' : 'border border-slate-200 rounded-lg hover:border-slate-400')
    : '';

  return (
    <div
      ref={wrapperRef}
      className={`group relative transition-all ${isDragging ? 'opacity-50' : ''} ${editModeBorderClass} ${!readOnly ? 'cursor-pointer' : ''}`}
      onClick={handleBlockClick}
      draggable={!readOnly && isSelected}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-block-index={index}
    >
      {/* Top toolbar when selected */}
      {showControls && (
        <div className={`flex items-center justify-between gap-1 px-2 py-1.5 mb-1 rounded-t-lg border-b ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-1">
            {/* Drag handle */}
            <button
              className={`${buttonBaseClass} cursor-grab active:cursor-grabbing`}
              title="Drag to reorder"
            >
              <DragIcon size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              disabled={index === 0}
              className={`${buttonBaseClass} disabled:opacity-30 disabled:cursor-not-allowed`}
              title="Move up"
            >
              <ChevronUpIcon size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              disabled={index === totalBlocks - 1}
              className={`${buttonBaseClass} disabled:opacity-30 disabled:cursor-not-allowed`}
              title="Move down"
            >
              <ChevronDownIcon size={16} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setShowAddMenu(!showAddMenu); }}
              className={`${buttonBaseClass} hover:!text-indigo-500`}
              title="Add block below"
            >
              <PlusIcon size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className={`${buttonBaseClass} hover:!text-indigo-500`}
              title="Duplicate"
            >
              <CopyIcon size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className={`${buttonBaseClass} hover:!text-red-500`}
              title="Delete"
            >
              <TrashIcon size={16} />
            </button>
          </div>
          {/* Add menu dropdown */}
          {showAddMenu && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50">
              <AddBlockMenu
                onAdd={(type) => {
                  onAddBlock(type, index);
                  setShowAddMenu(false);
                }}
                onClose={() => setShowAddMenu(false)}
                theme={theme}
              />
            </div>
          )}
        </div>
      )}

      {/* Legacy: Right side controls - hidden now */}
      {false && showControls && (
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className={`${buttonBaseClass} disabled:opacity-30 disabled:cursor-not-allowed`}
            title="Move up"
          >
            <ChevronUpIcon size={14} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === totalBlocks - 1}
            className={`${buttonBaseClass} disabled:opacity-30 disabled:cursor-not-allowed`}
            title="Move down"
          >
            <ChevronDownIcon size={14} />
          </button>
          <button
            onClick={onDuplicate}
            className={`${buttonBaseClass} hover:!text-indigo-500`}
            title="Duplicate"
          >
            <CopyIcon size={14} />
          </button>
          <button
            onClick={onDelete}
            className={`${buttonBaseClass} hover:!text-red-500`}
            title="Delete"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      )}

      {/* Block content */}
      <div className="relative px-2 py-2">
        {renderBlock()}
      </div>
    </div>
  );
};

export default BlockWrapper;
