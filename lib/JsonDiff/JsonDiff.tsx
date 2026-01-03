import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { JsonDiffProps, ViewMode, BlockDiff, DiffType } from './types';
import type { EditorData, EditorBlock } from '../PagesEditor/types';
import { compareEditorData, getBlockTypeLabel } from './utils';
import { BlockRenderer } from './BlockRenderer';
import {
  PlusCircleIcon,
  MinusCircleIcon,
  EditIcon,
  CheckIcon,
  SplitIcon,
  UnifiedIcon,
  GripVerticalIcon,
  UndoIcon,
  XIcon,
} from './icons';

// Hook to detect mobile viewport
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export function JsonDiff({
  oldData,
  newData,
  onChange,
  theme = 'light',
  className = '',
  initialSplitPosition = 50,
  minPanelWidth = 20,
  allowRevert = true,
}: JsonDiffProps) {
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'unified' : 'split');
  const [splitPosition, setSplitPosition] = useState(initialSplitPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [currentData, setCurrentData] = useState<EditorData>(newData);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update currentData when newData prop changes
  useEffect(() => {
    setCurrentData(newData);
  }, [newData]);

  // Auto-switch to unified on mobile
  useEffect(() => {
    if (isMobile && viewMode === 'split') {
      setViewMode('unified');
    }
  }, [isMobile, viewMode]);

  // Compute diff between old and current (not newData, so reverts are reflected)
  const diffResult = useMemo(
    () => compareEditorData(oldData, currentData),
    [oldData, currentData]
  );

  // Draggable divider handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
      const clampedPosition = Math.max(minPanelWidth, Math.min(100 - minPanelWidth, newPosition));
      setSplitPosition(clampedPosition);
    },
    [isDragging, minPanelWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Revert a change - keep old version instead of new
  const handleRevert = useCallback(
    (diff: BlockDiff) => {
      let newBlocks: EditorBlock[];

      if (diff.type === 'added' && diff.newBlock) {
        // Remove the added block
        newBlocks = currentData.blocks.filter((b) => b.id !== diff.newBlock!.id);
      } else if (diff.type === 'removed' && diff.oldBlock) {
        // Restore the removed block - find position based on surrounding blocks
        const oldIndex = oldData.blocks.findIndex((b) => b.id === diff.oldBlock!.id);
        newBlocks = [...currentData.blocks];

        // Find the best position to insert
        let insertIndex = newBlocks.length;
        for (let i = oldIndex - 1; i >= 0; i--) {
          const prevBlock = oldData.blocks[i];
          const prevIndexInCurrent = newBlocks.findIndex((b) => b.id === prevBlock?.id);
          if (prevIndexInCurrent !== -1) {
            insertIndex = prevIndexInCurrent + 1;
            break;
          }
        }
        newBlocks.splice(insertIndex, 0, diff.oldBlock);
      } else if (diff.type === 'modified' && diff.oldBlock && diff.newBlock) {
        // Replace with old version
        newBlocks = currentData.blocks.map((b) =>
          b.id === diff.newBlock!.id ? diff.oldBlock! : b
        );
      } else {
        return;
      }

      const updatedData: EditorData = {
        ...currentData,
        blocks: newBlocks,
        updatedAt: new Date().toISOString(),
      };

      setCurrentData(updatedData);
      onChange?.(updatedData);
    },
    [currentData, oldData, onChange]
  );

  // Accept a change (dismiss the revert option) - for removed blocks, permanently remove
  const handleAccept = useCallback(
    (diff: BlockDiff) => {
      // For most cases, the change is already in currentData, so nothing to do
      // But we could track "accepted" state if needed for UI purposes
      // For now, this is mainly useful for removed blocks to confirm deletion
      if (diff.type === 'removed' && diff.oldBlock) {
        // Already removed, just trigger onChange to confirm
        onChange?.(currentData);
      }
    },
    [currentData, onChange]
  );

  // Get diff type styling
  const getDiffStyles = (type: DiffType) => {
    const styles = {
      added: {
        bg: isDark ? 'bg-emerald-950/30' : 'bg-emerald-50',
        border: isDark ? 'border-emerald-600' : 'border-emerald-400',
        badge: isDark ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700',
        icon: <PlusCircleIcon size={14} />,
        label: 'Added',
        revertLabel: 'Remove',
      },
      removed: {
        bg: isDark ? 'bg-red-950/30' : 'bg-red-50',
        border: isDark ? 'border-red-600' : 'border-red-400',
        badge: isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700',
        icon: <MinusCircleIcon size={14} />,
        label: 'Removed',
        revertLabel: 'Restore',
      },
      modified: {
        bg: isDark ? 'bg-amber-950/30' : 'bg-amber-50',
        border: isDark ? 'border-amber-600' : 'border-amber-400',
        badge: isDark ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 text-amber-700',
        icon: <EditIcon size={14} />,
        label: 'Modified',
        revertLabel: 'Revert',
      },
      unchanged: {
        bg: 'bg-transparent',
        border: isDark ? 'border-slate-700' : 'border-slate-200',
        badge: isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500',
        icon: <CheckIcon size={14} />,
        label: 'Unchanged',
        revertLabel: '',
      },
    };
    return styles[type];
  };

  // Render block content with styling
  const renderBlockContent = (
    block: NonNullable<BlockDiff['oldBlock']>,
    diffType: DiffType,
    showBadge: boolean,
    badgeLabel?: string,
    diff?: BlockDiff
  ) => {
    const style = getDiffStyles(diffType);
    const showRevert = allowRevert && diff && diffType !== 'unchanged';

    return (
      <div className={`relative rounded-xl border-2 ${style.border} ${style.bg} overflow-hidden h-full`}>
        {/* Header with badge and actions */}
        <div
          className={`flex items-center justify-between px-4 py-2 border-b ${
            isDark ? 'border-slate-700' : 'border-slate-200'
          }`}
        >
          <span
            className={`text-xs font-medium uppercase tracking-wide ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {getBlockTypeLabel(block)}
          </span>

          <div className="flex items-center gap-2">
            {showBadge && (
              <span
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${style.badge}`}
              >
                {style.icon}
                {badgeLabel || style.label}
              </span>
            )}

            {showRevert && diff && (
              <button
                onClick={() => handleRevert(diff)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-900'
                }`}
                title={style.revertLabel}
              >
                <UndoIcon size={12} />
                {style.revertLabel}
              </button>
            )}
          </div>
        </div>

        {/* Block content */}
        <div className="p-4">
          <BlockRenderer block={block} theme={theme} />
        </div>
      </div>
    );
  };

  // Render placeholder for empty side
  const renderPlaceholder = (message: string, diff?: BlockDiff, showRevert?: boolean) => (
    <div
      className={`h-full min-h-[100px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 ${
        isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {message}
      </span>
      {showRevert && allowRevert && diff && (
        <button
          onClick={() => handleRevert(diff)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isDark
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-900'
          }`}
        >
          <UndoIcon size={12} />
          {diff.type === 'added' ? 'Remove this block' : 'Restore this block'}
        </button>
      )}
    </div>
  );

  // Render unified diff item
  const renderUnifiedDiffItem = (diff: BlockDiff, index: number) => {
    if (diff.type === 'unchanged') {
      return (
        <div key={diff.oldBlock?.id || index} className="opacity-60">
          {renderBlockContent(diff.oldBlock!, 'unchanged', false)}
        </div>
      );
    }

    if (diff.type === 'added') {
      return (
        <div key={diff.newBlock?.id || index}>
          {renderBlockContent(diff.newBlock!, 'added', true, undefined, diff)}
        </div>
      );
    }

    if (diff.type === 'removed') {
      return (
        <div key={diff.oldBlock?.id || index}>
          {renderBlockContent(diff.oldBlock!, 'removed', true, undefined, diff)}
        </div>
      );
    }

    // Modified - show both old and new
    return (
      <div key={diff.oldBlock?.id || index} className="space-y-2">
        <div className="relative pl-4">
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${
              isDark ? 'bg-red-500' : 'bg-red-400'
            }`}
          />
          <div className="opacity-80">
            {renderBlockContent(diff.oldBlock!, 'removed', true, 'Before')}
          </div>
        </div>
        <div className="relative pl-4">
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${
              isDark ? 'bg-emerald-500' : 'bg-emerald-400'
            }`}
          />
          {renderBlockContent(diff.newBlock!, 'added', true, 'After', diff)}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`json-diff w-full h-full flex flex-col ${isDark ? 'bg-slate-900' : 'bg-white'} ${className}`}
    >
      {/* Header */}
      <div
        className={`flex-shrink-0 flex flex-wrap items-center justify-between gap-4 p-4 border-b ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}
      >
        {/* Summary badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Changes:
          </span>
          {diffResult.summary.added > 0 && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <PlusCircleIcon size={12} />
              {diffResult.summary.added} added
            </span>
          )}
          {diffResult.summary.removed > 0 && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700'
              }`}
            >
              <MinusCircleIcon size={12} />
              {diffResult.summary.removed} removed
            </span>
          )}
          {diffResult.summary.modified > 0 && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                isDark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <EditIcon size={12} />
              {diffResult.summary.modified} modified
            </span>
          )}
          {diffResult.summary.added === 0 &&
            diffResult.summary.removed === 0 &&
            diffResult.summary.modified === 0 && (
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No changes detected
              </span>
            )}
        </div>

        {/* View mode toggle (hidden on mobile) */}
        {!isMobile && (
          <div
            className={`flex items-center rounded-lg p-1 ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          >
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'split'
                  ? isDark
                    ? 'bg-slate-700 text-white'
                    : 'bg-white text-slate-900 shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SplitIcon size={14} />
              Split
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'unified'
                  ? isDark
                    ? 'bg-slate-700 text-white'
                    : 'bg-white text-slate-900 shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UnifiedIcon size={14} />
              Unified
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto relative">
        {viewMode === 'split' ? (
          <div className="relative min-h-full">
            {/* Sticky drag handle */}
            <div
              className="sticky top-1/2 -translate-y-1/2 z-30 pointer-events-none"
              style={{ marginLeft: `calc(${splitPosition}% - 20px)`, height: 0 }}
            >
              <div
                className={`pointer-events-auto w-10 h-10 rounded-xl cursor-col-resize flex items-center justify-center transition-all ${
                  isDragging
                    ? 'bg-indigo-500 scale-110 shadow-lg'
                    : isDark
                      ? 'bg-slate-700 hover:bg-indigo-500 shadow-md'
                      : 'bg-slate-200 hover:bg-indigo-500 shadow-md'
                }`}
                onMouseDown={handleMouseDown}
              >
                <GripVerticalIcon
                  size={18}
                  className={`transition-colors ${
                    isDragging
                      ? 'text-white'
                      : isDark
                        ? 'text-slate-400'
                        : 'text-slate-500'
                  }`}
                />
              </div>
            </div>

            {/* Vertical divider line */}
            <div
              className={`absolute top-0 bottom-0 w-px transition-colors ${
                isDragging
                  ? 'bg-indigo-500'
                  : isDark
                    ? 'bg-slate-700'
                    : 'bg-slate-300'
              }`}
              style={{ left: `${splitPosition}%` }}
            />

            <div className="p-4">
              {/* Column headers */}
              <div
                className="flex mb-4 sticky top-0 z-20 py-2 -mx-4 px-4"
                style={{
                  background: isDark ? 'rgb(15 23 42)' : 'white',
                }}
              >
                <div
                  style={{ width: `${splitPosition}%` }}
                  className={`flex-shrink-0 pr-6 pb-2 border-b ${
                    isDark ? 'border-slate-700' : 'border-slate-200'
                  }`}
                >
                  <h3
                    className={`text-sm font-semibold uppercase tracking-wide ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    📄 Original
                  </h3>
                </div>
                <div
                  style={{ width: `${100 - splitPosition}%` }}
                  className={`flex-shrink-0 pl-6 pb-2 border-b ${
                    isDark ? 'border-slate-700' : 'border-slate-200'
                  }`}
                >
                  <h3
                    className={`text-sm font-semibold uppercase tracking-wide ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    ✨ Modified
                  </h3>
                </div>
              </div>

              {/* Diff rows */}
              <div className="space-y-4">
                {diffResult.blocks.map((diff, idx) => (
                  <div key={diff.oldBlock?.id || diff.newBlock?.id || idx} className="flex">
                    {/* Left side */}
                    <div style={{ width: `${splitPosition}%` }} className="flex-shrink-0 pr-6">
                      {diff.type === 'added' ? (
                        renderPlaceholder('New block added →', diff, true)
                      ) : diff.type === 'removed' ? (
                        renderBlockContent(diff.oldBlock!, 'removed', true, undefined, diff)
                      ) : diff.type === 'modified' ? (
                        renderBlockContent(diff.oldBlock!, 'modified', true, 'Before')
                      ) : (
                        <div className="opacity-60 h-full">
                          {renderBlockContent(diff.oldBlock!, 'unchanged', false)}
                        </div>
                      )}
                    </div>
                    {/* Right side */}
                    <div style={{ width: `${100 - splitPosition}%` }} className="flex-shrink-0 pl-6">
                      {diff.type === 'removed' ? (
                        renderPlaceholder('← Block removed', diff, true)
                      ) : diff.type === 'added' ? (
                        renderBlockContent(diff.newBlock!, 'added', true, undefined, diff)
                      ) : diff.type === 'modified' ? (
                        renderBlockContent(diff.newBlock!, 'modified', true, 'After', diff)
                      ) : (
                        <div className="opacity-60 h-full">
                          {renderBlockContent(diff.newBlock!, 'unchanged', false)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Unified View */
          <div className="p-4">
            <div className="space-y-4 max-w-4xl mx-auto">
              {diffResult.blocks.map((diff, idx) => renderUnifiedDiffItem(diff, idx))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JsonDiff;
