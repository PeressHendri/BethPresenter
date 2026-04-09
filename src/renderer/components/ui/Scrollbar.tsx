import React from 'react';

interface ScrollbarProps {
  children:  React.ReactNode;
  className?: string;
  /** thin = 4px, default = 6px */
  thin?:  boolean;
}

export function Scrollbar({ children, className = '', thin = false }: ScrollbarProps) {
  return (
    <div
      className={['overflow-y-auto', className].join(' ')}
      style={{
        scrollbarWidth: thin ? 'thin' : 'auto',
        scrollbarColor: 'rgba(255,255,255,0.12) transparent',
      }}
    >
      {children}
    </div>
  );
}
