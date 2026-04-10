import React from 'react';
import { 
  Plus, 
  Trash2, 
  Monitor, 
  Smartphone, 
  Settings, 
  ChevronDown,
  Save,
  MonitorCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header({ 
  activeTab = 'presentation', 
  onOpenOutput,
  onOpenSettings,
  onBlank,
  onAddSong,
  onAddMedia
}: { 
  activeTab?: string, 
  onOpenOutput?: () => void,
  onOpenSettings?: () => void,
  onBlank?: () => void,
  onAddSong?: () => void,
  onAddMedia?: () => void
}) {
  const navigate = useNavigate();
  
  const handleTabClick = (id: string) => {
    // Standardize IDs to paths
    const pathMap: Record<string, string> = {
      'presentation': '/',
      'song-library': '/songs',
      'scripture': '/bible',
      'media': '/media',
      'countdown': '/timer',
      'stage-display': '/stage',
      'project-manager': '/projects',
      'theme-manager': '/themes',
      'backup-restore': '/backup',
      'display-management': '/display',
      'mobile-remote': '/remote',
      'add-scripture': '/add-bible'
    };
    navigate(pathMap[id] || `/${id}`);
  };
  const tabs = [
    { id: 'presentation', label: 'Presentation' },
    { id: 'song-library', label: 'Songs' },
    { id: 'scripture', label: 'Bible' },
    { id: 'media', label: 'Media' },
    { id: 'countdown', label: 'Timer' },
    { id: 'stage-display', label: 'Stage' },
    { id: 'project-manager', label: 'Projects' },
    { id: 'theme-manager', label: 'Themes' },
    { id: 'backup-restore', label: 'Backup' },
    { id: 'display-management', label: 'Display' },
  ];

  return (
    <header className="flex flex-col bg-[var(--surface-primary)] border-b border-[var(--border-default)] select-none shrink-0">
      {/* Top Row: Branding & Global Actions */}
      <div className="h-14 px-4 flex items-center justify-between pb-1">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-tighter text-[var(--text-100)]">BethPresenter</h1>
          
          <div className="flex items-center gap-2 bg-[var(--surface-elevated)] border border-[var(--border-default)] px-3 py-1.5 rounded-md cursor-pointer hover:bg-[var(--surface-hover)] transition-colors">
            <span className="text-xs font-semibold text-[var(--text-200)]">Sunday Morning Service</span>
            <ChevronDown size={14} className="text-[var(--text-400)]" />
          </div>

          <div className="flex items-center gap-0.5 ml-2">
            <IconButton icon={<Save size={16}/>} />
            <IconButton icon={<Plus size={16}/>} />
            <IconButton icon={<Trash2 size={16}/>} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenOutput}
            className="h-9 px-4 rounded bg-[var(--accent-teal)] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[var(--accent-teal)]/20 active:scale-95"
          >
            Go Live
          </button>

          <div className="flex items-center gap-1 border-l border-white/5 pl-4 ml-2">
            <IconButton icon={<Smartphone size={16} />} onClick={() => navigate('/mobile-remote')} />
            <IconButton icon={<Monitor size={16} />} onClick={onOpenOutput} />
            <IconButton icon={<Settings size={16} />} onClick={onOpenSettings} />
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="h-10 px-4 flex items-center gap-1 bg-[var(--surface-base)]/30 border-t border-[var(--border-subtle)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              h-full px-5 flex items-center text-[10px] font-black uppercase tracking-[0.15em] transition-all relative
              ${tab.id === activeTab
                ? 'text-[var(--accent-teal)]' 
                : 'text-[var(--text-400)] hover:text-[var(--text-100)]'}
            `}
          >
            {tab.label}
            {tab.id === activeTab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-teal)] shadow-[0_0_10px_var(--accent-teal)]" />
            )}
          </button>
        ))}
      </div>
      
      {/* Subheader: Action Buttons */}
      <div className="h-14 px-4 flex items-center gap-2 bg-[var(--surface-primary)] border-t border-[var(--border-subtle)]">
        <ActionButton label="Add Song" onClick={onAddSong} />
        <ActionButton label="Add Bible" onClick={() => handleTabClick('add-scripture')} />
        <ActionButton label="Add Media" onClick={onAddMedia} />
        <div className="w-px h-6 bg-[var(--border-default)] mx-2" />
        <ActionButton label="Blank Output" color="text-amber-500" onClick={onBlank} />
        <ActionButton label="Set Standby" color="text-red-500" />
      </div>
    </header>
  );
}

function IconButton({ icon, onClick }: { icon: React.ReactNode, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="p-2 text-[var(--text-400)] hover:text-white hover:bg-[var(--surface-hover)] rounded-md transition-all active:scale-90"
    >
      {icon}
    </button>
  );
}

function ActionButton({ label, onClick, color }: { label: string, onClick?: () => void, color?: string }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 bg-[var(--surface-elevated)] border border-[var(--border-default)] px-4 h-9 rounded-md hover:bg-[var(--surface-hover)] transition-all group active:scale-95"
    >
      <Plus size={14} className={color || "text-[#00D2D2]"} />
      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-200)]">{label}</span>
    </button>
  );
}
