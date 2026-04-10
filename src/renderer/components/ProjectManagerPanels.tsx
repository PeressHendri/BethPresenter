import React from 'react';
import { FileText, MoreVertical, Calendar, Hash, FolderOpen } from 'lucide-react';

export function ProjectGrid({ projects, activeId, onSelect }: { projects: any[], activeId: string, onSelect: (id: string) => void }) {
  return (
    <div className="flex-1 flex flex-col bg-[var(--surface-base)] overflow-hidden">
      {/* Header */}
      <div className="p-8 pb-4 flex items-center justify-between">
         <h2 className="text-sm font-black text-[var(--text-100)] uppercase tracking-[0.3em]">Recent Projects</h2>
         <div className="flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="h-9 bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded px-4 text-[10px] text-[var(--text-100)] focus:outline-none focus:border-[#00E676] w-64"
            />
            <div className="text-[10px] font-black text-[var(--text-600)] uppercase tracking-widest cursor-pointer hover:text-[var(--text-100)] transition-all">Sort: Newest First</div>
         </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-8 pt-4 scrollbar-hide">
         <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((p) => (
              <div 
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`
                  group p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-4 relative
                  ${p.id === activeId 
                    ? 'bg-[#00E676]/5 border-[#00E676] shadow-[0_0_20px_rgba(0,230,118,0.1)]' 
                    : 'bg-[var(--surface-primary)] border-transparent hover:border-[var(--border-default)] hover:bg-[var(--surface-hover)]'}
                `}
              >
                <div className="flex items-start justify-between">
                   <div className={`p-3 rounded-xl ${p.id === activeId ? 'bg-[#00E676] text-black' : 'bg-[var(--surface-elevated)] text-[#00E676]'}`}>
                      <FileText size={20} />
                   </div>
                   <button className="text-[var(--text-600)] hover:text-[var(--text-100)]"><MoreVertical size={16} /></button>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-xs font-black text-[var(--text-100)] truncate group-hover:text-[#00E676]">{p.name}</span>
                   <div className="flex items-center gap-2 text-[9px] font-bold text-[var(--text-400)] uppercase tracking-widest mt-1">
                      <Calendar size={10} />
                      <span>{p.modified}</span>
                   </div>
                </div>
                {p.id === activeId && (
                   <div className="absolute inset-0 bg-gradient-to-t from-[#00E676]/5 to-transparent pointer-events-none rounded-2xl" />
                )}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}

export function ProjectPreviewPanel({ project }: { project: any | null }) {
  if (!project) return (
    <div className="w-[340px] bg-[var(--surface-primary)] border-l border-[var(--border-default)] flex items-center justify-center p-12 text-center opacity-20 italic select-none">
       <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[var(--text-100)]">Select a project to inspect files</span>
    </div>
  );

  return (
    <div className="w-[340px] bg-[var(--surface-primary)] border-l border-[var(--border-default)] flex flex-col shrink-0">
      <div className="p-8 border-b border-[var(--border-default)]">
         <h3 className="text-sm font-black text-[var(--text-100)] uppercase tracking-tighter truncate">{project.name}</h3>
         <span className="text-[9px] font-black uppercase text-[var(--text-600)] tracking-widest mt-1 block truncate opacity-50">{project.path}</span>
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto no-scrollbar">
         {/* Live Preview Thumbnail */}
         <div className="aspect-video w-full bg-black rounded-xl border border-[var(--border-default)] flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <div className="text-[10px] font-black uppercase text-[var(--text-800)] tracking-[0.3em]">Project Flow Preview</div>
         </div>

         {/* Inventory Telemetry */}
         <div className="grid grid-cols-2 gap-3">
            <StatBox label="Slides" value={project.counts.slides} />
            <StatBox label="Songs" value={project.counts.songs} />
            <StatBox label="Bible" value={project.counts.scriptures} />
            <StatBox label="Media" value={project.counts.media} />
         </div>

         {/* Action Deck */}
         <div className="space-y-3 pt-4">
            <button className="w-full h-14 bg-[#00E676] text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-[#00E676]/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
               <FolderOpen size={18} />
               Open Project
            </button>
            <div className="grid grid-cols-2 gap-3">
               <SideAction label="Duplicate" />
               <SideAction label="Export" />
               <SideAction label="Trash" danger />
            </div>
         </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: number }) {
  return (
    <div className="p-4 bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-xl">
       <div className="text-[8px] font-black text-[var(--text-600)] uppercase mb-1 tracking-widest">{label}</div>
       <div className="text-xl font-black text-[var(--text-100)]">{value}</div>
    </div>
  );
}

function SideAction({ label, danger }: { label: string, danger?: boolean }) {
  return (
    <button className={`
      w-full h-11 border rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
      ${danger ? 'border-red-900/50 bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white' : 'border-[#333] text-[#888] hover:border-white/20 hover:text-white'}
    `}>
       {label}
    </button>
  );
}
