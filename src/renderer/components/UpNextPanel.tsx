import React from 'react';

export function UpNextPanel({ nextSlide, backgroundImage }: { nextSlide: any, backgroundImage: string }) {
  return (
    <div className="flex flex-col bg-[#050505] border-y border-[var(--border-default)]">
      <div className="px-4 py-2 bg-black/40 flex items-center gap-2">
        <div className="w-1 h-3 bg-[var(--accent-blue)] rounded-full" />
        <span className="text-[9px] font-black text-[var(--text-400)] uppercase tracking-[0.2em]">Up Next</span>
      </div>

      <div className="p-4">
        <div className="relative aspect-video bg-[#0A0A0A] rounded border border-white/5 overflow-hidden group">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
             <p className="text-white/60 font-bold uppercase text-[9px] tracking-widest leading-tight">
                {nextSlide?.text || "END OF SERVICE"}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
