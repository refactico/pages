import React, { useState, useRef } from 'react';
import type { ListBlock as ListBlockType, Theme } from '../types';
import { PlusIcon, TrashIcon, CheckIcon } from '../icons';
import { useToolbarPosition } from '../hooks/useToolbarPosition';

interface ListBlockProps {
  block: ListBlockType;
  onUpdate: (block: ListBlockType) => void;
  readOnly?: boolean;
  theme?: Theme;
}

export const ListBlock: React.FC<ListBlockProps> = ({
  block,
  onUpdate,
  readOnly,
  theme = 'light',
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // Smart toolbar positioning
  const { showBelow } = useToolbarPosition({
    containerRef,
    isVisible: showToolbar && !readOnly,
    minSpaceAbove: 60,
  });

  const updateItem = (index: number, value: string) => {
    const newItems = [...block.items];
    newItems[index] = value;
    onUpdate({ ...block, items: newItems });
  };

  const addItem = (afterIndex?: number) => {
    const newItems = [...block.items];
    const insertIndex = afterIndex !== undefined ? afterIndex + 1 : newItems.length;
    newItems.splice(insertIndex, 0, '');

    const newCheckedItems = block.checkedItems ? [...block.checkedItems] : undefined;
    if (newCheckedItems) {
      newCheckedItems.splice(insertIndex, 0, false);
    }

    onUpdate({ ...block, items: newItems, checkedItems: newCheckedItems });
  };

  const removeItem = (index: number) => {
    if (block.items.length <= 1) return;
    const newItems = block.items.filter((_, i) => i !== index);
    const newCheckedItems = block.checkedItems?.filter((_, i) => i !== index);
    onUpdate({ ...block, items: newItems, checkedItems: newCheckedItems });
  };

  const toggleChecked = (index: number) => {
    if (!block.checkedItems) return;
    const newCheckedItems = [...block.checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    onUpdate({ ...block, checkedItems: newCheckedItems });
  };

  const setListType = (listType: 'bullet' | 'numbered' | 'checklist') => {
    const newBlock: ListBlockType = {
      ...block,
      listType,
      checkedItems: listType === 'checklist' ? block.items.map(() => false) : undefined,
    };
    onUpdate(newBlock);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(index);
      // Focus the new input
      setTimeout(() => {
        const inputs = document.querySelectorAll(`[data-list-input="${block.id}"]`);
        (inputs[index + 1] as HTMLInputElement)?.focus();
      }, 0);
    } else if (e.key === 'Backspace' && block.items[index] === '' && block.items.length > 1) {
      e.preventDefault();
      removeItem(index);
      // Focus the previous input
      setTimeout(() => {
        const inputs = document.querySelectorAll(`[data-list-input="${block.id}"]`);
        (inputs[Math.max(0, index - 1)] as HTMLInputElement)?.focus();
      }, 0);
    }
  };

  const toolbarBtnClass = (isActive?: boolean) =>
    `px-2 py-1 text-sm rounded-lg transition-colors ${
      isActive
        ? isDark
          ? 'bg-slate-600 text-white'
          : 'bg-slate-200 text-slate-900'
        : isDark
          ? 'hover:bg-slate-700 text-slate-300'
          : 'hover:bg-slate-100 text-slate-700'
    }`;

  const ListWrapper = block.listType === 'numbered' ? 'ol' : 'ul';

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
            onClick={() => setListType('bullet')}
            className={toolbarBtnClass(block.listType === 'bullet')}
          >
            • Bullet
          </button>
          <button
            onClick={() => setListType('numbered')}
            className={toolbarBtnClass(block.listType === 'numbered')}
          >
            1. Numbered
          </button>
          <button
            onClick={() => setListType('checklist')}
            className={toolbarBtnClass(block.listType === 'checklist')}
          >
            ☑ Checklist
          </button>
        </div>
      )}

      <ListWrapper
        className={`space-y-1 ${block.listType === 'numbered' ? 'list-decimal' : block.listType === 'bullet' ? 'list-disc' : 'list-none'} ${block.listType !== 'checklist' ? 'pl-6' : ''} ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
      >
        {block.items.map((item, index) => (
          <li
            key={index}
            className="group/item flex items-center gap-2"
          >
            {block.listType === 'checklist' && (
              <button
                onClick={() => toggleChecked(index)}
                disabled={readOnly}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  block.checkedItems?.[index]
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : isDark
                      ? 'border-slate-500 hover:border-indigo-400'
                      : 'border-slate-300 hover:border-indigo-400'
                }`}
              >
                {block.checkedItems?.[index] && <CheckIcon size={12} />}
              </button>
            )}
            {readOnly ? (
              <span
                className={
                  block.checkedItems?.[index]
                    ? isDark
                      ? 'line-through text-slate-500'
                      : 'line-through text-slate-400'
                    : ''
                }
              >
                {item}
              </span>
            ) : (
              <>
                <input
                  type="text"
                  data-list-input={block.id}
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder="List item..."
                  className={`flex-1 outline-none bg-transparent ${
                    block.checkedItems?.[index]
                      ? isDark
                        ? 'line-through text-slate-500'
                        : 'line-through text-slate-400'
                      : ''
                  } ${isDark ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400'}`}
                />
                <button
                  onClick={() => removeItem(index)}
                  className={`opacity-0 group-hover/item:opacity-100 p-1 transition-all ${
                    isDark
                      ? 'text-slate-500 hover:text-red-400'
                      : 'text-slate-400 hover:text-red-500'
                  }`}
                >
                  <TrashIcon size={14} />
                </button>
              </>
            )}
          </li>
        ))}
      </ListWrapper>

      {!readOnly && (
        <button
          onClick={() => addItem()}
          className={`mt-2 flex items-center gap-1 text-sm transition-colors ${
            isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <PlusIcon size={14} /> Add item
        </button>
      )}
    </div>
  );
};

export default ListBlock;
