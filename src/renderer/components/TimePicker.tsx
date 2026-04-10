import React from 'react';

export function TimePicker({ duration, onUpdate }: { duration: number, onUpdate: (d: number) => void }) {
  const h = Math.floor(duration / 3600);
  const m = Math.floor((duration % 3600) / 60);
  const s = duration % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center justify-center gap-6 p-10 bg-black/40 rounded-xl border border-white/5 shadow-2xl">
      <Segment value={pad(h)} label="HH" />
      <span className="text-4xl font-black text-white/20">:</span>
      <Segment value={pad(m)} label="MM" />
      <span className="text-4xl font-black text-white/20">:</span>
      <Segment value={pad(s)} label="SS" />
    </div>
  );
}

function Segment({ value, label }: { value: string, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className="text-7xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_4px_10px_rgba(0,0,0,1)] group-hover:text-[var(--accent-green)] transition-colors cursor-pointer select-none">
        {value}
      </div>
      <span className="text-[10px] font-black text-[var(--text-600)] uppercase tracking-[0.3em]">{label}</span>
    </div>
  );
}
