import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerData {
  seconds: number;
  title?: string;
  subtext?: string;
  bg?: string;
  bgType?: 'color' | 'image';
  showOn?: string;
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
      setRemaining(timerData.seconds);
      totalDurationRef.current = timerData.seconds;
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
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    
    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');

    if (h > 0) return `${hh}:${mm}:${ss}`;
    return `${mm}:${ss}`;
  };

  return (
    <AnimatePresence>
       <motion.div 
         initial={{ opacity: 0, scale: 0.98 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 1.02 }}
         transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
         className="absolute inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none"
         style={{ 
           backgroundColor: timerData.bgType === 'color' ? timerData.bg : '#050505',
           backgroundImage: timerData.bgType === 'image' ? `url(${timerData.bg})` : undefined,
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}
       >
          {/* Subtle vignette for better text readability */}
          <div className="absolute inset-0 bg-black/40 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            {timerData.subtext && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-500 text-[1.5vw] font-black uppercase tracking-[0.5vw] mb-6"
              >
                {timerData.subtext}
              </motion.div>
            )}

            <div className="relative">
               <motion.span 
                 key={remaining}
                 initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                 animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                 className={`font-black tracking-tighter tabular-nums leading-none ${isDone ? 'text-red-500' : 'text-white'}`}
                 style={{ 
                    fontSize: '18vw',
                    textShadow: '0 10px 40px rgba(0,0,0,0.5)'
                 }}
               >
                 {formatTime(remaining)}
               </motion.span>
               
               {/* Ambient Glow */}
               <div className={`absolute inset-0 -z-10 blur-[100px] rounded-full scale-150 opacity-40 transition-colors duration-1000 ${isDone ? 'bg-red-500' : 'bg-emerald-500'}`} />
            </div>

            {timerData.title && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/60 text-[2.5vw] mt-6 font-bold tracking-tight"
              >
                {timerData.title}
              </motion.div>
            )}
          </div>

          {/* Progress Circular Accent (Subtle) */}
          <svg width="600" height="600" viewBox="0 0 400 400" className="absolute opacity-10 -rotate-90 pointer-events-none">
            <circle cx="200" cy="200" r="180" fill="none" stroke="white" strokeWidth="2" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
       </motion.div>
    </AnimatePresence>
  );
}
