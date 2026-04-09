import React, { useState } from 'react';
import {
  SkipBack, SkipForward, Square, EyeOff, Maximize, AlertTriangle,
  Type, Image, Layers, Keyboard,
} from 'lucide-react';
import { usePresentationStore } from '../stores/presentationStore';
import { Button }   from './ui/Button';
import { Tooltip }  from './ui/Tooltip';
import { Badge }    from './ui/Badge';
import { Separator } from './ui/Separator';
import { useHotkeyConfig, useHotkeyListener } from '../hooks/useHotkeyConfig';
import { HotkeyConfigModal } from './HotkeyConfigModal';

/* ─── ClearButton ────────────────────────────────────────────────────── */
function ClearBtn({
  label,
  title,
  icon: Icon,
  onClick,
  hotkey,
  danger = false,
}: {
  label: string;
  title: string;
  icon:  React.ElementType;
  onClick: () => void;
  hotkey?: string;
  danger?: boolean;
}) {
  return (
    <Tooltip content={`${title}${hotkey ? ` [${hotkey.toUpperCase()}]` : ''}`} side="top">
      <button
        onClick={onClick}
        className={[
          'flex flex-col items-center justify-center gap-0.5',
          'w-14 h-12 rounded-lg border transition-all duration-150',
          'text-2xs font-semibold uppercase tracking-widest',
          'active:scale-95',
          danger
            ? 'border-danger/40 text-danger-400 hover:bg-danger/15 hover:border-danger/60'
            : 'border-[var(--border-default)] text-text-400 hover:bg-surface-hover hover:text-text-200 hover:border-[var(--border-strong)]',
        ].join(' ')}
        title={title}
      >
        <Icon size={15} />
        <span>{label}</span>
      </button>
    </Tooltip>
  );
}

