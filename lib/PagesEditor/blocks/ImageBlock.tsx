import React, { useState, useRef } from 'react';
import type { ImageBlock as ImageBlockType, Theme } from '../types';
import { UploadIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, TrashIcon } from '../icons';
import { fileToBase64 } from '../utils';
import { useToolbarPosition } from '../hooks/useToolbarPosition';

interface ImageBlockProps {
  block: ImageBlockType;
  onUpdate: (block: ImageBlockType) => void;
  readOnly?: boolean;
  theme?: Theme;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  onUpdate,
  readOnly,
  theme = 'light',
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // Smart toolbar positioning
  const { showBelow } = useToolbarPosition({
    containerRef,
    isVisible: showToolbar && !readOnly && !!block.src,
    minSpaceAbove: 60,
  });

  const handleFileChange = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      try {
        const base64 = await fileToBase64(file);
        onUpdate({ ...block, src: base64, alt: file.name });
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const setAlignment = (alignment: 'left' | 'center' | 'right') => {
    onUpdate({ ...block, alignment });
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...block, caption: e.target.value });
  };

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...block, alt: e.target.value });
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value) || undefined;
    onUpdate({ ...block, width });
  };

  const clearImage = () => {
    onUpdate({ ...block, src: '', alt: '', caption: '' });
  };

  const toolbarBtnClass = (isActive?: boolean) =>
    `p-2 rounded-lg transition-colors ${
      isActive
        ? isDark
          ? 'bg-slate-600 text-white'
          : 'bg-slate-200 text-slate-900'
        : isDark
          ? 'hover:bg-slate-700 text-slate-300'
          : 'hover:bg-slate-100 text-slate-600'
    }`;

  if (!block.src) {
    return (
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${
          isDragging
            ? isDark
              ? 'border-indigo-500 bg-indigo-950/30'
              : 'border-indigo-500 bg-indigo-50'
            : isDark
              ? 'border-slate-700 hover:border-slate-500'
              : 'border-slate-300 hover:border-slate-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center text-center">
          <UploadIcon
            className={`w-12 h-12 mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
          />
          <p className={`mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Drag and drop an image here, or
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            disabled={readOnly}
          >
            Browse Files
          </button>
          <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="group relative"
      onFocus={() => setShowToolbar(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setShowToolbar(false);
        }
      }}
    >
      {/* Toolbar - positions above or below based on available space */}
      {showToolbar && !readOnly && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 rounded-xl shadow-lg border z-10 ${
            showBelow ? 'top-full mt-2' : '-top-12'
          } ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}
        >
          <button
            onClick={() => setAlignment('left')}
            className={toolbarBtnClass(block.alignment === 'left')}
            title="Align Left"
          >
            <AlignLeftIcon size={16} />
          </button>
          <button
            onClick={() => setAlignment('center')}
            className={toolbarBtnClass(block.alignment === 'center')}
            title="Align Center"
          >
            <AlignCenterIcon size={16} />
          </button>
          <button
            onClick={() => setAlignment('right')}
            className={toolbarBtnClass(block.alignment === 'right')}
            title="Align Right"
          >
            <AlignRightIcon size={16} />
          </button>
          <div className={`w-px h-6 mx-1 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
          <input
            type="number"
            value={block.width || ''}
            onChange={handleWidthChange}
            placeholder="Width"
            className={`w-20 px-2 py-1.5 text-sm rounded-lg border ${
              isDark
                ? 'bg-slate-700 border-slate-600 text-slate-200'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          />
          <div className={`w-px h-6 mx-1 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
          <button
            onClick={clearImage}
            className={`p-2 rounded-lg hover:text-red-500 ${isDark ? 'hover:bg-red-950/30 text-slate-400' : 'hover:bg-red-50 text-slate-400'}`}
            title="Remove Image"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      )}

      <figure
        className="flex flex-col items-center w-full"
        style={{ maxWidth: '100%' }}
      >
        <img
          src={block.src}
          alt={block.alt || ''}
          className="max-w-full h-auto rounded-xl shadow-sm"
          style={{ maxWidth: block.width ? `${block.width}px` : '100%' }}
        />
        {!readOnly ? (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              value={block.caption || ''}
              onChange={handleCaptionChange}
              placeholder="Add a caption..."
              className={`w-full text-center text-sm bg-transparent outline-none ${
                isDark
                  ? 'text-slate-400 placeholder:text-slate-500'
                  : 'text-slate-600 placeholder:text-slate-400'
              }`}
            />
            <input
              type="text"
              value={block.alt || ''}
              onChange={handleAltChange}
              placeholder="Alt text for accessibility..."
              className={`w-full text-center text-xs bg-transparent outline-none ${
                isDark
                  ? 'text-slate-500 placeholder:text-slate-600'
                  : 'text-slate-500 placeholder:text-slate-400'
              }`}
            />
          </div>
        ) : block.caption ? (
          <figcaption
            className={`mt-3 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
          >
            {block.caption}
          </figcaption>
        ) : null}
      </figure>
    </div>
  );
};

export default ImageBlock;
