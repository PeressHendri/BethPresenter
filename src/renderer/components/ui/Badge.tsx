import React from 'react';

type BadgeVariant = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?:     boolean;
  pulse?:   boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  accent:  'bg-[var(--accent-glow)]  text-accent-400 border border-[var(--border-accent)]',
  success: 'bg-[var(--success-glow)] text-live-400   border border-emerald-500/40',
  warning: 'bg-[var(--warning-glow)] text-warn-400   border border-amber-500/40',
  danger:  'bg-red-500/15            text-danger-400  border border-red-500/40',
  info:    'bg-blue-500/15           text-info-400    border border-blue-500/40',
  neutral: 'bg-surface-hover text-text-400 border border-[var(--border-default)]',
};

const dotColors: Record<BadgeVariant, string> = {
  accent:  'bg-accent-400',
  success: 'bg-live-400',
  warning: 'bg-warn-400',
  danger:  'bg-danger-400',
  info:    'bg-info-400',
  neutral: 'bg-text-400',
};

export function Badge({
  variant = 'neutral',
  children,
  dot = false,
  pulse = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'px-2 py-0.5',
        'rounded-full',
        'text-2xs font-semibold uppercase tracking-widest',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          className={[
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColors[variant],
            pulse ? 'animate-live-pulse' : '',
          ].join(' ')}
        />
      )}
      {children}
    </span>
  );
}