/* ─── ControlBar ─────────────────────────────────────────────────────── */
export function ControlBar() {
  const {
    currentItems, activeItemIndex, activeSlideIndex,
    prevSlide, nextSlide,
    toggleBlank, toggleHideText, toggleFullscreen,
    isLive, isRehearsal, toggleRehearsal,
    isBlank, isHideText,
  } = usePresentationStore();

  const [showHotkeyModal, setShowHotkeyModal] = useState(false);
  const { hotkeys } = useHotkeyConfig();

  /* Clear Layer Actions */
  const clearText  = () => { if (!isHideText)  void toggleHideText(); };
  const clearBg    = () => {
    // Send IPC to output to clear background
    (window as any).electron?.ipcRenderer?.send('output:clear-bg');
  };
  const clearAllLayers = () => {
    if (!isBlank) void toggleBlank();
  };

  /* Connect hotkeys */
  useHotkeyListener(hotkeys, {
    nextSlide:  () => { if (currentItems.length > 0) nextSlide(); },
    prevSlide:  () => { if (currentItems.length > 0) prevSlide(); },
    blank:      () => void toggleBlank(),
    hideText:   () => void toggleHideText(),
    fullscreen: () => void toggleFullscreen(),
    rehearsal:  toggleRehearsal,
    clearText,
    clearBg,
    clearAll:   clearAllLayers,
  });

  /* Slide indicator */
  const currentItem = currentItems[activeItemIndex];
  let totalSlides = 0;
  if (currentItem?.type === 'song' && currentItem.song) {
    totalSlides = JSON.parse(currentItem.song.lyricsJson).length;
  }
  const slideNum = totalSlides > 0 ? activeSlideIndex + 1 : 0;


  return (
    <>
      <div
        className="w-full h-full flex items-center justify-between px-4"
        style={{
          background: 'var(--surface-sidebar)',
          borderTop: '1px solid var(--border-default)',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.4)',
        }}
      >
        {/* ── Left: Nav Controls ─────────────────────────────────── */}
        <div className="flex items-center gap-1.5">
          <Tooltip content={`Previous [${hotkeys.prevSlide}]`} side="top">
            <Button
              variant="secondary"
              size="sm"
              onClick={prevSlide}
              disabled={currentItems.length === 0}
              className="gap-1.5"
            >
              <SkipBack size={15} />
              <span className="hidden sm:inline">Prev</span>
            </Button>
          </Tooltip>

          <Tooltip content={`Next [${hotkeys.nextSlide}]`} side="top">
            <Button
              variant="primary"
              size="sm"
              onClick={nextSlide}
              disabled={currentItems.length === 0}
              className="gap-1.5 px-5"
            >
              <SkipForward size={15} />
              <span className="hidden sm:inline">Next</span>
            </Button>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-7" />

          {/* Panic / Clear Layer Buttons */}
          <ClearBtn
            label="TEXT"
            title="Clear Text Layer"
            icon={Type}
            hotkey={hotkeys.clearText}
            onClick={clearText}
          />
          <ClearBtn
            label="BG"
            title="Clear Background Layer"
            icon={Image}
            hotkey={hotkeys.clearBg}
            onClick={clearBg}
          />
          <ClearBtn
            label="ALL"
            title="Clear All / Blank Screen"
            icon={Layers}
            hotkey={hotkeys.clearAll}
            onClick={clearAllLayers}
            danger
          />

          <Separator orientation="vertical" className="mx-1 h-7" />

          <Tooltip content={`Blank / Black Screen [${hotkeys.blank}]`} side="top">
            <Button
              variant={isBlank ? 'danger' : 'ghost'}
              size="sm"
              onClick={() => void toggleBlank()}
              className={`gap-1.5 border ${isBlank ? 'border-danger/50' : 'border-[var(--border-default)]'}`}
            >
              <Square size={14} />
              <span className="hidden md:inline">Blank</span>
            </Button>
          </Tooltip>

          <Tooltip content={`Hide Text [${hotkeys.hideText}]`} side="top">
            <Button
              variant={isHideText ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => void toggleHideText()}
              className={`gap-1.5 border ${isHideText ? 'border-[var(--border-strong)]' : 'border-[var(--border-default)]'}`}
            >
              <EyeOff size={14} />
              <span className="hidden md:inline">Hide</span>
            </Button>
          </Tooltip>

          <Tooltip content={`Fullscreen [${hotkeys.fullscreen}]`} side="top">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void toggleFullscreen()}
              className="gap-1.5 border border-[var(--border-default)]"
            >
              <Maximize size={14} />
            </Button>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-7" />

          <Tooltip content={`Rehearsal Mode [${hotkeys.rehearsal}]`} side="top">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRehearsal}
              className={[
                'gap-1.5 border transition-colors',
                isRehearsal
                  ? 'bg-warn-400/20 border-warn-400/50 text-warn-400'
                  : 'border-[var(--border-default)]',
              ].join(' ')}
            >
              <AlertTriangle size={14} />
              <span className="hidden md:inline">Rehearsal</span>
            </Button>
          </Tooltip>
        </div>

        {/* ── Right: Status & Info ────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {isRehearsal && (
            <Badge variant="warning" dot pulse>
              REHEARSAL
            </Badge>
          )}

          {isLive && currentItem && !isRehearsal && (
            <div className="flex items-center gap-2 max-w-[200px]">
              <Badge variant="danger" dot pulse>LIVE</Badge>
              <span className="text-xs font-semibold text-text-200 truncate">
                {currentItem.song ? currentItem.song.title : currentItem.title}
              </span>
            </div>
          )}

          {/* Slide Indicator */}
          <div
            className="flex items-center gap-1.5 bg-surface-elevated border border-[var(--border-default)] rounded-lg px-3 py-1.5 min-w-[110px]"
          >
            <span className="text-xs text-text-600 font-medium">Slide</span>
            <span className="text-sm font-bold tabular-nums text-text-100">
              {slideNum > 0 ? slideNum : '–'}
            </span>
            {totalSlides > 0 && (
              <>
                <span className="text-text-600 text-xs">/</span>
                <span className="text-xs text-text-400 tabular-nums">{totalSlides}</span>
              </>
            )}
          </div>

          {/* Hotkey Config Button */}
          <Tooltip content="Keyboard Shortcuts" side="top">
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={() => setShowHotkeyModal(true)}
            >
              <Keyboard size={15} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Hotkey Config Modal */}
      <HotkeyConfigModal
        isOpen={showHotkeyModal}
        onClose={() => setShowHotkeyModal(false)}
      />
    </>
  );
}
