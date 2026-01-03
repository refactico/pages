import React from 'react';
import type { EditorBlock, Theme } from '../PagesEditor/types';
import {
  TextBlock,
  HeadingBlock,
  ImageBlock,
  CodeBlock,
  TableBlock,
  DividerBlock,
  QuoteBlock,
  ListBlock,
  CalloutBlock,
} from '../PagesEditor/blocks';

interface BlockRendererProps {
  block: EditorBlock;
  theme: Theme;
}

/**
 * Renders an EditorBlock in read-only mode for diff visualization
 */
export function BlockRenderer({ block, theme }: BlockRendererProps) {
  const noop = () => {};

  switch (block.type) {
    case 'text':
      return <TextBlock block={block} onUpdate={noop} readOnly theme={theme} />;
    case 'heading':
      return <HeadingBlock block={block} onUpdate={noop} readOnly theme={theme} />;
    case 'image':
      return <ImageBlock block={block} onUpdate={noop} readOnly theme={theme} />;
    case 'code':
      return <CodeBlock block={block} onUpdate={noop} readOnly theme={theme} />;
    case 'table':
      return <TableBlock block={block} onUpdate={noop} readOnly theme={theme} />;
    case 'divider':
      return <DividerBlock block={block} onUpdate={noop} readOnly theme={theme} />;
    case 'quote':
      return <QuoteBlock block={block} onUpdate={noop} readOnly theme={theme} />;
    case 'list':
      return <ListBlock block={block} onUpdate={noop} readOnly theme={theme} />;
    case 'callout':
      return <CalloutBlock block={block} onUpdate={noop} readOnly theme={theme} />;
    default:
      return null;
  }
}

export default BlockRenderer;
