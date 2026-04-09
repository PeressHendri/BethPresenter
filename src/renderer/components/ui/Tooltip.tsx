import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const sideStyles = {
  top:    'bottom-full mb-2 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  left:   'right-full mr-2 top-1/2 -translate-y-1/2',
  right:  'left-full ml-2 top-1/2 -translate-y-1/2',
};

export function Tooltip({ content, children, side = 'top', className = '' }: TooltipProps) {
  return (
    <div className={`relative group ${className}`}>
      {children}
      <div
        className={[
          'absolute z-[var(--z-tooltip)] pointer-events-none',
          'px-2 py-1 rounded-md',
          'bg-surface-elevated border border-[var(--border-strong)]',
          'text-xs text-text-200 whitespace-nowrap',
          'shadow-card',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-100',
          sideStyles[side],
        ].join(' ')}
      >
        {content}
      </div>
    </div>
  );
}
