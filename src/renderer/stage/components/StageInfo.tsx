import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerInfo {
  remaining: number;
  total: number;
  running: boolean;
  title?: string;
}

interface StageInfoProps {
  timer: TimerInfo | null;
  message: string;
}

export function StageInfo({ timer, message }: StageInfoProps) {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  function formatTime(s: number): string {
    const m = Math.floor(Math.abs(s) / 60);
    const sec = Math.abs(s) % 60;
    const sign = s < 0 ? '-' : '';
    return `${sign}${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  return (
    <div className="bg-surface-base p-6 flex-shrink-0 min-h-[140px] flex flex-col justify-center">
      
      {/* Clock Top */}
      <div className="absolute top-8 right-10 flex gap-4 items-center z-20">
         <span className="text-xl font-mono text-accent-400 font-bold drop-shadow-md">{clock}</span>
      </div>

      <AnimatePresence mode="wait">
        {timer && timer.running ? (
          <motion.div
            key="timer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center text-center"
          >
            <div className="text-[10px] text-amber-500 font-bold tracking-[0.1em] uppercase mb-1">⏱ TIMER</div>
            {timer.title && <div className="text-xs text-text-400 font-semibold mb-1">{timer.title}</div>}
            
            <div className={`text-5xl font-mono font-bold tracking-tight ${timer.remaining <= 60 ? 'text-red-500 border-red-500/20' : 'text-text-100'} transition-colors`}>
              {formatTime(timer.remaining)}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-border-strong rounded-full mt-3 overflow-hidden">
               <div 
                 className={`h-full ${timer.remaining <= 60 ? 'bg-red-500' : 'bg-accent-500'} transition-all ease-linear duration-1000`}
                 style={{ width: `${Math.max(0, (timer.remaining / timer.total) * 100)}%` }}
               />
            </div>
          </motion.div>
        ) : message ? (
          <motion.div
            key="message"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col text-center justify-center bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 h-full"
          >
            <div className="text-[10px] text-amber-500 font-bold tracking-[0.1em] mb-1">📢 PESAN OPERATOR</div>
            <p className="text-xl font-bold text-text-100">{message}</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-text-500 h-full"
          >
            <span className="text-sm font-semibold">Ready</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
