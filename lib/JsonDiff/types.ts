import type { EditorData, EditorBlock, Theme } from '../PagesEditor/types';

export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface BlockDiff {
  type: DiffType;
  oldBlock?: EditorBlock;
  newBlock?: EditorBlock;
  changes?: PropertyChange[];
}

export interface PropertyChange {
  path: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface JsonDiffProps {
  oldData: EditorData;
  newData: EditorData;
  /** Callback when user reverts changes. Receives the updated EditorData. */
  onChange?: (data: EditorData) => void;
  theme?: Theme;
  className?: string;
  /** Initial split position as percentage (0-100). Default: 50 */
  initialSplitPosition?: number;
  /** Minimum panel width as percentage. Default: 20 */
  minPanelWidth?: number;
  /** Allow reverting individual changes. Default: true */
  allowRevert?: boolean;
}

export interface DiffResult {
  blocks: BlockDiff[];
  summary: DiffSummary;
}

export interface DiffSummary {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
}

export type ViewMode = 'split' | 'unified';
