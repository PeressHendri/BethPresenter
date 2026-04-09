

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?:   string;
  label?:       string;
}

export function Separator({ orientation = 'horizontal', className = '', label }: SeparatorProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={['w-px self-stretch bg-[var(--border-default)]', className].join(' ')}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    return (
      <div className={['flex items-center gap-3', className].join(' ')} role="separator">
        <div className="flex-1 h-px bg-[var(--border-default)]" />
        <span className="text-2xs font-semibold uppercase tracking-widest text-text-600">{label}</span>
        <div className="flex-1 h-px bg-[var(--border-default)]" />
      </div>
    );
  }

  return (
    <div
      className={['h-px bg-[var(--border-default)]', className].join(' ')}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
