import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'flat';
  padding?:  boolean;
  children:  React.ReactNode;
}

const variantClasses = {
  default:  'bg-surface-elevated border border-[var(--border-default)] shadow-sm',
  glass:    'glass shadow-md',
  elevated: 'bg-surface-elevated border border-[var(--border-strong)] shadow-card',
  flat:     'bg-surface-elevated',
};

export function Card({
  variant = 'default',
  padding = false,
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'rounded-xl',
        'ring-1 ring-white/[0.04]',
        variantClasses[variant],
        padding ? 'p-4' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
