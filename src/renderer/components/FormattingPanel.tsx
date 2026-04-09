import { useState, useEffect, useCallback } from 'react';
import { Type, Bold, CaseSensitive, Sliders, X, ChevronDown, RotateCcw } from 'lucide-react';

const ipc = (window as any).electron?.ipcRenderer;

export interface Formatting {
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  uppercase: boolean;
  textShadow: 'none' | 'soft' | 'strong' | 'glow';
  letterSpacing: number;
  lineHeight: number;
  color: string;
  alignment: 'left' | 'center' | 'right';
}

const DEFAULT_FORMATTING: Formatting = {
  fontFamily: 'Arial',
  fontSize: 48,
  bold: false,
  uppercase: false,
  textShadow: 'soft',
  letterSpacing: 0,
  lineHeight: 1.4,
  color: '#ffffff',
  alignment: 'center',
};

const FONTS = ['Arial', 'Times New Roman', 'Verdana', 'Georgia', 'Trebuchet MS', 'Palatino', 'Garamond', 'Comic Sans MS', 'Impact'];

const TEXT_SHADOW_CSS: Record<string, string> = {
  none: 'none',
  soft: '2px 2px 8px rgba(0,0,0,0.6)',
  strong: '3px 3px 12px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7)',
  glow: '0 0 20px rgba(255,255,255,0.5), 2px 2px 8px rgba(0,0,0,0.8)',
};

export function buildTextStyle(f: Formatting): React.CSSProperties {
  return {
    fontFamily: f.fontFamily,
    fontSize: `${f.fontSize}px`,
    fontWeight: f.bold ? 700 : 400,
    textTransform: f.uppercase ? 'uppercase' : 'none',
    textShadow: TEXT_SHADOW_CSS[f.textShadow] ?? 'none',
    letterSpacing: `${f.letterSpacing}px`,
    lineHeight: f.lineHeight,
    color: f.color,
    textAlign: f.alignment,
  };
}

interface FormattingPanelProps {
  onClose?: () => void;
  onChange?: (f: Formatting) => void;
}

function Slider({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs text-text-secondary">{label}</label>
        <span className="text-xs font-mono font-semibold">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-accent rounded cursor-pointer"
      />
    </div>
  );
}

export function FormattingPanel({ onClose, onChange }: FormattingPanelProps) {
  const [fmt, setFmt] = useState<Formatting>(DEFAULT_FORMATTING);
  const [previewText] = useState('"Karena begitu besar kasih Allah akan dunia ini"');

  // Load saved default from settings
  useEffect(() => {
    ipc?.invoke('setting:get', 'defaultFormatting').then((saved: Formatting | null) => {
      if (saved) setFmt({ ...DEFAULT_FORMATTING, ...saved });
    });
  }, []);

  const update = useCallback((patch: Partial<Formatting>) => {
    setFmt(prev => {
      const next = { ...prev, ...patch };
      // Send to output window in real-time
      void ipc?.invoke('output:send-formatting', next);
      onChange?.(next);
      return next;
    });
  }, [onChange]);

  const saveAsDefault = async () => {
    await ipc?.invoke('setting:set', { key: 'defaultFormatting', value: fmt });
  };

  const reset = () => {
    setFmt(DEFAULT_FORMATTING);
    void ipc?.invoke('output:send-formatting', DEFAULT_FORMATTING);
    onChange?.(DEFAULT_FORMATTING);
  };

  return (
    <div className="flex flex-col h-full bg-bg-sidebar border-l border-border w-72">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Type size={16} className="text-accent" />
          <span className="font-semibold text-sm">Formatting</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={reset} title="Reset ke default" className="p-1.5 text-text-secondary hover:text-text-primary transition-colors">
            <RotateCcw size={14} />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 text-text-secondary hover:text-text-primary transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="mx-4 my-3 rounded-lg overflow-hidden flex-shrink-0">
        <div className="bg-black aspect-video flex items-center justify-center p-4">
          <p style={buildTextStyle(fmt)} className="text-center break-words w-full">
            {fmt.uppercase ? previewText.toUpperCase() : previewText}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
        {/* Font Family */}
        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Font</label>
          <div className="relative">
            <select
              value={fmt.fontFamily}
              onChange={e => update({ fontFamily: e.target.value })}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent appearance-none pr-8"
              style={{ fontFamily: fmt.fontFamily }}
            >
              {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
          </div>
        </div>

        {/* Size */}
        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Ukuran & Spasi</label>
          <Slider label="Font size" value={fmt.fontSize} min={18} max={120} unit="px" onChange={v => update({ fontSize: v })} />
          <Slider label="Letter spacing" value={fmt.letterSpacing} min={0} max={20} step={0.5} unit="px" onChange={v => update({ letterSpacing: v })} />
          <Slider label="Line height" value={fmt.lineHeight} min={1.0} max={3.0} step={0.1} unit="x" onChange={v => update({ lineHeight: v })} />
        </div>

        {/* Style toggles */}
        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Gaya</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => update({ bold: !fmt.bold })}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                fmt.bold ? 'bg-accent border-accent text-white' : 'border-border text-text-secondary hover:border-accent/60'
              }`}
            >
              <Bold size={14} /> Bold
            </button>
            <button
              onClick={() => update({ uppercase: !fmt.uppercase })}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                fmt.uppercase ? 'bg-accent border-accent text-white' : 'border-border text-text-secondary hover:border-accent/60'
              }`}
            >
              <CaseSensitive size={14} /> CAPS
            </button>
          </div>
        </div>

        {/* Alignment */}
        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Alignment</label>
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map(a => (
              <button
                key={a}
                onClick={() => update({ alignment: a })}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  fmt.alignment === a ? 'bg-accent border-accent text-white' : 'border-border text-text-secondary hover:border-accent/60'
                }`}
              >
                {a === 'left' ? '⫷' : a === 'center' ? '≡' : '⫸'}
              </button>
            ))}
          </div>
        </div>

        {/* Text Shadow */}
        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Text Shadow</label>
          <div className="grid grid-cols-2 gap-2">
            {(['none', 'soft', 'strong', 'glow'] as const).map(s => (
              <button
                key={s}
                onClick={() => update({ textShadow: s })}
                className={`py-2 rounded-lg border text-xs font-medium capitalize transition-colors ${
                  fmt.textShadow === s ? 'bg-accent border-accent text-white' : 'border-border text-text-secondary hover:border-accent/60'
                }`}
              >
                {s === 'none' ? 'Tanpa' : s === 'soft' ? 'Soft' : s === 'strong' ? 'Strong' : '✨ Glow'}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Warna Teks</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fmt.color}
              onChange={e => update({ color: e.target.value })}
              className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
            />
            <div className="flex gap-1 flex-wrap">
              {['#ffffff', '#ffff00', '#ffcc00', '#ff8800', '#00ffff', '#00ff88'].map(c => (
                <button
                  key={c}
                  onClick={() => update({ color: c })}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${fmt.color === c ? 'border-accent scale-110' : 'border-transparent hover:border-white/50'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => void saveAsDefault()}
            className="w-full flex items-center justify-center gap-2 py-2 bg-accent/20 border border-accent/40 text-accent rounded-lg text-sm hover:bg-accent/30 transition-colors"
          >
            <Sliders size={14} /> Simpan sebagai Default
          </button>
        </div>
      </div>
    </div>
  );
}
