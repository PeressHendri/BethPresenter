import { useState, useEffect, useRef } from 'react';

// MODUL 20: Dynamic Aspect Ratio Hook
const useAspectRatio = (defaultRatio = '16:9') => {
  const [aspectRatio, setAspectRatio] = useState(defaultRatio);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef(null);

  const aspectRatios = {
    '16:9': { width: 16, height: 9, label: '16:9 (Widescreen)', css: '16/9' },
    '4:3': { width: 4, height: 3, label: '4:3 (Standard)', css: '4/3' }
  };

  const currentRatio = aspectRatios[aspectRatio] || aspectRatios['16:9'];

  const changeAspectRatio = (newRatio) => {
    if (newRatio === aspectRatio || !aspectRatios[newRatio]) return;

    setIsTransitioning(true);
    
    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Set the new ratio after a brief delay for smooth transition
    transitionTimeoutRef.current = setTimeout(() => {
      setAspectRatio(newRatio);
      setIsTransitioning(false);
    }, 100);
  };

  const getAspectRatioStyles = () => {
    return {
      aspectRatio: currentRatio.css,
      transition: isTransitioning ? 'all 0.3s ease-in-out' : 'none',
      transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
      opacity: isTransitioning ? 0.8 : 1
    };
  };

  const getContainerStyles = () => {
    return {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      position: 'relative',
      overflow: 'hidden'
    };
  };

  const getVideoContainerStyles = () => {
    return {
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: isTransitioning ? 'all 0.3s ease-in-out' : 'none'
    };
  };

  // Broadcast aspect ratio changes to all connected displays
  const broadcastAspectRatioChange = (newRatio) => {
    // This would integrate with your socket.io system
    if (window.socket) {
      window.socket.emit('aspect-ratio-change', {
        ratio: newRatio,
        timestamp: Date.now()
      });
    }
  };

  const handleChangeAspectRatio = (newRatio) => {
    changeAspectRatio(newRatio);
    broadcastAspectRatioChange(newRatio);
    
    // Save to localStorage for persistence
    localStorage.setItem('bethpresenter-aspect-ratio', newRatio);
  };

  // Load saved aspect ratio from localStorage
  useEffect(() => {
    const savedRatio = localStorage.getItem('bethpresenter-aspect-ratio');
    if (savedRatio && aspectRatios[savedRatio]) {
      setAspectRatio(savedRatio);
    }
  }, []);

  // Listen for aspect ratio changes from other displays
  useEffect(() => {
    const handleAspectRatioChange = (data) => {
      if (data.ratio && data.ratio !== aspectRatio) {
        changeAspectRatio(data.ratio);
      }
    };

    if (window.socket) {
      window.socket.on('aspect-ratio-change', handleAspectRatioChange);
    }

    return () => {
      if (window.socket) {
        window.socket.off('aspect-ratio-change', handleAspectRatioChange);
      }
    };
  }, [aspectRatio]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts for aspect ratio switching
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + Shift + 1 for 16:9
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '1') {
        e.preventDefault();
        handleChangeAspectRatio('16:9');
      }
      
      // Ctrl/Cmd + Shift + 2 for 4:3
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '2') {
        e.preventDefault();
        handleChangeAspectRatio('4:3');
      }
      
      // Ctrl/Cmd + Shift + R to toggle between ratios
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        const nextRatio = aspectRatio === '16:9' ? '4:3' : '16:9';
        handleChangeAspectRatio(nextRatio);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [aspectRatio]);

  return {
    aspectRatio,
    currentRatio,
    isTransitioning,
    changeAspectRatio: handleChangeAspectRatio,
    getAspectRatioStyles,
    getContainerStyles,
    getVideoContainerStyles,
    availableRatios: Object.keys(aspectRatios),
    aspectRatioData: aspectRatios
  };
};

export default useAspectRatio;
