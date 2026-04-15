import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Monitor, Tv, 
  Layout, Type, Clock, Settings, Save, Zap
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const CountdownView = () => {
  const { countdown, setCountdown, language } = useProject();
  const timerRef = useRef(null);

  // Tick Logic
  useEffect(() => {
    if (countdown.isRunning && countdown.remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => ({
          ...prev,
          remainingSeconds: Math.max(0, prev.remainingSeconds - 1),
          isRunning: prev.remainingSeconds > 1
        }));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [countdown.isRunning, countdown.remainingSeconds]);

  const formatTime = (total) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatDisplayTime = (total) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(remainingMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const setDuration = (mins) => {
    setCountdown({
      ...countdown,
      remainingSeconds: mins * 60,
      isRunning: false,
      type: 'duration'
    });
  };

  const handleStart = () => setCountdown({ isRunning: true });
  const handlePause = () => setCountdown({ isRunning: false });
  const handleReset = () => {
    const totalSeconds = countdown.type === 'target' ? 
      (countdown.targetTime?.split(':').reduce((acc, time) => (60 * acc) + parseInt(time), 0) || 0) : 300;
    setCountdown({ isRunning: false, remainingSeconds: totalSeconds });
  };

  const toggleLive = () => {
    const newActiveState = !countdown.isActive;
    setCountdown({ isActive: newActiveState });
    
    // Send to output via sendCountdownToLive
    const { sendCountdownToLive } = useProject();
    if (newActiveState) {
      sendCountdownToLive({
        ...countdown,
        isActive: true,
        isRunning: countdown.isRunning,
        remainingSeconds: countdown.remainingSeconds,
        title: countdown.title,
        message: countdown.message,
        endMessage: countdown.endMessage
      });
    }
  };

  const t = {
    id: { 
      title: "PENGATUR WAKTU", mode: "Mode", duration: "Durasi", target: "Target Waktu",
      live: "TAMPILKAN LIVE", stop: "HENTIKAN LIVE", presets: "PRESET CEPAT",
      display: "OPSI TAMPILAN", settings: "KONFIGURASI"
    },
    en: { 
      title: "COUNTDOWN TIMER", mode: "Mode", duration: "Duration", target: "Target Time",
      live: "GO LIVE", stop: "STOP LIVE", presets: "QUICK PRESETS",
      display: "DISPLAY OPTIONS", settings: "CONFIGURATION"
    }
  }[language] || t.id;

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] overflow-hidden font-['Outfit']">
      {/* Header */}
      <div className="h-[64px] px-8 flex items-center justify-between bg-white border-b border-[#E2E2E6] shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#800000] rounded-xl flex items-center justify-center shadow-lg shadow-[#80000020]">
            <Clock size={20} className="text-white" />
          </div>
          <h2 className="text-[14px] font-[950] tracking-tight text-[#1D1D1F] uppercase">{t.title}</h2>
        </div>
        
        <button 
          onClick={toggleLive}
          className={`px-8 py-2.5 rounded-xl text-[12px] font-black flex items-center gap-2 transition-all shadow-xl ${
            countdown.isActive 
            ? 'bg-red-600 text-white shadow-red-600/20' 
            : 'bg-white border border-[#E2E2E6] text-[#AEAEB2] hover:border-[#80000040] hover:text-[#800000]'
          }`}
        >
          <Tv size={16} />
          {countdown.isActive ? t.stop : t.live}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden p-8 gap-8">
        {/* LEFT: Controls */}
        <div className="w-[450px] space-y-8 flex flex-col">
          {/* Main Display Card */}
          <div className="bg-white rounded-[32px] p-10 border border-[#E2E2E6] shadow-sm flex flex-col items-center justify-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#80000005]">
              <div 
                className="h-full bg-[#800000] transition-all duration-1000"
                style={{ width: `${(countdown.remainingSeconds / 1800) * 100}%` }}
              />
            </div>

            <div className="text-[120px] font-[950] leading-none text-[#1D1D1F] tracking-tighter drop-shadow-sm">
              {formatDisplayTime(countdown.remainingSeconds)}
            </div>

            <div className="flex items-center gap-3">
              {!countdown.isRunning ? (
                <button 
                  onClick={handleStart}
                  className="w-16 h-16 bg-[#800000] text-white rounded-2xl flex items-center justify-center hover:bg-black transition-all shadow-2xl shadow-[#80000020] scale-100 active:scale-95"
                >
                  <Play size={28} fill="currentColor" />
                </button>
              ) : (
                <button 
                  onClick={handlePause}
                  className="w-16 h-16 bg-[#1D1D1F] text-white rounded-2xl flex items-center justify-center hover:bg-black transition-all shadow-2xl shadow-black/20"
                >
                  <Pause size={28} fill="currentColor" />
                </button>
              )}
              <button 
                onClick={handleReset}
                className="w-16 h-16 bg-white border border-[#E2E2E6] text-[#AEAEB2] rounded-2xl flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-all active:rotate-180 duration-500"
              >
                <RotateCcw size={24} />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-[#8E8E93] tracking-[0.2em] uppercase px-2">{t.presets}</h3>
            <div className="grid grid-cols-5 gap-3">
              {[1, 5, 10, 15, 30].map(m => (
                <button 
                  key={m}
                  onClick={() => setDuration(m)}
                  className="py-3 bg-white border border-[#E2E2E6] rounded-xl text-[12px] font-black text-[#5C5C5E] hover:border-[#80000040] hover:text-[#800000] transition-all"
                >
                  {m}M
                </button>
              ))}
            </div>
          </div>

          {/* Target Time Mode */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2E2E6] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-[#800000]" />
              <div className="text-[12px] font-black text-[#1D1D1F] uppercase tracking-widest">{t.target}</div>
            </div>
            <input 
              type="time" 
              value={countdown.targetTime}
              onChange={e => setCountdown({ targetTime: e.target.value, type: 'target' })}
              className="bg-[#F8F9FA] px-4 py-2 rounded-xl text-[14px] font-black text-[#800000] outline-none border border-transparent focus:border-[#80000020]"
            />
          </div>
        </div>

        {/* RIGHT: Visual Customization */}
        <div className="flex-1 bg-white rounded-[32px] border border-[#E2E2E6] p-10 flex flex-col gap-8 overflow-y-auto custom-scrollbar shadow-sm">
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-[#8E8E93] tracking-[0.2em] uppercase">{t.settings}</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-[#AEAEB2] uppercase block mb-3">Main Title</label>
                <input 
                  value={countdown.title}
                  onChange={e => setCountdown({ title: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E2E2E6] rounded-2xl px-6 py-4 text-[15px] font-[600] outline-none focus:border-[#80000040] transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#AEAEB2] uppercase block mb-3">Message / Subtitle</label>
                <textarea 
                  value={countdown.message}
                  onChange={e => setCountdown({ message: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E2E2E6] rounded-2xl px-6 py-4 text-[14px] font-[600] outline-none focus:border-[#80000040] transition-all h-32 resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#AEAEB2] uppercase block mb-3">{t.display}</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'both', label: 'SEMUA' },
                    { id: 'output', label: 'OUTPUT' },
                    { id: 'stage', label: 'STAGE' }
                  ].map(o => (
                    <button 
                      key={o.id}
                      onClick={() => setCountdown({ mode: o.id })}
                      className={`py-3 rounded-xl border text-[10px] font-black transition-all ${
                        countdown.mode === o.id 
                        ? 'bg-[#1D1D1F] text-white border-black shadow-lg shadow-black/10' 
                        : 'bg-white text-[#AEAEB2] border-[#E2E2E6] hover:border-black/20'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-[#F8F9FA] rounded-xl border border-[#E2E2E6]">
                  <h4 className="text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.2em] mb-3">Background Options</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-[10px] font-black text-[#AEAEB2] uppercase">Background Type</label>
                      <select 
                        value={countdown.backgroundType || 'color'}
                        onChange={e => setCountdown({ backgroundColor: e.target.value, backgroundType: e.target.value })}
                        className="bg-white border border-[#E2E2E6] rounded-lg px-3 py-2 text-[12px] font-black"
                      >
                        <option value="color">Solid Color</option>
                        <option value="image">Image from Library</option>
                        <option value="video">Video from Library</option>
                      </select>
                    </div>
                    {(countdown.backgroundType === 'image' || countdown.backgroundType === 'video') && (
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] font-black text-[#AEAEB2] uppercase">Select Media</label>
                        <button className="px-4 py-2 bg-white border border-[#E2E2E6] rounded-lg text-[12px] font-black hover:border-[#80000040]">
                          Choose from Library
                        </button>
                      </div>
                    )}
                    {countdown.backgroundType === 'color' && (
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] font-black text-[#AEAEB2] uppercase">Background Color</label>
                        <input 
                          type="color"
                          value={countdown.backgroundColor || '#000000'}
                          onChange={e => setCountdown({ backgroundColor: e.target.value })}
                          className="w-12 h-8 border border-[#E2E2E6] rounded cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownView;
