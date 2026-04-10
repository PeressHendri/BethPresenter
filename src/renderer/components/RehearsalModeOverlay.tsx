import React from 'react';
import { X, EyeOff, Info, ArrowLeft, Power } from 'lucide-react';

export function RehearsalModeOverlay({ onClose, onExit }: { onClose: () => void, onExit: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-black/50 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden">
      
      {/* 🟢 TOP BANNER (HEADER) */}
      <div className="h-[64px] bg-[#1E1E1E] border-b border-white/5 px-8 flex items-center justify-between shrink-0 shadow-2xl">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#00E676]/10 rounded-full border border-[#00E676]/20">
               <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
               <span className="text-[10px] font-black uppercase text-[#00E676] tracking-widest">Rehearsal ON</span>
            </div>
            <div className="flex flex-col">
               <h2 className="text-sm font-bold text-white leading-none tracking-tight">Rehearsal Mode is Active</h2>
               <p className="text-[9px] font-medium text-[#666] uppercase tracking-widest mt-1">Nothing is being displayed to the projector or stage display.</p>
            </div>
         </div>
         <button 
           onClick={onClose}
           className="p-2 hover:bg-white/5 rounded-full text-[#666] hover:text-white transition-all"
         >
           <X size={20} />
         </button>
      </div>

      {/* 🟦 CENTER CONTENT */}
      <div className="flex-1 flex px-12 py-10 gap-12 overflow-hidden items-center justify-center">
        
         {/* Output Blocked View */}
         <div className="flex-[3] max-w-[900px] aspect-video bg-[#2A2A2A] rounded-2xl border-4 border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center p-12 text-center group transition-all hover:border-white/10">
            <div className="w-24 h-24 bg-black/40 rounded-full flex items-center justify-center text-[#444] mb-8 group-hover:scale-110 transition-transform">
               <EyeOff size={48} />
            </div>
            <h3 className="text-3xl font-black text-white/90 uppercase tracking-tighter mb-4">Rehearsal Mode Active</h3>
            <p className="text-sm text-[#888] font-medium max-w-md leading-relaxed">
              Your signal is isolated. You can navigate, edit, and preview all components without affecting the public display.
            </p>
         </div>

         {/* Information Panel */}
         <div className="flex-1 max-w-[340px] space-y-8 animate-in slide-in-from-right-8 duration-500">
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-[#00E676]">
                  <Info size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Protocol Guide</span>
               </div>
               <h4 className="text-lg font-bold text-white tracking-tight leading-tight">What is Rehearsal Mode?</h4>
               <ul className="space-y-4 text-xs font-medium text-[#BBB]">
                  <li className="flex items-start gap-3">
                     <span className="text-[#00E676]">•</span>
                     <span>Practice navigating slides and songs safely</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <span className="text-[#00E676]">•</span>
                     <span>Preview scriptures and background loops</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <span className="text-[#00E676]">•</span>
                     <span>All media audio playback is automatically muted</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <span className="text-[#00E676]">•</span>
                     <span>External projector outputs are fully disabled</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <span className="text-[#00E676]">•</span>
                     <span>Stage display feed is paused at current state</span>
                  </li>
               </ul>
            </div>
         </div>
      </div>

      {/* 🟧 BOTTOM BAR */}
      <div className="h-[90px] px-12 bg-black/40 border-t border-white/5 flex items-center justify-between shrink-0">
         <button 
           onClick={onClose}
           className="flex items-center gap-3 px-6 h-12 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-[#888] hover:text-white hover:bg-white/10 transition-all"
         >
            <ArrowLeft size={16} />
            Return to Presentation
         </button>

         <button 
           onClick={onExit}
           className="flex items-center gap-3 px-8 h-14 rounded-xl bg-[#FF5252] text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all"
         >
            <Power size={18} />
            Exit Rehearsal Mode
         </button>
      </div>
    </div>
  );
}
