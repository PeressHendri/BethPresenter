import React from 'react';
import { ZoomIn, Monitor, Save } from 'lucide-react';

export function ThemePreviewPanel({ theme }: { theme: any }) {
  if (!theme) return null;

  return (
    <div className="w-[420px] bg-[var(--surface-primary)] border-l border-[var(--border-default)] flex flex-col shrink-0">
      <div className="p-8 border-b border-[var(--border-default)] flex items-center justify-between">
         <div className="flex flex-col">
            <h3 className="text-xs font-black text-[var(--text-100)] uppercase tracking-[0.2em] mb-1">Live Monitor</h3>
            <span className="text-[10px] font-bold text-[var(--text-600)] uppercase tracking-widest">Broadcast-Safe Preview</span>
         </div>
         <div className="flex items-center gap-2 opacity-40 text-[var(--text-100)]">
            <Monitor size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">16:9 Output</span>
         </div>
      </div>

      <div className="flex-1 p-8 flex flex-col gap-8">
        {/* The Slide Frame */}
        <div className="aspect-video w-full rounded-2xl border-4 border-[var(--surface-elevated)] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative group">
           {/* Background Layer */}
           <div 
             className="absolute inset-0 transition-all duration-500" 
             style={{ 
               background: theme.background.type === 'gradient' 
                 ? `linear-gradient(to bottom right, ${theme.background.value}, ${theme.background.gradientEnd})` 
                 : theme.background.value 
             }} 
           />
           
           {/* Content Layer */}
           <div className={`absolute inset-0 p-12 flex flex-col justify-center items-center text-center`}>
              <h1 
                className="transition-all duration-300"
                style={{
                  fontFamily: theme.text.font,
                  fontSize: `${theme.text.size / 2}px`, // Scaled for preview
                  fontWeight: theme.text.weight,
                  color: theme.text.color,
                  lineHeight: theme.text.lineHeight,
                  textShadow: theme.text.shadow.enabled 
                    ? `0px ${theme.text.shadow.offset}px ${theme.text.shadow.blur}px ${theme.text.shadow.color}` 
                    : 'none',
                  WebkitTextStroke: theme.text.outline.enabled 
                    ? `${theme.text.outline.thickness / 2}px ${theme.text.outline.color}` 
                    : 'none'
                }}
              >
                Sample Slide Preview<br/>
                Line 1<br/>
                Line 2
              </h1>
           </div>
        </div>

        {/* Zoom & Metadata */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <ZoomIn size={14} className="text-[var(--text-600)]" />
                 <span className="text-[9px] font-black uppercase text-[var(--text-600)] tracking-widest">Zoom: 45%</span>
              </div>
              <div className="w-32 h-1 bg-[var(--surface-base)] rounded-full overflow-hidden">
                 <div className="w-1/2 h-full bg-[#00E676] shadow-[0_0_10px_#00E676]" />
              </div>
           </div>

           <div className="p-4 bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-xl space-y-3">
              <MetaRow label="Optimized for" value="1920x1080" />
              <MetaRow label="Last Modified" value="2 min ago" />
              <MetaRow label="Active Usage" value="3 services" />
           </div>
        </div>

        {/* Global Save */}
        <div className="mt-auto">
           <button className="w-full h-14 bg-[#00E676] text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-[#00E676]/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
              <Save size={18} />
              Apply to Templates
           </button>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center">
       <span className="text-[8px] font-black uppercase text-[var(--text-600)] tracking-widest">{label}</span>
       <span className="text-[9px] font-black text-[var(--text-400)]">{value}</span>
    </div>
  );
}
