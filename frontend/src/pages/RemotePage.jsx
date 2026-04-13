import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { 
  ChevronLeft, ChevronRight, EyeOff, 
  Smartphone, Wifi, Music, Activity
} from 'lucide-react';

const SOCKET_URL = 'http://' + window.location.hostname + ':5000';

const RemotePage = () => {
  const { pin } = useParams();
  const [connected, setConnected] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      setConnected(true);
      socketRef.current.emit('join-session', pin);
    });

    socketRef.current.on('sync-slide', (data) => {
      setCurrentSlide(data);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [pin]);

  const sendCommand = (cmd) => {
    if (socketRef.current) {
      socketRef.current.emit('remote-command', { pin, command: cmd });
    }
  };

  return (
    <div className="h-screen w-full bg-[#0F0F10] text-white flex flex-col font-manrope overflow-hidden select-none">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#1A1A1B]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#800000] rounded-lg flex items-center justify-center">
            <Smartphone size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-[14px] font-black uppercase tracking-widest text-white/90">BethRemote</h1>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#800000] animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-[9px] font-black text-white/40 uppercase">PIN: {pin}</span>
            </div>
          </div>
        </div>
        <div className="bg-white/5 px-3 py-1.5 rounded-full flex items-center gap-2">
            <Wifi size={12} className={connected ? 'text-[#800000]' : 'text-[#800000]'} />
            <span className="text-[10px] font-black text-white/60">{connected ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-6 flex flex-col overflow-hidden">
        <div className="aspect-video w-full bg-[#1A1A1B] rounded-lg border border-white/5 overflow-hidden flex flex-col shadow-2xl mb-8 relative">
           <div className="absolute top-4 left-4 flex gap-2">
             <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black uppercase">Pratinjau</div>
             {currentSlide?.label && <div className="bg-[#80000080] px-2 py-1 rounded text-[8px] font-black uppercase text-white">{currentSlide.label}</div>}
           </div>
           
           <div className="flex-1 flex items-center justify-center p-8 text-center bg-[conic-gradient(#1c1c1e_90deg,#1A1A1B_90deg_180deg,#1c1c1e_180deg_270deg,#1A1A1B_270deg)] bg-[size:20px_20px]">
              {currentSlide ? (
                <p className="text-[18px] font-black leading-tight tracking-tight drop-shadow-lg animate-in fade-in duration-300">
                  {currentSlide.isBlank ? '(SLIDE KOSONG)' : currentSlide.content}
                </p>
              ) : (
                <Activity className="text-white/10" size={40} />
              )}
           </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col gap-4">
           {/* Primary Controls */}
           <div className="flex-1 grid grid-cols-2 gap-4">
              <button 
                onClick={() => sendCommand('PREV')}
                className="bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 active:bg-white/10 transition-all active:scale-95 group"
              >
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center group-active:text-[#800000]">
                  <ChevronLeft size={32} strokeWidth={3} />
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">SEBELUMNYA</span>
              </button>

              <button 
                onClick={() => sendCommand('NEXT')}
                className="bg-[#800000] rounded-xl flex flex-col items-center justify-center gap-3 active:bg-black transition-all active:scale-95 shadow-xl shadow-[#80000010]"
              >
                <div className="w-14 h-14 bg-black/20 rounded-full flex items-center justify-center">
                  <ChevronRight size={32} strokeWidth={3} />
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] text-white/60 uppercase">BERIKUTNYA</span>
              </button>
           </div>

           {/* Auxiliary Controls */}
           <div className="h-20 flex gap-4">
              <button 
                 onClick={() => sendCommand('BLANK')}
                 className={`flex-1 rounded-lg border border-white/10 flex items-center justify-center gap-3 font-black text-[12px] uppercase tracking-widest transition-all ${currentSlide?.isBlank ? 'bg-white text-black' : 'bg-[#1A1A1B] text-white/60'}`}
              >
                 <EyeOff size={18} /> {currentSlide?.isBlank ? 'Lihat Teks' : 'KOSONGKAN'}
              </button>
           </div>
        </div>
      </div>

      <div className="px-8 py-6 text-center">
         <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">BethPresenter © 2026</p>
      </div>
    </div>
  );
};

export default RemotePage;
