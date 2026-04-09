import React, { useState, useEffect } from 'react';
import { CurrentLyrics } from './components/CurrentLyrics';
import { NextSlidePreview } from './components/NextSlidePreview';
import { StageInfo } from './components/StageInfo';

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
  const [operatorMessage, setOperatorMessage] = useState('');
  const [timer, setTimer] = useState<TimerInfo | null>(null);
  const [isBlank, setIsBlank] = useState(false);

  // Settings for Layout toggle
  const [layoutMode, setLayoutMode] = useState<'A' | 'B'>('A');

  useEffect(() => {
    const ipc = (window as any).electron?.ipcRenderer;
    if (!ipc) return;

    const unsubs: Array<() => void> = [];

    // Request settings (Layout)
    ipc.invoke('setting:get', 'stage-layout-mode').then((res: string) => {
      if (res && (res === 'A' || res === 'B')) setLayoutMode(res as 'A' | 'B');
    }).catch(console.error);

    // Watch dynamic settings
    unsubs.push(ipc.on('stage:layout-updated', (mode: 'A' | 'B') => {
      setLayoutMode(mode);
    }));

    // Data pipes
    unsubs.push(ipc.on('stage:update-slide', (data: { current: SlideInfo | null; next: SlideInfo | null }) => {
      setCurrentSlide(data.current);
      setNextSlide(data.next);
    }));

    unsubs.push(ipc.on('stage:set-message', (msg: string) => {
      setOperatorMessage(msg);
      // Auto clear message after 10s
      if (msg) {
        setTimeout(() => setOperatorMessage(''), 10000);
      }
    }));

    unsubs.push(ipc.on('stage:timer-update', (t: TimerInfo | null) => {
      setTimer(t);
    }));

    unsubs.push(ipc.on('set-blank', (blank: boolean) => {
      setIsBlank(blank);
    }));

    return () => unsubs.forEach(fn => fn());
  }, []);

  return (
    <div className="w-screen h-screen bg-[#0A0A0F] text-white flex overflow-hidden font-sans">
      {layoutMode === 'A' ? (
        // Opsi A: Landscape 3 panel horizontal (50% | 30% | 20%)
        <div className="flex w-full h-full">
           <div className="w-1/2 h-full flex flex-col">
             <CurrentLyrics slide={currentSlide} isBlank={isBlank} />
           </div>
           <div className="w-[30%] h-full flex flex-col border-r border-border-default">
             <NextSlidePreview slide={nextSlide} />
           </div>
           <div className="flex-1 h-full flex flex-col relative">
             <StageInfo timer={timer} message={operatorMessage} />
           </div>
        </div>
      ) : (
        // Opsi B: Landscape 2 baris (70% Atas Current, 30% Bawah terbagi 2)
        <div className="flex flex-col w-full h-full">
           <div className="flex-[7] w-full flex flex-col border-b border-border-default">
             <CurrentLyrics slide={currentSlide} isBlank={isBlank} />
           </div>
           <div className="flex-[3] w-full flex flex-row">
             <div className="w-1/2 h-full border-r border-border-default">
               <NextSlidePreview slide={nextSlide} />
             </div>
             <div className="w-1/2 h-full relative">
               <StageInfo timer={timer} message={operatorMessage} />
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
