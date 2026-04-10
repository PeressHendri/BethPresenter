import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function PaginationBar({ current, total }: { current: string, total: string }) {
  return (
    <div className="h-16 bg-[var(--surface-primary)] border-t border-[var(--border-default)] flex items-center justify-center gap-14 shrink-0 px-8">
      {/* Left Arrow */}
      <button className="w-10 h-10 bg-[var(--accent-green)] text-black rounded-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-[var(--success-glow)]">
        <ChevronLeft size={24} strokeWidth={3} />
      </button>
      
      {/* Counter and Keys */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-sm font-black text-white tracking-widest">{current} / {total}</div>
        <div className="flex items-center gap-6 text-[9px] font-black text-[var(--text-600)] uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <kbd className="bg-white/5 border border-white/10 px-1 py-0.5 rounded text-[8px]">← →</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px]">B</kbd>
            <span>Blank</span>
          </div>
        </div>
      </div>

      {/* Right Arrow */}
      <button className="w-10 h-10 bg-[var(--accent-green)] text-black rounded-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-[var(--success-glow)]">
        <ChevronRight size={24} strokeWidth={3} />
      </button>
    </div>
  );
}
