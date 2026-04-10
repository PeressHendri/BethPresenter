import React from 'react';
import { Play, Image as ImageIcon, FileText } from 'lucide-react';

export function AddMediaGrid({ 
  items, 
  onSelect, 
  activeId 
}: { 
  items: any[], 
  onSelect: (item: any) => void, 
  activeId: string | null 
}) {
  return (
    <div className="flex-1 flex flex-col bg-[#1A1A1A] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className={`
                group flex flex-col rounded-xl overflow-hidden cursor-pointer border-2 transition-all relative
                ${activeId === item.id 
                  ? 'border-[#00E676] bg-[#00E676]/5 shadow-[0_0_20px_rgba(0,230,118,0.1)]' 
                  : 'border-transparent bg-[#222] hover:border-[#333] hover:bg-[#252525]'}
              `}
            >
              <div className="aspect-video w-full bg-black relative">
                 <img src={item.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                 {item.type === 'video' && (
                   <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[8px] font-black text-white backdrop-blur-sm">
                     {item.duration}
                   </div>
                 )}
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <div className="w-10 h-10 rounded-full bg-[#00E676] text-black flex items-center justify-center shadow-lg">
                       {item.type === 'video' ? <Play size={20} fill="currentColor" /> : <ImageIcon size={20} />}
                    </div>
                 </div>
              </div>
              <div className="p-3">
                 <p className="text-[10px] font-bold text-white truncate group-hover:text-[#00E676]">{item.name}</p>
                 <span className="text-[8px] font-black text-[#666] uppercase tracking-widest mt-1 block">
                    {item.resolution} • {item.type}
                 </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom status bar */}
      <div className="h-14 px-6 bg-[#222] border-t border-[#333] flex items-center justify-between shrink-0">
         <span className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em]">12 Items in Backgrounds</span>
         <button className="px-4 py-2 border border-[#333] rounded text-[9px] font-black text-white hover:border-[#00E676] transition-all uppercase tracking-widest">
            Import Local File
         </button>
      </div>
    </div>
  );
}

export function AddMediaPreview({ item }: { item: any | null }) {
  return (
    <div className="w-[320px] bg-[#1A1A1A] border-l border-[#333] flex flex-col shrink-0">
      <div className="p-6 border-b border-[#333]">
         <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">Preview</h3>
         <span className="text-[10px] font-bold text-[#666] uppercase tracking-widest truncate max-w-full block">
           {item ? item.name : 'Select or Double-click'}
         </span>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
        <div className="aspect-video w-full bg-black rounded-xl border border-[#333] overflow-hidden shadow-2xl relative">
          {!item ? (
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center opacity-20 italic">
               <span className="text-[10px] font-bold text-white uppercase tracking-widest">No Media Selected</span>
            </div>
          ) : (
             <img src={item.thumbnail} className="w-full h-full object-cover" />
          )}
        </div>

        {item && (
          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
             <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-[#666] uppercase tracking-widest">Metadata</span>
                <div className="grid grid-cols-2 gap-2">
                   <MetaBit label="Type" value={item.type.toUpperCase()} />
                   <MetaBit label="Res" value={item.resolution} />
                   <MetaBit label="Size" value={item.size} />
                   <MetaBit label="Ext" value={item.extension} />
                </div>
             </div>
             
             <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-[#666] uppercase tracking-widest">Location</span>
                <p className="text-[10px] font-bold text-[#AAA] leading-relaxed truncate">/Media Library/Backgrounds/Motion/</p>
             </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
           <button className="w-full py-4 rounded-lg bg-[#00E676] text-black text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#00E676]/10 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50" disabled={!item}>
             Add to Service
           </button>
        </div>
      </div>
    </div>
  );
}

function MetaBit({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-2 bg-[#222] border border-[#333] rounded">
       <div className="text-[7px] font-black text-[#444] uppercase mb-0.5 tracking-tighter">{label}</div>
       <div className="text-[9px] font-black text-white">{value}</div>
    </div>
  );
}
