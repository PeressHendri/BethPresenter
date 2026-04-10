import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SlideData } from '@/shared/types';
import { BackgroundLayer } from './components/BackgroundLayer';
import { LyricsLayer, FormattingData } from './components/LyricsLayer';
import { TimerOverlay } from './components/TimerOverlay';
import { BlackOverlay } from './components/BlackOverlay';

export function OutputWindow() {
  const [slide, setSlide] = useState<SlideData>({ title: '', text: '', type: 'blank' });
  const [bibleData, setBibleData] = useState<{ text: string, reference: string, translation: string } | null>(null);
  const [mode, setMode] = useState<'slide' | 'bible'>('slide');
  
  const [formatting, setFormatting] = useState<FormattingData>({
    fontFamily: 'Inter',
    fontSize: 'auto',
    fontWeight: 'bold',
    textAlign: 'center',
    verticalAlign: 'center',
    lineHeight: 1.4,
    textColor: '#ffffff',
    textShadow: 'soft',
    paddingH: 120,
    paddingV: 80,
    overlayOpacity: 0.4
  });

  const [background, setBackground] = useState<any | null>(null);
  
  // States mapping mapping G-Presenter actions 
  const [isHidden, setIsHidden] = useState(false);  // text fades out, bg remains
  const [isBlank, setIsBlank] = useState(false);    // background remains, text fades
  const [isBlack, setIsBlack] = useState(false);    // pure blackout overlay fades in

  // Timer states mapped from existing IPC
  const [timerData, setTimerData] = useState<any | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const ipc = (window as any).electron?.ipcRenderer;
    if (!ipc) return;

    const unSub: Array<() => void> = [];

    unSub.push(ipc.on('display-slide', (data: SlideData) => {
      setSlide(data);
      if (data.type === 'blank') setIsBlank(true);
      else setIsBlank(false);
      setBibleData(null);
      setMode('slide');
    }));

    unSub.push(ipc.on('display-bible', (data: any) => {
      setBibleData(data);
      setIsBlank(false);
      setMode('bible');
    }));

    unSub.push(ipc.on('apply-formatting', (fmt: FormattingData) => {
       // Merge formatting
       setFormatting(prev => ({ ...prev, ...fmt }));
    }));

    unSub.push(ipc.on('set-background', (bg: any) => {
       setBackground(bg);
    }));

    // Specific toggles
    unSub.push(ipc.on('set-blank', (b: boolean) => setIsBlank(b)));

    unSub.push(ipc.on('output-action', (action: string) => {
       if (action === 'toggle-hide') setIsHidden(p => !p);
       if (action === 'toggle-blank') setIsBlank(p => !p);
       if (action === 'toggle-black') setIsBlack(p => !p);
    }));

    // Extensively handle explicit new signals if added
    unSub.push(ipc.on('output:blank', (b: boolean) => setIsBlank(b)));
    unSub.push(ipc.on('output:hideText', (h: boolean) => setIsHidden(h)));
    unSub.push(ipc.on('output:blackScreen', (bk: boolean) => setIsBlack(bk)));

    // Countdown Hub
    unSub.push(ipc.on('output:countdown-start', (data: any) => {
      setTimerData(data);
      setIsTimerRunning(true);
    }));
    unSub.push(ipc.on('output:countdown-pause', () => setIsTimerRunning(false)));
    unSub.push(ipc.on('output:countdown-reset', () => {
      setIsTimerRunning(false);
      setTimerData(null);
    }));

    return () => unSub.forEach(fn => {
       if (typeof fn === 'function') fn();
    });
  }, []);

  // F11 fullscreen trigger
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
       if (e.key === 'F11') {
          e.preventDefault();
          (window as any).electron?.ipcRenderer?.invoke('output:toggle-fullscreen');
       }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Compute if text should be fully hidden based on toggles
  const textHiddenStatus = isHidden || isBlank;
  
  // Decide what text to show based on Mode
  const activeText = mode === 'slide' ? slide.text : (bibleData?.text || '');
  const activeTitle = mode === 'slide' ? slide.title : undefined;

  return (
    <div 
      className="w-screen h-screen overflow-hidden bg-black relative select-none" 
      style={{ aspectRatio: formatting.aspectRatio ? formatting.aspectRatio.replace(':', '/') : undefined }} // Support 4:3 dynamically if passed via CSS block
    >
       {/* LAYER 1: Background stack -> fades cross over smoothly */}
       <BackgroundLayer 
         background={background} 
         overlayOpacity={formatting.overlayOpacity ?? 0.4} 
       />

       {/* LAYER 2: Lyrics display mapped accurately */}
       <LyricsLayer 
         mode={mode}
         text={activeText}
         title={activeTitle}
         reference={mode === 'bible' ? bibleData?.reference : undefined}
         translation={mode === 'bible' ? bibleData?.translation : undefined}
         formatting={formatting}
         isHidden={textHiddenStatus}
       />

       {/* LAYER 3: Overlay timer projection */}
       <TimerOverlay 
         timerData={timerData}
         isRunning={isTimerRunning}
       />

       {/* LAYER 4: Absolute Blackout */}
       <BlackOverlay isVisible={isBlack} />
    </div>
  );
}
