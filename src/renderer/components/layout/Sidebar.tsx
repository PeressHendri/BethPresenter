/**
 * Sidebar — Collapsible icon-rail sidebar (Framer Motion edition)
 *
 * Collapsed (56px): icons only + AnimatePresence tooltip on hover
 * Expanded (200px): icons + labels with staggered fade-in
 */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Music, BookOpen, MonitorPlay,
  Image, Type, Settings, PanelLeftClose, PanelLeftOpen,
  Wifi, Radio, Timer,
} from 'lucide-react';
import logo from '../../assets/logo.png';
import { usePresentationStore } from '../../stores/presentationStore';
import { useShellStore }        from '../../stores/shellStore';

/* ── Types ─────────────────────────────────────────────────────── */
interface NavItem {
  id:      string;
  icon:    React.ElementType;
  label:   string;
  path:    string;
  badge?:  number;
  action?: () => void;
}

interface NavGroup {
  id:     string;
  label?: string;
  items:  NavItem[];
}

interface SidebarProps {
  onOpenFormatting?: () => void;
  onOpenTimer?:      () => void;
}

/* ── Constants ──────────────────────────────────────────────────── */
const W_COLLAPSED = 56;
const W_EXPANDED  = 200;

/* ── Framer variants ────────────────────────────────────────────── */
const sidebarVariants = {
  collapsed: { width: W_COLLAPSED },
  expanded:  { width: W_EXPANDED  },
};

const labelVariants = {
  collapsed: { opacity: 0, x: -4, width: 0      },
  expanded:  { opacity: 1, x:  0, width: 'auto' },
};

const groupLabelVariants = {
  collapsed: { opacity: 0, height: 0, marginBottom: 0 },
  expanded:  { opacity: 1, height: 'auto', marginBottom: 4 },
};

const tooltipVariants = {
  hidden:  { opacity: 0, x: -4, scale: 0.95 },
  visible: { opacity: 1, x:  0, scale: 1    },
};

