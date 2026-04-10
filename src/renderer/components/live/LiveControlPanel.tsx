import React from 'react';
import { 
  X, 
  EyeOff, 
  Type, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Layout
} from 'lucide-react';

const FOREST_BG = 'media:///Users/mac/.gemini/antigravity/brain/cf3b98ec-4448-4e7a-8f01-3c8b866cfa3c/dark_forest_background_1775749896276.png';

export function LiveControlPanel() {
  return (
    <div className="w-[340px] bg-[var(--surface-primary)] border-l border-[var(--border-default)] flex flex-col select-none shrink-0 overflow-hidden">
      {/* ── LIVE HEADER ── */}
      <div className="h-12 px-4 flex items-center justify-between bg-red-950/20 border-b border-red-900/40">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live</span>
        </div>
        <button className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider transition-colors">
          <X size={12} strokeWidth={3} />
          End Live
        </button>
      </div>

      {/* ── LIVE PREVIEW ── */}
      <div className="p-4 flex flex-col gap-4 border-b border-[var(--border-subtle)] bg-[#050505]/40">
        <div className="relative aspect-video bg-black rounded border border-white/5 overflow-hidden shadow-2xl">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${FOREST_BG})` }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
             <p className="text-white text-center font-black uppercase text-[10px] tracking-widest drop-shadow-md leading-tight">
                (blank)
             </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex justify-center items-center gap-1.5">
          <LiveIconButton icon={<ChevronLeft size={16}/>} />
          <LiveIconButton icon={<EyeOff size={16}/>} />
          <LiveIconButton icon={<Type size={16}/>} active />
          <LiveIconButton icon={<ChevronRight size={16}/>} />
        </div>
      </div>

      {/* ── UP NEXT HEADER ── */}
      <div className="px-4 py-2 bg-[var(--surface-base)]/80 border-b border-[var(--border-subtle)] flex items-center gap-2">
        <div className="w-1 h-3 bg-[var(--accent-blue)] rounded-full" />
        <span className="text-[9px] font-black text-[var(--text-400)] uppercase tracking-[0.2em]">Up Next</span>
      </div>

      {/* ── UP NEXT PREVIEW ── */}
      <div className="p-4 bg-[#050505]/20">
        <div className="relative aspect-video bg-black/40 rounded border border-white/5 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${FOREST_BG})` }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
             <p className="text-white text-center font-bold uppercase text-[9px] tracking-widest opacity-80">
                CAN'T GO BACK TO THE BEGINNING
             </p>
          </div>
        </div>
      </div>

      {/* ── SERVICE FLOW ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-2 bg-[var(--surface-base)]/80 border-y border-[var(--border-subtle)] flex items-center gap-2">
          <Layout size={10} className="text-[var(--text-600)]" />
          <span className="text-[9px] font-black text-[var(--text-400)] uppercase tracking-[0.2em]">Service Flow</span>
        </div>
        
        <div className="flex-1 overflow-y-auto pt-1 pb-4">
          <FlowItem title="STANDBY" type="video" />
          <FlowItem title="HERE AGAIN" type="music" active />
          <FlowItem title="BELIEVE FOR IT .." type="music" />
        </div>
      </div>

      {/* ── FOOTER STATUS ── */}
      <div className="h-10 px-4 flex items-center justify-between bg-[#08090C] border-t border-[var(--border-default)]">
        <div className="flex items-center gap-1.5 text-[var(--text-600)]">
           <Clock size={12} />
           <span className="text-xs font-black text-white/80">09:23 PM</span>
        </div>
        <div className="flex items-center gap-3">
           <StatusKey keyText="Navigate" />
           <StatusKey keyText="Blank" />
        </div>
      </div>
    </div>
  );
}

function LiveIconButton({ icon, active }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <button className={`
      w-10 h-8 flex items-center justify-center rounded border transition-all
      ${active 
        ? 'bg-[var(--accent-blue)]/20 border-[var(--accent-blue)]/50 text-white' 
        : 'bg-[var(--surface-elevated)] border-[var(--border-default)] text-[var(--text-400)] hover:bg-[var(--surface-hover)]'}
    `}>
      {icon}
    </button>
  );
}

function FlowItem({ title, type, active }: { title: string; type: 'music' | 'video'; active?: boolean }) {
  return (
    <div className={`
      flex items-center gap-3 px-4 py-2 border-l-2
      ${active ? 'bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]' : 'border-transparent opacity-40'}
    `}>
      <span className={`text-[10px] font-bold ${active ? 'text-white' : 'text-[var(--text-400)]'}`}>
        {title}
      </span>
    </div>
  );
}

function StatusKey({ keyText }: { keyText: string }) {
  return (
    <div className="flex items-center gap-1.5">
       <div className="w-[5px] h-[5px] rounded-full bg-[var(--text-600)]" />
       <span className="text-[9px] font-bold text-[var(--text-600)] uppercase tracking-widest">{keyText}</span>
    </div>
  );
}
