import React from 'react';
import { 
  Plus, 
  Trash2, 
  Monitor, 
  Smartphone, 
  Settings, 
  ChevronDown,
  MonitorCheck,
  Search,
  Download,
  UploadCloud,
  Layers,
  Clock
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';

export function HeaderBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'presentation', label: 'Presentation', path: '/' },
    { id: 'songs',         label: 'Songs',        path: '/songs' },
    { id: 'bible',         label: 'Bible',        path: '/bible' },
    { id: 'media',         label: 'Media',        path: '/media' },
    { id: 'builder',       label: 'Builder',      path: '/builder' },
    { id: 'stage',         label: 'Stage',        path: '/stage' },
  ];

  const handleOpenOutput = () => {
    if ((window as any).electron?.ipcRenderer) {
      (window as any).electron.ipcRenderer.invoke('output-open');
    }
  };

  // Dynamic Actions based on path
  const renderContextActions = () => {
    const path = location.pathname;
    
    if (path.startsWith('/songs')) {
      return (
        <>
          <Button variant="secondary" size="xs" onClick={() => navigate('/song-editor')} className="px-4">
            <Plus size={14} className="text-[var(--accent-teal)]" /> New Song
          </Button>
          <Button variant="secondary" size="xs" className="px-4">
             <UploadCloud size={14} /> Import CSV
          </Button>
          <Button variant="secondary" size="xs" className="px-4">
             <Download size={14} /> Backup
          </Button>
        </>
      );
    }
    
    if (path.startsWith('/bible')) {
      return (
        <>
          <Button variant="secondary" size="xs" onClick={() => navigate('/add-bible')} className="px-4">
            <Plus size={14} className="text-[var(--accent-teal)]" /> Add Bible
          </Button>
          <div className="flex items-center bg-black/20 border border-white/10 rounded-lg px-3 h-8 ml-2">
             <Search size={14} className="text-[var(--text-400)] mr-2" />
             <input type="text" placeholder="Search scripture..." className="bg-transparent border-none outline-none text-[10px] w-40 text-white" />
          </div>
        </>
      );
    }

    if (path.startsWith('/media')) {
      return (
        <>
          <Button variant="secondary" size="xs" onClick={() => navigate('/add-media')} className="px-4">
            <Plus size={14} className="text-[var(--accent-teal)]" /> Add Media
          </Button>
          <Button variant="secondary" size="xs" className="px-4">
             <Layers size={14} /> Manage Backgrounds
          </Button>
        </>
      );
    }

    // Default Presentation Actions
    return (
      <>
        <Button variant="secondary" size="xs" onClick={() => navigate('/song-editor')} className="px-4">
          <Plus size={14} className="text-[var(--accent-teal)]" /> Add Song
        </Button>
        <Button variant="secondary" size="xs" onClick={() => navigate('/add-bible')} className="px-4">
          <Plus size={14} className="text-[var(--accent-teal)]" /> Add Bible
        </Button>
        <Button variant="secondary" size="xs" onClick={() => navigate('/add-media')} className="px-4">
          <Plus size={14} className="text-[var(--accent-teal)]" /> Add Media
        </Button>
        <div className="w-px h-6 bg-[var(--border-subtle)] mx-2" />
        <Button variant="ghost" size="xs" onClick={() => navigate('/timer')} className="px-4 text-[var(--text-400)]">
          <Clock size={14} className="mr-1" /> Add Timer
        </Button>
      </>
    );
  };

  return (
    <header className="flex flex-col bg-[var(--surface-primary)] border-b border-[var(--border-default)] select-none shrink-0 z-50 shadow-xl">
      {/* Tier 1: Branding */}
      <div className="h-16 px-6 flex items-center justify-between bp-drag-region">
        <div className="flex items-center gap-8 bp-no-drag-region">
          <div className="flex flex-col -gap-1 cursor-pointer" onClick={() => navigate('/landing')}>
             <h1 className="text-xl font-black tracking-tighter text-white">BethPresenter</h1>
             <span className="text-[9px] font-bold text-[var(--accent-500)] uppercase tracking-[0.2em] leading-none">Worship Edition</span>
          </div>
          
          <div className="flex items-center gap-2 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-4 py-2 rounded-xl cursor-pointer hover:bg-[var(--surface-hover)] transition-all">
            <span className="text-[11px] font-bold text-[var(--text-200)]">Sunday Morning Service</span>
            <ChevronDown size={14} className="text-[var(--text-400)]" />
          </div>
        </div>

        <div className="flex items-center gap-5 bp-no-drag-region">
          <Button 
            variant="accent" 
            size="sm" 
            onClick={handleOpenOutput}
          >
            <MonitorCheck size={16} />
            Go Live
          </Button>
          
          <div className="flex items-center gap-1 text-[var(--text-400)] border-l border-[var(--border-subtle)] pl-5">
            <HeaderIconButton icon={<Smartphone size={18}/>} onClick={() => navigate('/remote')} tooltip="Remote Control" />
            <HeaderIconButton icon={<Monitor size={18}/>} onClick={handleOpenOutput} tooltip="Second Screen" />
            <HeaderIconButton icon={<Settings size={18}/>} onClick={() => navigate('/settings')} tooltip="Settings" />
          </div>
        </div>
      </div>

      {/* Tier 2: Tabs */}
      <div className="h-11 px-6 flex items-center gap-1 border-t border-[var(--border-subtle)] bg-[var(--surface-base)]/50 backdrop-blur-sm">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`
                h-full px-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] transition-all relative group
                ${isActive 
                  ? 'text-[var(--accent-teal)]' 
                  : 'text-[var(--text-400)] hover:text-white'}
              `}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--accent-teal)] shadow-[0_-4px_12px_var(--accent-teal)] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Tier 3: Contextual Actions */}
      <div className="h-14 px-6 flex items-center gap-3 bg-[var(--surface-primary)] border-t border-[var(--border-subtle)]">
        {renderContextActions()}
      </div>
    </header>
  );
}

function HeaderIconButton({ icon, tooltip, onClick }: { icon: React.ReactNode; tooltip?: string, onClick?: () => void }) {
  return (
    <button 
      title={tooltip}
      onClick={onClick}
      className="p-2 text-[var(--text-400)] hover:text-white hover:bg-[var(--surface-hover)] rounded-xl transition-all active:scale-90 active:bg-[var(--surface-base)]"
    >
      {icon}
    </button>
  );
}
