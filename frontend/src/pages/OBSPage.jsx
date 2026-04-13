import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';

const SOCKET_URL = 'http://' + window.location.hostname + ':5000';

const OBSPage = () => {
  const { pin } = useParams();
  const [searchParams] = useSearchParams();
  const [currentSlide, setCurrentSlide] = useState(null);
  const socketRef = useRef(null);

  // URL Params for styling
  const layout = searchParams.get('layout') || 'lower-third';
  const anim = searchParams.get('anim') || 'fade';

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-session', pin);
    });

    socketRef.current.on('sync-slide', (data) => {
      setCurrentSlide(data);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [pin]);

  if (!currentSlide || currentSlide.isBlank) return <div className="h-screen w-full bg-transparent" />;

  const getLayoutClasses = () => {
     switch(layout) {
        case 'lower-third': return 'absolute bottom-20 left-1/2 -translate-x-1/2 w-[80%] text-center';
        case 'full-center': return 'h-screen w-full flex items-center justify-center p-20 text-center';
        case 'side-left': return 'h-screen w-[40%] flex items-center justify-start p-20 text-left';
        case 'side-right': return 'h-screen w-[40%] ml-auto flex items-center justify-end p-20 text-right';
        default: return 'absolute bottom-20 left-1/2 -translate-x-1/2 w-[80%] text-center';
     }
  };

  return (
    <div className="h-screen w-full bg-transparent overflow-hidden font-['Outfit']">
       <div className={`${getLayoutClasses()} transition-all duration-500`}>
          <div className={`animate-in fade-in ${anim === 'slide' ? 'slide-in-from-bottom-5' : anim === 'zoom' ? 'zoom-in-95' : ''} duration-500`}>
             <h1 className="text-5xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] leading-tight tracking-tight uppercase">
                {currentSlide.content}
             </h1>
             {currentSlide.label && (
                <div className="mt-4 inline-block bg-[#800000] text-white text-[10px] font-black px-3 py-1 rounded-full tracking-[0.2em] shadow-lg">
                   {currentSlide.label}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default OBSPage;
