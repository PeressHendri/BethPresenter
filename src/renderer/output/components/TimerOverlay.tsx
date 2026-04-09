import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerData {
  duration: number;
  title?: string;
  subtext?: string;
  background?: { color?: string; url?: string };
}

interface TimerOverlayProps {
  timerData: TimerData | null;
  isRunning: boolean;
}

export function TimerOverlay({ timerData, isRunning }: TimerOverlayProps) {
  const [remaining, setRemaining] = useState(0);
  const totalDurationRef = useRef(0);
  
  useEffect(() => {
    if (timerData) {
      setRemaining(timerData.duration);
      totalDurationRef.current = timerData.duration;
    }
  }, [timerData]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  if (!timerData) return null;

  const isDone = remaining === 0;
  const progress = totalDurationRef.current > 0 ? remaining / totalDurationRef.current : 0;
  const circumference = 2 * Math.PI * 180;
  const offset = circumference * (1 - progress);

  const formatTime = (sec: number) => {
    const abs = Math.abs(sec);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const glowClass = remaining < 60 && !isDone && isRunning ? 'animate-pulse' : '';

  return (
    <AnimatePresence>
       <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 1.05 }}
         transition={{ duration: 0.5, ease: 'easeOut' }}
         className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
         style={{ backgroundColor: timerData.background?.color || '#0a0a1a' }}
       >
          {timerData.title && (
             <div className="text-white/80 text-[3vw] mb-8 font-bold tracking-tight px-10 text-center" style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.8)' }}>
               {timerData.title}
             </div>
          )}

          <div className={`relative flex items-center justify-center ${glowClass}`}>
            <svg width="400" height="400" viewBox="0 0 400 400" className="-rotate-90">
              <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
              <circle cx="200" cy="200" r="180" fill="none"
                stroke={isDone ? '#ef4444' : isRunning ? '#8b5cf6' : '#f59e0b'}
                strokeWidth="16" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0px 0px 8px rgba(139,92,246,0.8))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center drop-shadow-2xl">
              <span 
                 className={`font-mono font-bold leading-none ${isDone ? 'text-red-400' : 'text-white'}`}
                 style={{ 
                    fontSize: '8vw',
                    textShadow: isDone 
                      ? '0 0 40px rgba(239,68,68,0.8)' 
                      : '0 0 40px rgba(255,255,255,0.3), 4px 4px 12px rgba(0,0,0,0.9)'
                 }}
              >
                {formatTime(remaining)}
              </span>
              <span className="text-white/50 text-[1.5vw] mt-4 font-medium uppercase tracking-widest">
                 {isDone ? 'Finished' : isRunning ? '' : 'Paused'}
              </span>
            </div>
          </div>

          {timerData.subtext && (
             <div className="text-white/60 text-[2vw] mt-8 font-medium px-10 text-center uppercase tracking-widest">
               {timerData.subtext}
             </div>
          )}
       </motion.div>
    </AnimatePresence>
  );
}
