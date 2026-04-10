import React from 'react';
import { Music, Video, MoreVertical, Trash, Copy, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePresentationStore } from '../stores/presentationStore';

export interface ServiceItem {
  id: number;
  type: 'STANDBY' | 'SONG';
  title: string;
  slides: number;
  active?: boolean;
}

export function ServiceOrderSidebar({ items, onGoLive }: { 
  items: ServiceItem[], 
  onGoLive?: (id: number) => void
}) {
  const navigate = useNavigate();
  const { activeItemIndex, setActiveSlide } = usePresentationStore();

  return (
    <div className="w-64 bg-[var(--surface-primary)] border-r border-[var(--border-default)] flex flex-col select-none group/sidebar">
      <div className="p-4 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-base)]/50">
        <h3 className="text-[var(--text-400)] text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Service Flow</h3>
        <span className="bg-[var(--accent-green)] text-black text-[10px] font-black px-1.5 py-0.5 rounded-sm">
          {items.length} ITM
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto pt-2 px-2 space-y-1 bg-[#0A0C10]/40 no-scrollbar">
        {items.map((item, index) => {
          const isActive = index === activeItemIndex;
          return (
            <div 
              key={item.id} 
              onClick={() => setActiveSlide(index, 0)}
              onDoubleClick={() => onGoLive?.(item.id)}
              className={`
                group flex items-center gap-3 px-3 py-3 cursor-pointer transition-all rounded border-l-4
                ${isActive 
                  ? 'bg-[var(--accent-blue)] border-white text-white shadow-[0_10px_20px_rgba(0,0,0,0.4)] scale-[1.01] z-10' 
                  : 'border-transparent hover:bg-white/5 text-[var(--text-200)] hover:border-white/10'}
              `}
            >
              <span className={`text-[10px] font-black w-4 ${isActive ? 'text-white/80' : 'text-[var(--text-600)]'}`}>
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <div className={`p-1.5 rounded transition-transform group-hover:scale-110 ${isActive ? 'bg-white/20' : 'bg-black/40 border border-white/5'}`}>
                {item.type === 'STANDBY' ? <Video size={14} className="text-green-400"/> : <Music size={14} className="text-[#00D2D2]"/>}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className={`text-[11px] font-black truncate tracking-tight uppercase ${isActive ? 'text-white' : 'text-gray-300'}`}>
                  {item.title}
                </span>
                <span className={`text-[8px] font-black uppercase tracking-[0.1em] transition-opacity ${isActive ? 'text-white/60' : 'text-[var(--text-600)]'}`}>
                  {item.slides > 0 ? `${item.slides} slides` : 'Standby Signal'}
                </span>
              </div>

              {/* Item Quick Actions (Appears on Hover) */}
              <div className={`hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                 <button className="p-1 hover:text-white transition-colors"><MoreVertical size={12}/></button>
              </div>
            </div>
          );
        })}

        {/* Placeholder for Add Item */}
        <button 
          onClick={() => navigate('/service-manager')}
          className="w-full flex items-center justify-center py-4 border-2 border-dashed border-white/5 rounded mt-4 hover:border-[#00D2D2]/30 hover:bg-[#00D2D2]/5 transition-all text-[var(--text-600)] hover:text-[#00D2D2]"
        >
           <span className="text-[10px] font-black uppercase tracking-widest">+ Add Service Item</span>
        </button>
      </div>
    </div>
  );
}
