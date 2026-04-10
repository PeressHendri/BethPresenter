import React from 'react';
import { Search, Plus, ListFilter } from 'lucide-react';

export function SongSearchBar() {
  return (
    <div className="flex flex-col gap-4 p-4 bg-[var(--surface-primary)] border-b border-[var(--border-default)]">
      {/* Search Core */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-400)] group-focus-within:text-[var(--accent-green)] transition-colors" />
          <input 
            type="text" 
            placeholder="Search songs, authors, tags..."
            className="w-full h-11 bg-[var(--surface-elevated)] bg-opacity-50 border border-[var(--border-default)] rounded-md pl-12 pr-4 text-sm text-white placeholder:text-[var(--text-600)] focus:outline-none focus:border-[var(--accent-green)] transition-all"
          />
        </div>
        <button className="w-11 h-11 flex items-center justify-center bg-[var(--accent-green)] text-black rounded-md hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-[var(--success-glow)]">
          <Plus size={24} />
        </button>
      </div>

      {/* Sorting / Meta */}
      <div className="flex items-center justify-between px-1">
        <button className="flex items-center gap-2 text-[var(--text-400)] hover:text-white transition-colors">
          <ListFilter size={14} className="rotate-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Recent First</span>
        </button>
      </div>
    </div>
  );
}
