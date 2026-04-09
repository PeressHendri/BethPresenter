import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  title?:    string;
  children:  React.ReactNode;
  footer?:   React.ReactNode;
  size?:     'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
}

const sizeMap = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[90vw] h-[90vh]',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closable = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, closable, onClose]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-modal flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current && closable) onClose();
      }}
    >
      <div
        className={[
          'relative flex flex-col w-full',
          'bg-surface-elevated',
          'border border-[var(--border-strong)]',
          'rounded-2xl shadow-modal',
          'ring-1 ring-white/[0.06]',
          'animate-slide-up',
          sizeMap[size],
          size === 'full' ? '' : 'max-h-[90vh]',
        ].join(' ')}
      >
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] shrink-0">
            {title && (
              <h2 className="text-base font-semibold text-text-100">
                {title}
              </h2>
            )}
            {closable && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                onClick={onClose}
                className="ml-auto shrink-0"
                aria-label="Close"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--border-default)] flex justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
