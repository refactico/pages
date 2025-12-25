// Types for the Pages Editor component

export type BlockType =
  | 'text'
  | 'heading'
  | 'image'
  | 'code'
  | 'table'
  | 'divider'
  | 'quote'
  | 'list'
  | 'callout';

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  color?: string;
  backgroundColor?: string;
  link?: string;
}

export interface TextBlock {
  type: 'text';
  id: string;
  content: string;
  style?: TextStyle;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
}

export interface HeadingBlock {
  type: 'heading';
  id: string;
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  alignment?: 'left' | 'center' | 'right';
}

export interface ImageBlock {
  type: 'image';
  id: string;
  src: string; // base64 or URL
  alt?: string;
  caption?: string;
  width?: number;
  alignment?: 'left' | 'center' | 'right';
}

export interface CodeBlock {
  type: 'code';
  id: string;
  code: string;
  language: string;
  showLineNumbers?: boolean;
  filename?: string;
}

export interface TableCell {
  content: string;
  header?: boolean;
  alignment?: 'left' | 'center' | 'right';
}

export interface TableBlock {
  type: 'table';
  id: string;
  rows: TableCell[][];
  hasHeader?: boolean;
}

export interface DividerBlock {
  type: 'divider';
  id: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface QuoteBlock {
  type: 'quote';
  id: string;
  content: string;
  author?: string;
  style?: 'default' | 'bordered' | 'modern';
}

export interface ListBlock {
  type: 'list';
  id: string;
  items: string[];
  listType: 'bullet' | 'numbered' | 'checklist';
  checkedItems?: boolean[];
}

export interface CalloutBlock {
  type: 'callout';
  id: string;
  content: string;
  variant: 'info' | 'warning' | 'success' | 'error' | 'tip';
  title?: string;
}

export type EditorBlock =
  | TextBlock
  | HeadingBlock
  | ImageBlock
  | CodeBlock
  | TableBlock
  | DividerBlock
  | QuoteBlock
  | ListBlock
  | CalloutBlock;

export interface EditorData {
  version: string;
  createdAt: string;
  updatedAt: string;
  blocks: EditorBlock[];
}

export type Theme = 'light' | 'dark';

export interface PagesEditorProps {
  initialData?: EditorData;
  onChange?: (data: EditorData) => void;
  /** Debounce delay in ms for onChange callback. Default: 300ms */
  debounceDelay?: number;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  theme?: Theme;
}

export interface BlockSettingsProps {
  block: EditorBlock;
  onUpdate: (block: EditorBlock) => void;
  onClose: () => void;
}

export interface AddBlockMenuProps {
  onAdd: (type: BlockType) => void;
  onClose: () => void;
}

export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'csharp',
  'cpp',
  'c',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'scala',
  'html',
  'css',
  'scss',
  'json',
  'yaml',
  'xml',
  'markdown',
  'sql',
  'bash',
  'shell',
  'powershell',
  'dockerfile',
  'plaintext',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
