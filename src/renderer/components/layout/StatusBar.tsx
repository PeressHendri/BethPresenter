/**
 * StatusBar — Bottom persistent status bar
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ [◉ LIVE]  Hallelujah — Slide 2/5   │  Output: Live  │  Remote: 3  │
 * └─────────────────────────────────────────────────────────────────────┘
 */
import { usePresentationStore } from '../../stores/presentationStore';
import { Wifi, MonitorPlay } from 'lucide-react';

type OutputStatus = 'live' | 'blank' | 'hidden' | 'off';

function getOutputStatus(isLive: boolean, isBlank: boolean, isHideText: boolean): OutputStatus {
  if (!isLive) return 'off';
  if (isBlank) return 'blank';
  if (isHideText) return 'hidden';
  return 'live';
}

const OUTPUT_CONFIG: Record<OutputStatus, { label: string; dot: string; text: string }> = {
  live:   { label: 'Live',   dot: '#EF4444', text: '#F87171' },
  blank:  { label: 'Blank',  dot: '#6B7280', text: '#9CA3AF' },
  hidden: { label: 'Hidden', dot: '#F59E0B', text: '#FBBF24' },
  off:    { label: 'Off',    dot: '#374151', text: '#6B7280' },
};

export function StatusBar() {
  const {
    currentItems, activeItemIndex, activeSlideIndex,
    isLive, isBlank, isHideText, remoteClientCount,
  } = usePresentationStore();

  const currentItem = currentItems[activeItemIndex];

  /* ── Slide info ───────────────── */
  let titleText = 'No Active Presentation';
  let slideText = '';

  if (currentItem) {
    if (currentItem.type === 'song' && currentItem.song) {
      const lyrics = JSON.parse(currentItem.song.lyricsJson);
      titleText = currentItem.song.title;
      slideText = `${activeSlideIndex + 1} / ${lyrics.length}`;
    } else if (currentItem.type === 'custom') {
      titleText = currentItem.title ?? 'Custom Slide';
      slideText = '1 / 1';
    } else {
      titleText = 'Blank Screen';
      slideText = '–';
    }
  }

  /* ── Output status ─────────────── */
  const outputStatus = getOutputStatus(isLive, isBlank, isHideText);
  const cfg = OUTPUT_CONFIG[outputStatus];

  /* ── Remote status ─────────────── */
  const remoteConnected = remoteClientCount > 0;

  return (
    <div
      id="status-bar"
      className="flex items-center h-6 shrink-0 select-none overflow-hidden"
      style={{
        background: 'var(--surface-sidebar)',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '11px',
        color: 'var(--text-600)',
      }}
    >
      {/* ── Left: Active presentation + slide ─────── */}
      <div className="flex items-center gap-2 px-3 flex-1 min-w-0 overflow-hidden">
        {/* Live indicator dot */}
        {isLive && (
          <span
            className="shrink-0"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#EF4444',
              display: 'inline-block',
              boxShadow: '0 0 4px #EF4444',
              animation: 'livePulse 1.5s ease-in-out infinite',
            }}
          />
        )}
        <span
          className="truncate font-medium"
          style={{ color: currentItem ? 'var(--text-400)' : 'var(--text-600)' }}
        >
          {titleText}
        </span>
        {slideText && (
          <>
            <Divider />
            <span className="shrink-0 font-mono tabular-nums">
              Slide <span style={{ color: 'var(--text-200)', fontWeight: 600 }}>{slideText}</span>
            </span>
          </>
        )}
      </div>

      {/* ── Center: Output status ─────── */}
      <div
        className="flex items-center gap-1.5 px-4 shrink-0"
        style={{ borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}
      >
        <MonitorPlay size={11} style={{ color: cfg.text }} />
        <span style={{ color: cfg.text, fontWeight: 600 }}>Output: {cfg.label}</span>
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: cfg.dot,
            display: 'inline-block',
            ...(outputStatus === 'live' ? { animation: 'livePulse 1.5s ease-in-out infinite' } : {}),
          }}
        />
      </div>

      {/* ── Right: Remote status ─────── */}
      <div className="flex items-center gap-1.5 px-3 shrink-0">
        <Wifi
          size={11}
          style={{ color: remoteConnected ? '#34D399' : 'var(--text-600)' }}
        />
        <span style={{ color: remoteConnected ? '#34D399' : 'var(--text-600)', fontWeight: remoteConnected ? 600 : 400 }}>
          Remote: {remoteConnected ? `${remoteClientCount} client${remoteClientCount > 1 ? 's' : ''}` : 'Disconnected'}
        </span>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <span
      style={{
        width: 1,
        height: 10,
        background: 'var(--border-default)',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  );
}
