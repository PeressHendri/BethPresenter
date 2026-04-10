import React from 'react';
import { Settings, Maximize2, Palette, Type, AlignLeft, Layers as LayersIcon, Eye, Move } from 'lucide-react';

export function StageCanvas({ widgets, selectedId, onSelect }: { widgets: any[], selectedId: string | null, onSelect: (id: string) => void }) {
  return (
    <div className="flex-1 bg-black rounded-xl border border-white/5 shadow-2xl relative overflow-hidden group select-none flex items-center justify-center">
      {/* 16:9 Aspect Container */}
      <div className="w-full aspect-video bg-[#050505] relative shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        
        {/* Safe Area Guides */}
        <div className="absolute inset-[10%] border border-white/5 border-dashed pointer-events-none">
           <span className="absolute -top-4 left-0 text-[8px] font-black text-[var(--text-600)] uppercase tracking-widest opacity-30">Safe Area (90%)</span>
        </div>

        {/* Widgets Render Loop */}
        {widgets.map((w) => (
          <div 
            key={w.id}
            onClick={(e) => { e.stopPropagation(); onSelect(w.id); }}
            className={`
              absolute flex items-center justify-center border-2 transition-all cursor-move
              ${w.id === selectedId 
                ? 'border-[var(--accent-green)] bg-[var(--accent-green)]/5 z-20' 
                : 'border-white/10 hover:border-white/30 z-10'}
            `}
            style={{ 
              left: `${w.x}%`, 
              top: `${w.y}%`, 
              width: `${w.w}%`, 
              height: `${w.h}%` 
            }}
          >
            {/* Widget Content Mock */}
            <div className="flex flex-col items-center">
               <span className="text-[8px] font-black text-[var(--accent-blue)] uppercase tracking-widest mb-1 opacity-50">{w.label}</span>
               <div className="text-white font-black text-center" style={{ fontSize: `${w.style.fontSize / 3}px` }}>
                  {w.type === 'clock' ? '09:53:21' : 
                   w.type === 'timer' ? '04:59' : 
                   w.id === selectedId ? '[Widget Active]' : 'PREVIEW TEXT'}
               </div>
            </div>

            {/* Selection Handles */}
            {w.id === selectedId && (
              <>
                <div className="absolute top-0 right-0 w-2 h-2 bg-[var(--accent-green)] -mr-1 -mt-1 cursor-nesw-resize" />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-[var(--accent-green)] -mr-1 -mb-1 cursor-nwse-resize" />
                <div className="absolute top-0 left-0 w-2 h-2 bg-[var(--accent-green)] -ml-1 -mt-1 cursor-nwse-resize" />
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-[var(--accent-green)] -ml-1 -mb-1 cursor-nesw-resize" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function WidgetInspector({ widget }: { widget: any }) {
  if (!widget) return (
    <div className="w-72 bg-[var(--surface-primary)] border-l border-[var(--border-default)] flex flex-col items-center justify-center p-8 text-center opacity-30 italic select-none">
       <Settings size={32} className="mb-4 text-[var(--text-600)]" />
       <p className="text-[10px] uppercase font-black tracking-widest leading-loose">Select a widget on the canvas to inspect its properties</p>
    </div>
  );

  return (
    <div className="w-72 bg-[var(--surface-primary)] border-l border-[var(--border-default)] flex flex-col shrink-0 overflow-y-auto no-scrollbar select-none">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-blue)]">Inspector</h3>
         <button className="text-[var(--text-600)] hover:text-white"><Eye size={16}/></button>
      </div>

      <div className="p-4 space-y-6">
        {/* Identity Section */}
        <div className="flex flex-col gap-2">
           <span className="text-[8px] font-black text-[var(--text-600)] uppercase tracking-widest">Active Widget</span>
           <div className="text-xs font-bold text-white px-2 py-1.5 bg-white/5 rounded border border-white/5">{widget.label}</div>
        </div>

        {/* Styling Section */}
        <InspectorSection title="Typography" icon={<Type size={12}/>}>
           <div className="space-y-4">
              <InspectorControl label="Size" type="slider" />
              <div className="flex gap-2">
                 <InspectorActionBtn icon={<AlignLeft size={16}/>} active />
                 <InspectorActionBtn icon={<Palette size={16}/>} />
                 <InspectorActionBtn icon={<LayersIcon size={16}/>} />
              </div>
           </div>
        </InspectorSection>

        <InspectorSection title="Positioning" icon={<Move size={12}/>}>
           <div className="grid grid-cols-2 gap-3">
              <InspectorInput label="X Pos" value={`${widget.x}%`} />
              <InspectorInput label="Y Pos" value={`${widget.y}%`} />
           </div>
        </InspectorSection>
      </div>
    </div>
  );
}

function InspectorSection({ title, icon, children }: { title: string, icon: any, children: any }) {
  return (
    <div className="flex flex-col gap-3">
       <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <span className="text-[var(--text-400)]">{icon}</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-400)]">{title}</span>
       </div>
       {children}
    </div>
  );
}

function InspectorControl({ label }: { label: string, type: string }) {
  return (
    <div className="flex flex-col gap-2">
       <span className="text-[8px] font-black uppercase text-[var(--text-600)]">{label}</span>
       <input type="range" className="w-full accent-[var(--accent-green)]" />
    </div>
  );
}

function InspectorInput({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex-1 flex flex-col gap-1.5">
       <span className="text-[8px] font-black uppercase text-[var(--text-600)]">{label}</span>
       <div className="px-2 py-1.5 bg-black/40 rounded border border-white/5 text-[10px] font-bold text-white tabular-nums">{value}</div>
    </div>
  );
}

function InspectorActionBtn({ icon, active }: { icon: any, active?: boolean }) {
  return (
    <button className={`flex-1 h-9 rounded flex items-center justify-center border transition-all ${active ? 'bg-[var(--accent-green)] text-black border-[var(--accent-green)]' : 'bg-white/5 border-white/10 text-[var(--text-400)] hover:text-white'}`}>
       {icon}
    </button>
  );
}
