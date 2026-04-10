import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Clock, Target, 
  Monitor, Layout, Palette, Image as ImageIcon,
  ChevronDown
} from 'lucide-react';
import { useCountdownStore, CountdownMode, ShowOnMode } from '../stores/countdownStore';
import { useCountdown } from '../hooks/useCountdown';

const PRESETS = [
  { label: '1m', m: 1, s: 0 },
  { label: '3m', m: 3, s: 0 },
  { label: '5m', m: 5, s: 0 },
  { label: '10m', m: 10, s: 0 },
  { label: '15m', m: 15, s: 0 },
  { label: '30m', m: 30, s: 0 },
];

export function CountdownPage() {
  const store = useCountdownStore();
  const { formattedTime } = useCountdown();

  const handleStartStop = () => {
    if (store.isActive) store.pause();
    else store.start();
  };

  const applyPreset = (m: number, s: number) => {
    store.setConfig({ durationMinutes: m, durationSeconds: s, mode: 'duration' });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
      {/* ── HEADER AREA ── */}
      <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Clock className="w-6 h-6 text-emerald-500" />
            COUNTDOWN STUDIO
          </h1>
          <p className="text-sm text-gray-500 font-medium">Configure production timers and stage clocks</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {(['duration', 'target'] as CountdownMode[]).map((m) => (
              <button
                key={m}
                onClick={() => store.setConfig({ mode: m })}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  store.mode === m 
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT PANEL: CONFIG ── */}
        <div className="w-[400px] border-r border-white/5 flex flex-col bg-[#0a0a0a] overflow-y-auto">
          <div className="p-6 space-y-8">
            
            {/* 1. Time Input */}
            <section>
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 block">
                Timer Settings
              </label>
              
              {store.mode === 'duration' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Minutes</span>
                      <input 
                        type="number" 
                        value={store.durationMinutes}
                        onChange={(e) => store.setConfig({ durationMinutes: parseInt(e.target.value) || 0 })}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                       <span className="text-[10px] text-gray-500 font-bold uppercase">Seconds</span>
                       <input 
                        type="number" 
                        value={store.durationSeconds}
                        onChange={(e) => store.setConfig({ durationSeconds: parseInt(e.target.value) || 0 })}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => applyPreset(p.m, p.s)}
                        className="h-10 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-gray-400 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Target Wall Clock</span>
                  <input 
                    type="time" 
                    step="1"
                    value={store.targetTime}
                    onChange={(e) => store.setConfig({ targetTime: e.target.value })}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-2xl font-black text-white focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              )}
            </section>

            {/* 2. Text Content */}
            <section className="space-y-4">
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">
                Message & Labels
              </label>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Main Title"
                  value={store.title}
                  onChange={(e) => store.setConfig({ title: e.target.value })}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:border-emerald-500 outline-none transition-all"
                />
                <textarea 
                  placeholder="Subtitle text..."
                  value={store.subtext}
                  onChange={(e) => store.setConfig({ subtext: e.target.value })}
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-medium text-gray-300 focus:border-emerald-500 outline-none transition-all resize-none"
                />
              </div>
            </section>

            {/* 3. Appearance */}
            <section className="space-y-4">
               <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">
                Visuals & Output
              </label>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-300">Show On</span>
                  </div>
                  <select 
                    value={store.showOn}
                    onChange={(e) => store.setConfig({ showOn: e.target.value as ShowOnMode })}
                    className="bg-transparent text-xs font-black text-emerald-400 outline-none"
                  >
                    <option value="both">Both Screens</option>
                    <option value="main">Main Output Only</option>
                    <option value="display">Stage Display Only</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => store.setConfig({ bgType: 'color' })}
                    className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border transition-all text-xs font-bold ${
                      store.bgType === 'color' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-transparent border-white/10 text-gray-500'
                    }`}
                   >
                     <Palette className="w-4 h-4" /> Color
                   </button>
                   <button 
                    onClick={() => store.setConfig({ bgType: 'image' })}
                    className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border transition-all text-xs font-bold ${
                      store.bgType === 'image' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-transparent border-white/10 text-gray-500'
                    }`}
                   >
                     <ImageIcon className="w-4 h-4" /> Image
                   </button>
                </div>

                {store.bgType === 'color' ? (
                  <input 
                    type="color" 
                    value={store.background}
                    onChange={(e) => store.setConfig({ background: e.target.value })}
                    className="w-full h-10 bg-transparent border-none cursor-pointer p-0"
                  />
                ) : (
                  <button className="w-full h-12 bg-white/5 border border-dashed border-white/20 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                    Choose Background Image
                  </button>
                )}
              </div>
            </section>

          </div>
        </div>

        {/* ── MAIN WORKSPACE: PREVIEW & LIVE ── */}
        <div className="flex-1 p-8 flex flex-col gap-8 bg-[#050505]">
          {/* Real-time Preview */}
          <div className="flex-1 rounded-[32px] overflow-hidden relative border border-white/5 shadow-2xl bg-[#0a0a0a] flex items-center justify-center group">
            
            {/* Background Layer */}
            {store.bgType === 'color' ? (
              <div 
                className="absolute inset-0 transition-all duration-700 opacity-20 group-hover:opacity-40"
                style={{ backgroundColor: store.background }}
              />
            ) : (
              <div className="absolute inset-0 bg-black/40" />
            )}

            {/* Content Layer */}
            <div className="relative z-10 text-center space-y-4 px-12">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[12px] font-black text-emerald-500 uppercase tracking-[4px] block"
              >
                {store.subtext || 'GET READY'}
              </motion.span>
              
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.h2 
                    key={formattedTime}
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="text-[140px] leading-none font-black text-white tracking-tighter tabular-nums"
                  >
                    {formattedTime}
                  </motion.h2>
                </AnimatePresence>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 -z-10 bg-emerald-500/20 blur-[100px] rounded-full scale-150 opacity-50" />
              </div>

              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold text-gray-400 tracking-tight"
              >
                {store.title || 'Service Starting Soon'}
              </motion.h3>
            </div>

            {/* Badge Overlay */}
            <div className="absolute bottom-10 left-10 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full">
              <div className={`w-2 h-2 rounded-full animate-pulse ${store.isActive ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <span className="text-[10px] font-black text-white uppercase tracking-wider">
                {store.isActive ? 'LIVE OUTPUT ACTIVE' : 'PREVIEW MODE'}
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="h-28 bg-[#0a0a0a] border border-white/5 rounded-3xl flex items-center justify-between px-10">
            <div className="flex items-center gap-6">
               <button 
                onClick={handleStartStop}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl ${
                  store.isActive 
                    ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' 
                    : 'bg-emerald-500 text-black shadow-emerald-500/20 hover:bg-emerald-600'
                }`}
               >
                 {store.isActive ? <Pause className="w-8 h-8 font-black" /> : <Play className="w-8 h-8 fill-current" />}
               </button>

               <div className="flex flex-col">
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Status</span>
                 <span className={`text-xl font-black ${store.isActive ? 'text-red-500' : 'text-emerald-500'} tracking-tight`}>
                   {store.isActive ? 'TIMER RUNNING' : 'STANDING BY'}
                 </span>
               </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => store.reset()}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              
              <button 
                className={`h-16 px-10 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  store.isActive 
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-emerald-500 hover:scale-[1.02] shadow-xl active:scale-[0.98]'
                }`}
              >
                GO LIVE NOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
