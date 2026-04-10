import React from 'react';
import { 
  Plus, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  ChevronDown,
  Columns,
  Scissors,
  Eraser
} from 'lucide-react';

export function TextEditorPanel() {
  return (
    <div className="w-80 bg-[var(--surface-primary)] border-l border-[var(--border-default)] flex flex-col shrink-0">
      <div className="flex bg-black/20 border-b border-white/5">
         <button className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-[var(--accent-green)] border-b-2 border-[var(--accent-green)]">Content</button>
         <button className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-[var(--text-600)] hover:text-white transition-colors">Style</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col no-scrollbar">
        {/* Lyrical Input */}
        <div className="flex flex-col gap-2">
           <span className="text-[8px] font-black uppercase text-[var(--text-600)] tracking-widest">Lyric Content</span>
           <textarea 
             className="w-full h-40 bg-black/40 border border-white/5 rounded p-3 text-xs leading-relaxed text-white focus:outline-none focus:border-[var(--accent-blue)] transition-all resize-none font-medium"
             defaultValue={"I'M GONNA WAIT ON YOU\nI'M GONNA WAIT ON YOU"}
           />
        </div>

        {/* Formatting Tools */}
        <div className="flex flex-col gap-3">
           <span className="text-[8px] font-black uppercase text-[var(--text-600)] tracking-widest">Text Styling</span>
           <div className="grid grid-cols-5 gap-2">
              <FormatBtn icon={<Bold size={14}/>} />
              <FormatBtn icon={<Italic size={14}/>} />
              <FormatBtn icon={<AlignLeft size={14} />} active />
              <FormatBtn icon={<AlignCenter size={14} />} />
              <FormatBtn icon={<AlignRight size={14} />} />
           </div>
           
           <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between items-center text-[8px] font-bold text-[var(--text-400)]">
                <span>FONT SIZE</span>
                <span>48 PT</span>
              </div>
              <input type="range" className="w-full accent-[var(--accent-blue)]" />
           </div>
        </div>

        {/* Slide Controls */}
        <div className="flex flex-col gap-2 pt-4">
           <span className="text-[8px] font-black uppercase text-[var(--text-600)] tracking-widest">Segmentation</span>
           <div className="grid grid-cols-2 gap-2">
              <SlideToolBtn icon={<Scissors size={14}/>} label="Split Slide" />
              <SlideToolBtn icon={<Columns size={14}/>} label="Set Break" />
              <SlideToolBtn icon={<Eraser size={14}/>} label="Clear Text" />
              <SlideToolBtn icon={<ChevronDown size={14}/>} label="Apply All" />
           </div>
        </div>
      </div>
    </div>
  );
}

function FormatBtn({ icon, active }: { icon: any, active?: boolean }) {
  return (
    <button className={`h-8 flex items-center justify-center rounded border transition-all ${active ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]' : 'bg-white/5 border-white/10 text-[var(--text-600)] hover:text-white'}`}>
       {icon}
    </button>
  );
}

function SlideToolBtn({ icon, label }: { icon: any, label: string }) {
  return (
    <button className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-elevated)] border border-white/5 rounded text-[8px] font-black uppercase tracking-widest text-[var(--text-400)] hover:text-white hover:border-white/20 transition-all">
       {icon}
       {label}
    </button>
  );
}
