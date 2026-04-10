import React from 'react';

export function BookChapterNavigator({ book, chapter }: { book: string, chapter: string }) {
  const chapters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  return (
    <div className="flex flex-col bg-[var(--surface-primary)] border-b border-[var(--border-subtle)] shrink-0">
      <div className="px-4 py-2 flex items-center justify-between border-b border-white/5">
        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">{book} → Chapter {chapter}</h2>
      </div>
      
      <div className="flex items-center gap-2 p-2 px-3 overflow-x-auto no-scrollbar">
        {chapters.map((n) => (
          <button
            key={n}
            className={`
              min-w-[40px] h-9 rounded flex items-center justify-center text-xs font-black transition-all border
              ${n.toString() === chapter 
                ? 'bg-[var(--accent-green)] text-black border-[var(--accent-green)]' 
                : 'bg-[var(--surface-elevated)] text-[var(--text-400)] border-[var(--border-default)] hover:text-white hover:border-white/20'}
            `}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function VerseList({ verses, selectedIds, onSelect }: { 
  verses: any[], 
  selectedIds: number[], 
  onSelect: (id: number) => void 
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
      {verses.map((v) => (
        <div 
          key={v.v}
          onClick={() => onSelect(v.v)}
          className={`
            group flex gap-5 p-5 rounded-lg border-2 cursor-pointer transition-all duration-300 relative overflow-hidden
            ${selectedIds.includes(v.v)
              ? 'bg-[var(--accent-green)] bg-opacity-10 border-[var(--accent-green)] shadow-[0_0_20px_rgba(0,224,145,0.15)]' 
              : 'bg-[var(--surface-elevated)] bg-opacity-30 border-transparent hover:border-white/10 hover:bg-white/5'}
          `}
        >
          {/* Verse Number Enclave */}
          <div className={`
             w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black transition-all
             ${selectedIds.includes(v.v) ? 'bg-[var(--accent-green)] text-black' : 'bg-black/40 text-[var(--accent-green)]'}
          `}>
            {v.v}
          </div>

          {/* Verse Text */}
          <p className={`
            text-sm leading-relaxed tracking-tight
            ${selectedIds.includes(v.v) ? 'text-white font-bold' : 'text-[var(--text-200)]'}
          `}>
            {v.text}
          </p>

          {/* Selection Indicator Shine */}
          {selectedIds.includes(v.v) && (
            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[var(--accent-green)] m-1 rounded-full animate-pulse" />
          )}
        </div>
      ))}
      <div className="h-20" />
    </div>
  );
}