/* ── Sidebar ────────────────────────────────────────────────────── */
export function Sidebar({ onOpenFormatting, onOpenTimer }: SidebarProps) {
  const location = useLocation();
  const { sidebarExpanded, toggleSidebar } = useShellStore();
  const { isLive, endLive, remoteClientCount, setRemoteClientCount } = usePresentationStore();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const t = setInterval(tick, 1000);
    const off = (window as any).electron?.ipcRenderer?.on(
      'remote:client-count',
      (n: number) => setRemoteClientCount(n)
    );
    return () => { clearInterval(t); off?.(); };
  }, [setRemoteClientCount]);

  const NAV_GROUPS: NavGroup[] = [
    {
      id: 'main',
      items: [
        { id: 'dashboard',     icon: LayoutDashboard, label: 'Dashboard', path: '/'        },
        { id: 'songs',         icon: Music,           label: 'Songs',     path: '/songs'   },
        { id: 'bible',         icon: BookOpen,        label: 'Alkitab',   path: '/bible'   },
        { id: 'presentations', icon: MonitorPlay,     label: 'Builder',   path: '/builder' },
        { id: 'media',         icon: Image,           label: 'Media',     path: '/media'   },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      items: [
        { id: 'formatting', icon: Type,     label: 'Formatting', path: '#', action: onOpenFormatting },
        { id: 'timer',      icon: Timer,    label: 'Timer',      path: '#', action: onOpenTimer      },
        { id: 'settings',   icon: Settings, label: 'Settings',   path: '/settings'                  },
      ],
    },
  ];

  const state = sidebarExpanded ? 'expanded' : 'collapsed';

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={state}
      initial={false}
      transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.8 }}
      style={{
        height: '100%',
        background: 'var(--surface-sidebar)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        userSelect: 'none',
        willChange: 'width',
      }}
    >
      {/* ── Brand ──────────────────────────────────────────────── */}
      <BrandHeader expanded={sidebarExpanded} onToggle={toggleSidebar} state={state} />

      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.id}>
            {gi > 0 && (
              <div style={{ padding: '4px 0 2px' }}>
                {sidebarExpanded ? (
                  <motion.p
                    variants={groupLabelVariants}
                    animate={state}
                    initial={false}
                    transition={{ duration: 0.18, delay: 0.05 }}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      padding: '6px 16px 2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    }}
                  >
                    {group.label}
                  </motion.p>
                ) : (
                  <div style={{ height: 1, background: 'var(--border-default)', margin: '6px 12px' }} />
                )}
              </div>
            )}

            {group.items.map((item) => {
              const isActive = item.path !== '#' && location.pathname === item.path;
              return (
                <NavItemRow
                  key={item.id}
                  item={item}
                  active={isActive}
                  expanded={sidebarExpanded}
                  state={state}
                />
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Status Footer ─────────────────────────────────────── */}
      <SidebarFooter
        expanded={sidebarExpanded}
        state={state}
        isLive={isLive}
        endLive={endLive}
        remoteCount={remoteClientCount}
        timeStr={timeStr}
      />
    </motion.aside>
  );
}

/* ── BrandHeader ────────────────────────────────────────────────── */
function BrandHeader({
  expanded, onToggle,
}: { expanded: boolean; onToggle: () => void; state: string }) {
  return (
    <div
      style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-default)',
        padding: '0 10px',
        gap: 10,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: 'rgba(255,255,255,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
      </div>

      {/* App name — fade in when expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="brand-name"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18, delay: 0.06 }}
            style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-100)', lineHeight: 1.2 }}>
              BethPresenter
            </p>
            <p style={{ fontSize: 10, color: 'var(--text-600)', marginTop: 1 }}>
              Youth Bethlehem
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          border: '1px solid var(--border-default)',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-600)',
          flexShrink: 0,
        }}
        title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {expanded
          ? <PanelLeftClose size={13} />
          : <PanelLeftOpen  size={13} />
        }
      </motion.button>
    </div>
  );
}

/* ── NavItemRow ─────────────────────────────────────────────────── */
function NavItemRow({
  item, active, expanded,
}: {
  item: NavItem; active: boolean; expanded: boolean; state: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const Icon = item.icon;

  const bg          = active ? 'rgba(192,57,43,0.15)' : 'transparent';
  const borderColor = active ? 'var(--accent-500)'    : 'transparent';

  const inner = (
    <motion.div
      onHoverStart={() => { if (!expanded) setTimeout(() => setShowTooltip(true), 350); }}
      onHoverEnd={() => setShowTooltip(false)}
      whileHover={{ backgroundColor: active ? 'rgba(192,57,43,0.18)' : 'var(--surface-hover)' }}
      whileTap={{ scale: 0.97 }}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: expanded ? '8px 10px' : '8px 0',
        margin: '1px 6px',
        borderRadius: 8,
        cursor: 'pointer',
        background: bg,
        borderLeft: `3px solid ${borderColor}`,
        justifyContent: expanded ? 'flex-start' : 'center',
        overflow: 'visible',
      }}
      transition={{ duration: 0.12 }}
    >
      {/* Icon */}
      <span
        style={{
          color: active ? 'var(--accent-400)' : 'var(--text-400)',
          flexShrink: 0,
          display: 'flex',
          transition: 'color 0.15s',
        }}
      >
        <Icon size={18} />
      </span>

      {/* Label — animate in/out */}
      <AnimatePresence>
        {expanded && (
          <motion.span
            key="label"
            variants={labelVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            transition={{ duration: 0.16, delay: 0.04 }}
            style={{
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              color: active ? 'var(--text-100)' : 'var(--text-400)',
              whiteSpace: 'nowrap',
              flex: 1,
              overflow: 'hidden',
            }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badge */}
      <AnimatePresence>
        {expanded && item.badge !== undefined && item.badge > 0 && (
          <motion.span
            key="badge"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            style={{
              marginLeft: 'auto',
              background: 'var(--accent-600)',
              color: '#fff',
              fontSize: 9,
              fontWeight: 700,
              borderRadius: 8,
              padding: '1px 5px',
              minWidth: 16,
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            {item.badge > 99 ? '99+' : item.badge}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Floating tooltip (collapsed only) */}
      <AnimatePresence>
        {showTooltip && !expanded && (
          <motion.div
            key="tooltip"
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute',
              left: 'calc(100% + 10px)',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-strong)',
              borderRadius: 8,
              padding: '5px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-200)',
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-md)',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            {item.label}
            {/* Arrow */}
            <span
              style={{
                position: 'absolute',
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                borderWidth: '4px 4px 4px 0',
                borderStyle: 'solid',
                borderColor: 'transparent var(--border-strong) transparent transparent',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (item.action) {
    return (
      <button
        onClick={item.action}
        style={{ width: '100%', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link to={item.path} style={{ display: 'block', textDecoration: 'none' }}>
      {inner}
    </Link>
  );
}

/* ── SidebarFooter ──────────────────────────────────────────────── */
function SidebarFooter({
  expanded, isLive, endLive, remoteCount, timeStr,
}: {
  expanded: boolean;
  state:    string;
  isLive:   boolean;
  endLive:  () => void;
  remoteCount: number;
  timeStr:  string;
}) {
  return (
    <div
      style={{
        borderTop: '1px solid var(--border-default)',
        padding: '10px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        flexShrink: 0,
        background: 'rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}
    >
      {/* Live + Wi-Fi row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'space-between' : 'center',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <motion.span
            animate={isLive
              ? { scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }
              : { scale: 1, opacity: 1 }}
            transition={isLive
              ? { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
              : {}}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: isLive ? '#EF4444' : '#374151',
              display: 'inline-block',
              boxShadow: isLive ? '0 0 6px #EF4444' : 'none',
              flexShrink: 0,
            }}
          />
          <AnimatePresence>
            {expanded && (
              <motion.span
                key="live-label"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isLive ? '#F87171' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {isLive ? 'Live' : 'Offline'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div title={`${remoteCount} remote client(s)`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Wifi size={13} style={{ color: remoteCount > 0 ? '#34D399' : 'var(--text-muted)', flexShrink: 0 }} />
          <AnimatePresence>
            {expanded && (
              <motion.span
                key="wifi-count"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ fontSize: 10, fontWeight: 600, color: remoteCount > 0 ? '#34D399' : 'var(--text-muted)' }}
              >
                {remoteCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* End Live button */}
      <AnimatePresence>
        {isLive && expanded && (
          <motion.button
            key="end-live"
            initial={{ opacity: 0, y: 6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 4, height: 0 }}
            transition={{ duration: 0.18 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={endLive}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '6px',
              borderRadius: 8,
              border: '1px solid rgba(220,38,38,0.5)',
              background: 'rgba(220,38,38,0.15)',
              color: '#F87171',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <Radio size={11} />
            End Live
          </motion.button>
        )}
      </AnimatePresence>

      {/* Clock */}
      <motion.div
        animate={{ fontSize: expanded ? 18 : 12 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        style={{
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          color: 'var(--text-200)',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}
      >
        {timeStr}
      </motion.div>
    </div>
  );
}
