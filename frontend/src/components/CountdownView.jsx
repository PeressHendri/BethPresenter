import React, { useState, useEffect } from 'react';
import { Timer, Plus, FolderOpen, Upload, Play, Pause, Trash2, MonitorPlay } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const CountdownView = () => {
  const { isLive, isRehearsal, sendManualToLive } = useProject();

  // Countdown States
  const [countdownTitle, setCountdownTitle] = useState('The service is about to start');
  const [countdownMessage, setCountdownMessage] = useState('Silakan duduk di tempat Anda');
  const [countdownMode, setCountdownMode] = useState('duration'); // 'duration' or 'target'
  const [countdownMinutes, setCountdownMinutes] = useState(5);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [countdownTarget, setCountdownTarget] = useState('09:00');
  const [countdownDisplay, setCountdownDisplay] = useState('all');
  const [countdownBg, setCountdownBg] = useState('color');
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Countdown Timer Logic
  useEffect(() => {
    let interval = null;
    if (isCountdownRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => {
          const next = prev - 1;
          if (next <= 0) {
            setIsCountdownRunning(false);
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isCountdownRunning, remainingSeconds]);

  // Sync Countdown to Output
  useEffect(() => {
    if (isCountdownRunning && isLive && !isRehearsal) {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      sendManualToLive({
        songId: 'countdown',
        content: timeStr,
        label: countdownTitle || 'COUNTDOWN',
        subLabel: countdownMessage
      });
    }
  }, [remainingSeconds, isCountdownRunning, isLive, isRehearsal, countdownTitle, countdownMessage]);

  const startCountdown = () => {
    if (countdownMode === 'duration') {
      setRemainingSeconds(countdownMinutes * 60 + countdownSeconds);
    } else {
      const [h, m] = countdownTarget.split(':').map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target < now) target.setDate(target.getDate() + 1);
      const diff = Math.floor((target - now) / 1000);
      setRemainingSeconds(diff);
    }
    setIsCountdownRunning(true);
  };

  const displayMinutes = Math.floor(remainingSeconds / 60);
  const displaySeconds = remainingSeconds % 60;
  const displayStr = isCountdownRunning 
    ? `${displayMinutes}:${displaySeconds.toString().padStart(2, '0')}`
    : `${countdownMinutes}:${countdownSeconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden pt-1 px-8 pb-8 text-[#800000] font-['Outfit']">
      {/* Header Premium - Restored Precisely */}
      <div className="flex flex-col mb-5 w-full pt-2">
        <div className="flex items-center gap-3 mb-3 pl-1">
          <Timer size={22} strokeWidth={3} className="text-[#800000]" />
          <span className="text-[16px] font-[950] uppercase tracking-[0.25em] leading-none">PENGHITUNG MUNDUR</span>
        </div>
        <div className="w-full h-[3px] bg-[#800000] rounded-full"></div>
      </div>

      <div className="flex-1 flex gap-10 overflow-hidden relative">
        {/* Left Panel */}
        <div className="w-[550px] flex flex-col gap-3 pr-12 pb-4 border-r border-[#80000010]">
          <div className="space-y-1">
            <label className="text-[12px] font-black uppercase pl-1">Judul Utama</label>
            <input type="text" value={countdownTitle} onChange={(e) => setCountdownTitle(e.target.value)} className="w-full h-11 bg-white border border-[#80000040] px-5 text-[15px] font-bold text-[#800000] outline-none transition-all" />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-black uppercase pl-1">Keterangan Sub-Teks</label>
            <input type="text" value={countdownMessage} onChange={(e) => setCountdownMessage(e.target.value)} className="w-full h-11 bg-white border border-[#80000040] px-5 text-[15px] font-bold text-[#800000] outline-none transition-all" />
          </div>

          <div className="flex flex-col gap-3 mt-1">
             <div className="space-y-2">
                <label className="text-[12px] font-black uppercase pl-1">Mode Timer</label>
                <div className="flex bg-[#80000010] p-1.5 border border-[#80000015]">
                   <button onClick={() => setCountdownMode('duration')} className={`flex-1 h-9 text-[12px] font-black transition-all ${countdownMode === 'duration' ? 'bg-[#800000] text-white shadow-md' : 'text-[#80000060]'}`}>Durasi</button>
                   <button onClick={() => setCountdownMode('target')} className={`flex-1 h-9 text-[12px] font-black transition-all ${countdownMode === 'target' ? 'bg-[#800000] text-white shadow-md' : 'text-[#80000060]'}`}>Target</button>
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[12px] font-black uppercase pl-1">Tampilkan Ke</label>
                <div className="flex bg-[#80000010] p-1.5 border border-[#80000015] gap-1">
                   {['all', 'output', 'preview'].map(d => (
                     <button key={d} onClick={() => setCountdownDisplay(d)} className={`flex-1 h-9 text-[11px] font-black transition-all ${countdownDisplay === d ? 'bg-[#800000] text-white shadow-md' : 'text-[#80000060]'}`}>{d === 'all' ? 'Semuanya' : d === 'output' ? 'Output Utama' : 'Tampilan Saja'}</button>
                   ))}
                </div>
             </div>
          </div>

          <div className="space-y-2 pt-1">
             <label className="text-[12px] font-black uppercase pl-1">{countdownMode === 'duration' ? 'Atur Waktu Mundur' : 'Atur Waktu Target'}</label>
             <div className="flex items-center gap-4 bg-white p-3 border-2 border-[#80000015]">
                {countdownMode === 'duration' ? (
                  <>
                    <div className="flex items-center">
                      <input type="number" value={countdownMinutes} onChange={(e) => setCountdownMinutes(parseInt(e.target.value) || 0)} className="bg-transparent border-none outline-none text-[32px] font-[900] w-14 text-right text-[#800000]" />
                      <span className="text-[11px] font-black opacity-40 ml-2 mt-2">MIN</span>
                    </div>
                    <span className="font-black text-[#80000040] text-3xl mt-1">:</span>
                    <div className="flex items-center">
                      <input type="number" value={countdownSeconds} onChange={(e) => setCountdownSeconds(parseInt(e.target.value) || 0)} className="bg-transparent border-none outline-none text-[32px] font-[900] w-14 text-right text-[#800000]" />
                      <span className="text-[11px] font-black opacity-40 ml-2 mt-2">SEC</span>
                    </div>
                    <div className="flex-1 flex justify-end gap-1.5">
                       {[1, 3, 5, 10].map(m => (
                         <button key={m} onClick={() => { setCountdownMinutes(m); setCountdownSeconds(0); }} className={`h-10 w-12 rounded-lg text-[13px] font-black transition-all border-2 ${countdownMinutes === m && countdownSeconds === 0 ? 'bg-[#800000] text-white border-[#800000]' : 'border-[#80000015] text-[#80000080]'}`}>{m}m</button>
                       ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-3">
                    <span className="text-[11px] font-black opacity-40 mt-1">TIME</span>
                    <input type="time" value={countdownTarget} onChange={(e) => setCountdownTarget(e.target.value)} className="bg-transparent border-none outline-none text-[32px] font-[900] text-[#800000] px-4" />
                  </div>
                )}
             </div>
          </div>

          <div className="space-y-2 pt-1">
             <label className="text-[12px] font-black uppercase pl-1">Background Tampilan</label>
             <div className="grid grid-cols-3 gap-2">
                {['color', 'library', 'file'].map(t => (
                  <button key={t} onClick={() => setCountdownBg(t)} className={`h-10 flex items-center justify-center gap-2 text-[12px] font-black transition-all border-2 ${countdownBg === t ? 'bg-[#800000] text-white border-[#800000]' : 'bg-white border-[#80000010] text-[#800000]'}`}>
                    {t === 'color' ? <Plus size={16} /> : t === 'library' ? <FolderOpen size={16} /> : <Upload size={16} />} {t.toUpperCase()}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 flex flex-col gap-6 items-center justify-start pt-4 px-8">
           <div className="w-full max-w-[800px] aspect-video bg-[#800000] border-[8px] border-[#600000] shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center px-12 py-10">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10 w-full flex flex-col items-center justify-center gap-1">
                <h4 className="text-[15px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">{countdownTitle}</h4>
                <div className="text-[140px] font-[950] text-white tabular-nums leading-[0.8] tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">{displayStr}</div>
                {countdownMessage && <p className="text-[14px] font-black text-white/30 tracking-[0.25em] uppercase mt-4">{countdownMessage}</p>}
              </div>
           </div>

           <div className="w-full max-w-[800px] flex flex-col gap-3">
              <div className="flex gap-3 h-14">
                <button onClick={() => setIsCountdownRunning(!isCountdownRunning)} className={`flex-1 flex items-center justify-center gap-3 text-[14px] font-black uppercase tracking-widest transition-all ${isCountdownRunning ? 'bg-white border-2 border-[#800000] text-[#800000]' : 'bg-[#1A1A1A] text-white'}`}>
                  {isCountdownRunning ? <><Pause size={20} fill="currentColor" /> Jeda</> : <><Play size={20} fill="currentColor" /> Lanjutkan</>}
                </button>
                <button onClick={() => { setIsCountdownRunning(false); setRemainingSeconds(0); }} className="w-40 bg-white border-2 border-[#80000020] text-[#80000040] hover:text-[#800000] hover:border-[#800000] flex items-center justify-center gap-2 text-[14px] font-black transition-all"><Trash2 size={20} /> Reset</button>
              </div>
              <button onClick={startCountdown} disabled={isCountdownRunning} className={`w-full h-16 flex items-center justify-center gap-4 text-[18px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${isCountdownRunning ? 'bg-[#80000010] text-[#80000020]' : 'bg-[#800000] text-white hover:bg-[#5C0000] shadow-[#80000020]'}`}><MonitorPlay size={24} /> Tampilkan Live</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownView;
