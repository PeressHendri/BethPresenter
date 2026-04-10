import React, { useState } from 'react';
import { X, Command, Sliders, Monitor as MonitorIcon, Activity } from 'lucide-react';
import { MOCK_MONITORS, OUTPUT_PRESETS } from '../data/output-settings-data';
import { MonitorSelector, ToggleRow, SliderControl } from './OutputSettingPrimitives';

export function OutputSettingsOverlay({ onClose }: { onClose: () => void }) {
  const [selectedMonitorId, setSelectedMonitorId] = useState(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-[880px] h-[580px] bg-[#1F1F1F] border border-white/10 rounded-[20px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between shrink-0">
           <div className="flex flex-col">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Output Settings</h2>
              <p className="text-[10px] text-[#666] uppercase tracking-[0.2em] mt-1">Configure display outputs for projector and stage monitors.</p>
           </div>
           <button 
             onClick={onClose}
             className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#666] hover:text-white transition-all"
           >
             <X size={20} />
           </button>
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 flex overflow-hidden">
           {/* LEFT: Primary Panel */}
           <div className="flex-1 p-8 border-r border-white/5 overflow-y-auto no-scrollbar space-y-8">
              <section className="space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                    <MonitorIcon size={14} className="text-[#00E676]" />
                    <span className="text-[9px] font-black text-[#666] uppercase tracking-widest">Active Display Output</span>
                 </div>
                 <MonitorSelector 
                   monitors={MOCK_MONITORS} 
                   selectedId={selectedMonitorId}
                   onSelect={setSelectedMonitorId}
                 />
              </section>

              <section className="space-y-6 pt-4 border-t border-white/5">
                 <div className="flex items-center gap-2 mb-2">
                    <Sliders size={14} className="text-[#00E676]" />
                    <span className="text-[9px] font-black text-[#666] uppercase tracking-widest">Projection Parameters</span>
                 </div>
                 <SliderControl label="Safe Margin" value="5" unit="%" />
                 <SliderControl label="Text Scale" value="100" unit="%" />
                 <div className="flex gap-4 pt-2">
                    <button className="flex-1 h-10 rounded bg-[#262626] border border-white/5 text-[9px] font-black uppercase text-white hover:border-[#00E676] transition-all">Solid Color</button>
                    <button className="flex-1 h-10 rounded bg-[#262626] border border-[#00E676] text-[9px] font-black uppercase text-[#00E676]">Video Loop</button>
                 </div>
              </section>
           </div>

           {/* RIGHT: Advanced Panel */}
           <div className="flex-1 p-8 overflow-y-auto no-scrollbar space-y-8 bg-black/10">
              <section className="space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                    <Activity size={14} className="text-[#00E676]" />
                    <span className="text-[9px] font-black text-[#666] uppercase tracking-widest">Stage Display Intelligence</span>
                 </div>
                 <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                    <ToggleRow label="Enable Stage Display" checked={true} />
                    <ToggleRow label="Show Next Slide" checked={true} />
                    <ToggleRow label="Show Service Order" checked={false} />
                    <div className="pt-2">
                       <span className="text-[8px] font-black text-[#444] uppercase tracking-widest">Layout Preset</span>
                       <div className="mt-2 px-3 py-2 bg-black/40 border border-white/5 rounded text-[10px] font-bold text-white flex justify-between items-center cursor-pointer">
                          {OUTPUT_PRESETS[0]}
                          <Command size={12} className="opacity-30" />
                       </div>
                    </div>
                 </div>
              </section>

              <section className="space-y-4 pt-4 border-t border-white/5">
                 <span className="text-[9px] font-black text-[#666] uppercase tracking-widest">Signal Routing</span>
                 <RoutingRow label="Main Output" value="Display 2 (HDMI)" />
                 <RoutingRow label="Stage Output" value="Display 3 (NDI)" />
              </section>
           </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 bg-black/20 border-t border-white/5 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
              <span className="text-[10px] font-black text-[#666] uppercase tracking-widest">Real-time sync active</span>
           </div>
           <div className="flex gap-4">
              <button onClick={onClose} className="px-8 py-3 rounded text-[10px] font-black uppercase text-[#666] hover:text-white transition-all tracking-widest">Cancel</button>
              <button className="px-8 py-3 rounded bg-[#00E676] text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#00E676]/20 hover:scale-105 active:scale-95 transition-all">Apply Changes</button>
           </div>
        </div>
      </div>
    </div>
  );
}

function RoutingRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between bg-white/5 px-4 py-2.5 rounded-lg border border-white/5">
       <span className="text-[9px] font-black uppercase text-[#888] tracking-widest">{label}</span>
       <span className="text-[10px] font-bold text-white">{value}</span>
    </div>
  );
}
