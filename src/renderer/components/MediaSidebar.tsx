import React from 'react';
import { 
  Clock, 
  Grid, 
  Image as ImageIcon, 
  Video, 
  Layers, 
  ChevronRight, 
  Folder 
} from 'lucide-react';

export function MediaSidebar() {
  const folders: { name: string, icon: any, active?: boolean, sub?: string[] }[] = [
    { name: 'Recent', icon: Clock },
    { name: 'All Media', icon: Grid, active: true },
    { name: 'Images', icon: ImageIcon },
    { name: 'Videos', icon: Video },
    { name: 'Backgrounds', icon: Layers, sub: ['Motion', 'Static'] },
    { name: 'Imported', icon: Folder },
  ];

  return (
    <div className="w-64 bg-[var(--surface-primary)] border-r border-[var(--border-default)] flex flex-col shrink-0">
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-400)]">Folders</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {folders.map((f) => (
          <div key={f.name} className="flex flex-col">
            <div className={`
              group flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-all
              ${f.active ? 'bg-[var(--surface-elevated)] border border-white/10' : 'hover:bg-white/5'}
            `}>
              <div className="flex items-center gap-3">
                <f.icon size={16} className={f.active ? 'text-[var(--accent-green)]' : 'text-[var(--text-400)]'} />
                <span className={`text-[11px] font-bold ${f.active ? 'text-white' : 'text-[var(--text-400)] group-hover:text-white'}`}>
                  {f.name}
                </span>
              </div>
              {f.sub && <ChevronRight size={14} className="text-[var(--text-600)]" />}
            </div>

            {f.sub && f.active && (
              <div className="ml-9 mt-1 space-y-1 border-l border-white/5 pl-3">
                {f.sub.map(s => (
                  <div key={s} className="py-1.5 text-[10px] font-bold text-[var(--text-600)] hover:text-[var(--accent-green)] cursor-pointer tracking-wide transition-colors">
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
