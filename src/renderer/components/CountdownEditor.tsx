import React from 'react';
import { Type, Image as ImageIcon, Palette, Layout, Save, RotateCcw, Copy, Trash2 } from 'lucide-react';
import { TimePicker } from './TimePicker';

export function CountdownEditor({ 
  template, 
  onSave 
}: { 
  template: any, 
  onSave: (t: any) => void 
}) {
  return (
    <div className="flex-1 flex flex-col bg-[#0A0C10] overflow-hidden overflow-y-auto">
      <div className="p-8 flex flex-col gap-10 max-w-[900px] mx-auto w-full">
        
        {/* TOP: Temporal Hub */}
        <TimePicker duration={template?.duration || 0} onUpdate={() => {}} />

        {/* MIDDLE: Visual Stylist Panels */}
        <div className="grid grid-cols-2 gap-6">
          {/* Style Controls */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-green)] border-b border-white/5 pb-2">Styling</h3>
            
            <div className="grid grid-cols-2 gap-3">
               <StyleGridBtn icon={<Palette size={16}/>} label="Background" />
               <StyleGridBtn icon={<Type size={16}/>} label="Font Face" />
               <StyleGridBtn icon={<ImageIcon size={16}/>} label="Overlay" />
               <StyleGridBtn icon={<Layout size={16}/>} label="Alignment" />
            </div>

            <div className="flex flex-col gap-2 mt-4">
               <span className="text-[10px] font-bold text-[var(--text-400)]">Font Size</span>
               <input type="range" className="w-full accent-[var(--accent-green)]" />
            </div>
          </div>

          {/* Real-time Preview Area */}
          <div className="flex flex-col gap-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-400)] border-b border-white/5 pb-2">Live Preview</h3>
             <div className="relative aspect-video rounded-lg bg-black border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                <div 
                  className="absolute inset-0 opacity-40 bg-cover bg-center"
                  style={{ backgroundImage: `url(media:///Users/mac/.gemini/antigravity/brain/cf3b98ec-4448-4e7a-8f01-3c8b866cfa3c/dark_forest_background_1775749896276.png)` }}
                />
                <span className="text-4xl font-black text-white z-10 drop-shadow-lg tracking-tighter">04:59</span>
             </div>
          </div>
        </div>

        {/* BOTTOM: Action Bar */}
        <div className="flex items-center justify-between pt-10 border-t border-white/5">
           <div className="flex gap-2">
              <ActionBtn icon={<Save size={16}/>} label="Save Template" primary />
              <ActionBtn icon={<RotateCcw size={16}/>} label="Reset" />
           </div>
           <div className="flex gap-2">
              <ActionBtn icon={<Copy size={16}/>} label="Duplicate" />
              <ActionBtn icon={<Trash2 size={16}/>} label="Delete" danger />
           </div>
        </div>

      </div>
    </div>
  );
}

function StyleGridBtn({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex flex-col items-center justify-center gap-2 p-4 bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-md hover:border-[var(--accent-green)] transition-all">
       <div className="text-[var(--text-400)]">{icon}</div>
       <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-600)]">{label}</span>
    </button>
  );
}

function ActionBtn({ icon, label, primary, danger }: { icon: React.ReactNode, label: string, primary?: boolean, danger?: boolean }) {
  return (
    <button className={`
      flex items-center gap-2 px-5 h-10 rounded font-black text-[10px] uppercase tracking-widest transition-all
      ${primary ? 'bg-[var(--accent-green)] text-black shadow-lg shadow-[var(--success-glow)]' : 
        danger ? 'bg-red-600 text-white shadow-lg' : 'bg-transparent border border-[var(--border-default)] text-[var(--text-400)] hover:text-white'}
    `}>
       {icon}
       {label}
    </button>
  );
}
