import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Pause, Square, Monitor, Clock, X } from 'lucide-react';
import { Card } from './ui/Card';

const ipc = (window as any).electron?.ipcRenderer;

interface TimerConfig {
  mode: 'duration' | 'target';
  durationMinutes: number;
  targetHour: number;
  targetMinute: number;
  title: string;
  subtext: string;
  bgColor: string;
}

const QUICK_DURATIONS = [5, 10, 15, 20, 30];

function formatTime(seconds: number): string {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface Props {
  onClose?: () => void;
}

export function CountdownTimer({ onClose }: Props) {
  const [config, setConfig] = useState<TimerConfig>({
    mode: 'duration',
    durationMinutes: 5,
    targetHour: 9,
    targetMinute: 0,
    title: 'Ibadah akan dimulai dalam…',
    subtext: '',
    bgColor: '#0a0a1a',
  });

  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'done'>('idle');
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalRef = useRef(0);
  const beepRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const getTotalSeconds = (): number => {
    if (config.mode === 'duration') return config.durationMinutes * 60;
    const now = new Date();
    const target = new Date(now);
    target.setHours(config.targetHour, config.targetMinute, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return Math.round((target.getTime() - now.getTime()) / 1000);
  };

  const playBeep = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
    } catch { /* no audio context */ }
  };

  const start = useCallback(async () => {
    const total = getTotalSeconds();
    if (total <= 0) return;
    totalRef.current = total;
    setRemaining(total);
    setStatus('running');
    beepRef.current = false;

    // Send to output window
    await ipc?.invoke('timer:start', {
      duration: total,
      title: config.title,
      subtext: config.subtext,
      background: { color: config.bgColor },
    });

    clearTimer();
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearTimer();
          setStatus('done');
          if (!beepRef.current) { beepRef.current = true; playBeep(); }
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [config, clearTimer]);

  const pause = useCallback(async () => {
    clearTimer();
    setStatus('paused');
    await ipc?.invoke('timer:pause');
  }, [clearTimer]);

  const resume = useCallback(async () => {
    setStatus('running');
    await ipc?.invoke('timer:resume');
    clearTimer();
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1;
        if (next <= 0) { clearTimer(); setStatus('done'); return 0; }
        return next;
      });
    }, 1000);
  }, [clearTimer]);

  const stop = useCallback(async () => {
    clearTimer();
    setStatus('idle');
    setRemaining(0);
    await ipc?.invoke('timer:stop');
  }, [clearTimer]);

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), [clearTimer]);

  const progress = totalRef.current > 0 ? remaining / totalRef.current : 0;
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isActive = isRunning || isPaused;

  const circumference = 2 * Math.PI * 54; // r=54

  return (
    <div className="w-80 bg-bg-sidebar border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Timer size={16} className="text-accent" />
          <span className="font-semibold text-sm">Countdown Timer</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-text-secondary hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Timer display */}
      <div className="flex flex-col items-center py-6 px-4 flex-shrink-0">
        <div className="relative w-36 h-36">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="6" />
            {/* Progress circle */}
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={status === 'done' ? '#ef4444' : status === 'paused' ? '#f59e0b' : 'var(--accent)'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
            />
          </svg>
          {/* Time text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold font-mono ${status === 'done' ? 'text-red-400' : ''}`}>
              {isActive || status === 'done' ? formatTime(remaining) : formatTime(getTotalSeconds())}
            </span>
            <span className="text-xs text-text-secondary mt-1 capitalize">
              {status === 'idle' ? (config.mode === 'duration' ? `${config.durationMinutes} menit` : 'Target time')
               : status === 'running' ? 'Berjalan...'
               : status === 'paused' ? 'Dijeda'
               : '✓ Selesai!'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mt-4">
          {!isActive && status !== 'done' && (
            <button
              onClick={() => void start()}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Play size={16} /> Mulai
            </button>
          )}
          {isRunning && (
            <>
              <button onClick={() => void pause()} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:opacity-90">
                <Pause size={15} /> Jeda
              </button>
              <button onClick={() => void stop()} className="flex items-center gap-2 px-4 py-2 bg-red-500/80 text-white rounded-xl font-semibold text-sm hover:opacity-90">
                <Square size={15} /> Stop
              </button>
            </>
          )}
          {isPaused && (
            <>
              <button onClick={() => void resume()} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl font-semibold text-sm hover:opacity-90">
                <Play size={15} /> Lanjut
              </button>
              <button onClick={() => void stop()} className="flex items-center gap-2 px-4 py-2 bg-red-500/80 text-white rounded-xl font-semibold text-sm hover:opacity-90">
                <Square size={15} /> Stop
              </button>
            </>
          )}
          {status === 'done' && (
            <button onClick={() => void stop()} className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border text-text-primary rounded-xl font-semibold text-sm hover:bg-bg-hover">
              <Square size={15} /> Tutup
            </button>
          )}
        </div>
      </div>

      {/* Config (only when idle) */}
      {!isActive && status !== 'done' && (
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 border-t border-border pt-4">
          {/* Mode selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Mode</label>
            <div className="flex gap-1">
              {(['duration', 'target'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setConfig(c => ({ ...c, mode: m }))}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    config.mode === m ? 'bg-accent border-accent text-white' : 'border-border text-text-secondary hover:border-accent/60'
                  }`}
                >
                  {m === 'duration' ? '⏱ Durasi' : '🕐 Target'}
                </button>
              ))}
            </div>
          </div>

          {config.mode === 'duration' ? (
            <div className="space-y-2">
              <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Durasi</label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setConfig(c => ({ ...c, durationMinutes: d }))}
                    className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                      config.durationMinutes === d ? 'bg-accent border-accent text-white' : 'border-border text-text-secondary hover:border-accent/60'
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number" min={1} max={180} value={config.durationMinutes}
                  onChange={e => setConfig(c => ({ ...c, durationMinutes: Math.max(1, +e.target.value) }))}
                  className="w-20 bg-bg-primary border border-border rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:ring-1 focus:ring-accent"
                />
                <span className="text-xs text-text-secondary">menit (custom)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider flex items-center gap-1">
                <Clock size={12} /> Target Waktu
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number" min={0} max={23} value={config.targetHour}
                  onChange={e => setConfig(c => ({ ...c, targetHour: +e.target.value }))}
                  className="w-16 bg-bg-primary border border-border rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:ring-1 focus:ring-accent"
                />
                <span className="font-bold">:</span>
                <input
                  type="number" min={0} max={59} value={config.targetMinute}
                  onChange={e => setConfig(c => ({ ...c, targetMinute: +e.target.value }))}
                  className="w-16 bg-bg-primary border border-border rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          )}

          {/* Title & subtext */}
          <div className="space-y-2">
            <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Tampilan</label>
            <input
              type="text" placeholder="Judul (mis. Ibadah dimulai dalam…)"
              value={config.title}
              onChange={e => setConfig(c => ({ ...c, title: e.target.value }))}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent"
            />
            <input
              type="text" placeholder="Sub-teks (opsional)"
              value={config.subtext}
              onChange={e => setConfig(c => ({ ...c, subtext: e.target.value }))}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Background color */}
          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color" value={config.bgColor}
                onChange={e => setConfig(c => ({ ...c, bgColor: e.target.value }))}
                className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
              />
              <div className="flex gap-1">
                {['#0a0a1a','#0f172a','#1a0000','#001a00','#1a0a00'].map(c => (
                  <button
                    key={c}
                    onClick={() => setConfig(cfg => ({ ...cfg, bgColor: c }))}
                    className={`w-7 h-7 rounded border-2 transition-all ${config.bgColor === c ? 'border-accent' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview mini */}
          <Card className="overflow-hidden p-0">
            <div className="aspect-video flex flex-col items-center justify-center text-center p-3" style={{ backgroundColor: config.bgColor }}>
              {config.title && <p className="text-white/80 text-xs mb-1">{config.title}</p>}
              <p className="text-white text-2xl font-bold font-mono">{formatTime(getTotalSeconds())}</p>
              {config.subtext && <p className="text-white/60 text-xs mt-1">{config.subtext}</p>}
            </div>
          </Card>
        </div>
      )}

      {/* Output indicator */}
      <div className="px-4 py-2 border-t border-border flex-shrink-0 flex items-center gap-2">
        <Monitor size={13} className={isActive ? 'text-green-400' : 'text-text-secondary'} />
        <span className="text-xs text-text-secondary">
          {isActive ? 'Timer tampil di output window' : 'Output: standby'}
        </span>
      </div>
    </div>
  );
}
