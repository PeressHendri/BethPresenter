/**
 * AppShell — Master layout shell for BethPresenter
 *
 * Structure:
 * ┌──────────────────────────────────────────────┐
 * │ TitleBar (36px, frameless/drag region)        │
 * ├──────┬───────────────────────────────────────┤
 * │      │                                       │
 * │  S   │   Main Content                        │
 * │  i   │   (flex-1, overflow-y-auto)           │
 * │  d   │                                       │
 * │  e   ├───────────────────────────────────────┤
 * │  b   │ ControlBar (64px, fixed bottom)       │
 * │  a   │                                       │
 * │  r   ├───────────────────────────────────────┤
 * └──────┴ StatusBar (24px)                      ┘
 *
 * The sidebar width is reactive via useShellStore.
 */
import { useState } from 'react';
import { TitleBar }   from './TitleBar';
import { Sidebar }    from './Sidebar';
import { StatusBar }  from './StatusBar';
import { ControlBar } from '../ControlBar';
import { FormattingPanel } from '../formatting/FormattingPanel';
import { CountdownTimer }  from '../CountdownTimer';
import { useShellStore }   from '../../stores/shellStore';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { sidebarExpanded } = useShellStore();
  const [showFormatting, setShowFormatting] = useState(false);
  const [showTimer,      setShowTimer]      = useState(false);

  const toggleFormatting = () => { setShowTimer(false); setShowFormatting((p) => !p); };
  const toggleTimer      = () => { setShowFormatting(false); setShowTimer((p) => !p); };

  /* Sidebar width for ControlBar left offset */
  const sidebarW = sidebarExpanded ? 200 : 56;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--surface-primary)',
      }}
    >
      {/* ── TitleBar ───────────────────────────────────────────── */}
      <TitleBar />

      {/* ── Body (sidebar + content) ────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Sidebar */}
        <Sidebar onOpenFormatting={toggleFormatting} onOpenTimer={toggleTimer} />

        {/* Content column */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {/* Main content area + right panels */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              overflow: 'hidden',
              minHeight: 0,
              /* Space for ControlBar at bottom */
              paddingBottom: 64,
            }}
          >
            {/* Page content */}
            <main
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '20px',
                minWidth: 0,
              }}
            >
              {children}
            </main>

            {/* Formatting Panel (slide-in from right) */}
            {showFormatting && (
              <div
                style={{
                  flexShrink: 0,
                  borderLeft: '1px solid var(--border-default)',
                  animation: 'slideInRight 0.25s cubic-bezier(0,0,0.2,1)',
                }}
              >
                <FormattingPanel isOpen={showFormatting} onClose={() => setShowFormatting(false)} />
              </div>
            )}

            {/* Timer Panel (slide-in from right) */}
            {showTimer && (
              <div
                style={{
                  flexShrink: 0,
                  borderLeft: '1px solid var(--border-default)',
                  animation: 'slideInRight 0.25s cubic-bezier(0,0,0.2,1)',
                }}
              >
                <CountdownTimer onClose={() => setShowTimer(false)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ControlBar (fixed bottom, offset by sidebar width) ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 24, /* above StatusBar */
          left: sidebarW,
          right: 0,
          height: 64,
          zIndex: 1030,
          transition: 'left 220ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <ControlBar />
      </div>

      {/* ── StatusBar (always at very bottom) ──────────────────── */}
      <StatusBar />
    </div>
  );
}
