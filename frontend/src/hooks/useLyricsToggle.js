import { useState, useEffect, useRef } from 'react';

// MODUL 19: Lyrics Toggle Hook with Fade Animation
const useLyricsToggle = (initialState = true) => {
  const [isLyricsVisible, setIsLyricsVisible] = useState(initialState);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef(null);

  const toggleLyrics = (forceState = null) => {
    const newState = forceState !== null ? forceState : !isLyricsVisible;
    
    if (newState === isLyricsVisible) return;

    setIsTransitioning(true);
    
    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Set the new state after a brief delay for smooth transition
    transitionTimeoutRef.current = setTimeout(() => {
      setIsLyricsVisible(newState);
      setIsTransitioning(false);
    }, 50); // Small delay for smooth fade
  };

  const showLyrics = () => toggleLyrics(true);
  const hideLyrics = () => toggleLyrics(false);

  const getOpacity = () => {
    if (isTransitioning) {
      return isLyricsVisible ? 0.3 : 0.7; // Mid-transition opacity
    }
    return isLyricsVisible ? 1 : 0;
  };

  const getVisibility = () => {
    return isLyricsVisible || isTransitioning ? 'visible' : 'hidden';
  };

  const getTransform = () => {
    if (isTransitioning) {
      return isLyricsVisible ? 'translateY(-10px)' : 'translateY(10px)';
    }
    return isLyricsVisible ? 'translateY(0)' : 'translateY(20px)';
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // 'B' key to toggle lyrics (like PowerPoint)
      if (e.key === 'b' || e.key === 'B') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          toggleLyrics();
        }
      }
      
      // 'H' key to hide lyrics
      if (e.key === 'h' || e.key === 'H') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          hideLyrics();
        }
      }
      
      // 'S' key to show lyrics
      if (e.key === 's' || e.key === 'S') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          showLyrics();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  return {
    isLyricsVisible,
    isTransitioning,
    toggleLyrics,
    showLyrics,
    hideLyrics,
    getOpacity,
    getVisibility,
    getTransform,
    styles: {
      opacity: getOpacity(),
      visibility: getVisibility(),
      transform: getTransform(),
      transition: 'all 0.3s ease-in-out',
      pointerEvents: isLyricsVisible || isTransitioning ? 'auto' : 'none'
    }
  };
};

export default useLyricsToggle;
