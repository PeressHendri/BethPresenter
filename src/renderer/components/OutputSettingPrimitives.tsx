import React from 'react';
import { Monitor, CheckCircle2 } from 'lucide-react';

export function MonitorSelector({ monitors, selectedId, onSelect }: { monitors: any[], selectedId: number, onSelect: (id: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {monitors.map((m) => (
        <div 
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={`
            p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-3 relative
            ${m.id === selectedId 
              ? 'bg-[#00E676]/5 border-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.1)]' 
              : 'bg-black/20 border-white/5 hover:border-white/20'}
          `}
        >
          <div className="flex items-center justify-between">
             <div className={`p-2 rounded-lg ${m.id === selectedId ? 'bg-[#00E676] text-black' : 'bg-white/5 text-[#666]'}`}>
                <Monitor size={18} />
             </div>
             {m.id === selectedId && <CheckCircle2 size={16} className="text-[#00E676]" />}
          </div>
          <div className="flex flex-col">
             <span className={`text-[11px] font-bold ${m.id === selectedId ? 'text-white' : 'text-[#888]'}`}>{m.name}</span>
             <span className="text-[9px] font-black uppercase text-[#444] tracking-widest mt-0.5">{m.resolution} {m.hz}Hz</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ToggleRow({ label, description, checked }: { label: string, description?: string, checked?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
       <div className="flex flex-col">
          <span className="text-xs font-bold text-white uppercase tracking-tight">{label}</span>
          {description && <span className="text-[9px] font-medium text-[#666] uppercase tracking-wide">{description}</span>}
       </div>
       <div className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${checked ? 'bg-[#00E676]' : 'bg-black/40 border border-white/10'}`}>
          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'left-5 shadow-[0_0_8px_white]' : 'left-1 opacity-40'}`} />
       </div>
    </div>
  );
}

export function SliderControl({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="flex flex-col gap-2">
       <div className="flex justify-between items-center px-1">
          <span className="text-[9px] font-black text-[#666] uppercase tracking-widest">{label}</span>
          <span className="text-[10px] font-bold text-[#00E676]">{value}{unit}</span>
       </div>
       <input type="range" className="w-full h-1 bg-black/40 rounded-full accent-[#00E676] cursor-pointer" />
    </div>
  );
}
