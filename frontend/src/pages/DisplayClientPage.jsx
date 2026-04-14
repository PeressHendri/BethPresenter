import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import SlideRenderer from '../components/SlideRenderer';

const SOCKET_URL = 'http://localhost:5000';

const DisplayClientPage = () => {
  const { pin } = useParams();
  const [slide, setSlide] = useState(null);
  const [globalBg, setGlobalBg] = useState(() => {
    const saved = localStorage.getItem('beth_global_bg');
    return saved ? JSON.parse(saved) : null;
  });
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current.emit('join-session', pin);
    });
    socketRef.current.on('disconnect', () => setIsConnected(false));
    
    socketRef.current.on('sync-slide', (data) => {
      // Prioritize 'data' or 'payload' fields which contain the full envelope
      const slideData = data?.data || data?.payload || data;
      setSlide(slideData);
      
      const incomingBg = slideData?.globalBackground || slideData?.data?.globalBackground;
      if (incomingBg) {
        setGlobalBg(incomingBg);
        localStorage.setItem('beth_global_bg', JSON.stringify(incomingBg));
      }
    });

    socketRef.current.on('sync-global-bg', (bg) => {
      setGlobalBg(bg);
      if (bg) localStorage.setItem('beth_global_bg', JSON.stringify(bg));
      else localStorage.removeItem('beth_global_bg');
    });

    // LOCAL LISTENER (For local output window)
    const handleMessage = (e) => {
      if (e.data?.type === 'SET_LIVE_SLIDE' || e.data?.type === 'UPDATE_SLIDE') {
        // Handle both SET_LIVE_SLIDE and UPDATE_SLIDE (from broadcast helper)
        const slideData = e.data.data || e.data.payload || e.data;
        setSlide(slideData);
        
        const incomingBg = slideData?.globalBackground || slideData?.data?.globalBackground;
        if (incomingBg) {
          setGlobalBg(incomingBg);
          localStorage.setItem('beth_global_bg', JSON.stringify(incomingBg));
        }
      }
      if (e.data?.type === 'SET_GLOBAL_BG') {
        const bg = e.data.payload || e.data.background;
        setGlobalBg(bg);
        if (bg) localStorage.setItem('beth_global_bg', JSON.stringify(bg));
        else localStorage.removeItem('beth_global_bg');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      socketRef.current.disconnect();
      window.removeEventListener('message', handleMessage);
    };
  }, [pin]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <SlideRenderer 
        slide={slide}
        format={slide?.format}
        globalBg={globalBg}
        showLabel={false}
        showLiveIndicator={false}
        showControls={false}
      />
    </div>
  );
};

export default DisplayClientPage;
