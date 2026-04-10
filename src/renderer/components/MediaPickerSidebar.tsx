import React from 'react';
import { Search, Clock, Grid, Image as ImageIcon, Film, Folder, Plus, RefreshCw } from 'lucide-react';

export function AddMediaSidebar() {
  const categories = [
    { name: 'Recent', icon: Clock },
    { name: 'All Media', icon: Grid, active: true },
    { name: 'Images', icon: ImageIcon },
    { name: 'Videos', icon: Film },
    { name: 'Backgrounds', icon: ImageIcon },
    { name: 'Motion Backgrounds', icon: Film },
    { name: 'Imported Media', icon: Folder },
  ];

  return (
    <div className="w-64 bg-[#1A1A1A] border-r border-[#333] flex flex-col shrink-0">
      {/* Search Header */}
      <div className="p-4 border-b border-[#333]">
        <div className="relative group">
           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] group-focus-within:text-[#00E676]" />
           <input 
             placeholder="Search media..."
             className="w-full h-9 bg-black/40 border border-[#333] rounded pl-9 pr-3 text-[11px] text-white focus:outline-none focus:border-[#00E676]"
           />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {categories.map((c) => (
          <div 
            key={c.name}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer relative transition-all group
              ${c.active ? 'bg-[#00E676]/10 text-white' : 'text-[#888] hover:bg-white/5 hover:text-white'}
            `}
          >
            {c.active && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#00E676] rounded-r shadow-[0_0_10px_#00E676]" />}
            <c.icon size={16} className={c.active ? 'text-[#00E676]' : 'text-[#666] group-hover:text-white'} />
            <span className="text-xs font-bold leading-none">{c.name}</span>
          </div>
        ))}

        <div className="pt-4 px-3 flex items-center justify-between">
           <span className="text-[10px] font-black uppercase text-[#444] tracking-widest">User Folders</span>
           <button className="text-[#666] hover:text-[#00E676]"><Plus size={14}/></button>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 bg-black/20 border-t border-[#333] flex items-center justify-between shrink-0">
         <button className="text-[10px] uppercase font-black text-[#666] hover:text-white flex items-center gap-2">
            <RefreshCw size={12} />
            Refresh Library
         </button>
      </div>
    </div>
  );
}
