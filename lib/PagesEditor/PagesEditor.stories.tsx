import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PagesEditor } from './PagesEditor';
import type { EditorData } from './types';

const meta: Meta<typeof PagesEditor> = {
  title: 'Components/PagesEditor',
  component: PagesEditor,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    readOnly: {
      control: 'boolean',
      description: 'Whether the editor is in read-only mode',
    },
    theme: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Color theme for the editor',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when editor is empty',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PagesEditor>;

// Basic empty editor
export const Empty: Story = {
  args: {
    placeholder: 'Start creating your content...',
  },
};

// Editor with onChange handler
export const WithChangeHandler: Story = {
  render: () => {
    const [data, setData] = useState<EditorData | undefined>(undefined);
    return (
      <div className="p-4">
        <PagesEditor
          onChange={(newData) => {
            setData(newData);
            console.log('Editor data changed:', newData);
          }}
        />
        {data && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium mb-2">Current Data:</p>
            <pre className="text-xs overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  },
};

// Pre-populated editor (edit mode)
const sampleData: EditorData = {
  version: '1.0.0',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  blocks: [
    {
      type: 'heading',
      id: 'heading-1',
      content: 'Welcome to Pages Editor',
      level: 1,
      alignment: 'left',
    },
    {
      type: 'text',
      id: 'text-1',
      content: 'This is a Medium-like block editor for creating beautiful course content. You can add various types of blocks including text, images, code, tables, and more.',
      fontSize: 'base',
      alignment: 'left',
    },
    {
      type: 'callout',
      id: 'callout-1',
      content: 'This editor returns structured JSON that you can store in your database and render later.',
      variant: 'tip',
      title: 'Pro Tip',
    },
    {
      type: 'heading',
      id: 'heading-2',
      content: 'Features',
      level: 2,
      alignment: 'left',
    },
    {
      type: 'list',
      id: 'list-1',
      items: [
        'Drag and drop to reorder blocks',
        'Multiple block types supported',
        'Mobile-friendly design',
        'JSON import/export',
        'Customizable block settings',
      ],
      listType: 'bullet',
    },
    {
      type: 'code',
      id: 'code-1',
      code: `// Example: Using the editor data
const editorData = await getEditorContent();

// Store in database
await db.courses.update({
  content: JSON.stringify(editorData)
});

// Later, render the content
<PagesEditor
  initialData={storedData}
  readOnly={true}
/>`,
      language: 'typescript',
      showLineNumbers: true,
      filename: 'example.ts',
    },
    {
      type: 'divider',
      id: 'divider-1',
      style: 'solid',
    },
    {
      type: 'quote',
      id: 'quote-1',
      content: 'The best way to predict the future is to create it.',
      author: 'Peter Drucker',
      style: 'bordered',
    },
    {
      type: 'table',
      id: 'table-1',
      rows: [
        [
          { content: 'Block Type', header: true },
          { content: 'Description', header: true },
          { content: 'Use Case', header: true },
        ],
        [
          { content: 'Text' },
          { content: 'Plain text paragraph' },
          { content: 'General content' },
        ],
        [
          { content: 'Code' },
          { content: 'Syntax highlighted code' },
          { content: 'Technical tutorials' },
        ],
        [
          { content: 'Image' },
          { content: 'Base64 encoded images' },
          { content: 'Visual content' },
        ],
      ],
      hasHeader: true,
    },
  ],
};

export const EditMode: Story = {
  args: {
    initialData: sampleData,
    onChange: (data) => {
      console.log('Changed:', data);
    },
  },
};

// Read-only mode
export const ReadOnly: Story = {
  args: {
    initialData: sampleData,
    readOnly: true,
  },
};

// Mobile preview
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    initialData: sampleData,
  },
};

// Course content example
const courseContentData: EditorData = {
  version: '1.0.0',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  blocks: [
    {
      type: 'heading',
      id: 'course-heading',
      content: 'Introduction to React Hooks',
      level: 1,
      alignment: 'center',
    },
    {
      type: 'callout',
      id: 'course-callout',
      content: 'Make sure you have Node.js 16+ and basic React knowledge before starting this lesson.',
      variant: 'info',
      title: 'Prerequisites',
    },
    {
      type: 'heading',
      id: 'section-1',
      content: 'What are React Hooks?',
      level: 2,
      alignment: 'left',
    },
    {
      type: 'text',
      id: 'text-intro',
      content: 'React Hooks are functions that let you "hook into" React state and lifecycle features from function components. Hooks don\'t work inside classes — they let you use React without classes.',
      fontSize: 'base',
      alignment: 'left',
    },
    {
      type: 'heading',
      id: 'section-2',
      content: 'The useState Hook',
      level: 3,
      alignment: 'left',
    },
    {
      type: 'code',
      id: 'code-usestate',
      code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`,
      language: 'typescript',
      showLineNumbers: true,
      filename: 'Counter.tsx',
    },
    {
      type: 'list',
      id: 'key-points',
      items: [
        'useState returns a pair: current state value and a function to update it',
        'You can call useState multiple times in a single component',
        'The initial state is only used during the first render',
      ],
      listType: 'numbered',
    },
    {
      type: 'callout',
      id: 'warning-callout',
      content: 'Don\'t call Hooks inside loops, conditions, or nested functions. Always use Hooks at the top level of your React function.',
      variant: 'warning',
      title: 'Important Rule',
    },
    {
      type: 'divider',
      id: 'divider',
      style: 'dashed',
    },
    {
      type: 'heading',
      id: 'exercise',
      content: 'Practice Exercise',
      level: 2,
      alignment: 'left',
    },
    {
      type: 'list',
      id: 'exercise-checklist',
      items: [
        'Create a new React component called "TodoList"',
        'Use useState to manage an array of todos',
        'Add functionality to add and remove todos',
        'Style your component with CSS',
      ],
      listType: 'checklist',
      checkedItems: [false, false, false, false],
    },
  ],
};

export const CourseContent: Story = {
  args: {
    initialData: courseContentData,
    onChange: (data) => {
      console.log('Course content changed:', data);
    },
  },
};

// Live Preview - Editor on left, Preview on right
export const LivePreview: Story = {
  render: () => {
    const [data, setData] = useState<EditorData>(sampleData);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const isDark = theme === 'dark';
    
    return (
      <div className={`min-h-screen transition-colors ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        {/* Header */}
        <div className={`sticky top-0 z-50 px-4 py-3 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between max-w-[1800px] mx-auto">
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Pages Editor - Live Preview
            </h1>
            <button
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'bg-slate-700 text-white hover:bg-slate-600' 
                  : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
              }`}
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
        
        {/* Split View */}
        <div className="flex min-h-[calc(100vh-57px)]">
          {/* Editor Panel */}
          <div className={`w-1/2 p-6 border-r overflow-auto ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
            <div className={`mb-4 pb-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <h2 className={`text-sm font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                ✏️ Editor
              </h2>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-200'}`}>
              <PagesEditor
                initialData={data}
                onChange={setData}
                theme={theme}
              />
            </div>
          </div>
          
          {/* Preview Panel */}
          <div className={`w-1/2 p-6 overflow-auto ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
            <div className={`mb-4 pb-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <h2 className={`text-sm font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                👁️ Preview (Read-Only)
              </h2>
            </div>
            <PagesEditor
              initialData={data}
              readOnly={true}
              theme={theme}
            />
          </div>
        </div>
      </div>
    );
  },
};

// Dark Theme
export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <div className="bg-slate-900 min-h-screen p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    initialData: sampleData,
    theme: 'dark',
  },
};

// Light Theme (default)
export const LightTheme: Story = {
  decorators: [
    (Story) => (
      <div className="bg-white min-h-screen p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    initialData: sampleData,
    theme: 'light',
  },
};
