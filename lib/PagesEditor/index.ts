export { PagesEditor } from './PagesEditor';
export type {
  BlockType,
  TextStyle,
  TextBlock,
  HeadingBlock,
  ImageBlock,
  CodeBlock,
  TableCell,
  TableBlock,
  DividerBlock,
  QuoteBlock,
  ListBlock,
  CalloutBlock,
  EditorBlock,
  EditorData,
  PagesEditorProps,
  SupportedLanguage,
  Theme,
} from './types';
export { SUPPORTED_LANGUAGES } from './types';
export {
  generateId,
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
  fileToBase64,
  validateEditorData,
  cloneBlock,
  moveArrayItem,
} from './utils';

// Hooks
export { useBlockToolbar, useAutoResize, useClickOutside } from './hooks';

// Theme utilities
export {
  isDarkTheme,
  getToolbarButtonClass,
  getSmallToolbarButtonClass,
  getToolbarContainerClass,
  getToolbarDividerClass,
  getPlaceholderClass,
  getMutedTextClass,
  getPrimaryTextClass,
  getSecondaryTextClass,
  CALLOUT_VARIANT_STYLES,
  CALLOUT_ICONS,
  CALLOUT_LABELS,
  FONT_SIZE_CLASSES,
  ALIGNMENT_CLASSES,
  QUOTE_STYLE_CLASSES,
  DIVIDER_STYLE_CLASSES,
} from './theme';
