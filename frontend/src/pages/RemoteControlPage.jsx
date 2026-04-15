import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';
import { 
  ChevronLeft, ChevronRight, MonitorOff, EyeOff, 
  Search, BookOpen, Music, Zap, Settings, Tv, Send, Play
} from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

const RemoteControlPage = () => {
  const [searchParams] = useSearchParams();
  const pin = searchParams.get('pin');
  
  const [isConnected, setIsConnected] = useState(false);
  const [liveSlide, setLiveSlide] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [activeTab, setActiveTab] = useState('control'); // 'control' | 'bible' | 'schedule'
  const [bibleQuery, setBibleQuery] = useState('');
  const [bibleResults, setBibleResults] = useState([]);
  
  const socketRef = useRef(null);

  useEffect(() => {
    if (!pin) return;
    
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current.emit('join-session', pin);
    });

    socketRef.current.on('sync-slide', (data) => {
      setLiveSlide(data.data || data);
    });

    socketRef.current.on('sync-schedule', (data) => {
      setSchedule(data.schedule || []);
    });

    socketRef.current.on('bible-search-results', (data) => {
      setBibleResults(data.results || []);
    });

    return () => socketRef.current?.disconnect();
  }, [pin]);

  const sendCommand = (command, data = {}) => {
    if (socketRef.current) {
      socketRef.current.emit('remote-command', { pin, command, ...data });
    }
  };

  const handleBibleSearch = () => {
    if (bibleQuery.trim()) {
      sendCommand('BIBLE_SEARCH', { query: bibleQuery });
    }
  };

  const handleBibleSelect = (verse) => {
    sendCommand('BIBLE_SEND', { verse });
  };

  const handleSlideSelect = (slideIndex) => {
    sendCommand('GO_TO_SLIDE', { slideIndex });
  };

  if (!pin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-10 bg-[#F8F9FA] text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-6">
          <MonitorOff size={40} />
        </div>
        <h1 className="text-2xl font-black text-[#1D1D1F]">PIN Diperlukan</h1>
        <p className="text-[#AEAEB2] mt-2">Silakan scan QR Code dari layar operator BethPresenter.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F8F9FA] flex flex-col font-['Outfit'] overflow-hidden">
      {/* HEADER */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#800000] rounded-lg flex items-center justify-center">
            <Tv size={18} className="text-white" />
          </div>
          <span className="font-black text-[15px] tracking-tight">REMOTE</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${isConnected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isConnected ? 'ONLINE' : 'OFFLINE'}
        </div>
      </header>

      {/* LIVE PREVIEW */}
      <div className="p-6 shrink-0">
        <div className="aspect-video bg-black rounded-3xl shadow-2xl overflow-hidden relative border border-white/10 ring-1 ring-black/5">
          {liveSlide ? (
            <div className="w-full h-full p-6 flex items-center justify-center text-center text-white font-bold leading-t">
              {liveSlide.content || liveSlide.text || 'LIVE CONTENT'}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 uppercase text-[10px] font-black tracking-widest">
              Menunggu Slide...
            </div>
          )}
          <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-0.5 rounded text-[8px] font-black animate-pulse">LIVE</div>
          {liveSlide?.title && (
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-[10px] font-black">
              {liveSlide.title}
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-6 flex gap-2 mb-4 shrink-0">
          <button onClick={() => setActiveTab('control')} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${activeTab === 'control' ? 'bg-[#800000] text-white shadow-lg shadow-[#80000020]' : 'bg-white text-[#AEAEB2]'}`}>
            <Zap size={18} />
          </button>
          <button onClick={() => setActiveTab('bible')} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${activeTab === 'bible' ? 'bg-[#800000] text-white shadow-lg shadow-[#80000020]' : 'bg-white text-[#AEAEB2]'}`}>
            <BookOpen size={18} />
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${activeTab === 'schedule' ? 'bg-[#800000] text-white shadow-lg shadow-[#80000020]' : 'bg-white text-[#AEAEB2]'}`}>
            <Music size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-10 custom-scrollbar">
          {activeTab === 'control' && (
            <div className="space-y-6">
              {/* Navigation Controls */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => sendCommand('PREV_SLIDE')}
                  className="bg-white border p-10 rounded-[32px] flex items-center justify-center active:scale-95 transition-all shadow-sm"
                >
                  <ChevronLeft size={40} className="text-[#800000]" />
                </button>
                <button 
                  onClick={() => sendCommand('NEXT_SLIDE')}
                  className="bg-white border p-10 rounded-[32px] flex items-center justify-center active:scale-95 transition-all shadow-sm"
                >
                  <ChevronRight size={40} className="text-[#800000]" />
                </button>
              </div>
              
              {/* Blank & Lyrics Controls */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => sendCommand('TOGGLE_BLANK')}
                  className="bg-white border py-6 rounded-3xl flex flex-col items-center gap-2 text-[#AEAEB2] active:text-black active:border-black transition-all"
                >
                  <MonitorOff size={24} />
                  <span className="text-[10px] font-black tracking-widest uppercase">BLANK</span>
                </button>
                <button 
                  onClick={() => sendCommand('TOGGLE_LYRICS')}
                  className="bg-white border py-6 rounded-3xl flex flex-col items-center gap-2 text-[#AEAEB2] active:text-black active:border-black transition-all"
                >
                  <EyeOff size={24} />
                  <span className="text-[10px] font-black tracking-widest uppercase">HIDE</span>
                </button>
              </div>

              {/* Schedule Items for Quick Access */}
              {schedule.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[12px] font-black text-[#8E8E93] uppercase tracking-[0.2em]">Quick Access</h3>
                  <div className="space-y-2">
                    {schedule.slice(0, 5).map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSlideSelect(idx)}
                        className="w-full bg-white border border-[#E2E2E6] p-4 rounded-2xl flex items-center gap-3 text-left active:border-[#80000040] transition-all"
                      >
                        <div className="w-8 h-8 bg-[#800000] text-white rounded-lg flex items-center justify-center text-[10px] font-black">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-[12px] font-black truncate">{item.title}</p>
                          <p className="text-[10px] text-[#AEAEB2]">{item.type}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bible' && (
            <div className="space-y-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AEAEB2]" />
                <input 
                  placeholder="Cari Ayat (cth: Yoh 3:16)"
                  value={bibleQuery}
                  onChange={(e) => setBibleQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBibleSearch()}
                  className="w-full bg-white border border-[#E2E2E6] rounded-2xl pl-12 pr-4 py-4 text-[16px] font-bold outline-none focus:border-[#80000040]"
                />
                <button 
                  onClick={handleBibleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#800000] text-white p-2 rounded-lg"
                >
                  <Search size={16} />
                </button>
              </div>
              
              {bibleResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[12px] font-black text-[#8E8E93] uppercase tracking-[0.2em]">Hasil Pencarian</h3>
                  <div className="space-y-2">
                    {bibleResults.map((result, idx) => (
                      <div key={idx} className="bg-white border border-[#E2E2E6] p-4 rounded-2xl">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[12px] font-black text-[#800000]">{result.reference}</p>
                          <button 
                            onClick={() => handleBibleSelect(result)}
                            className="bg-[#800000] text-white p-2 rounded-lg"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                        <p className="text-[14px] leading-relaxed text-[#424245]">{result.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {bibleQuery && bibleResults.length === 0 && (
                <p className="text-center py-10 text-[#AEAEB2] text-[12px] font-bold">Tidak ada hasil untuk "{bibleQuery}"</p>
              )}
              
              {!bibleQuery && (
                <p className="text-center py-10 text-[#AEAEB2] text-[12px] font-bold">Masukkan ayat untuk mencari</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoteControlPage;
