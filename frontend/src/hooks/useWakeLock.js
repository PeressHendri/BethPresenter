import { useState, useEffect, useRef } from 'react';

// MODUL 18: Screen Wake Lock Hook
const useWakeLock = (isEnabled = true) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    // Check if Wake Lock API is supported
    if ('wakeLock' in navigator) {
      setIsSupported(true);
    } else {
      console.warn('Wake Lock API is not supported in this browser');
      setIsSupported(false);
    }
  }, []);

  const requestWakeLock = async () => {
    if (!isSupported) {
      console.warn('Wake Lock API not supported');
      return false;
    }

    try {
      // Request screen wake lock
      const wakeLock = await navigator.wakeLock.request('screen');
      wakeLockRef.current = wakeLock;
      setIsActive(true);
      setError(null);

      console.log('[WakeLock] Screen wake lock activated');

      // Listen for wake lock release events
      wakeLock.addEventListener('release', () => {
        console.log('[WakeLock] Screen wake lock released');
        setIsActive(false);
        wakeLockRef.current = null;
      });

      return true;
    } catch (err) {
      console.error('[WakeLock] Failed to acquire wake lock:', err);
      setError(err.message);
      setIsActive(false);
      return false;
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsActive(false);
      console.log('[WakeLock] Screen wake lock manually released');
    }
  };

  // Auto-request wake lock when enabled
  useEffect(() => {
    if (isEnabled && isSupported && !isActive) {
      requestWakeLock();
    }

    // Cleanup on unmount
    return () => {
      releaseWakeLock();
    };
  }, [isEnabled, isSupported, isActive]);

  // Handle visibility change (user switches tabs/apps)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isEnabled && isSupported && !isActive) {
        // Re-request wake lock when page becomes visible again
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isEnabled, isSupported, isActive]);

  // Fallback for browsers without Wake Lock API
  const requestVideoWakeLock = () => {
    try {
      // Create a hidden video element to prevent sleep
      const video = document.createElement('video');
      video.style.display = 'none';
      video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjYwMSBhMGNkN2QzIC0gYW4gYmxvY2sgc2VhcmNoIGZyb20gaW5zdGFsbGF0aW9uIG9mIHRoZSBjb25zb2xlIHRvb2xzLiBodHRwOi8vd3d3LmNvbnNvbGUub3JnL2NvbnNvbGUtdG9vbHM='; // Minimal base64 video
      video.loop = true;
      video.muted = true;
      video.play().catch(err => console.warn('[WakeLock] Fallback video play failed:', err));
      
      // Store reference for cleanup
      wakeLockRef.current = video;
      setIsActive(true);
      
      console.log('[WakeLock] Fallback video wake lock activated');
      
      return true;
    } catch (err) {
      console.error('[WakeLock] Fallback failed:', err);
      return false;
    }
  };

  const releaseVideoWakeLock = () => {
    if (wakeLockRef.current && wakeLockRef.current.tagName === 'VIDEO') {
      wakeLockRef.current.pause();
      wakeLockRef.current.src = '';
      wakeLockRef.current = null;
      setIsActive(false);
      console.log('[WakeLock] Fallback video wake lock released');
    }
  };

  return {
    isSupported,
    isActive,
    error,
    requestWakeLock: isSupported ? requestWakeLock : requestVideoWakeLock,
    releaseWakeLock: isSupported ? releaseWakeLock : releaseVideoWakeLock,
    toggle: () => isActive ? releaseWakeLock() : requestWakeLock()
  };
};

export default useWakeLock;
