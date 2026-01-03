import React, { useState, useRef } from 'react';
import type { TableBlock as TableBlockType, TableCell, Theme } from '../types';
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../icons';

interface TableBlockProps {
  block: TableBlockType;
  onUpdate: (block: TableBlockType) => void;
  readOnly?: boolean;
  theme?: Theme;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  onUpdate,
  readOnly,
  theme = 'light',
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{
    top: number;
    left: number;
    right?: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, HTMLTableCellElement>>(new Map());
  const isDark = theme === 'dark';

  // Update toolbar position when active cell changes
  const updateToolbarPosition = (row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    const cellEl = cellRefs.current.get(cellKey);
    const containerEl = containerRef.current;

    if (cellEl && containerEl) {
      const cellRect = cellEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      const containerWidth = containerRect.width;

      // Calculate left position based on cell
      let left = cellRect.left - containerRect.left;

      // Toolbar is roughly 500px wide, check if it would overflow
      const toolbarWidth = 520; // approximate width
      const availableRight = containerWidth - left;

      if (availableRight < toolbarWidth) {
        // Not enough space on right, align to right edge of container
        left = Math.max(0, containerWidth - toolbarWidth);
      }

      setToolbarPosition({
        top: cellRect.top - containerRect.top - 44, // 44px above cell
        left: Math.max(0, left),
      });
    }
  };

  const handleCellFocus = (row: number, col: number) => {
    setActiveCell({ row, col });
    setShowToolbar(true);
    // Small delay to let the toolbar render, then position it
    setTimeout(() => updateToolbarPosition(row, col), 0);
  };

  const updateCell = (rowIndex: number, colIndex: number, content: string) => {
    const currentRow = block.rows[rowIndex];
    if (!currentRow) return;
    const currentCell = currentRow[colIndex];
    if (!currentCell) return;
    const newRows = [...block.rows];
    newRows[rowIndex] = [...currentRow];
    newRows[rowIndex][colIndex] = { ...currentCell, content };
    onUpdate({ ...block, rows: newRows });
  };

  const addRow = () => {
    const colCount = block.rows[0]?.length || 3;
    const newRow: TableCell[] = Array(colCount)
      .fill(null)
      .map(() => ({ content: '' }));
    onUpdate({ ...block, rows: [...block.rows, newRow] });
  };

  const addColumn = () => {
    const newRows = block.rows.map((row, rowIndex) => [
      ...row,
      { content: '', header: rowIndex === 0 && block.hasHeader },
    ]);
    onUpdate({ ...block, rows: newRows });
  };

  const deleteRow = (rowIndex: number) => {
    if (block.rows.length <= 1) return;
    const newRows = block.rows.filter((_, i) => i !== rowIndex);
    onUpdate({ ...block, rows: newRows });
  };

  const deleteColumn = (colIndex: number) => {
    if ((block.rows[0]?.length ?? 0) <= 1) return;
    const newRows = block.rows.map((row) => row.filter((_, i) => i !== colIndex));
    onUpdate({ ...block, rows: newRows });
  };

  // Move row up
  const moveRowUp = (rowIndex: number) => {
    if (rowIndex === 0) return;
    const newRows = [...block.rows];
    const temp = newRows[rowIndex - 1]!;
    newRows[rowIndex - 1] = newRows[rowIndex]!;
    newRows[rowIndex] = temp;
    onUpdate({ ...block, rows: newRows });
  };

  // Move row down
  const moveRowDown = (rowIndex: number) => {
    if (rowIndex >= block.rows.length - 1) return;
    const newRows = [...block.rows];
    const temp = newRows[rowIndex]!;
    newRows[rowIndex] = newRows[rowIndex + 1]!;
    newRows[rowIndex + 1] = temp;
    onUpdate({ ...block, rows: newRows });
  };

  // Move column left
  const moveColumnLeft = (colIndex: number) => {
    if (colIndex === 0) return;
    const newRows = block.rows.map((row) => {
      const newRow = [...row];
      const temp = newRow[colIndex - 1]!;
      newRow[colIndex - 1] = newRow[colIndex]!;
      newRow[colIndex] = temp;
      return newRow;
    });
    onUpdate({ ...block, rows: newRows });
  };

  // Move column right
  const moveColumnRight = (colIndex: number) => {
    if (colIndex >= (block.rows[0]?.length ?? 0) - 1) return;
    const newRows = block.rows.map((row) => {
      const newRow = [...row];
      const temp = newRow[colIndex]!;
      newRow[colIndex] = newRow[colIndex + 1]!;
      newRow[colIndex + 1] = temp;
      return newRow;
    });
    onUpdate({ ...block, rows: newRows });
  };

  const toggleHeader = () => {
    const newRows = block.rows.map((row, rowIndex) =>
      row.map((cell) => ({
        ...cell,
        header: rowIndex === 0 ? !block.hasHeader : false,
      })),
    );
    onUpdate({ ...block, rows: newRows, hasHeader: !block.hasHeader });
  };

  const toolbarBtnClass = (isActive?: boolean) =>
    `px-2 py-1 text-sm rounded-lg transition-colors ${
      isActive
        ? isDark
          ? 'bg-indigo-900/50 text-indigo-400'
          : 'bg-indigo-100 text-indigo-600'
        : isDark
          ? 'hover:bg-slate-700 text-slate-300'
          : 'hover:bg-slate-100 text-slate-700'
    }`;

  return (
    <div
      ref={containerRef}
      className="group relative"
      tabIndex={0}
      onClick={() => setShowToolbar(true)}
      onFocus={() => setShowToolbar(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setShowToolbar(false);
        }
      }}
    >
      {/* Toolbar - positioned above active cell */}
      {showToolbar && !readOnly && activeCell && toolbarPosition && (
        <div
          ref={toolbarRef}
          style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
          className={`absolute flex items-center gap-1 p-1.5 rounded-xl shadow-lg border z-50 whitespace-nowrap ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}
        >
          {/* Add buttons */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              addRow();
            }}
            className={`flex items-center gap-1 ${toolbarBtnClass()}`}
            title="Add Row"
          >
            <PlusIcon size={14} /> Row
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              addColumn();
            }}
            className={`flex items-center gap-1 ${toolbarBtnClass()}`}
            title="Add Column"
          >
            <PlusIcon size={14} /> Col
          </button>
          <div className={`w-px h-6 mx-1 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              toggleHeader();
            }}
            className={toolbarBtnClass(block.hasHeader)}
          >
            Header
          </button>
          <div className={`w-px h-6 mx-1 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
          {/* Row controls */}
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Row:</span>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              moveRowUp(activeCell.row);
              updateToolbarPosition(activeCell.row - 1, activeCell.col);
            }}
            disabled={activeCell.row === 0}
            className={`p-1 rounded ${activeCell.row === 0 ? 'opacity-30 cursor-not-allowed' : ''} ${toolbarBtnClass()}`}
            title="Move Row Up"
          >
            <ChevronUpIcon size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              moveRowDown(activeCell.row);
              updateToolbarPosition(activeCell.row + 1, activeCell.col);
            }}
            disabled={activeCell.row >= block.rows.length - 1}
            className={`p-1 rounded ${activeCell.row >= block.rows.length - 1 ? 'opacity-30 cursor-not-allowed' : ''} ${toolbarBtnClass()}`}
            title="Move Row Down"
          >
            <ChevronDownIcon size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              deleteRow(activeCell.row);
              setActiveCell(null);
              setShowToolbar(false);
            }}
            disabled={block.rows.length <= 1}
            className={`p-1 rounded text-red-500 hover:bg-red-100 ${block.rows.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
            title="Delete Row"
          >
            <TrashIcon size={14} />
          </button>
          <div className={`w-px h-6 mx-1 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
          {/* Column controls */}
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Col:</span>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              moveColumnLeft(activeCell.col);
              updateToolbarPosition(activeCell.row, activeCell.col - 1);
            }}
            disabled={activeCell.col === 0}
            className={`p-1 rounded ${activeCell.col === 0 ? 'opacity-30 cursor-not-allowed' : ''} ${toolbarBtnClass()}`}
            title="Move Column Left"
          >
            <ChevronLeftIcon size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              moveColumnRight(activeCell.col);
              updateToolbarPosition(activeCell.row, activeCell.col + 1);
            }}
            disabled={activeCell.col >= (block.rows[0]?.length ?? 0) - 1}
            className={`p-1 rounded ${activeCell.col >= (block.rows[0]?.length ?? 0) - 1 ? 'opacity-30 cursor-not-allowed' : ''} ${toolbarBtnClass()}`}
            title="Move Column Right"
          >
            <ChevronRightIcon size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              deleteColumn(activeCell.col);
              setActiveCell(null);
              setShowToolbar(false);
            }}
            disabled={(block.rows[0]?.length ?? 0) <= 1}
            className={`p-1 rounded text-red-500 hover:bg-red-100 ${(block.rows[0]?.length ?? 0) <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
            title="Delete Column"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl">
        <table
          className={`w-full border-collapse border ${isDark ? 'border-slate-600' : 'border-slate-300'}`}
        >
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="group/row"
              >
                {row.map((cell, colIndex) => {
                  const isHeader = block.hasHeader && rowIndex === 0;
                  const CellTag = isHeader ? 'th' : 'td';
                  const isActive = activeCell?.row === rowIndex && activeCell?.col === colIndex;
                  const alignClass =
                    cell.alignment === 'center'
                      ? 'text-center'
                      : cell.alignment === 'right'
                        ? 'text-right'
                        : 'text-left';

                  return (
                    <CellTag
                      key={colIndex}
                      ref={(el) => {
                        if (el) cellRefs.current.set(`${rowIndex}-${colIndex}`, el);
                      }}
                      className={`relative border p-0 ${
                        isDark ? 'border-slate-600' : 'border-slate-300'
                      } ${
                        isHeader
                          ? isDark
                            ? 'bg-slate-800 font-semibold'
                            : 'bg-slate-100 font-semibold'
                          : isDark
                            ? 'bg-slate-900'
                            : 'bg-white'
                      } ${alignClass} ${isActive ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
                    >
                      {readOnly ? (
                        <div
                          className={`px-3 py-2 min-h-[40px] ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                        >
                          {cell.content}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={cell.content}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          onFocus={() => handleCellFocus(rowIndex, colIndex)}
                          className={`w-full px-3 py-2 min-h-[40px] outline-none bg-transparent ${alignClass} ${
                            isHeader ? 'font-semibold' : ''
                          } ${isDark ? 'text-slate-200 placeholder:text-slate-500' : 'text-slate-700 placeholder:text-slate-400'}`}
                          placeholder={isHeader ? 'Header' : ''}
                        />
                      )}
                    </CellTag>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableBlock;
