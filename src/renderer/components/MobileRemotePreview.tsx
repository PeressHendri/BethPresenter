import React from 'react';
import { ChevronLeft, ChevronRight, Square, EyeOff, Layout, LogIn } from 'lucide-react';

export function RemoteControllerPreview({ currentSlide }: { currentSlide: any }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-black/20 overflow-hidden relative">
      <div className="text-[10px] font-black text-[#444] uppercase tracking-[0.5em] mb-8">Virtual Remote Simulator</div>

      {/* PHONE FRAME */}
      <div className="w-[300px] h-[620px] bg-black rounded-[44px] p-3 border-[6px] border-[#181818] shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 flex flex-col">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />
          
          {/* Inner Interface */}
          <div className="flex-1 bg-[#121212] rounded-[34px] p-4 flex flex-col gap-4 overflow-hidden pt-8">
             {/* Header */}
             <div className="flex items-center justify-between opacity-60">
                <span className="text-[9px] font-black text-white tracking-widest uppercase">G-Presenter</span>
                <div className="flex items-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                   <span className="text-[7px] font-bold text-white uppercase">Live</span>
                </div>
             </div>

             {/* Slide Preview */}
             <div className="aspect-video w-full bg-[#222] border border-white/5 rounded-xl flex items-center justify-center p-4 text-center overflow-hidden shadow-inner">
                <span className="text-[10px] font-black leading-relaxed text-white uppercase tracking-tight">
                   {currentSlide?.text || "READY TO PRESENT"}
                </span>
             </div>

             <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                <span className="text-[7px] font-black text-[#444] uppercase tracking-[0.2em]">Next Slide</span>
                <p className="text-[9px] font-bold text-[#888] mt-1 italic">...will appear here</p>
             </div>

             {/* Main Navigation */}
             <div className="grid grid-cols-2 gap-3 mt-4">
                <MobileBtn icon={<ChevronLeft size={24} />} label="Prev" />
                <MobileBtn icon={<ChevronRight size={24} />} label="Next" active />
             </div>

             <div className="grid grid-cols-2 gap-3">
                <MobileBtn icon={<Square size={16} />} label="Blank" small />
                <MobileBtn icon={<EyeOff size={16} />} label="Hide" small />
             </div>

             {/* Footer Utilities */}
             <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                   <div className="flex justify-between text-[7px] font-black text-[#444] uppercase">
                      <span>TEXT SCALE</span>
                      <span className="text-[#00E676]">100%</span>
                   </div>
                   <div className="w-full h-1 bg-[#222] rounded-full">
                      <div className="w-1/2 h-full bg-[#00E676] rounded-full" />
                   </div>
                </div>

                <div className="flex items-center justify-between pb-2">
                   <div className="flex items-center gap-2">
                      <Layout size={12} className="text-[#444]" />
                      <span className="text-[8px] font-black text-[#444] uppercase">Library</span>
                   </div>
                   <LogIn size={12} className="text-[#444]" />
                </div>
             </div>
          </div>
      </div>
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00E676]/5 blur-[120px] rounded-full" />
    </div>
  );
}

function MobileBtn({ icon, label, active, small }: { icon: any, label: string, active?: boolean, small?: boolean }) {
  return (
    <button className={`
      flex flex-col items-center justify-center rounded-2xl transition-all border
      ${small ? 'h-14 gap-1' : 'h-24 gap-2'}
      ${active 
        ? 'bg-[#00E676] text-black border-[#00E676] shadow-lg shadow-[#00E676]/20' 
        : 'bg-[#1a1a1a] text-[#888] border-white/5 hover:border-white/20'}
    `}>
       <div className={active ? 'text-black' : 'text-[#666]'}>{icon}</div>
       <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-black' : 'text-[#666]'}`}>{label}</span>
    </button>
  );
}
