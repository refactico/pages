import type { Theme } from './types';

/**
 * Theme utilities and common styling helpers
 */

export const isDarkTheme = (theme: Theme): boolean => theme === 'dark';

/**
 * Generate toolbar button class based on active state and theme
 */
export const getToolbarButtonClass = (isActive: boolean | undefined, isDark: boolean): string => {
  const baseClass = 'p-2 rounded-lg transition-colors';

  if (isActive) {
    return `${baseClass} ${isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-900'}`;
  }

  return `${baseClass} ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`;
};

/**
 * Generate small toolbar button class (used in list items, etc.)
 */
export const getSmallToolbarButtonClass = (
  isActive: boolean | undefined,
  isDark: boolean,
): string => {
  const baseClass = 'px-2 py-1 text-sm rounded-lg transition-colors';

  if (isActive) {
    return `${baseClass} ${isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-900'}`;
  }

  return `${baseClass} ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`;
};

/**
 * Get toolbar container classes
 */
export const getToolbarContainerClass = (isDark: boolean): string => {
  return `absolute -top-12 left-0 flex items-center gap-1 p-1.5 rounded-xl shadow-lg border z-10 ${
    isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'
  }`;
};

/**
 * Get toolbar divider class
 */
export const getToolbarDividerClass = (isDark: boolean): string => {
  return `w-px h-6 mx-1 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`;
};

/**
 * Get placeholder text class
 */
export const getPlaceholderClass = (isDark: boolean): string => {
  return isDark ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400';
};

/**
 * Get muted text class
 */
export const getMutedTextClass = (isDark: boolean): string => {
  return isDark ? 'text-slate-500' : 'text-slate-400';
};

/**
 * Get primary text class
 */
export const getPrimaryTextClass = (isDark: boolean): string => {
  return isDark ? 'text-slate-200' : 'text-slate-800';
};

/**
 * Get secondary text class
 */
export const getSecondaryTextClass = (isDark: boolean): string => {
  return isDark ? 'text-slate-300' : 'text-slate-700';
};

/**
 * Callout variant styles configuration
 */
export const CALLOUT_VARIANT_STYLES = {
  info: {
    light: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      content: 'text-blue-700',
    },
    dark: {
      bg: 'bg-blue-950/40',
      border: 'border-blue-800',
      icon: 'text-blue-500',
      title: 'text-blue-300',
      content: 'text-blue-200',
    },
  },
  warning: {
    light: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-500',
      title: 'text-amber-800',
      content: 'text-amber-700',
    },
    dark: {
      bg: 'bg-amber-950/40',
      border: 'border-amber-800',
      icon: 'text-amber-500',
      title: 'text-amber-300',
      content: 'text-amber-200',
    },
  },
  success: {
    light: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: 'text-emerald-500',
      title: 'text-emerald-800',
      content: 'text-emerald-700',
    },
    dark: {
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-800',
      icon: 'text-emerald-500',
      title: 'text-emerald-300',
      content: 'text-emerald-200',
    },
  },
  error: {
    light: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      content: 'text-red-700',
    },
    dark: {
      bg: 'bg-red-950/40',
      border: 'border-red-800',
      icon: 'text-red-500',
      title: 'text-red-300',
      content: 'text-red-200',
    },
  },
  tip: {
    light: {
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      icon: 'text-violet-500',
      title: 'text-violet-800',
      content: 'text-violet-700',
    },
    dark: {
      bg: 'bg-violet-950/40',
      border: 'border-violet-800',
      icon: 'text-violet-500',
      title: 'text-violet-300',
      content: 'text-violet-200',
    },
  },
} as const;

export const CALLOUT_ICONS = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅',
  error: '❌',
  tip: '💡',
} as const;

export const CALLOUT_LABELS = {
  info: 'Info',
  warning: 'Warning',
  success: 'Success',
  error: 'Error',
  tip: 'Tip',
} as const;

/**
 * Font size mapping for text blocks
 */
export const FONT_SIZE_CLASSES = {
  sm: 'text-sm leading-relaxed',
  base: 'text-base leading-relaxed',
  lg: 'text-lg leading-relaxed',
  xl: 'text-xl leading-relaxed',
} as const;

/**
 * Text alignment mapping
 */
export const ALIGNMENT_CLASSES = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
} as const;

/**
 * Quote style mapping
 */
export const QUOTE_STYLE_CLASSES = {
  default: (isDark: boolean) =>
    `border-l-4 pl-4 italic ${isDark ? 'border-slate-600' : 'border-slate-300'}`,
  bordered: (isDark: boolean) =>
    `border-l-4 pl-4 py-3 rounded-r ${isDark ? 'border-indigo-500 bg-indigo-950/30' : 'border-indigo-500 bg-indigo-50'}`,
  modern: (isDark: boolean) =>
    `relative pl-10 before:content-['"'] before:absolute before:left-0 before:top-0 before:text-5xl before:leading-none ${isDark ? 'before:text-slate-600' : 'before:text-slate-300'}`,
} as const;

/**
 * Divider style mapping
 */
export const DIVIDER_STYLE_CLASSES = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
} as const;
