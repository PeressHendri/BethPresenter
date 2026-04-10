import React from 'react';
import { Type, Grid3X3, Layers, Settings2, SlidersHorizontal } from 'lucide-react';

export function ThemeEditorPanel({ theme, onChange }: { theme: any, onChange: (t: any) => void }) {
  if (!theme) return null;

  return (
    <div className="flex-1 flex flex-col bg-[var(--surface-base)] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-10 scrollbar-hide">
        
        {/* TEXT SETTINGS */}
        <section className="space-y-6">
           <SectionHeader icon={<Type size={16}/>} label="Typography Controls" />
           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                 <DropdownField label="Font Family" value={theme.text.font} />
                 <SliderField label="Font Size" value={theme.text.size} unit="px" />
                 <div className="grid grid-cols-2 gap-4">
                    <DropdownField label="Weight" value={theme.text.weight} />
                    <ColorField label="Color" value={theme.text.color} />
                 </div>
              </div>
              <div className="space-y-4">
                 <SliderField label="Line Space" value={theme.text.lineHeight} unit="" />
                 <ToggleRow label="Enable Text Outline" checked={theme.text.outline.enabled} />
                 <ToggleRow label="Drop Shadow" checked={theme.text.shadow.enabled} />
              </div>
           </div>
        </section>

        {/* ALIGNMENT GRID */}
        <section className="space-y-6 pt-4 border-t border-[var(--border-default)]">
           <SectionHeader icon={<Grid3X3 size={16}/>} label="Layout & Anchors" />
           <div className="flex gap-12">
              <div className="grid grid-cols-3 gap-1 w-32 h-32 bg-[var(--surface-elevated)] rounded-xl p-2 border border-[var(--border-default)]">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`rounded-sm transition-all cursor-pointer ${i === 4 ? 'bg-[#00E676] shadow-[0_0_15px_#00E676]' : 'bg-[var(--surface-primary)] hover:bg-[var(--surface-hover)]'}`} 
                  />
                ))}
              </div>
              <div className="flex-1 space-y-4">
                 <SliderField label="Text Box Width" value="80" unit="%" />
                 <div className="grid grid-cols-2 gap-4">
                    <SliderField label="Padding X" value="100" unit="px" />
                    <SliderField label="Padding Y" value="40" unit="px" />
                 </div>
              </div>
           </div>
        </section>

        {/* BACKGROUND */}
        <section className="space-y-6 pt-4 border-t border-[var(--border-default)]">
           <SectionHeader icon={<Layers size={16}/>} label="Layer Aesthetics" />
           <div className="flex gap-4">
              {['Solid', 'Gradient', 'Image', 'Video'].map(type => (
                <button 
                  key={type}
                  className={`
                    flex-1 h-11 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all
                    ${theme.background.type.toLowerCase() === type.toLowerCase() ? 'bg-[#00E676]/10 border-[#00E676] text-[#00E676]' : 'bg-[var(--surface-elevated)] border-transparent text-[var(--text-400)] hover:text-[var(--text-100)]'}
                  `}
                >
                  {type}
                </button>
              ))}
           </div>
           {theme.background.type === 'gradient' && (
              <div className="grid grid-cols-2 gap-4">
                 <ColorField label="Start Color" value={theme.background.value} />
                 <ColorField label="End Color" value={theme.background.gradientEnd} />
              </div>
           )}
        </section>

        {/* ADVANCED */}
        <section className="space-y-6 pt-4 border-t border-[var(--border-default)]">
           <SectionHeader icon={<Settings2 size={16}/>} label="Automation & Flow" />
           <div className="grid grid-cols-2 gap-8">
              <ToggleRow label="Auto-resize Text" checked={true} />
              <ToggleRow label="Show Chords" checked={false} />
           </div>
        </section>

      </div>
    </div>
  );
}

function SectionHeader({ icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-3">
       <div className="text-[#00E676] opacity-60">{icon}</div>
       <span className="text-[10px] font-black text-[var(--text-400)] uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

function DropdownField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-2">
       <span className="text-[8px] font-black text-[var(--text-600)] uppercase tracking-widest leading-none">{label}</span>
       <div className="h-11 bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg flex items-center justify-between px-4 text-[11px] font-bold text-[var(--text-100)] cursor-pointer hover:border-[#00E676]/30 transition-all">
          {value}
          <SlidersHorizontal size={12} className="text-[var(--text-600)]" />
       </div>
    </div>
  );
}

function SliderField({ label, value, unit }: { label: string, value: any, unit: string }) {
  return (
    <div className="flex flex-col gap-2">
       <div className="flex justify-between items-center px-1">
          <span className="text-[8px] font-black text-[var(--text-600)] uppercase tracking-widest leading-none">{label}</span>
          <span className="text-[10px] font-black text-[#00E676] tracking-tighter">{value}{unit}</span>
       </div>
       <div className="h-1.5 w-full bg-[var(--surface-base)] rounded-full relative group cursor-pointer overflow-hidden">
          <div className="h-full bg-white/10 rounded-full" style={{ width: '60%' }} />
          <div className="absolute top-0 left-0 h-full bg-[#00E676] shadow-[0_0_10px_#00E676]" style={{ width: '40%' }} />
       </div>
    </div>
  );
}

function ColorField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-2">
       <span className="text-[8px] font-black text-[var(--text-600)] uppercase tracking-widest leading-none">{label}</span>
       <div className="h-11 bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg flex items-center gap-3 px-3 cursor-pointer hover:border-[#00E676]/30 transition-all">
          <div className="w-6 h-6 rounded-md shadow-lg" style={{ backgroundColor: value }} />
          <span className="text-[10px] font-bold text-[var(--text-100)] tracking-widest">{value.toUpperCase()}</span>
       </div>
    </div>
  );
}

function ToggleRow({ label, checked }: { label: string, checked: boolean }) {
  return (
    <div className="flex items-center justify-between h-5">
       <span className="text-[9px] font-black text-[var(--text-400)] uppercase tracking-widest">{label}</span>
       <div className={`w-8 h-4 rounded-full relative transition-all cursor-pointer ${checked ? 'bg-[#00E676]' : 'bg-[var(--surface-elevated)] border border-[var(--border-default)]'}`}>
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'left-4.5 shadow-[0_0_8px_white]' : 'left-0.5 opacity-40'}`} />
       </div>
    </div>
  );
}
