import React, { useState, useRef, useEffect } from 'react';
import type { CodeBlock as CodeBlockType, Theme } from '../types';
import { SUPPORTED_LANGUAGES } from '../types';
import { CopyIcon, CheckIcon } from '../icons';

interface CodeBlockProps {
  block: CodeBlockType;
  onUpdate: (block: CodeBlockType) => void;
  readOnly?: boolean;
  theme?: Theme;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  block,
  onUpdate,
  readOnly,
  theme = 'light',
}) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDark = theme === 'dark';

  // Auto-resize textarea to fit content
  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Resize on mount and whenever code changes
  useEffect(() => {
    if (!readOnly) {
      resizeTextarea();
    }
  }, [block.code, readOnly]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...block, code: e.target.value });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ ...block, language: e.target.value });
  };

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...block, filename: e.target.value });
  };

  const toggleLineNumbers = () => {
    onUpdate({ ...block, showLineNumbers: !block.showLineNumbers });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const lines = block.code.split('\n');
  const lineNumbers = lines.map((_, i) => i + 1);

  return (
    <div
      className={`group relative rounded-xl overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-900'}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-800 border-slate-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          {!readOnly ? (
            <input
              type="text"
              value={block.filename || ''}
              onChange={handleFilenameChange}
              placeholder="filename.js"
              className="text-sm text-slate-400 bg-transparent outline-none placeholder:text-slate-600 w-32"
            />
          ) : block.filename ? (
            <span className="text-sm text-slate-400">{block.filename}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <select
                value={block.language}
                onChange={handleLanguageChange}
                className="text-xs px-2 py-1.5 bg-slate-700 text-slate-300 rounded-lg border border-slate-600 outline-none"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option
                    key={lang}
                    value={lang}
                  >
                    {lang}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleLineNumbers}
                className={`text-xs px-2 py-1.5 rounded-lg transition-colors ${
                  block.showLineNumbers
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                #
              </button>
            </>
          )}
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Copy code"
          >
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          </button>
        </div>
      </div>

      {/* Code area */}
      <div className="relative flex">
        {block.showLineNumbers && (
          <div className="flex-shrink-0 py-4 pl-4 pr-3 text-right select-none border-r border-slate-800">
            {lineNumbers.map((num) => (
              <div
                key={num}
                className="text-xs text-slate-600 leading-6 font-mono"
              >
                {num}
              </div>
            ))}
          </div>
        )}
        <div className="flex-1 p-4">
          {readOnly ? (
            <pre className="text-sm text-slate-100 font-mono leading-6 whitespace-pre overflow-x-auto">
              <code>{block.code}</code>
            </pre>
          ) : (
            <textarea
              ref={textareaRef}
              value={block.code}
              onChange={handleCodeChange}
              placeholder="// Write your code here..."
              spellCheck={false}
              className="w-full min-h-[100px] text-sm text-slate-100 font-mono leading-6 bg-transparent outline-none resize-none placeholder:text-slate-600 overflow-hidden"
              style={{ tabSize: 2, height: 'auto' }}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const start = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  const newValue =
                    block.code.substring(0, start) + '  ' + block.code.substring(end);
                  onUpdate({ ...block, code: newValue });
                  // Set cursor position after tab
                  setTimeout(() => {
                    if (textareaRef.current) {
                      textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
                        start + 2;
                    }
                  }, 0);
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Language badge */}
      <div className="absolute bottom-2 right-2">
        <span className="text-xs text-slate-500 uppercase font-medium">{block.language}</span>
      </div>
    </div>
  );
};

export default CodeBlock;
