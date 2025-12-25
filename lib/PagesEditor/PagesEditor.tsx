import React, { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import type { EditorData, EditorBlock, PagesEditorProps, BlockType, Theme } from './types';
import {
  createEmptyEditorData,
  createTextBlock,
  createHeadingBlock,
  createImageBlock,
  createCodeBlock,
  createTableBlock,
  createDividerBlock,
  createQuoteBlock,
  createListBlock,
  createCalloutBlock,
  cloneBlock,
  moveArrayItem,
  validateEditorData,
} from './utils';
import { AddBlockMenu } from './AddBlockMenu';
import { BlockWrapper } from './BlockWrapper';
import { PlusIcon } from './icons';

// Theme context for passing theme to child components
export const ThemeContext = createContext<Theme>('light');
export const useTheme = () => useContext(ThemeContext);

export const PagesEditor: React.FC<PagesEditorProps> = ({
  initialData,
  onChange,
  debounceDelay = 300,
  readOnly = false,
  placeholder = 'Start creating your content...',
  className = '',
  theme = 'light',
}) => {
  const [data, setData] = useState<EditorData>(() => {
    if (initialData && validateEditorData(initialData)) {
      return initialData;
    }
    return createEmptyEditorData();
  });

  const [showInitialAddMenu, setShowInitialAddMenu] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = theme === 'dark';

  // Memoized block factory function
  const createBlock = useCallback((type: BlockType): EditorBlock => {
    switch (type) {
      case 'text':
        return createTextBlock();
      case 'heading':
        return createHeadingBlock();
      case 'image':
        return createImageBlock();
      case 'code':
        return createCodeBlock();
      case 'table':
        return createTableBlock();
      case 'divider':
        return createDividerBlock();
      case 'quote':
        return createQuoteBlock();
      case 'list':
        return createListBlock();
      case 'callout':
        return createCalloutBlock();
      default:
        return createTextBlock();
    }
  }, []);

  // Update internal state when initialData changes
  useEffect(() => {
    if (initialData && validateEditorData(initialData)) {
      setData(initialData);
    }
  }, [initialData]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const updateData = useCallback(
    (newBlocks: EditorBlock[]) => {
      const newData: EditorData = {
        ...data,
        blocks: newBlocks,
        updatedAt: new Date().toISOString(),
      };
      setData(newData);

      // Debounced onChange callback
      if (onChange) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          onChange(newData);
        }, debounceDelay);
      }
    },
    [data, onChange, debounceDelay],
  );

  const addBlock = useCallback(
    (type: BlockType, afterIndex?: number) => {
      const newBlock = createBlock(type);
      const newBlocks = [...data.blocks];

      if (afterIndex !== undefined && afterIndex >= 0) {
        newBlocks.splice(afterIndex + 1, 0, newBlock);
      } else {
        newBlocks.push(newBlock);
      }

      updateData(newBlocks);
      setShowInitialAddMenu(false);
    },
    [data.blocks, updateData, createBlock],
  );

  const updateBlock = useCallback(
    (index: number, block: EditorBlock) => {
      const newBlocks = [...data.blocks];
      newBlocks[index] = block;
      updateData(newBlocks);
    },
    [data.blocks, updateData],
  );

  const deleteBlock = useCallback(
    (index: number) => {
      const newBlocks = data.blocks.filter((_, i) => i !== index);
      updateData(newBlocks);
    },
    [data.blocks, updateData],
  );

  const duplicateBlock = useCallback(
    (index: number) => {
      const block = data.blocks[index];
      if (!block) return;
      const newBlock = cloneBlock(block);
      const newBlocks = [...data.blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      updateData(newBlocks);
    },
    [data.blocks, updateData],
  );

  const moveBlockUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newBlocks = moveArrayItem(data.blocks, index, index - 1);
      updateData(newBlocks);
    },
    [data.blocks, updateData],
  );

  const moveBlockDown = useCallback(
    (index: number) => {
      if (index === data.blocks.length - 1) return;
      const newBlocks = moveArrayItem(data.blocks, index, index + 1);
      updateData(newBlocks);
    },
    [data.blocks, updateData],
  );

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);

    if (dragIndex !== dropIndex && !isNaN(dragIndex)) {
      const newBlocks = moveArrayItem(data.blocks, dragIndex, dropIndex);
      updateData(newBlocks);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div className={`pages-editor w-full ${isDark ? 'pe-dark' : 'pe-light'} ${className}`}>
        {/* Editor Content */}
        <div className="relative py-4">
          {data.blocks.length === 0 ? (
            // Empty state
            <div className="text-center py-16">
              <p className={`mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {placeholder}
              </p>
              {!readOnly && (
                <div className="relative inline-block">
                  <button
                    onClick={() => setShowInitialAddMenu(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mx-auto font-medium shadow-sm"
                  >
                    <PlusIcon size={20} />
                    Add First Block
                  </button>
                  {showInitialAddMenu && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50">
                      <AddBlockMenu
                        onAdd={(type) => addBlock(type)}
                        onClose={() => setShowInitialAddMenu(false)}
                        theme={theme}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Blocks list
            <div className="space-y-2">
              {data.blocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`transition-all duration-200 ${
                    dragOverIndex === index && draggedIndex !== index
                      ? 'border-t-2 border-indigo-500 pt-2'
                      : ''
                  }`}
                >
                  <BlockWrapper
                    block={block}
                    index={index}
                    totalBlocks={data.blocks.length}
                    onUpdate={(updatedBlock) => updateBlock(index, updatedBlock)}
                    onDelete={() => deleteBlock(index)}
                    onDuplicate={() => duplicateBlock(index)}
                    onMoveUp={() => moveBlockUp(index)}
                    onMoveDown={() => moveBlockDown(index)}
                    onAddBlock={(type, afterIdx) => addBlock(type as BlockType, afterIdx)}
                    readOnly={readOnly}
                    isDragging={draggedIndex === index}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    theme={theme}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add block at the end */}
          {!readOnly && data.blocks.length > 0 && (
            <div className="relative mt-6">
              <div className="flex justify-center">
                <div className="relative">
                  <button
                    onClick={() => setShowInitialAddMenu(true)}
                    className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition-colors ${
                      isDark
                        ? 'text-slate-500 hover:text-slate-300 border-slate-700 hover:border-slate-500'
                        : 'text-slate-400 hover:text-slate-600 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <PlusIcon size={16} />
                    Add Block
                  </button>
                  {showInitialAddMenu && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50">
                      <AddBlockMenu
                        onAdd={(type) => addBlock(type)}
                        onClose={() => setShowInitialAddMenu(false)}
                        theme={theme}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default PagesEditor;
