import React, { useState, useRef } from 'react';
import type { TableBlock as TableBlockType, TableCell, Theme } from '../types';
import { PlusIcon, TrashIcon } from '../icons';
import { useToolbarPosition } from '../hooks/useToolbarPosition';

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
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // Smart toolbar positioning
  const { showBelow } = useToolbarPosition({
    containerRef,
    isVisible: showToolbar && !readOnly,
    minSpaceAbove: 60,
  });

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

  const toggleHeader = () => {
    const newRows = block.rows.map((row, rowIndex) =>
      row.map((cell) => ({
        ...cell,
        header: rowIndex === 0 ? !block.hasHeader : false,
      })),
    );
    onUpdate({ ...block, rows: newRows, hasHeader: !block.hasHeader });
  };

  const setCellAlignment = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedCell) return;
    const currentRow = block.rows[selectedCell.row];
    if (!currentRow) return;
    const currentCell = currentRow[selectedCell.col];
    if (!currentCell) return;
    const newRows = [...block.rows];
    const newRow = [...currentRow];
    newRow[selectedCell.col] = {
      ...currentCell,
      alignment,
    };
    newRows[selectedCell.row] = newRow;
    onUpdate({ ...block, rows: newRows });
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
            onClick={addRow}
            className={`flex items-center gap-1 ${toolbarBtnClass()}`}
            title="Add Row"
          >
            <PlusIcon size={14} /> Row
          </button>
          <button
            onClick={addColumn}
            className={`flex items-center gap-1 ${toolbarBtnClass()}`}
            title="Add Column"
          >
            <PlusIcon size={14} /> Col
          </button>
          <div className={`w-px h-6 mx-1 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
          <button
            onClick={toggleHeader}
            className={toolbarBtnClass(block.hasHeader)}
          >
            Header
          </button>
          {selectedCell && (
            <>
              <div className={`w-px h-6 mx-1 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
              <button
                onClick={() => setCellAlignment('left')}
                className={toolbarBtnClass()}
              >
                Left
              </button>
              <button
                onClick={() => setCellAlignment('center')}
                className={toolbarBtnClass()}
              >
                Center
              </button>
              <button
                onClick={() => setCellAlignment('right')}
                className={toolbarBtnClass()}
              >
                Right
              </button>
            </>
          )}
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
                  const alignClass =
                    cell.alignment === 'center'
                      ? 'text-center'
                      : cell.alignment === 'right'
                        ? 'text-right'
                        : 'text-left';

                  return (
                    <CellTag
                      key={colIndex}
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
                      } ${alignClass}`}
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
                          onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                          onBlur={() => setSelectedCell(null)}
                          className={`w-full px-3 py-2 min-h-[40px] outline-none bg-transparent ${alignClass} ${
                            isHeader ? 'font-semibold' : ''
                          } ${isDark ? 'text-slate-200 placeholder:text-slate-500' : 'text-slate-700 placeholder:text-slate-400'} focus:ring-2 focus:ring-indigo-500 focus:ring-inset`}
                          placeholder={isHeader ? 'Header' : ''}
                        />
                      )}
                      {/* Delete column button */}
                      {!readOnly && rowIndex === 0 && showToolbar && (
                        <button
                          onClick={() => deleteColumn(colIndex)}
                          className="absolute -top-6 left-1/2 -translate-x-1/2 p-1 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Column"
                        >
                          <TrashIcon size={12} />
                        </button>
                      )}
                    </CellTag>
                  );
                })}
                {/* Delete row button */}
                {!readOnly && showToolbar && (
                  <td className="w-8 border-none bg-transparent p-0">
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      className="p-1 rounded-lg bg-red-500 text-white opacity-0 group-hover/row:opacity-100 transition-opacity"
                      title="Delete Row"
                    >
                      <TrashIcon size={12} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableBlock;
