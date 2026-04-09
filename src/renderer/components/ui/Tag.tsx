import React from 'react';
import { X } from 'lucide-react';

interface TagProps {
  children:  React.ReactNode;
  onRemove?: () => void;
  color?:    'default' | 'accent' | 'success' | 'warning' | 'danger';
  className?: string;
}

const colorStyles = {
  default: 'bg-surface-hover text-text-400 border-[var(--border-default)]',
  accent:  'bg-[var(--accent-glow)] text-accent-400 border-[var(--border-accent)]',
  success: 'bg-[var(--success-glow)] text-live-400 border-emerald-500/30',
  warning: 'bg-[var(--warning-glow)] text-warn-400 border-amber-500/30',
  danger:  'bg-red-500/15 text-danger-400 border-red-500/30',
};

export function Tag({ children, onRemove, color = 'default', className = '' }: TagProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'px-2 py-0.5 rounded-full',
        'text-2xs font-medium',
        'border',
        colorStyles[color],
        className,
      ].join(' ')}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="rounded-full hover:opacity-80 transition-opacity leading-none outline-none"
          aria-label="Remove tag"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}
