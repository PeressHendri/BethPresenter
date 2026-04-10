import React from 'react';
import { Search, Columns, Rows, Plus, Settings } from 'lucide-react';

export function ScriptureSearchBar({ 
  translation, 
  onTranslationChange 
}: { 
  translation: string, 
  onTranslationChange: (t: string) => void 
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-[var(--surface-primary)] border-b border-[var(--border-default)] shrink-0">
      {/* 1. Translation Dropdown */}
      <div className="relative group min-w-[180px]">
        <select 
          value={translation}
          onChange={(e) => onTranslationChange(e.target.value)}
          className="w-full h-10 bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded px-3 text-xs font-bold text-white uppercase tracking-wider appearance-none focus:border-[var(--accent-green)] transition-all cursor-pointer"
        >
          <option value="KJV">King James Version</option>
          <option value="ASV">American Standard Version</option>
          <option value="ADB">Ang Dating Biblia</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--accent-green)]">
           <Settings size={14} />
        </div>
      </div>

      {/* 2. Jump To Search */}
      <div className="flex-1 relative group">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-400)] group-focus-within:text-[var(--accent-green)] transition-all" />
        <input 
          type="text" 
          placeholder="Jump to... (e.g. John 3:16)"
          className="w-full h-10 bg-[var(--surface-base)] border border-[var(--border-default)] rounded pl-11 pr-4 text-xs text-white placeholder:text-[var(--text-600)] font-medium focus:outline-none focus:border-[var(--accent-green)] transition-all"
        />
      </div>

      {/* 3. View & Action Buttons */}
      <div className="flex items-center gap-2">
        <div className="flex bg-[var(--surface-elevated)] p-1 rounded border border-[var(--border-default)]">
           <button className="p-1.5 text-[var(--accent-green)] bg-white/5 rounded">
             <Columns size={16} />
           </button>
           <button className="p-1.5 text-[var(--text-600)] hover:text-white">
             <Rows size={16} />
           </button>
        </div>
        <button className="flex items-center gap-2 bg-[var(--accent-green)] text-black px-4 h-10 rounded font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-[var(--success-glow)]">
          <Plus size={16} strokeWidth={3} />
          Add to Service
        </button>
      </div>
    </div>
  );
}
