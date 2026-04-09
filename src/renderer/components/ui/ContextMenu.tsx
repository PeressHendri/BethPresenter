import React, { useEffect, useRef, useState, useCallback } from 'react';

interface MenuItem {
  id:       string;
  label?:    string;
  icon?:    React.ReactNode;
  shortcut?: string;
  danger?:  boolean;
  divider?: boolean;
  onClick?: () => void;
}

interface ContextMenuProps {
  items:    MenuItem[];
  children: React.ReactNode;
  /** If true, shows on left-click instead of right-click */
  onClick?: boolean;
}

export function ContextMenu({ items, children, onClick: triggerOnClick = false }: ContextMenuProps) {
  const [open, setOpen]     = useState(false);
  const [pos, setPos]       = useState({ x: 0, y: 0 });
  const menuRef             = useRef<HTMLDivElement>(null);
  const containerRef        = useRef<HTMLDivElement>(null);

  const show = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const viewportW  = window.innerWidth;
    const viewportH  = window.innerHeight;
    const menuWidth  = 192;
    const menuHeight = items.length * 36 + 16;

    const x = Math.min(e.clientX, viewportW - menuWidth - 8);
    const y = Math.min(e.clientY, viewportH - menuHeight - 8);

    setPos({ x, y });
    setOpen(true);
  }, [items.length]);

  /* Close on outside click / Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') { setOpen(false); return; }
      if (e instanceof MouseEvent && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', handler);
    };
  }, [open]);

  return (
    <>
      <div
        ref={containerRef}
        onContextMenu={!triggerOnClick ? show : undefined}
        onClick={triggerOnClick ? show : undefined}
        className="contents"
      >
        {children}
      </div>

      {open && (
        <div
          ref={menuRef}
          className="fixed z-[var(--z-popover)] min-w-[192px] py-1 rounded-xl bg-surface-elevated border border-[var(--border-strong)] shadow-modal ring-1 ring-white/[0.05] animate-fade-in"
          style={{ top: pos.y, left: pos.x }}
        >
          {items.map((item) => {
            if (item.divider) {
              return <div key={item.id} className="my-1 h-px bg-[var(--border-default)]" />;
            }
            return (
              <button
                key={item.id}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left',
                  item.danger
                    ? 'text-danger-400 hover:bg-danger/10'
                    : 'text-text-200 hover:bg-surface-hover',
                ].join(' ')}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
              >
                {item.icon && <span className="shrink-0 text-current opacity-70">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <kbd className="text-2xs text-text-600 font-mono bg-surface-active px-1 py-0.5 rounded">
                    {item.shortcut}
                  </kbd>
                )}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
