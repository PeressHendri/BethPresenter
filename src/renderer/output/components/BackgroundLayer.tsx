import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../../assets/logo.png';

interface BackgroundLayerProps {
  background: {
    type?: string;
    url?: string;
    color?: string;
  } | null;
  overlayOpacity?: number;
}

export function BackgroundLayer({ background, overlayOpacity = 0.4 }: BackgroundLayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ipc = (window as any).electron?.ipcRenderer;
    if (!ipc) return;

    const unsubs: Array<() => void> = [];

    // Playback directives sent from Operator panels
    unsubs.push(ipc.on('video:play', () => videoRef.current?.play().catch(() => {})));
    unsubs.push(ipc.on('video:pause', () => videoRef.current?.pause()));
    unsubs.push(ipc.on('video:stop', () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }));
    unsubs.push(ipc.on('video:setLoop', (loop: boolean) => {
      if (videoRef.current) videoRef.current.loop = loop;
    }));
    unsubs.push(ipc.on('video:setMuted', (muted: boolean) => {
      if (videoRef.current) videoRef.current.muted = muted;
    }));

    // Trigger video playback automatically if URL identical but requires restarting
    // handled intrinsically via React key, but we leave the hooks active above
    return () => unsubs.forEach((fn) => {
      if (typeof fn === 'function') fn();
    });
  }, []);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const ipc = (window as any).electron?.ipcRenderer;
    if (ipc) {
      ipc.send('output:video:progress-update', {
        currentTime: videoRef.current.currentTime,
        duration: videoRef.current.duration,
        paused: videoRef.current.paused,
      });
    }
  };

  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden pointer-events-none">
      {/* ── CINEMATIC AMBIENT ENGINE (Enhanced 'Cool' Layer) ── */}
      {!background?.url && (
         <div className="absolute inset-0 overflow-hidden bg-[#050505]">
            
            {/* 1. Cinematic Landscape Base (Poster Style) */}
            <div className="absolute inset-0 opacity-40">
               <img 
                 src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop" 
                 className="w-full h-full object-cover grayscale brightness-50 contrast-125"
                 alt="landscape"
               />
            </div>

            {/* 2. Intense Orbital Gradients (Vibrant Colors) */}
            <motion.div 
               animate={{ 
                  x: [0, 100, -100, 0],
                  y: [0, 50, -50, 0],
                  scale: [1, 1.3, 0.8, 1],
               }}
               transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -inset-[50%] bg-gradient-to-tr from-[#2D83FF] via-[#B56DFF] to-transparent blur-[120px] rounded-full opacity-40"
            />
            <motion.div 
               animate={{ 
                  x: [0, -80, 80, 0],
                  y: [0, -60, 60, 0],
                  scale: [1.2, 0.9, 1.2, 1],
               }}
               transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -inset-[50%] bg-gradient-to-bl from-[#00D2D2] via-[#240b36] to-transparent blur-[140px] rounded-full opacity-35"
            />

            {/* 3. Cinematic Particles (Floating Dust) */}
            <div className="absolute inset-0 z-10">
               {[...Array(15)].map((_, i) => (
                  <motion.div
                     key={i}
                     initial={{ 
                        x: Math.random() * 100 + "%", 
                        y: Math.random() * 100 + "%", 
                        opacity: 0,
                        scale: Math.random() * 0.5 + 0.5
                     }}
                     animate={{
                        y: ["-10%", "110%"],
                        opacity: [0, 0.6, 0.6, 0],
                        x: (Math.random() * 20 - 10) + (Math.random() * 100) + "%"
                     }}
                     transition={{
                        duration: 10 + Math.random() * 15,
                        repeat: Infinity,
                        delay: Math.random() * 10,
                        ease: "linear"
                     }}
                     className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                  />
               ))}
            </div>

            {/* 4. Cinematic Grain Overlay */}
            <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay pointer-events-none grayscale contrast-125 brightness-110">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            {/* 5. Vignette Shadow */}
            <div className="absolute inset-0 shadow-[inset_0_0_300px_rgba(0,0,0,0.95)]" />
         </div>
      )}

      <AnimatePresence mode="popLayout">
        <motion.div
           key={background?.url || background?.color || 'empty'}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
           className="absolute inset-0 w-full h-full"
        >
          {background?.url ? (
             background.type === 'video' ? (
                <video 
                   ref={videoRef}
                   src={background.url} 
                   autoPlay 
                   loop 
                   muted 
                   playsInline 
                   onTimeUpdate={handleTimeUpdate}
                   className="w-full h-full object-cover" 
                />
             ) : (
                <img 
                   src={background.url} 
                   className="w-full h-full object-cover" 
                   alt="bg"
                />
             )
          ) : (
             <div 
                className="w-full h-full" 
                style={{ backgroundColor: background?.color || 'transparent' }} 
             />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dim Overlay */}
      {(background?.url || background?.color) && (
        <motion.div 
           className="absolute inset-0 bg-black pointer-events-none"
           initial={{ opacity: overlayOpacity }}
           animate={{ opacity: overlayOpacity }}
           transition={{ duration: 0.5 }}
        />
      )}

      {/* ── DYNAMIC BRANDING LOGO (Logo Layer) ── */}
      <div className="absolute inset-0 z-50 pointer-events-none">
         <motion.div
            initial={false}
            animate={{
               scale: !background?.url ? 1 : 0.45,
               opacity: !background?.url ? 1 : 0.35,
               x: !background?.url ? 0 : "40%", 
               y: !background?.url ? 0 : "40%", 
            }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full flex items-center justify-center"
         >
            <div className="flex flex-col items-center gap-6">
               <div className="relative group">
                  {/* Subtle Glow behind the logo */}
                  {!background?.url && (
                    <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-150 animate-pulse" />
                  )}
                  <img 
                    src={logoImg} 
                    alt="Logo" 
                    className="w-64 h-auto drop-shadow-[0_20px_50px_rgba(255,255,255,0.15)] object-contain"
                  />
               </div>
               
               {!background?.url && (
                  <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.8, duration: 1 }}
                     className="flex flex-col items-center gap-1"
                  >
                     <p className="text-[11px] font-black uppercase tracking-[0.8em] text-white/60">
                        Care, Love, and Serve
                     </p>
                  </motion.div>
               )}
            </div>
         </motion.div>
      </div>
    </div>
  );
}
