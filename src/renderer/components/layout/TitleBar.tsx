/**
 * TitleBar — Custom Electron frameless window title bar
 * macOS-style traffic-light buttons + draggable region
 *
 * Note: -webkit-app-region is applied via CSS class (not inline style)
 * to avoid TypeScript type conflicts.
 */
import { useState, useEffect } from 'react';

/* Add style to head for webkit-app-region (can't be in React inline styles) */
const DRAG_STYLE_ID = 'bp-drag-styles';

function injectDragStyles() {
  if (document.getElementById(DRAG_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = DRAG_STYLE_ID;
  style.textContent = `
    .bp-drag-region    { -webkit-app-region: drag;    }
    .bp-no-drag-region { -webkit-app-region: no-drag; }
  `;
  document.head.appendChild(style);
}

const ipc = () => (window as any).electron?.ipcRenderer;

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    injectDragStyles();
    const off = ipc()?.on('window:maximized-state', (v: boolean) => setIsMaximized(v));
    return () => off?.();
  }, []);

  const minimize = () => ipc()?.invoke('window:minimize');
  const maximize = () => ipc()?.invoke('window:maximize-toggle');
  const close    = () => ipc()?.invoke('window:close');

  return (
    <div
      id="title-bar"
      className="bp-drag-region flex items-center select-none overflow-hidden shrink-0"
      style={{
        height: 36,
        background: 'var(--surface-sidebar)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      {/* ── Traffic-light buttons ─── */}
      <div className="bp-no-drag-region flex items-center gap-2 px-3 shrink-0">
        <TrafficBtn color="#FF5F57" hoverColor="#FF3B30" title="Close"    onClick={close}    symbol="✕" />
        <TrafficBtn color="#FEBC2E" hoverColor="#FF9500" title="Minimize" onClick={minimize}  symbol="–" />
        <TrafficBtn
          color="#28C840"
          hoverColor="#34C759"
          title={isMaximized ? 'Restore' : 'Maximize'}
          onClick={maximize}
          symbol={isMaximized ? '⊡' : '⊞'}
        />
      </div>

      {/* ── App name (center) ─── */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-600)',
          }}
        >
          BethPresenter — Youth Bethlehem
        </span>
      </div>

      {/* ── Version ─── */}
      <div className="px-3 shrink-0">
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          v1.0.0
        </span>
      </div>
    </div>
  );
}

/* ── Traffic Light Button ── */
function TrafficBtn({
  color, hoverColor, symbol, title, onClick,
}: {
  color: string; hoverColor: string; symbol: string; title: string; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: hovered ? hoverColor : color,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.1s',
        fontSize: 7,
        color: 'rgba(0,0,0,0.55)',
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
        padding: 0,
      }}
      aria-label={title}
    >
      {hovered ? symbol : null}
    </button>
  );
}
