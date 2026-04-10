import React from 'react';
import { Type, MoreVertical, Plus } from 'lucide-react';

export function ThemeListSidebar({ themes, activeId, onSelect }: { themes: any[], activeId: string, onSelect: (id: string) => void }) {
  return (
    <div className="w-64 bg-[var(--surface-primary)] border-r border-[var(--border-default)] flex flex-col shrink-0">
      <div className="p-8 pb-4">
        <h2 className="text-xl font-black text-[var(--text-100)] uppercase tracking-tighter">Themes & Templates</h2>
        <p className="text-[10px] text-[var(--text-400)] uppercase tracking-[0.2em] mt-1 text-pretty">Manage your slide styles.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {themes.map((theme) => (
          <div 
            key={theme.id}
            onClick={() => onSelect(theme.id)}
            className={`
              group p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-3
              ${theme.id === activeId 
                ? 'bg-[#00E676]/5 border-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.1)]' 
                : 'bg-[var(--surface-elevated)] border-transparent hover:border-[var(--border-default)] hover:bg-[var(--surface-hover)]'}
            `}
          >
            <div className="aspect-video w-full bg-black rounded-lg border border-white/5 flex items-center justify-center relative overflow-hidden">
               <div 
                 className="absolute inset-0 opacity-40" 
                 style={{ 
                   background: theme.background.type === 'gradient' 
                     ? `linear-gradient(to bottom right, ${theme.background.value}, ${theme.background.gradientEnd})` 
                     : theme.background.value 
                 }} 
               />
               <Type size={16} className="text-white relative z-10 opacity-60" />
            </div>
            <div className="flex items-center justify-between px-1">
               <span className={`text-[10px] font-bold ${theme.id === activeId ? 'text-[var(--text-100)]' : 'text-[var(--text-400)]'}`}>{theme.name}</span>
               <MoreVertical size={14} className="text-[var(--border-default)] group-hover:text-[var(--text-400)]" />
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-[var(--surface-primary)] border-t border-[var(--border-default)]">
         <button className="w-full h-12 bg-[var(--surface-elevated)] border border-[#00E676]/30 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#00E676] hover:bg-[#00E676] hover:text-black transition-all">
            <Plus size={16} />
            New Theme
         </button>
      </div>
    </div>
  );
}
