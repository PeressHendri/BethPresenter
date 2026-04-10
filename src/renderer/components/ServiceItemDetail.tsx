import React from 'react';
import { Pencil, Copy, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

export function ServiceItemDetail({ item }: { item: any | null }) {
  if (!item) return (
    <div className="flex-1 bg-[#1A1A1A] flex flex-col items-center justify-center p-12 text-center opacity-20 italic select-none">
       <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white">Select a component to inspect details</span>
    </div>
  );

  return (
    <div className="w-[480px] bg-[#1A1A1A] border-l border-[#333] flex flex-col shrink-0">
      <div className="p-8 border-b border-[#333] flex items-center justify-between">
         <div className="flex flex-col">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">{item.title}</h3>
            <span className="text-[10px] font-black uppercase text-[#00E676] tracking-[0.2em]">{item.type} Properties</span>
         </div>
         <button className="p-2 bg-[#222] rounded border border-[#333] text-[#666] hover:text-[#00E676] transition-all">
            <Pencil size={18} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
        {/* Preview Block */}
        <div className="aspect-video w-full bg-black rounded-xl border border-[#333] flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
           <span className="text-[10px] font-black uppercase text-[#444] tracking-[0.3em] mb-4">Preview Rendering</span>
           <div className="text-white font-black text-center px-6" style={{ fontSize: '18px' }}>
              {item.type === 'song' ? '[First Slide Preview]' : 
               item.type === 'scripture' ? item.detail.text.substring(0, 100) + '...' : 
               item.type === 'media' ? 'MEDIA THUMBNAIL' : '05:00'}
           </div>
        </div>

        {/* Metadata Fields */}
        <div className="space-y-6">
           {Object.keys(item.detail).map(key => (
             <div key={key} className="flex flex-col gap-2">
                <span className="text-[9px] font-black uppercase text-[#444] tracking-widest">{key}</span>
                <div className="px-4 py-3 bg-black/40 rounded-lg border border-[#333] text-[11px] font-bold text-white">
                   {item.detail[key]}
                </div>
             </div>
           ))}
        </div>

        {/* Actions Deck */}
        <div className="pt-8 border-t border-[#333] grid grid-cols-2 gap-3">
           <ActionBtn icon={<Copy size={16}/>} label="Duplicate" />
           <ActionBtn icon={<ArrowUp size={16}/>} label="Move Top" />
           <ActionBtn icon={<ArrowDown size={16}/>} label="Move Bottom" />
           <ActionBtn icon={<Trash2 size={16}/>} label="Delete" danger />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, danger }: { icon: any, label: string, danger?: boolean }) {
  return (
    <button className={`
      flex items-center justify-center gap-3 h-12 rounded-lg border font-black text-[10px] uppercase tracking-widest transition-all
      ${danger ? 'border-red-900/50 bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white' : 'border-[#333] text-[#888] hover:border-[#00E676] hover:text-white hover:bg-white/5'}
    `}>
       {icon}
       {label}
    </button>
  );
}
