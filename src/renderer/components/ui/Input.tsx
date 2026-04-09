import React, { forwardRef } from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  label?:    string;
  error?:    string;
  hint?:     string;
  prefix?:   React.ReactNode;
  suffix?:   React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm:  'py-1.5 px-3 text-xs',
  md:  'py-2   px-3 text-sm',
  lg:  'py-2.5 px-4 text-base',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    prefix,
    suffix,
    inputSize = 'md',
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  
  const base = [
    'w-full appearance-none outline-none',
    'bg-surface-input border rounded-lg',
    'text-text-200 placeholder:text-text-600',
    'transition-all duration-150 ease-smooth',
    'focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500',
    error
      ? 'border-danger/60 focus:border-danger focus:ring-danger/30'
      : 'border-[var(--border-default)] hover:border-[var(--border-strong)]',
    prefix ? 'pl-9' : '',
    suffix ? 'pr-9' : '',
    sizeMap[inputSize],
    className,
  ].join(' ');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-text-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-text-600 pointer-events-none">
            {prefix}
          </span>
        )}
        <input ref={ref} id={inputId} className={base} {...props} />
        {suffix && (
          <span className="absolute right-3 text-text-600 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error  && <p className="text-xs text-danger-400">{error}</p>}
      {!error && hint && <p className="text-xs text-text-600">{hint}</p>}
    </div>
  );
});
