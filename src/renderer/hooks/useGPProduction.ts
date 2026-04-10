import { useState, useCallback } from 'react';

export interface ProductionState {
  currentSlide: any;
  nextSlide: any;
  liveMedia: any;
  isLive: boolean;
  isBlackout: boolean;
  isLyricsHidden: boolean;
}

export function useGPProduction() {
  const [state, setState] = useState<ProductionState>({
    currentSlide: null,
    nextSlide: null,
    liveMedia: null,
    isLive: false,
    isBlackout: false,
    isLyricsHidden: false,
  });

  const goLive = useCallback((item: any) => {
    setState(s => ({ ...s, currentSlide: item, isLive: true, isBlackout: false }));
    // IPC call would happen here to update output window
    if ((window as any).electron?.ipcRenderer) {
       (window as any).electron.ipcRenderer.send('output:update', item);
    }
  }, []);

  const toggleBlackout = useCallback(() => {
    setState(s => ({ ...s, isBlackout: !s.isBlackout }));
  }, []);

  const toggleHideLyrics = useCallback(() => {
    setState(s => ({ ...s, isLyricsHidden: !s.isLyricsHidden }));
  }, []);

  const nextSlide = useCallback(() => {
    // Logic to move to next slide based on service order
    console.log('Navigating to next slide');
  }, []);

  const prevSlide = useCallback(() => {
    console.log('Navigating to prev slide');
  }, []);

  return {
    ...state,
    goLive,
    toggleBlackout,
    toggleHideLyrics,
    nextSlide,
    prevSlide,
    setProductionState: setState
  };
}
