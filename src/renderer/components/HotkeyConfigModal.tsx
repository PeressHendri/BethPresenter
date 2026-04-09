import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Modal }  from './ui/Modal';
import { Button } from './ui/Button';
import { Badge }  from './ui/Badge';
import { useHotkeyConfig, DEFAULT_HOTKEYS, HotkeyConfig } from '../hooks/useHotkeyConfig';

interface HotkeyConfigModalProps {
  isOpen:  boolean;
  onClose: () => void;
}

const ACTION_LABELS: Record<keyof HotkeyConfig, string> = {
  nextSlide:  'Next Slide',
  prevSlide:  'Previous Slide',
  blank:      'Blank / Black Screen',
  hideText:   'Hide Text',
  fullscreen: 'Toggle Fullscreen',
  rehearsal:  'Toggle Rehearsal Mode',
  clearText:  'Clear Text Layer',
  clearBg:    'Clear Background Layer',
  clearAll:   'Clear All Layers',
};

function KeyCapture({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  const [capturing, setCapturing] = useState(false);

  return (
    <button
      className={[
        'min-w-[90px] px-3 py-1.5 rounded-lg border text-xs font-mono transition-all',
        capturing
          ? 'border-accent-500 bg-[var(--accent-glow)] text-accent-400 animate-pulse-slow'
          : 'border-[var(--border-default)] bg-surface-input text-text-200 hover:border-[var(--border-strong)]',
      ].join(' ')}
      onClick={() => setCapturing(true)}
      onKeyDown={(e) => {
        if (!capturing) return;
        e.preventDefault();
        e.stopPropagation();
        onChange(e.key);
        setCapturing(false);
      }}
      onBlur={() => setCapturing(false)}
    >
      {capturing ? 'Press a key…' : (
        <kbd>{value}</kbd>
      )}
    </button>
  );
}

export function HotkeyConfigModal({ isOpen, onClose }: HotkeyConfigModalProps) {
  const { hotkeys, updateHotkey, resetHotkeys } = useHotkeyConfig();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={resetHotkeys} className="gap-1.5 mr-auto">
            <RotateCcw size={13} />
            Reset to Default
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-1">
        <p className="text-xs text-text-400 mb-3">
          Click a key badge and press a new key to reassign. Changes are saved automatically.
        </p>
        {(Object.keys(ACTION_LABELS) as (keyof HotkeyConfig)[]).map((action) => (
          <div
            key={action}
            className="flex items-center justify-between py-2.5 border-b border-[var(--border-subtle)] last:border-0"
          >
            <span className="text-sm text-text-200">{ACTION_LABELS[action]}</span>
            <div className="flex items-center gap-2">
              {hotkeys[action] !== DEFAULT_HOTKEYS[action] && (
                <Badge variant="warning">custom</Badge>
              )}
              <KeyCapture
                value={hotkeys[action]}
                onChange={(key) => updateHotkey(action, key)}
              />
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
