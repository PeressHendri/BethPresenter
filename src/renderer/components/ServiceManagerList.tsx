import React from 'react';
import { GripVertical, Music, Book, Film, Clock, MoreHorizontal, Plus } from 'lucide-react';

const icons: Record<string, any> = {
  song: Music,
  scripture: Book,
  media: Film,
  countdown: Clock,
};

export function DraggableServiceList({ items, activeId, onSelect }: { items: any[], activeId: string, onSelect: (id: string) => void }) {
  return (
    <div className="flex-1 flex flex-col bg-[#1A1A1A] border-r border-[#333] overflow-hidden">
      <div className="p-8 pb-4">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Service Order Manager</h2>
        <p className="text-[10px] text-[#666] uppercase tracking-[0.2em] mt-1">Reorder the flow for this service.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {['COUNTDOWNS', 'SONGS', 'SCRIPTURES', 'MEDIA'].map(category => {
          const catItems = items.filter(i => i.type.toUpperCase() + 'S' === category || (i.type === 'countdown' && category === 'COUNTDOWNS'));
          if (catItems.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
               <div className="flex items-center gap-2 px-4">
                  <span className="text-[9px] font-black text-[#444] tracking-[0.3em] uppercase">{category}</span>
                  <div className="flex-1 h-[1px] bg-[#333]" />
               </div>
               
               <div className="space-y-2">
                 {catItems.map((item) => {
                   const IconComp = icons[item.type];
                   return (
                     <div 
                       key={item.id}
                       onClick={() => onSelect(item.id)}
                       className={`
                        group flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${item.id === activeId 
                          ? 'border-[#00E676] bg-[#00E676]/5 shadow-[0_0_20px_rgba(0,230,118,0.05)]' 
                          : 'border-transparent bg-[#212121] hover:border-[#333] hover:bg-[#252525]'}
                       `}
                     >
                       <div className="flex items-center gap-4 truncate">
                          <GripVertical size={16} className="text-[#333] group-hover:text-[#666]" />
                          <div className={`p-2 rounded-lg ${item.id === activeId ? 'bg-[#00E676] text-black' : 'bg-black/40 text-[#00E676]'}`}>
                             <IconComp size={16} />
                          </div>
                          <div className="flex flex-col truncate">
                             <span className={`text-xs font-bold ${item.id === activeId ? 'text-white' : 'text-[#AAA] group-hover:text-white'}`}>
                                {item.title}
                             </span>
                             <span className="text-[9px] font-black uppercase text-[#666] tracking-widest mt-0.5">
                                {item.subtext}
                             </span>
                          </div>
                       </div>
                       <button className="text-[#444] hover:text-white transition-colors">
                          <MoreHorizontal size={18} />
                       </button>
                     </div>
                   );
                 })}
               </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-[#1A1A1A] border-t border-[#333]">
         <button className="w-full h-12 flex items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[#333] text-[10px] font-black uppercase tracking-[0.2em] text-[#666] hover:border-[#00E676] hover:text-[#00E676] transition-all">
            <Plus size={18} />
            Add New Item
         </button>
      </div>
    </div>
  );
}
