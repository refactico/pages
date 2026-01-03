import type { EditorData, EditorBlock } from '../PagesEditor/types';
import type { BlockDiff, DiffResult, PropertyChange, DiffSummary } from './types';

/**
 * Deep compare two values and return if they are equal
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object') return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (Array.isArray(a) || Array.isArray(b)) return false;

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);

  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
}

/**
 * Get property changes between two blocks
 */
export function getPropertyChanges(
  oldBlock: EditorBlock,
  newBlock: EditorBlock
): PropertyChange[] {
  const changes: PropertyChange[] = [];
  const oldObj = oldBlock as unknown as Record<string, unknown>;
  const newObj = newBlock as unknown as Record<string, unknown>;
  const allKeys = new Set([
    ...Object.keys(oldObj),
    ...Object.keys(newObj),
  ]);

  for (const key of allKeys) {
    if (key === 'id') continue; // Skip ID comparison
    
    const oldValue = oldObj[key];
    const newValue = newObj[key];

    if (!deepEqual(oldValue, newValue)) {
      changes.push({ path: key, oldValue, newValue });
    }
  }

  return changes;
}

/**
 * Compare two EditorData objects and return diff result
 */
export function compareEditorData(
  oldData: EditorData,
  newData: EditorData
): DiffResult {
  const oldBlocks = oldData.blocks;
  const newBlocks = newData.blocks;
  const blockDiffs: BlockDiff[] = [];

  // Create maps for quick lookup by ID
  const oldBlockMap = new Map(oldBlocks.map((b) => [b.id, b]));
  const newBlockMap = new Map(newBlocks.map((b) => [b.id, b]));

  // Track processed IDs
  const processedIds = new Set<string>();

  // Process blocks in order of new data to maintain structure
  for (const newBlock of newBlocks) {
    const oldBlock = oldBlockMap.get(newBlock.id);
    processedIds.add(newBlock.id);

    if (!oldBlock) {
      // Block was added
      blockDiffs.push({ type: 'added', newBlock });
    } else {
      // Block exists in both - check for modifications
      const changes = getPropertyChanges(oldBlock, newBlock);
      if (changes.length > 0) {
        blockDiffs.push({ type: 'modified', oldBlock, newBlock, changes });
      } else {
        blockDiffs.push({ type: 'unchanged', oldBlock, newBlock });
      }
    }
  }

  // Find removed blocks (in old but not in new)
  for (const oldBlock of oldBlocks) {
    if (!processedIds.has(oldBlock.id)) {
      blockDiffs.push({ type: 'removed', oldBlock });
    }
  }

  // Calculate summary
  const summary: DiffSummary = {
    added: blockDiffs.filter((d) => d.type === 'added').length,
    removed: blockDiffs.filter((d) => d.type === 'removed').length,
    modified: blockDiffs.filter((d) => d.type === 'modified').length,
    unchanged: blockDiffs.filter((d) => d.type === 'unchanged').length,
  };

  return { blocks: blockDiffs, summary };
}

/**
 * Format a value for display
 */
export function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

/**
 * Get a human-readable label for a block type
 */
export function getBlockTypeLabel(block: EditorBlock): string {
  const labels: Record<string, string> = {
    text: 'Text',
    heading: 'Heading',
    image: 'Image',
    code: 'Code',
    table: 'Table',
    divider: 'Divider',
    quote: 'Quote',
    list: 'List',
    callout: 'Callout',
  };
  return labels[block.type] || block.type;
}

/**
 * Get a preview of block content
 */
export function getBlockPreview(block: EditorBlock, maxLength = 50): string {
  switch (block.type) {
    case 'text':
    case 'heading':
    case 'quote':
    case 'callout':
      const content = block.content || '';
      return content.length > maxLength
        ? content.substring(0, maxLength) + '...'
        : content;
    case 'code':
      return block.language || 'code';
    case 'image':
      return block.alt || 'Image';
    case 'list':
      return `${block.items.length} items`;
    case 'table':
      return `${block.rows.length} rows`;
    case 'divider':
      return block.style || 'solid';
    default:
      return '';
  }
}
