import type { EditorBlock, EditorData } from './types';

export const generateId = (): string => {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createEmptyEditorData = (): EditorData => ({
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  blocks: [],
});

export const createTextBlock = (content: string = ''): EditorBlock => ({
  type: 'text',
  id: generateId(),
  content,
  fontSize: 'base',
  alignment: 'left',
});

export const createHeadingBlock = (level: 1 | 2 | 3 | 4 | 5 | 6 = 2, content: string = ''): EditorBlock => ({
  type: 'heading',
  id: generateId(),
  content,
  level,
  alignment: 'left',
});

export const createImageBlock = (src: string = '', alt: string = ''): EditorBlock => ({
  type: 'image',
  id: generateId(),
  src,
  alt,
  caption: '',
  alignment: 'center',
});

export const createCodeBlock = (code: string = '', language: string = 'javascript'): EditorBlock => ({
  type: 'code',
  id: generateId(),
  code,
  language,
  showLineNumbers: true,
});

export const createTableBlock = (rows: number = 3, cols: number = 3): EditorBlock => ({
  type: 'table',
  id: generateId(),
  rows: Array(rows).fill(null).map((_, rowIndex) =>
    Array(cols).fill(null).map(() => ({
      content: '',
      header: rowIndex === 0,
    }))
  ),
  hasHeader: true,
});

export const createDividerBlock = (): EditorBlock => ({
  type: 'divider',
  id: generateId(),
  style: 'solid',
});

export const createQuoteBlock = (content: string = ''): EditorBlock => ({
  type: 'quote',
  id: generateId(),
  content,
  style: 'default',
});

export const createListBlock = (listType: 'bullet' | 'numbered' | 'checklist' = 'bullet'): EditorBlock => ({
  type: 'list',
  id: generateId(),
  items: [''],
  listType,
  checkedItems: listType === 'checklist' ? [false] : undefined,
});

export const createCalloutBlock = (variant: 'info' | 'warning' | 'success' | 'error' | 'tip' = 'info'): EditorBlock => ({
  type: 'callout',
  id: generateId(),
  content: '',
  variant,
});

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const validateEditorData = (data: unknown): data is EditorData => {
  if (!data || typeof data !== 'object') return false;
  const d = data as EditorData;
  return (
    typeof d.version === 'string' &&
    typeof d.createdAt === 'string' &&
    typeof d.updatedAt === 'string' &&
    Array.isArray(d.blocks)
  );
};

export const cloneBlock = (block: EditorBlock): EditorBlock => {
  return {
    ...JSON.parse(JSON.stringify(block)),
    id: generateId(),
  };
};

export const moveArrayItem = <T>(arr: T[], fromIndex: number, toIndex: number): T[] => {
  const newArr = [...arr];
  const [item] = newArr.splice(fromIndex, 1);
  if (item !== undefined) {
    newArr.splice(toIndex, 0, item);
  }
  return newArr;
};
