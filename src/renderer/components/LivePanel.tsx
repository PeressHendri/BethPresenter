import React from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  EyeOff, 
  Type, 
  Clock 
} from 'lucide-react';
import { UpNextPanel } from './UpNextPanel';
import { ServiceFlowMini } from './ServiceFlowMini';

interface LivePanelProps {
  activeSlide: any; 
  nextSlide: any;
  backgroundImage: string;
  serviceItems: any[];
  activeServiceId: number;
  onEndLive: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleHide: () => void;
  onToggleSubtitle: () => void;
  isLyricsHidden?: boolean;
}

export function LivePanel({ 
  activeSlide, 
  nextSlide, 
  backgroundImage,
  serviceItems,
  activeServiceId,
  onEndLive,
  onNext,
  onPrev,
  onToggleHide,
  onToggleSubtitle,
  isLyricsHidden
}: LivePanelProps) {
  return (
    <div className="w-[340px] bg-[var(--surface-primary)] border-l border-[var(--border-default)] flex flex-col select-none shrink-0 overflow-hidden shadow-2xl">
      {/* ── LIVE PREVIEW BOX ── */}
      <div className="shrink-0 flex flex-col bg-[#0A0C10]">
        <div className="h-12 px-4 flex items-center justify-between bg-red-950/20 border-b border-red-900/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live</span>
          </div>
          <button 
            onClick={onEndLive}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider transition-all"
          >
            <X size={12} strokeWidth={3} />
            End Live
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div className="relative aspect-video bg-black rounded-lg border border-white/10 overflow-hidden shadow-2xl">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-70"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
            {isLyricsHidden ? (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                 <div className="flex flex-col items-center gap-2 opacity-40">
                    <EyeOff size={32} className="text-white" />
                    <span className="text-[8px] font-black uppercase text-white tracking-[0.3em]">Lyrics Hidden</span>
                 </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                 <p className="text-white text-center font-black uppercase text-[11px] tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                    {activeSlide?.text || "(blank)"}
                 </p>
                 {activeSlide?.reference && (
                   <p className="absolute bottom-4 text-[9px] font-black text-[var(--accent-green)] uppercase tracking-[0.3em] opacity-80 drop-shadow-md">
                     {activeSlide.reference}
                   </p>
                 )}
              </div>
            )}
          </div>

          {/* Controls Under Preview */}
          <div className="flex justify-center items-center gap-2">
            <LiveControlBtn icon={<ChevronLeft size={16}/>} label="Prev" onClick={onPrev} />
            <LiveControlBtn 
              icon={<EyeOff size={16}/>} 
              label={isLyricsHidden ? "Show" : "Hide"} 
              active={isLyricsHidden} 
              onClick={onToggleHide} 
            />
            <LiveControlBtn icon={<Type size={16}/>} label="Sub" onClick={onToggleSubtitle} />
            <LiveControlBtn icon={<ChevronRight size={16}/>} label="Next" onClick={onNext} />
          </div>
        </div>
      </div>

      {/* ── UP NEXT ── */}
      <UpNextPanel nextSlide={nextSlide} backgroundImage={backgroundImage} />

      {/* ── SERVICE FLOW ── */}
      <ServiceFlowMini items={serviceItems} activeId={activeServiceId} />

      {/* ── FOOTER STATUS ── */}
      <div className="h-12 px-4 flex items-center justify-between bg-black border-t border-[var(--border-default)]">
        <div className="flex items-center gap-2 text-[var(--text-600)]">
           <Clock size={12} />
           <span className="text-xs font-black text-white/90 tracking-tighter">
             {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 opacity-50">
             <div className="w-1 h-1 bg-white rounded-full" />
             <span className="text-[8px] font-bold text-white uppercase tracking-widest">Navigate</span>
           </div>
           <div className="flex items-center gap-2 opacity-50">
             <div className="w-1 h-1 bg-white rounded-full" />
             <span className="text-[8px] font-bold text-white uppercase tracking-widest">Blank</span>
           </div>
        </div>
      </div>
    </div>
  );
}

function LiveControlBtn({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick?: () => void, active?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex-1 max-w-[64px] h-10 flex flex-col items-center justify-center rounded border transition-all
        ${active 
          ? 'bg-amber-500/20 border-amber-500 text-amber-500' 
          : 'bg-[var(--surface-elevated)] border-[var(--border-default)] text-[var(--text-400)] hover:text-white hover:bg-[var(--surface-hover)]'}
      `}
    >
      {icon}
      <span className="text-[7px] font-black tracking-tighter uppercase mt-0.5">{label}</span>
    </button>
  );
}
