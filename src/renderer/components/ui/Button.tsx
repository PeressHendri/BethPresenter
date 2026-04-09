import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  iconOnly?: boolean;
  children:  React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white shadow-sm',
  secondary: 'bg-surface-elevated hover:bg-surface-hover text-text-200 border border-[var(--border-default)] hover:border-[var(--border-strong)]',
  danger:    'bg-danger hover:bg-danger-400 active:bg-danger-600 text-white shadow-sm',
  ghost:     'hover:bg-surface-hover text-text-400 hover:text-text-200',
  icon:      'hover:bg-surface-hover text-text-400 hover:text-text-200 rounded-lg',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-2xs rounded',
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-base rounded-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconOnly = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-medium leading-none',
    'transition-all duration-150 ease-smooth',
    'active:scale-[0.97]',
    'focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-primary',
    'select-none outline-none',
    iconOnly ? 'aspect-square p-0 w-8 h-8 rounded-lg' : sizeClasses[size],
    variantClasses[variant],
    (disabled || loading) ? 'opacity-50 pointer-events-none' : 'cursor-pointer',
    className,
  ].join(' ');

  return (
    <button className={base} disabled={disabled || loading} {...props}>
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
