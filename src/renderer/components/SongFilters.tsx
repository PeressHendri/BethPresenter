import React from 'react';

const FILTERS = [
  { id: 'all', label: 'All', count: null },
  { id: 'solemn', label: 'Solemn', count: 9 },
  { id: 'joyful', label: 'Joyful', count: 0 },
];

export function SongFilters() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface-primary)] border-b border-[var(--border-subtle)] shrink-0 overflow-x-auto no-scrollbar">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          className={`
            px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2
            ${f.id === 'all' 
              ? 'bg-[var(--accent-green)] text-black' 
              : 'bg-[var(--surface-elevated)] text-[var(--text-400)] hover:text-white border border-[var(--border-default)]'}
          `}
        >
          {f.label}
          {f.count !== null && (
            <span className={`opacity-60 text-[8px] font-black`}>{f.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
