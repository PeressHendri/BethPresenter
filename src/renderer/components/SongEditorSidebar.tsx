import React from 'react';
import { GripVertical, Copy, Trash2, Plus } from 'lucide-react';

export function SectionListPanel({ sections, activeId, onSelect }: { sections: any[], activeId: string, onSelect: (id: string) => void }) {
  return (
    <div className="w-64 bg-[var(--surface-primary)] border-r border-[var(--border-default)] flex flex-col shrink-0">
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-400)]">Song Sections</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {sections.map((section) => (
          <div 
            key={section.id}
            onClick={() => onSelect(section.id)}
            className={`
              group flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-all border
              ${section.id === activeId 
                ? 'bg-[var(--accent-blue)]/20 border-[var(--accent-blue)]' 
                : 'bg-transparent border-transparent hover:bg-white/5'}
            `}
          >
            <div className="flex items-center gap-3 truncate">
               <GripVertical size={14} className="text-[var(--text-600)] shrink-0" />
               <span className={`text-[11px] font-bold truncate ${section.id === activeId ? 'text-white' : 'text-[var(--text-400)] group-hover:text-white'}`}>
                 {section.label}
               </span>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="p-1 hover:text-white transition-colors text-[var(--text-600)]"><Copy size={12}/></button>
               <button className="p-1 hover:text-red-500 transition-colors text-[var(--text-600)]"><Trash2 size={12}/></button>
            </div>
          </div>
        ))}

        <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-dashed border-white/10 rounded-md text-[9px] font-black uppercase tracking-widest text-[var(--text-600)] hover:border-[var(--accent-green)] hover:text-[var(--accent-green)] transition-all">
          <Plus size={14} />
          Add Section
        </button>
      </div>
    </div>
  );
}
