# @refactico/pages

A Medium-style block editor for React applications. Build rich content editors with support for text, headings, images, code blocks, tables, lists, quotes, callouts, and more.

[![Storybook](https://img.shields.io/badge/Storybook-Live%20Demo-ff4785?logo=storybook&logoColor=white)](https://refactico.github.io/pages/)
[![npm](https://img.shields.io/npm/v/@refactico/pages)](https://www.npmjs.com/package/@refactico/pages)

## Demo

**[View Live Storybook →](https://refactico.github.io/pages/)**

## Installation

```bash
npm install @refactico/pages
# or
pnpm add @refactico/pages
```

## Tailwind CSS Setup (Required)

This library uses Tailwind CSS utility classes and requires Tailwind CSS v4+ as a peer dependency. Your application must have Tailwind configured and include the library's source files for class scanning.

### 1. Install Tailwind CSS

If you haven't already, install Tailwind CSS in your project:

```bash
npm install tailwindcss @tailwindcss/vite
# or
pnpm add tailwindcss @tailwindcss/vite
```

### 2. Configure Content Sources

Add the `@source` directive to your CSS file to include the library's classes in your Tailwind build:

```css
/* your-app/src/index.css */
@import "tailwindcss";

/* Include Tailwind classes from @refactico/pages components */
@source "../node_modules/@refactico/pages/dist";
```

This tells Tailwind to scan the `@refactico/pages` distribution files for class names, ensuring all styles are included in your bundle.

## Usage

```tsx
import { PagesEditor, createEmptyEditorData } from '@refactico/pages';

function App() {
  const [data, setData] = useState(createEmptyEditorData());

  return (
    <PagesEditor
      initialData={data}
      onChange={setData}
      theme="light"
    />
  );
}
```

## Features

- **9 Block Types**: Text, Heading (H1-H6), Image, Code, Table, Divider, Quote, List, Callout
- **Rich Formatting**: Bold, italic, underline, strikethrough, inline code, links
- **Drag & Drop**: Reorder blocks with intuitive drag handles
- **Dark Mode**: Full light/dark theme support
- **Keyboard Shortcuts**: Markdown-style shortcuts (e.g., `# ` for headings, `- ` for lists)
- **Smart Toolbars**: Context-aware toolbars that flip position when near viewport edges
- **Accessible**: ARIA labels and keyboard navigation support
- **TypeScript**: Fully typed API

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS
- Vite

## Development

1. Clone this repository
2. Install dependencies: `pnpm install`
3. Start Storybook: `pnpm dev`

## Scripts

- `dev`: Starts the local Storybook server, use this to develop and preview your components.
- `test`: Runs all your tests with vitest.
- `test:watch`: Runs tests in watch mode.
- `build`: Builds your Storybook as a static web application.
- `build:lib`: Builds your component library with Vite.
- `lint`: Runs ESLint.
- `format`: Formats your code with Prettier.

## API

### PagesEditor Props

| Prop          | Type                         | Default              | Description                   |
| ------------- | ---------------------------- | -------------------- | ----------------------------- |
| `initialData` | `EditorData`                 | -                    | Initial editor content        |
| `onChange`    | `(data: EditorData) => void` | -                    | Callback when content changes |
| `readOnly`    | `boolean`                    | `false`              | Disable editing               |
| `theme`       | `'light' \| 'dark'`          | `'light'`            | Color theme                   |
| `placeholder` | `string`                     | `'Start writing...'` | Empty state placeholder       |

### Utility Functions

```tsx
import {
  createEmptyEditorData,
  createTextBlock,
  createHeadingBlock,
  validateEditorData,
  generateId,
} from '@refactico/pages';
```

## License

MIT
