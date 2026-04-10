import React from 'react';
import { Play, Image as ImageIcon, Video as VideoIcon, PlusCircle, Info } from 'lucide-react';

export function MediaCard({ 
  item, 
  isSelected, 
  onSelect 
}: { 
  item: any, 
  isSelected: boolean, 
  onSelect: () => void 
}) {
  return (
    <div 
      onClick={onSelect}
      className={`
        group relative flex flex-col bg-[var(--surface-elevated)] bg-opacity-30 rounded-lg p-2 transition-all border-2
        ${isSelected ? 'border-[var(--accent-green)] scale-[1.02] shadow-[0_0_20px_rgba(0,224,145,0.2)]' : 'border-transparent hover:border-white/10'}
      `}
    >
      {/* THUMBNAIL PREVIEW */}
      <div className="relative aspect-video rounded-md overflow-hidden bg-black mb-2">
        <div className="absolute inset-0 bg-[var(--surface-primary)] flex items-center justify-center opacity-40">
           {item.type === 'video' ? <Play className="text-white/20" size={32} /> : <ImageIcon className="text-white/20" size={32} />}
        </div>
        
        {/* MEDIA TYPE ICON OVERLAY */}
        <div className="absolute top-2 left-2 p-1.5 bg-black/60 backdrop-blur-md rounded border border-white/5 text-[var(--accent-green)]">
           {item.type === 'video' ? <VideoIcon size={12} /> : <ImageIcon size={12} />}
        </div>

        {/* DURATION BADGE (VIDEO ONLY) */}
        {item.duration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[9px] font-black text-white">
            {item.duration}
          </div>
        )}

        {/* HOVER ACTIONS */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
           <button className="p-2 bg-[var(--accent-green)] text-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl">
              <PlusCircle size={20} strokeWidth={3} />
           </button>
           <button className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all border border-white/20">
              <Info size={18} />
           </button>
        </div>
      </div>

      {/* METADATA */}
      <div className="flex flex-col gap-0.5 px-1 truncate">
        <h4 className="text-[11px] font-bold text-white truncate tracking-tight">{item.name}</h4>
        <div className="flex items-center justify-between mt-1">
           <span className="text-[9px] font-black text-[var(--text-600)] uppercase tracking-widest">{item.resolution}</span>
           <span className="text-[9px] font-black text-[var(--text-600)] uppercase tracking-widest">{item.size}</span>
        </div>
      </div>
    </div>
  );
}

export function MediaGrid({ items, selectedId, onSelect }: { items: any[], selectedId: string | null, onSelect: (id: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map(item => (
            <MediaCard 
              key={item.id} 
              item={item} 
              isSelected={item.id === selectedId} 
              onSelect={() => onSelect(item.id)} 
            />
          ))}
       </div>
       <div className="h-20" />
    </div>
  );
}
