import React from 'react';
import { Music, Video, User, Play, ChevronRight } from 'lucide-react';

export function SidebarServiceOrder() {
  const items = [
    { id: 1, type: 'STANDBY', title: 'STANDBY', slides: 0, icon: <Video size={14} className="text-green-500"/> },
    { id: 2, type: 'SONG', title: 'HERE AGAIN', slides: 35, icon: <Music size={14} className="text-blue-400"/>, active: true },
    { id: 3, type: 'SONG', title: 'BELIEVE FOR IT ..', slides: 38, icon: <Music size={14} className="text-blue-400"/> },
    { id: 4, type: 'SONG', title: 'WAY MAKER', slides: 20, icon: <Music size={14} className="text-blue-400"/> },
    { id: 5, type: 'SONG', title: 'From the Inside ..', slides: 5, icon: <Music size={14} className="text-blue-400"/> },
    { id: 6, type: 'SONG', title: 'KING OF GLORY', slides: 24, icon: <Music size={14} className="text-blue-400"/> },
  ];

  return (
    <div className="w-64 bg-[var(--surface-primary)] border-r border-[var(--border-default)] flex flex-col select-none">
      <div className="p-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <h3 className="text-[var(--text-400)] text-[10px] font-bold uppercase tracking-widest">Service Order</h3>
        <span className="bg-[var(--accent-green)] text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">6</span>
      </div>
      
      <div className="flex-1 overflow-y-auto pt-2">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`
              group flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all border-l-2
              ${item.active 
                ? 'bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]' 
                : 'border-transparent hover:bg-white/5'}
            `}
          >
            <span className="text-[10px] text-[var(--text-600)] font-bold w-3">{item.id}</span>
            <div className={`p-1 rounded bg-[var(--surface-elevated)] group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className={`text-[11px] font-bold truncate ${item.active ? 'text-white' : 'text-[var(--text-200)]'}`}>
                {item.title}
              </span>
              <span className="text-[9px] text-[var(--text-600)] uppercase font-semibold">
                {item.slides > 0 ? `${item.slides} slides` : 'Ready'}
              </span>
            </div>
            {item.active && <ChevronRight size={14} className="text-[var(--accent-blue)]" />}
          </div>
        ))}
      </div>
    </div>
  );
}
