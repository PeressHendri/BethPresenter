import React from 'react';
import { Search, Plus, FolderPlus, Trash2, Filter, Presentation } from 'lucide-react';

export function MediaSearchBar({ onImportPPT }: { onImportPPT?: () => void }) {
  return (
    <div className="flex flex-col bg-[var(--surface-primary)] border-b border-[var(--border-default)] shrink-0">
      <div className="p-4 flex flex-col gap-4">
        {/* Row 1: Search & Core Actions */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-400)] group-focus-within:text-[var(--accent-green)] transition-all" />
            <input 
              type="text" 
              placeholder="Search images, videos, backgrounds..."
              className="w-full h-11 bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-md pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[var(--accent-green)] transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <MediaActionBtn icon={<Plus size={18}/>} label="Add Media" primary />
            <MediaActionBtn 
              icon={<Presentation size={18}/>} 
              label="Import PPT" 
              onClick={onImportPPT}
            />
            <MediaActionBtn icon={<FolderPlus size={18}/>} label="New Folder" />
            <div className="w-px h-6 bg-[var(--border-default)] mx-1" />
            <button className="p-2.5 text-[var(--text-400)] hover:text-red-500 transition-colors">
              <Trash2 size={20} />
            </button>
            <button className="p-2.5 text-[var(--text-400)] hover:text-white transition-colors border border-[var(--border-default)] rounded-md">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Row 2: Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-400)]">
           <span className="hover:text-[var(--accent-green)] cursor-pointer">/ Media Library</span>
           <span className="text-[var(--text-600)]">/</span>
           <span className="hover:text-[var(--accent-green)] cursor-pointer">Backgrounds</span>
           <span className="text-[var(--text-600)]">/</span>
           <span className="text-white">Motion</span>
        </div>
      </div>
    </div>
  );
}

function MediaActionBtn({ icon, label, primary, onClick }: { icon: React.ReactNode, label: string, primary?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
      flex items-center gap-2 h-11 px-4 rounded-md font-black text-[10px] uppercase tracking-widest transition-all
      ${primary 
        ? 'bg-[var(--accent-green)] text-black hover:scale-105 shadow-lg shadow-[var(--success-glow)]' 
        : 'bg-[var(--surface-elevated)] text-[var(--text-200)] border border-[var(--border-default)] hover:bg-[var(--surface-hover)]'}
    `}>
      {icon}
      {label}
    </button>
  );
}
