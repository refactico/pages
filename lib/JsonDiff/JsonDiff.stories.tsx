import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { JsonDiff } from './JsonDiff';
import type { EditorData } from '../PagesEditor/types';

const meta: Meta<typeof JsonDiff> = {
  title: 'Components/JsonDiff',
  component: JsonDiff,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Color theme',
    },
    initialSplitPosition: {
      control: { type: 'range', min: 20, max: 80, step: 5 },
      description: 'Initial split position percentage',
    },
    allowRevert: {
      control: 'boolean',
      description: 'Allow reverting individual changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof JsonDiff>;

// Sample old data
const oldData: EditorData = {
  version: '1.0.0',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  blocks: [
    {
      type: 'heading',
      id: 'heading-1',
      content: 'Introduction to React',
      level: 1,
      alignment: 'left',
    },
    {
      type: 'text',
      id: 'text-1',
      content: 'React is a JavaScript library for building user interfaces.',
      fontSize: 'base',
      alignment: 'left',
    },
    {
      type: 'callout',
      id: 'callout-1',
      content: 'Make sure you have Node.js installed before starting.',
      variant: 'info',
      title: 'Prerequisites',
    },
    {
      type: 'code',
      id: 'code-1',
      code: 'const App = () => <div>Hello</div>;',
      language: 'javascript',
      showLineNumbers: true,
    },
    {
      type: 'list',
      id: 'list-1',
      items: ['Components', 'Props', 'State'],
      listType: 'bullet',
    },
  ],
};

// Sample new data with changes
const newData: EditorData = {
  version: '1.0.0',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  blocks: [
    {
      type: 'heading',
      id: 'heading-1',
      content: 'Introduction to React Hooks',
      level: 1,
      alignment: 'center',
    },
    {
      type: 'text',
      id: 'text-1',
      content:
        'React is a powerful JavaScript library for building modern user interfaces with hooks.',
      fontSize: 'lg',
      alignment: 'left',
    },
    {
      type: 'code',
      id: 'code-1',
      code: `const App = () => {
  const [count, setCount] = useState(0);
  return <div>Count: {count}</div>;
};`,
      language: 'typescript',
      showLineNumbers: true,
      filename: 'App.tsx',
    },
    {
      type: 'list',
      id: 'list-1',
      items: ['Components', 'Props', 'State', 'Hooks', 'Context'],
      listType: 'numbered',
    },
    {
      type: 'quote',
      id: 'quote-1',
      content: 'Hooks let you use state and other React features without writing a class.',
      author: 'React Documentation',
      style: 'bordered',
    },
  ],
};

// Basic comparison
export const Default: Story = {
  args: {
    oldData,
    newData,
  },
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
};

// Interactive with onChange - shows how revert works
export const WithRevertFunctionality: Story = {
  render: () => {
    const [currentData, setCurrentData] = useState<EditorData>(newData);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const isDark = theme === 'dark';

    return (
      <div className={`h-screen flex flex-col ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${
            isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div>
            <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Review Changes Before Publishing
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Click "Revert" on any change to undo it
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
              }`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setCurrentData(newData)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              Reset All
            </button>
            <button
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              onClick={() => {
                console.log('Publishing:', currentData);
                alert('Published! Check console for data.');
              }}
            >
              Publish
            </button>
          </div>
        </div>
        <div className="flex-1">
          <JsonDiff
            oldData={oldData}
            newData={currentData}
            onChange={(data) => {
              console.log('Data changed:', data);
              setCurrentData(data);
            }}
            theme={theme}
          />
        </div>
      </div>
    );
  },
};

// Read-only mode (no revert buttons)
export const ReadOnlyMode: Story = {
  args: {
    oldData,
    newData,
    allowRevert: false,
  },
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
};

// No changes
export const NoChanges: Story = {
  args: {
    oldData,
    newData: oldData,
  },
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
};

// Only additions
const dataWithAdditions: EditorData = {
  ...oldData,
  blocks: [
    ...oldData.blocks,
    {
      type: 'divider',
      id: 'divider-new',
      style: 'dashed',
    },
    {
      type: 'callout',
      id: 'callout-new',
      content: 'This is a new section added to the document.',
      variant: 'success',
      title: 'New Content',
    },
  ],
};

export const OnlyAdditions: Story = {
  args: {
    oldData,
    newData: dataWithAdditions,
  },
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
};

// Only removals
const dataWithRemovals: EditorData = {
  ...oldData,
  blocks: oldData.blocks.slice(0, 2),
};

export const OnlyRemovals: Story = {
  args: {
    oldData,
    newData: dataWithRemovals,
  },
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
};

// Dark theme
export const DarkTheme: Story = {
  args: {
    oldData,
    newData,
    theme: 'dark',
  },
  decorators: [
    (Story) => (
      <div className="h-screen bg-slate-900">
        <Story />
      </div>
    ),
  ],
};

// Mobile view (unified)
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    oldData,
    newData,
  },
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
};

// Course content example
const courseOldData: EditorData = {
  version: '1.0.0',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  blocks: [
    { type: 'heading', id: 'h1', content: 'Chapter 1: Getting Started', level: 1 },
    {
      type: 'text',
      id: 't1',
      content: 'Welcome to this comprehensive guide on building web applications.',
      fontSize: 'base',
    },
    { type: 'heading', id: 'h2', content: 'Installation', level: 2 },
    { type: 'code', id: 'c1', code: 'npm install my-package', language: 'bash', showLineNumbers: false },
    {
      type: 'callout',
      id: 'call1',
      content: 'Make sure you have Node.js version 14 or higher installed.',
      variant: 'warning',
      title: 'Requirements',
    },
    {
      type: 'list',
      id: 'l1',
      items: ['Step 1: Clone the repository', 'Step 2: Install dependencies', 'Step 3: Run the app'],
      listType: 'numbered',
    },
  ],
};

const courseNewData: EditorData = {
  ...courseOldData,
  updatedAt: '2024-01-15T00:00:00.000Z',
  blocks: [
    { type: 'heading', id: 'h1', content: 'Chapter 1: Quick Start Guide', level: 1 },
    {
      type: 'callout',
      id: 'new-callout',
      content: 'This guide has been updated for version 2.0!',
      variant: 'info',
      title: 'Updated',
    },
    {
      type: 'text',
      id: 't1',
      content: 'Welcome to this comprehensive guide on building modern web applications with React.',
      fontSize: 'lg',
    },
    { type: 'heading', id: 'h2', content: 'Installation', level: 2 },
    {
      type: 'code',
      id: 'c1',
      code: 'npm install my-package@latest',
      language: 'bash',
      showLineNumbers: true,
      filename: 'terminal',
    },
    {
      type: 'list',
      id: 'l1',
      items: [
        'Step 1: Clone the repository',
        'Step 2: Install dependencies',
        'Step 3: Configure environment',
        'Step 4: Run the app',
      ],
      listType: 'numbered',
    },
    { type: 'divider', id: 'div1', style: 'dashed' },
    { type: 'quote', id: 'q1', content: 'The best way to learn is by doing.', author: 'Unknown', style: 'modern' },
  ],
};

export const CourseContentReview: Story = {
  args: {
    oldData: courseOldData,
    newData: courseNewData,
  },
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
};
