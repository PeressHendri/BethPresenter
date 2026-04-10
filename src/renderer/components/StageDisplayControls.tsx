import React from 'react';
import { 
  Monitor, 
  ChevronDown, 
  Plus, 
  Type, 
  Layers, 
  Music, 
  Clock, 
  FileText 
} from 'lucide-react';

const icons: Record<string, any> = {
  'text': Type,
  'layers': Layers,
  'music': Music,
  'clock': Clock,
  'file-text': FileText,
};

export function LayoutTemplateList({ templates, selectedId }: { templates: any[], selectedId: string }) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
      {templates.map((t) => {
        const IconComp = icons[t.icon] || Type;
        return (
          <div 
            key={t.id}
            className={`
              min-w-[140px] p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center gap-2
              ${t.id === selectedId 
                ? 'bg-[var(--accent-green)]/10 border-[var(--accent-green)] shadow-[0_0_15px_rgba(0,224,145,0.15)]' 
                : 'bg-[var(--surface-elevated)] border-transparent hover:border-white/10 hover:bg-white/5'}
            `}
          >
            <div className={`p-2 rounded-md ${t.id === selectedId ? 'bg-[var(--accent-green)] text-black' : 'bg-black/40 text-[var(--accent-green)]'}`}>
              <IconComp size={20} />
            </div>
            <span className={`text-[9px] font-black uppercase text-center leading-tight tracking-widest ${t.id === selectedId ? 'text-white' : 'text-[var(--text-600)]'}`}>
              {t.name}
            </span>
          </div>
        );
      })}
      
      <button className="min-w-[140px] h-full flex items-center justify-center border-2 border-dashed border-[var(--text-600)]/30 rounded-lg hover:border-[var(--accent-green)] transition-all group">
         <div className="flex flex-col items-center gap-1 text-[var(--text-600)] group-hover:text-[var(--accent-green)]">
           <Plus size={20} />
           <span className="text-[9px] font-black uppercase">New Layout</span>
         </div>
      </button>
    </div>
  );
}

export function DisplaySelector({ options, selected }: { options: string[], selected: string }) {
  return (
    <div className="flex items-center gap-2 bg-[var(--surface-primary)] border border-white/5 rounded px-3 py-1.5 cursor-pointer hover:bg-[var(--surface-elevated)] transition-all shrink-0">
      <Monitor size={14} className="text-[var(--accent-green)]" />
      <span className="text-[10px] font-bold text-white uppercase tracking-widest">{selected}</span>
      <ChevronDown size={14} className="text-[var(--text-600)] ml-2" />
    </div>
  );
}
