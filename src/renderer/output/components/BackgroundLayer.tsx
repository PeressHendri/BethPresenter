import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    return () => unsubs.forEach((fn) => fn());
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
      <AnimatePresence mode="popLayout">
        <motion.div
           key={background?.url || background?.color || 'empty'}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.8, ease: 'easeInOut' }}
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
                style={{ backgroundColor: background?.color || 'black' }} 
             />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dim Overlay */}
      {background?.url && (
        <motion.div 
           className="absolute inset-0 bg-black pointer-events-none"
           initial={{ opacity: overlayOpacity }}
           animate={{ opacity: overlayOpacity }}
           transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
}
