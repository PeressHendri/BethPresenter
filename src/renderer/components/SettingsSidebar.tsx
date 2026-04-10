import React from 'react';
import { 
  Settings, 
  Monitor, 
  Layout, 
  Music, 
  Book, 
  Film, 
  Clock, 
  Keyboard, 
  User 
} from 'lucide-react';

const icons: Record<string, any> = {
  settings: Settings,
  monitor: Monitor,
  layout: Layout,
  music: Music,
  book: Book,
  film: Film,
  clock: Clock,
  keyboard: Keyboard,
  user: User,
};

export function SettingsSidebar({ categories, activeId, onSelect }: { categories: any[], activeId: string, onSelect: (id: string) => void }) {
  return (
    <div className="w-64 bg-[var(--surface-primary)] border-r border-[var(--border-default)] flex flex-col shrink-0">
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-400)]">Settings Categories</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {categories.map((c) => {
          const IconComp = icons[c.icon] || Settings;
          return (
            <div 
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all border
                ${c.id === activeId 
                  ? 'bg-[#0084FF]/20 border-[#0084FF] text-white shadow-lg' 
                  : 'bg-transparent border-transparent hover:bg-white/5 text-[var(--text-400)]'}
              `}
            >
              <IconComp size={16} className={c.id === activeId ? 'text-[#0084FF]' : 'text-[var(--text-600)] group-hover:text-white'} />
              <span className={`text-[11px] font-bold ${c.id === activeId ? 'text-white' : 'group-hover:text-white'}`}>
                {c.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
