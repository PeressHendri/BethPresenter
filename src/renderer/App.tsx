import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AppShell }  from './components/layout/AppShell';
import { Card }       from './components/ui/Card';
import { Button }     from './components/ui/Button';
import { Badge }      from './components/ui/Badge';
import { Songs }      from './routes/Songs';
import { OperatorPanel } from './routes/OperatorPanel';
import { PresentationBuilder } from './routes/PresentationBuilder';
import { Bible }     from './routes/Bible';
import { Media }     from './routes/Media';
import { Settings }  from './routes/Settings';
import { useEffect } from 'react';
import { useThemeStore }        from './stores/themeStore';
import { usePresentationStore } from './stores/presentationStore';
import { Music, BookOpen, Image, MonitorPlay, ArrowRight, Zap, Clock } from 'lucide-react';

/* ─── Dashboard ──────────────────────────────────────────────────────── */
function Dashboard() {
  const navigate = useNavigate();
  const { isLive } = usePresentationStore();

  const cards = [
    {
      icon: Music, iconBg: 'bg-accent-500/20', iconColor: 'text-accent-400',
      label: 'Songs', badge: 'Library',
      desc: 'Kelola perpustakaan lagu, tambah tag, dan buat presentasi ibadah.',
      path: '/songs',
    },
    {
      icon: BookOpen, iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400',
      label: 'Alkitab', badge: '31K ayat',
      desc: 'Browse TB offline. Tampilkan ayat ke proyektor langsung.',
      path: '/bible',
    },
    {
      icon: Image, iconBg: 'bg-purple-500/20', iconColor: 'text-purple-400',
      label: 'Media', badge: 'Library',
      desc: 'Upload foto & video untuk background slide.',
      path: '/media',
    },
    {
      icon: MonitorPlay, iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400',
      label: 'Builder', badge: 'Service',
      desc: 'Susun urutan ibadah dengan drag-and-drop.',
      path: '/builder',
    },
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        {/* Hero */}
        <div className="flex items-start justify-between pt-4">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-widest text-text-600 mb-1">Welcome back</p>
            <h1 className="text-3xl font-extrabold text-text-100 tracking-tight">BethPresenter</h1>
            <p className="text-text-400 text-sm mt-1">Youth Bethlehem Worship Software</p>
          </div>
          <div className="flex gap-2 items-center">
            {isLive && <Badge variant="danger" dot pulse>LIVE</Badge>}
            <Button variant="primary" size="sm" onClick={() => navigate('/builder')} className="gap-1.5">
              <Zap size={14} />
              New Service
            </Button>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Music,    label: 'Songs',    value: '–',   color: 'text-accent-400' },
            { icon: Clock,    label: 'Services', value: '–',   color: 'text-blue-400' },
            { icon: BookOpen, label: 'Bible',    value: 'TB',  color: 'text-emerald-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label} padding className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center shrink-0">
                <Icon size={16} className={color} />
              </div>
              <div>
                <p className="text-2xs text-text-600 font-medium uppercase tracking-widest">{label}</p>
                <p className="text-lg font-bold text-text-100">{value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {cards.map(({ icon: Icon, iconBg, iconColor, label, badge, desc, path }) => (
            <Card
              key={label}
              variant="elevated"
              className="p-5 cursor-pointer group hover:border-[var(--border-strong)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-panel"
              onClick={() => navigate(path)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                  <Icon size={20} className={iconColor} />
                </div>
                <Badge variant="neutral">{badge}</Badge>
              </div>
              <h2 className="text-base font-semibold text-text-100 mb-1">{label}</h2>
              <p className="text-xs text-text-400 leading-relaxed">{desc}</p>
              <div className="flex items-center gap-1 mt-4 text-xs font-medium text-text-400 group-hover:text-accent-400 transition-colors">
                Buka {label} <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Services */}
        <Card>
          <div className="px-5 py-4 border-b border-[var(--border-default)]">
            <h2 className="text-sm font-semibold text-text-100">Recent Services</h2>
          </div>
          <div className="flex items-center justify-center h-20 text-xs text-text-600">
            Belum ada layanan. Buat presentasi pertama Anda!
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

import { ErrorBoundary } from './components/ErrorBoundary';
import { SHORTCUTS, matchesShortcut } from '../shared/shortcuts';

const ipc = (window as any).electron?.ipcRenderer;

/* ─── App ─────────────────────────────────────────────────────────────── */
function AppRoot() {
  const { init } = useThemeStore();

  useEffect(() => {
    init();

    // Global Key Listener for Quick Production Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (matchesShortcut(e, SHORTCUTS.NEXT_SLIDE)) {
         ipc?.invoke('operator:next');
      } else if (matchesShortcut(e, SHORTCUTS.PREV_SLIDE)) {
         ipc?.invoke('operator:prev');
      } else if (matchesShortcut(e, SHORTCUTS.TOGGLE_BLANK)) {
         ipc?.invoke('output:blank');
      } else if (matchesShortcut(e, SHORTCUTS.TOGGLE_HIDE_TEXT)) {
         ipc?.invoke('output:hideText');
      } else if (matchesShortcut(e, SHORTCUTS.BLACK_SCREEN)) {
         ipc?.invoke('output:black');
      } else if (matchesShortcut(e, SHORTCUTS.FULLSCREEN)) {
         ipc?.invoke('output:toggleFullscreen');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [init]);

  return (
    <Router>
      <Routes>
        <Route path="/"        element={<Dashboard />} />
        <Route path="/songs"   element={<Songs />} />
        <Route path="/builder" element={<PresentationBuilder />} />
        <Route path="/operator" element={<OperatorPanel />} />
        <Route path="/bible"   element={<Bible />} />
        <Route path="/media"   element={<Media />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
     <ErrorBoundary>
        <AppRoot />
     </ErrorBoundary>
  );
}
