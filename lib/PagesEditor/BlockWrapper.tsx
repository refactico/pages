import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { 
  EditorBlock, 
  Theme,
  TextBlock as TextBlockType,
  HeadingBlock as HeadingBlockType,
  ImageBlock as ImageBlockType,
  CodeBlock as CodeBlockType,
  TableBlock as TableBlockType,
  DividerBlock as DividerBlockType,
  QuoteBlock as QuoteBlockType,
  ListBlock as ListBlockType,
  CalloutBlock as CalloutBlockType,
} from './types';
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
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSelected]);

  const handleBlockClick = useCallback((e: React.MouseEvent) => {
    // Don't select if clicking on an input/textarea/button inside the block
    const target = e.target as HTMLElement;
    const interactiveElements = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'];
    if (interactiveElements.includes(target.tagName)) {
      return;
    }
    if (!readOnly) {
      setIsSelected(true);
    }
  }, [readOnly]);

  // Type-safe block renderer using discriminated union
  const renderBlock = useCallback(() => {
    const commonProps = { readOnly, theme };
    
    switch (block.type) {
      case 'text':
        return <TextBlock block={block} onUpdate={(b: TextBlockType) => onUpdate(b)} {...commonProps} />;
      case 'heading':
        return <HeadingBlock block={block} onUpdate={(b: HeadingBlockType) => onUpdate(b)} {...commonProps} />;
      case 'image':
        return <ImageBlock block={block} onUpdate={(b: ImageBlockType) => onUpdate(b)} {...commonProps} />;
      case 'code':
        return <CodeBlock block={block} onUpdate={(b: CodeBlockType) => onUpdate(b)} {...commonProps} />;
      case 'table':
        return <TableBlock block={block} onUpdate={(b: TableBlockType) => onUpdate(b)} {...commonProps} />;
      case 'divider':
        return <DividerBlock block={block} onUpdate={(b: DividerBlockType) => onUpdate(b)} {...commonProps} />;
      case 'quote':
        return <QuoteBlock block={block} onUpdate={(b: QuoteBlockType) => onUpdate(b)} {...commonProps} />;
      case 'list':
        return <ListBlock block={block} onUpdate={(b: ListBlockType) => onUpdate(b)} {...commonProps} />;
      case 'callout':
        return <CalloutBlock block={block} onUpdate={(b: CalloutBlockType) => onUpdate(b)} {...commonProps} />;
      default: {
        // TypeScript exhaustive check - this should never happen
        const _exhaustiveCheck: never = block;
        return <div>Unknown block type: {(_exhaustiveCheck as EditorBlock).type}</div>;
      }
    }
  }, [block, onUpdate, readOnly, theme]);

  const buttonBaseClass = `p-1.5 rounded-lg transition-all ${
    isDark 
      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' 
      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
  }`;

  const showControls = !readOnly && isSelected;

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (readOnly || !isSelected) return;
    
    switch (e.key) {
      case 'Escape':
        setIsSelected(false);
        setShowAddMenu(false);
        break;
      case 'Delete':
      case 'Backspace':
        // Only delete if not focused on an input
        if (!(e.target as HTMLElement).matches('input, textarea, [contenteditable]')) {
          e.preventDefault();
          onDelete();
        }
        break;
      case 'ArrowUp':
        if (e.altKey) {
          e.preventDefault();
          onMoveUp();
        }
        break;
      case 'ArrowDown':
        if (e.altKey) {
          e.preventDefault();
          onMoveDown();
        }
        break;
      case 'd':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onDuplicate();
        }
        break;
    }
  }, [readOnly, isSelected, onDelete, onMoveUp, onMoveDown, onDuplicate]);

  // Base border style for edit mode (always visible)
  const editModeBorderClass = !readOnly
    ? isSelected
      ? (isDark ? 'ring-2 ring-indigo-500 rounded-lg bg-slate-800/30' : 'ring-2 ring-indigo-500 rounded-lg bg-indigo-50/30')
      : (isDark ? 'border border-slate-700 rounded-lg hover:border-slate-500' : 'border border-slate-200 rounded-lg hover:border-slate-400')
    : '';

  // Generate accessible block type label
  const blockTypeLabel = block.type.charAt(0).toUpperCase() + block.type.slice(1);

  return (
    <div
      ref={wrapperRef}
      role="article"
      aria-label={`${blockTypeLabel} block ${index + 1} of ${totalBlocks}`}
      aria-selected={isSelected}
      tabIndex={readOnly ? -1 : 0}
      className={`group relative transition-all ${isDragging ? 'opacity-50' : ''} ${editModeBorderClass} ${!readOnly ? 'cursor-pointer' : ''} focus:outline-none`}
      onClick={handleBlockClick}
      onKeyDown={handleKeyDown}
      draggable={!readOnly && isSelected}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-block-index={index}
      data-block-type={block.type}
    >
      {/* Top toolbar when selected */}
      {showControls && (
        <div 
          role="toolbar" 
          aria-label="Block controls"
          className={`flex items-center justify-between gap-1 px-2 py-1.5 mb-1 rounded-t-lg border-b ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-1" role="group" aria-label="Reorder controls">
            {/* Drag handle */}
            <button
              type="button"
              className={`${buttonBaseClass} cursor-grab active:cursor-grabbing`}
              title="Drag to reorder"
              aria-label="Drag to reorder block"
            >
              <DragIcon size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              disabled={index === 0}
              className={`${buttonBaseClass} disabled:opacity-30 disabled:cursor-not-allowed`}
              title="Move up (Alt+↑)"
              aria-label="Move block up"
              aria-disabled={index === 0}
            >
              <ChevronUpIcon size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              disabled={index === totalBlocks - 1}
              className={`${buttonBaseClass} disabled:opacity-30 disabled:cursor-not-allowed`}
              title="Move down (Alt+↓)"
              aria-label="Move block down"
              aria-disabled={index === totalBlocks - 1}
            >
              <ChevronDownIcon size={16} />
            </button>
          </div>
          <div className="flex items-center gap-1" role="group" aria-label="Block actions">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowAddMenu(!showAddMenu); }}
              className={`${buttonBaseClass} hover:!text-indigo-500`}
              title="Add block below"
              aria-label="Add new block below"
              aria-expanded={showAddMenu}
              aria-haspopup="menu"
            >
              <PlusIcon size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className={`${buttonBaseClass} hover:!text-indigo-500`}
              title="Duplicate (Ctrl+D)"
              aria-label="Duplicate block"
            >
              <CopyIcon size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className={`${buttonBaseClass} hover:!text-red-500`}
              title="Delete"
              aria-label="Delete block"
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

      {/* Block content */}
      <div className="relative px-2 py-2">
        {renderBlock()}
      </div>
    </div>
  );
};

export default BlockWrapper;
