import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PagesEditor } from './PagesEditor';
import type {
  EditorData,
  TextBlock as TextBlockType,
  HeadingBlock as HeadingBlockType,
} from './types';
import {
  createEmptyEditorData,
  createTextBlock,
  createHeadingBlock,
  validateEditorData,
  generateId,
  cloneBlock,
  moveArrayItem,
} from './utils';

describe('PagesEditor', () => {
  it('renders empty state when no initial data', () => {
    render(<PagesEditor />);
    expect(screen.getByText('Start creating your content...')).toBeInTheDocument();
    expect(screen.getByText('Add First Block')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(<PagesEditor placeholder="Custom placeholder text" />);
    expect(screen.getByText('Custom placeholder text')).toBeInTheDocument();
  });

  it('renders blocks from initial data', () => {
    const initialData: EditorData = {
      version: '1.0.0',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      blocks: [
        {
          type: 'heading',
          id: 'heading-1',
          content: 'Test Heading',
          level: 1,
          alignment: 'left',
        },
      ],
    };

    render(<PagesEditor initialData={initialData} />);
    expect(screen.getByDisplayValue('Test Heading')).toBeInTheDocument();
  });

  it('hides controls in read-only mode', () => {
    const initialData: EditorData = {
      version: '1.0.0',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      blocks: [
        {
          type: 'text',
          id: 'text-1',
          content: 'Read only text',
          fontSize: 'base',
        },
      ],
    };

    render(
      <PagesEditor
        initialData={initialData}
        readOnly
      />,
    );
    expect(screen.queryByText('Add First Block')).not.toBeInTheDocument();
    expect(screen.queryByText('Add Block')).not.toBeInTheDocument();
  });

  it('calls onChange when content is modified (with debounce)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onChange = vi.fn();
    const initialData: EditorData = {
      version: '1.0.0',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      blocks: [
        {
          type: 'text',
          id: 'text-1',
          content: 'Initial text',
          fontSize: 'base',
        },
      ],
    };

    render(
      <PagesEditor
        initialData={initialData}
        onChange={onChange}
        debounceDelay={100}
      />,
    );

    const textarea = screen.getByDisplayValue('Initial text');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Updated text');

    // Wait for debounce
    await vi.advanceTimersByTimeAsync(200);

    expect(onChange).toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('Utils', () => {
  describe('createEmptyEditorData', () => {
    it('creates valid empty editor data', () => {
      const data = createEmptyEditorData();
      expect(data.version).toBe('1.0.0');
      expect(data.blocks).toEqual([]);
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
    });
  });

  describe('createTextBlock', () => {
    it('creates a text block with default values', () => {
      const block = createTextBlock() as TextBlockType;
      expect(block.type).toBe('text');
      expect(block.content).toBe('');
      expect(block.fontSize).toBe('base');
      expect(block.id).toBeDefined();
    });

    it('creates a text block with custom content', () => {
      const block = createTextBlock('Custom content') as TextBlockType;
      expect(block.content).toBe('Custom content');
    });
  });

  describe('createHeadingBlock', () => {
    it('creates a heading block with default level', () => {
      const block = createHeadingBlock() as HeadingBlockType;
      expect(block.type).toBe('heading');
      expect(block.level).toBe(2);
    });

    it('creates a heading block with custom level', () => {
      const block = createHeadingBlock(1, 'Title') as HeadingBlockType;
      expect(block.level).toBe(1);
      expect(block.content).toBe('Title');
    });
  });

  describe('validateEditorData', () => {
    it('validates correct editor data', () => {
      const data = createEmptyEditorData();
      expect(validateEditorData(data)).toBe(true);
    });

    it('rejects invalid data', () => {
      expect(validateEditorData(null)).toBe(false);
      expect(validateEditorData({})).toBe(false);
      expect(validateEditorData({ version: '1.0.0' })).toBe(false);
    });
  });

  describe('generateId', () => {
    it('generates unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      // New format uses UUID: block_<uuid>
      expect(id1).toMatch(/^block_[a-f0-9-]+$/);
    });
  });

  describe('cloneBlock', () => {
    it('creates a deep copy with new id', () => {
      const original = createTextBlock('Test') as TextBlockType;
      const cloned = cloneBlock(original) as TextBlockType;

      expect(cloned.id).not.toBe(original.id);
      expect(cloned.content).toBe(original.content);
      expect(cloned.type).toBe(original.type);
    });
  });

  describe('moveArrayItem', () => {
    it('moves item forward in array', () => {
      const arr = ['a', 'b', 'c', 'd'];
      const result = moveArrayItem(arr, 0, 2);
      expect(result).toEqual(['b', 'c', 'a', 'd']);
    });

    it('moves item backward in array', () => {
      const arr = ['a', 'b', 'c', 'd'];
      const result = moveArrayItem(arr, 3, 1);
      expect(result).toEqual(['a', 'd', 'b', 'c']);
    });

    it('does not mutate original array', () => {
      const arr = ['a', 'b', 'c'];
      moveArrayItem(arr, 0, 2);
      expect(arr).toEqual(['a', 'b', 'c']);
    });
  });
});
