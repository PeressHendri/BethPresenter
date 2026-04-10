import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon' | 'accent' | 'glass';
type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  iconOnly?: boolean;
  active?:   boolean;
  children:  React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-[var(--accent-500)] hover:bg-[var(--accent-400)] active:bg-[var(--accent-600)] text-white shadow-[0_4px_12px_rgba(0,210,210,0.25)] hover:shadow-[0_8px_20px_rgba(0,210,210,0.4)]',
  secondary: 'bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-base)] text-[var(--text-100)] border border-[var(--border-default)] hover:border-[var(--border-strong)] shadow-sm',
  danger:    'bg-[var(--danger)] hover:bg-red-400 active:bg-red-600 text-white shadow-[0_4px_12px_rgba(239,68,68,0.25)]',
  ghost:     'hover:bg-[var(--surface-hover)] text-[var(--text-400)] hover:text-[var(--text-100)] active:scale-95',
  icon:      'hover:bg-[var(--surface-hover)] text-[var(--text-400)] hover:text-[var(--text-100)] rounded-xl active:scale-90',
  accent:    'bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-teal)] text-white font-bold hover:brightness-110 active:scale-95 shadow-lg shadow-[var(--accent-blue)]/20',
  glass:     'bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 active:bg-white/15 text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded',
  sm: 'px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg',
  md: 'px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl',
  lg: 'px-7 py-3.5 text-sm font-bold uppercase tracking-widest rounded-2xl',
  xl: 'px-10 py-5 text-base font-black uppercase tracking-[0.15em] rounded-3xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconOnly = false,
  active = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = [
    'inline-flex items-center justify-center gap-2',
    'transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)',
    'select-none outline-none border-none whitespace-nowrap',
    'active:scale-[0.94] active:brightness-90',
    active ? 'ring-2 ring-[var(--accent-500)] ring-offset-2 ring-offset-[var(--surface-base)]' : '',
    iconOnly ? 'aspect-square p-0 w-10 h-10 rounded-xl' : sizeClasses[size],
    variantClasses[variant],
    (disabled || loading) ? 'opacity-30 pointer-events-none grayscale' : 'cursor-pointer',
    className,
  ].join(' ');

  return (
    <button className={base} disabled={disabled || loading} {...props}>
      {loading ? (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      <span className="relative flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
