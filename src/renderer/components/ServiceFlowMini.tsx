import React from 'react';

export function ServiceFlowMini({ items, activeId }: { items: any[], activeId: number }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#08090C]/50 border-t border-white/5">
      <div className="px-4 py-2 bg-black/20 flex items-center gap-2">
        <span className="text-[9px] font-black text-[var(--text-600)] uppercase tracking-widest">Service Flow</span>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`
              px-3 py-1.5 rounded flex items-center gap-3 transition-all
              ${item.id === activeId 
                ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' 
                : 'text-[var(--text-600)] opacity-60'}
            `}
          >
            <div className={`w-1 h-1 rounded-full ${item.id === activeId ? 'bg-[var(--accent-blue)]' : 'bg-transparent'}`} />
            <span className="text-[10px] font-bold uppercase truncate">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
