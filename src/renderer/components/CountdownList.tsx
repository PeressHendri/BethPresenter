import React from 'react';
import { Clock } from 'lucide-react';

export function CountdownList({ 
  items, 
  activeId, 
  onSelect 
}: { 
  items: any[], 
  activeId: string, 
  onSelect: (id: string) => void 
}) {
  return (
    <div className="w-64 bg-[var(--surface-primary)] border-r border-[var(--border-default)] flex flex-col shrink-0">
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-400)]">Templates</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {items.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onSelect(item.id)}
            className={`
              group flex flex-col p-3 rounded-md cursor-pointer transition-all border
              ${item.id === activeId 
                ? 'bg-[var(--accent-green)]/10 border-[var(--accent-green)] shadow-[0_0_15px_rgba(0,224,145,0.1)]' 
                : 'bg-[var(--surface-elevated)] bg-opacity-30 border-transparent hover:bg-white/5 hover:border-white/10'}
            `}
          >
            <div className="flex items-center gap-2 mb-1">
               <Clock size={12} className={item.id === activeId ? 'text-[var(--accent-green)]' : 'text-[var(--text-600)]'} />
               <h4 className={`text-[11px] font-bold tracking-tight truncate ${item.id === activeId ? 'text-white' : 'text-[var(--text-200)]'}`}>
                 {item.title}
               </h4>
            </div>
            <span className={`text-[10px] font-black tracking-widest ${item.id === activeId ? 'text-[var(--accent-green)]' : 'text-[var(--text-600)]'}`}>
               {Math.floor(item.duration / 60)}:00
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
