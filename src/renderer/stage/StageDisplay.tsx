import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlideInfo {
  label: string;
  text: string;
  songTitle?: string;
}

interface TimerInfo {
  remaining: number;
  total: number;
  running: boolean;
  title?: string;
}

export function StageDisplay() {
  const [currentSlide, setCurrentSlide] = useState<SlideInfo | null>(null);
  const [nextSlide, setNextSlide] = useState<SlideInfo | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [shouldFlash, setShouldFlash] = useState(false);
  const [timer, setTimer] = useState<TimerInfo | null>(null);
  const [isBlank, setIsBlank] = useState(false);
  const [clock, setClock] = useState('');

  // 1. High-precision Digital Clock (HH:MM:SS)
  useEffect(() => {
    let frameId: number;
    const update = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
      frameId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frameId);
  }, []);

  // 2. IPC Orchestration
  useEffect(() => {
    const ipc = (window as any).electron?.ipcRenderer;
    if (!ipc) return;

    const unsubs: Array<() => void> = [];

    // Notify dashboard that stage is connected
    ipc.invoke('stage-report-connection', true);

    unsubs.push(ipc.on('stage:update-slide', (data: { current: SlideInfo | null; next: SlideInfo | null }) => {
      setCurrentSlide(data.current);
      setNextSlide(data.next);
    }));

    unsubs.push(ipc.on('stage:receive-message', (data: any) => {
      const text = typeof data === 'string' ? data : data.text;
      const flash = typeof data === 'object' ? data.flash : false;
      
      setMessage(text);
      if (flash) {
        setShouldFlash(true);
        setTimeout(() => setShouldFlash(false), 3000);
      }
    }));

    unsubs.push(ipc.on('stage:clear-message', () => setMessage(null)));

    unsubs.push(ipc.on('stage:timer-update', (t: TimerInfo | null) => setTimer(t)));
    unsubs.push(ipc.on('set-blank', (blank: boolean) => setIsBlank(blank)));

    return () => {
      unsubs.forEach(fn => fn());
      ipc.invoke('stage-report-connection', false);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col overflow-hidden font-sans uppercase">
      
      {/* ── TOP BAR: CLOCK & STATUS ── */}
      <div className="h-[15vh] border-b border-white/10 flex items-center justify-between px-16">
         <div className="flex flex-col">
           <span className="text-[1.5vw] font-black text-[#2D83FF] tracking-widest leading-none">BETH STAGE MONITOR</span>
           <span className="text-[1vw] font-bold text-white/20 tracking-[0.5em] mt-2">Active Production Stream</span>
         </div>
         <div className="text-[8vw] font-black tracking-tighter tabular-nums text-white/90 leading-none">
           {clock}
         </div>
      </div>

      <main className="flex-1 flex flex-col p-16 space-y-12">
         
         {/* ── PRIMARY VIEW: CURRENT SLIDE ── */}
         <div className="flex-[3] flex flex-col justify-center">
            <div className="text-[1.2vw] font-black text-[#2D83FF] tracking-[0.8em] mb-12 opacity-40">Current Lyrik</div>
            <motion.h1 
               key={currentSlide?.text}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-[6vw] font-black leading-[0.95] tracking-tighter line-clamp-3"
            >
               {isBlank ? "[ OUTPUT BLANKED ]" : (currentSlide?.text || "READY")}
            </motion.h1>
         </div>

         {/* ── SECONDARY VIEW: NEXT UP & TIMER ── */}
         <div className="flex-1 border-t border-white/10 pt-16 flex justify-between items-end">
            <div className="flex-1 max-w-[60%]">
               <div className="text-[1.2vw] font-black text-white/20 tracking-[0.8em] mb-6">Next Up Slide</div>
               <p className="text-[3vw] font-black text-white/40 truncate tracking-tight">
                  {nextSlide?.text || "End of Sequence"}
               </p>
            </div>
            
            {timer && (
              <div className="flex flex-col items-end">
                 <div className="text-[1.2vw] font-black text-emerald-500 tracking-[0.5em] mb-2">Service Timer</div>
                 <div className="text-[6vw] font-black tracking-widest tabular-nums leading-none">
                   {Math.floor(timer.remaining / 60)}:{(timer.remaining % 60).toString().padStart(2, '0')}
                 </div>
              </div>
            )}
         </div>
      </main>

      {/* ── BROADCAST OVERLAY: MESSAGES ── */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              backgroundColor: shouldFlash ? ["rgba(45,131,255,0.95)", "rgba(0,0,0,0.95)", "rgba(45,131,255,0.95)", "rgba(0,0,0,0.95)"] : "rgba(45,131,255,0.95)"
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              backgroundColor: { duration: 1.5, repeat: shouldFlash ? 1 : 0 },
              default: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
            }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-24 backdrop-blur-xl"
          >
             <div className="text-center max-w-7xl">
                <span className="block text-[2vw] font-black tracking-[1em] text-black/50 mb-12 italic">MESSAGE FOR TEAM</span>
                <p className="text-[8vw] font-black text-white leading-[0.9] tracking-tighter uppercase break-words">
                  {message}
                </p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
