import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import SlideRenderer from '../components/SlideRenderer';
import useAspectRatio from '../hooks/useAspectRatio';

const SOCKET_URL = 'http://localhost:5000';

const DisplayClientPage = () => {
  const { pin } = useParams();
  const [slide, setSlide] = useState(null);
  const [globalBg, setGlobalBg] = useState(() => {
    try {
      const saved = localStorage.getItem('beth_global_bg');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isBlank, setIsBlank] = useState(false);
  const [countdown, setCountdown] = useState({ isActive: false });
  const [videoControl, setVideoControl] = useState({ isPlaying: true, isMuted: false });
  const socketRef = useRef(null);

  const {
    aspectRatio,
    currentRatio,
    isTransitioning,
    getAspectRatioStyles,
    getContainerStyles,
    getVideoContainerStyles,
    availableRatios,
    aspectRatioData
  } = useAspectRatio('16:9');

  /* ─── normalise incoming envelope into a flat slide object ─── */
  const normaliseSlide = (raw) => {
    if (!raw) return null;
    // Support nested data/payload
    const d = raw.data || raw.payload || raw;
    // Merge top-level fields from envelope with inner data
    return {
      ...d,
      contentType: raw.contentType || d.contentType || d.type || 'song',
      isBlank: raw.isBlank ?? d.isBlank ?? false,
    };
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      if (pin) {
        // Join display-specific room for multi-display sync
        socketRef.current.emit('join-display-room', { 
          pin: pin,
          clientType: 'display',
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        });
      }
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      if (pin) {
        socketRef.current.emit('leave-display-room', { pin });
      }
    });

    socketRef.current.on('sync-slide', (data) => {
      const normalised = normaliseSlide(data);
      setSlide(normalised);
      setIsBlank(normalised?.isBlank || false);

      const bg = normalised?.globalBackground || normalised?.background;
      if (bg) {
        setGlobalBg(bg);
        localStorage.setItem('beth_global_bg', JSON.stringify(bg));
      }
    });

    // Multi-display sync events
    socketRef.current.on('display-slide-update', (data) => {
      const normalised = normaliseSlide(data);
      setSlide(normalised);
      setIsBlank(normalised?.isBlank || false);

      const bg = normalised?.globalBackground || normalised?.background;
      if (bg) {
        setGlobalBg(bg);
        localStorage.setItem('beth_global_bg', JSON.stringify(bg));
      }
    });

    socketRef.current.on('display-countdown-update', (data) => {
      if (data && (data.mode === 'both' || data.mode === 'output')) {
        setCountdown(data.countdown || data);
      }
    });

    socketRef.current.on('display-video-control', (data) => {
      setVideoControl(v => ({ ...v, ...data }));
    });

    socketRef.current.on('sync-global-bg', (bg) => {
      setGlobalBg(bg);
      if (bg) localStorage.setItem('beth_global_bg', JSON.stringify(bg));
      else localStorage.removeItem('beth_global_bg');
    });

    socketRef.current.on('sync-video-control', (data) => {
      setVideoControl(v => ({ ...v, ...data }));
    });

    socketRef.current.on('sync-countdown', (data) => {
      if (data && (data.mode === 'both' || data.mode === 'output')) {
        setCountdown(data.countdown || data);
      }
    });

    /* ─── Local window.postMessage listener (for local output window) ─── */
    const handleMessage = (e) => {
      if (!e.data?.type) return;

      if (e.data.type === 'SET_LIVE_SLIDE' || e.data.type === 'UPDATE_SLIDE') {
        const normalised = normaliseSlide(e.data.data || e.data.payload || e.data);
        setSlide(normalised);
        setIsBlank(normalised?.isBlank || false);

        const bg = normalised?.globalBackground || normalised?.background;
        if (bg) {
          setGlobalBg(bg);
          localStorage.setItem('beth_global_bg', JSON.stringify(bg));
        }
      }

      if (e.data.type === 'SET_GLOBAL_BG') {
        const bg = e.data.payload || e.data.background;
        setGlobalBg(bg);
        if (bg) localStorage.setItem('beth_global_bg', JSON.stringify(bg));
        else localStorage.removeItem('beth_global_bg');
      }

      if (e.data.type === 'SYNC_VIDEO_CONTROL') {
        setVideoControl(v => ({ ...v, ...e.data.payload }));
      }

      if (e.data.type === 'SET_COUNTDOWN') {
        const data = e.data.payload || e.data.countdown;
        if (data && (data.mode === 'both' || data.mode === 'output')) {
          setCountdown(data);
        }
      }

      // Blank toggle from operator
      if (e.data.type === 'TOGGLE_BLANK') {
        setIsBlank(b => !b);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      socketRef.current?.disconnect();
      window.removeEventListener('message', handleMessage);
    };
  }, [pin]);

  /* ─── Keyboard shortcuts: B = blank ─── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'b' || e.key === 'B') setIsBlank(b => !b);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ─── Build merged slide state for renderer ─── */
  const rendererSlide = slide ? { ...slide, isBlank } : (isBlank ? { isBlank: true } : null);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Connection indicator (small dot, no overlay) */}
      {!isConnected && pin && (
        <div className="absolute top-3 right-3 z-50 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-white text-[10px] font-black uppercase tracking-widest">Menghubungkan...</span>
        </div>
      )}

      {/* URL Display for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-3 left-3 z-50 bg-black/60 px-3 py-1.5 rounded-full">
          <span className="text-white text-[10px] font-black">PIN: {pin}</span>
        </div>
      )}
      
      {/* Multi-Display indicator */}
      {isConnected && (
        <div className="absolute top-3 right-3 z-50 bg-green-500/20 px-3 py-1.5 rounded-full border border-green-500/30">
          <span className="text-green-500 text-[10px] font-black">SYNCED</span>
        </div>
      )}

      {/* Aspect Ratio Indicator */}
      <div className={`absolute top-4 right-4 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-black z-50 transition-all ${
        isTransitioning ? 'bg-yellow-500/20 text-yellow-300' : 'bg-white/10'
      }`}>
        {currentRatio.label}
        {isTransitioning && (
          <span className="ml-2 animate-pulse">...</span>
        )}
      </div>

      <div style={getContainerStyles()}>
        <div style={getAspectRatioStyles()}>
          <SlideRenderer
            slide={rendererSlide}
            format={slide?.format}
            globalBg={globalBg}
            showLabel={false}
            showLiveIndicator={false}
            showControls={false}
            isPlaying={videoControl.isPlaying}
            isMuted={videoControl.isMuted}
            isLoop={true}
          />
        </div>
      </div>

      {/* GLOBAL COUNTDOWN OVERLAY */}
      {countdown.isActive && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <SlideRenderer 
            slide={{ type: 'countdown', ...countdown }}
            showLabel={false}
          />
        </div>
      )}
    </div>
  );
};

export default DisplayClientPage;
