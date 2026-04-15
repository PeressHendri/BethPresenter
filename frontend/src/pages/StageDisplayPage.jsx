import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Clock, MessageSquare, ArrowRight, Tv, Send, X } from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

const StageDisplayPage = () => {
  const [searchParams] = useSearchParams();
  const pin = searchParams.get('pin');
  
  const [isConnected, setIsConnected] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [nextSlide, setNextSlide] = useState(null);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  const [showCustomMessage, setShowCustomMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState([]);

  const socketRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!pin) return;
    
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current.emit('join-session', pin);
    });

    socketRef.current.on('sync-stage', (payload) => {
      const { data } = payload;
      if (data) {
        setCurrentSlide(data.currentSlide);
        setNextSlide(data.nextSlide);
        if (data.message) {
          setMessage(data.message);
          setMessageHistory(prev => [...prev, { text: data.message, timestamp: Date.now() }]);
          // Auto clear message after 5s
          setTimeout(() => setMessage(''), 5000);
        }
        setCountdown(data.countdown);
      }
    });

    socketRef.current.on('sync-countdown', (data) => {
        if (data && (data.mode === 'both' || data.mode === 'stage')) {
          setCountdown(data.countdown || data);
        }
    });

    return () => socketRef.current?.disconnect();
  }, [pin]);

  const formatTime = (total) => {
    if (!total && total !== 0) return '00:00';
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!pin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-10 font-['Outfit']">
        <Tv size={64} className="text-[#800000] mb-6" />
        <h1 className="text-3xl font-black">STAGE DISPLAY</h1>
        <p className="text-[#AEAEB2] mt-2">PIN diperlukan untuk menghubungkan monitor ini.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col font-['Outfit'] overflow-hidden p-8 gap-8">
      {/* HEADER: CLOCK & STATUS */}
      <div className="flex justify-between items-center bg-[#1A1A1A] rounded-3xl px-10 py-6 border border-white/5">
        <div className="flex items-center gap-4 text-4xl font-black tracking-tighter">
          <Clock size={32} className="text-[#800000]" />
          {time}
        </div>
        <div className="flex items-center gap-8">
          {countdown?.isActive && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.2em]">{countdown.title}</span>
              <span className={`text-4xl font-black tabular-nums ${countdown.remainingSeconds < 60 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                {formatTime(countdown.remainingSeconds)}
              </span>
            </div>
          )}
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${isConnected ? 'border-green-500/30 text-green-500' : 'border-red-500/30 text-red-500'}`}>
            {isConnected ? 'SYNCED' : 'DISCONNECTED'}
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* LEFT: CURRENT SLIDE (LARGE) */}
        <div className="flex-[2] bg-[#1A1A1A] rounded-[48px] border border-white/10 p-12 flex flex-col relative overflow-hidden">
          <div className="absolute top-8 left-10 flex items-center gap-2 text-[#800000]">
            <span className="w-2 h-2 bg-[#800000] rounded-full animate-pulse" />
            <span className="text-[12px] font-black uppercase tracking-[0.3em]">CURRENT SLIDE</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-center">
            <h2 className="text-[6.5cqw] font-[900] leading-tight tracking-tight">
              {currentSlide?.content || currentSlide?.text || "..."}
            </h2>
          </div>
          {currentSlide?.label && (
            <div className="absolute bottom-8 left-10 bg-[#800000] px-4 py-1.5 rounded-lg text-[12px] font-black uppercase tracking-wider">
               {currentSlide.label}
            </div>
          )}
        </div>

        {/* RIGHT: NEXT SLIDE & MESSAGES */}
        <div className="flex-1 flex flex-col gap-8">
          {/* NEXT SLIDE */}
          <div className="flex-1 bg-white/5 rounded-[40px] border border-white/5 p-8 flex flex-col relative">
            <div className="flex items-center gap-2 text-[#AEAEB2] mb-6">
              <ArrowRight size={18} />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">NEXT SLIDE</span>
            </div>
            <div className="flex-1 flex items-center justify-center text-center opacity-40">
              <p className="text-3xl font-black">
                {nextSlide?.content || nextSlide?.text || "..."}
              </p>
            </div>
          </div>

          {/* OPERATOR MESSAGES */}
          <div className={`h-[200px] rounded-[40px] p-8 flex flex-col transition-all duration-500 ${message ? 'bg-[#800000] shadow-[0_20px_60px_rgba(128,0,0,0.3)]' : 'bg-white/5 border border-white/5'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 opacity-50">
                <MessageSquare size={18} />
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">MSG FROM OPERATOR</span>
              </div>
              <button 
                onClick={() => setShowCustomMessage(true)}
                className="text-[#800000] hover:text-white transition-colors"
                title="Send custom message"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center text-center">
              {message ? (
                <p className="text-3xl font-black animate-in zoom-in duration-300 uppercase tracking-tight italic">
                   {message}
                </p>
              ) : (
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">NO MESSAGES</span>
              )}
            </div>
            
            {/* Quick Message Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {['Lagu Berikutnya', 'Waktu Doa', 'Persembahan', 'Istirahat'].map((msg) => (
                <button
                  key={msg}
                  onClick={() => {
                    if (socketRef.current) {
                      socketRef.current.emit('stage-message', { pin, message: msg });
                    }
                  }}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Message Modal */}
      {showCustomMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-black text-[#1D1D1F]">Kirim Pesan Custom</h3>
              <button 
                onClick={() => setShowCustomMessage(false)}
                className="text-[#AEAEB2] hover:text-black transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Masukkan pesan untuk musisi..."
                className="w-full bg-[#F8F9FA] border border-[#E2E2E6] rounded-2xl p-4 text-[14px] font-bold outline-none focus:border-[#80000040] h-32 resize-none"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCustomMessage(false)}
                  className="flex-1 py-3 bg-white border border-[#E2E2E6] rounded-2xl text-[12px] font-black text-[#AEAEB2] hover:border-black/20 transition-all"
                >
                  BATAL
                </button>
                <button 
                  onClick={() => {
                    if (customMessage.trim() && socketRef.current) {
                      socketRef.current.emit('stage-message', { pin, message: customMessage.trim() });
                      setCustomMessage('');
                      setShowCustomMessage(false);
                    }
                  }}
                  disabled={!customMessage.trim()}
                  className="flex-1 py-3 bg-[#800000] text-white rounded-2xl text-[12px] font-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  KIRIM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StageDisplayPage;
