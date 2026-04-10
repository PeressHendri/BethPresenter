import React from 'react';
import { Layout } from 'lucide-react';

export function UpNext({ 
  nextSlide, 
  backgroundImage 
}: { 
  nextSlide: { text: string } | null, 
  backgroundImage: string 
}) {
  return (
    <div className="flex flex-col h-full bg-[#050505]">
      {/* HEADER */}
      <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center gap-2 shrink-0">
        <div className="w-1 h-3 bg-[var(--accent-blue)] rounded-full" />
        <span className="text-[9px] font-black text-[var(--text-400)] uppercase tracking-[0.25em]">Up Next</span>
      </div>

      {/* PREVIEW BOX */}
      <div className="p-3 shrink-0">
        <div className="relative aspect-video bg-[#0A0A0A] rounded border border-white/5 overflow-hidden group">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
             <p className="text-white/60 font-bold uppercase text-[9px] tracking-widest leading-tight">
                {nextSlide?.text || "None"}
             </p>
          </div>
        </div>
      </div>

      {/* SERVICE FLOW REDUCED VIEW */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-white/5">
        <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center gap-2">
          <Layout size={10} className="text-[var(--text-600)]" />
          <span className="text-[9px] font-black text-[var(--text-600)] uppercase tracking-widest">Service Flow</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-1 py-1 space-y-0.5">
           <CompactFlowItem title="STANDBY" active={false} />
           <CompactFlowItem title="HERE AGAIN" active={true} />
           <CompactFlowItem title="BELIEVE FOR IT" active={false} />
           <CompactFlowItem title="WAY MAKER" active={false} />
        </div>
      </div>
    </div>
  );
}

function CompactFlowItem({ title, active }: { title: string, active: boolean }) {
  return (
    <div className={`
      px-3 py-1.5 rounded flex items-center gap-2 transition-colors
      ${active ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'text-[var(--text-600)]'}
    `}>
       <div className={`w-1 h-1 rounded-full ${active ? 'bg-[var(--accent-blue)]' : 'bg-transparent'}`} />
       <span className="text-[10px] font-bold uppercase truncate tracking-tight">{title}</span>
    </div>
  );
}
