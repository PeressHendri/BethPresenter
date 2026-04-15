import React, { useState } from 'react';
import { 
  Send, MessageSquare, Zap, Clock, 
  Trash2, Bell, AlertTriangle, Info
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const PRESET_MESSAGES = [
  "Lagu Berikutnya", "Waktu Doa", "Persembahan", 
  "Istirahat", "Pengumuman", "Kesaksian", 
  "Persiapan Ibadah", "Microphone On"
];

const StageView = () => {
  const { remotePin, socketRef, liveState, flowItems, countdown } = useProject();
  const [customMsg, setCustomMsg] = useState('');
  const [activeMsg, setActiveMsg] = useState('');

  // Find next slide from flowItems or context
  const getNextSlide = () => {
     // Simplifying for stage view: just get next from flow
     if (!liveState.songId) return "No item live";
     return "Ready in Flow"; 
  };

  const sendMessage = (msg) => {
    if (!remotePin) return;
    
    const payload = {
      pin: remotePin,
      currentSlide: liveState,
      nextSlide: null, // Logic to get next slide can be expanded
      message: msg,
      countdown: countdown.isActive ? countdown : null
    };

    if (socketRef.current) {
      socketRef.current.emit('stage-message', payload);
    }
    
    setActiveMsg(msg);
    if (msg) {
        setTimeout(() => setActiveMsg(''), 10000);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] overflow-hidden font-['Outfit']">
      {/* Header */}
      <div className="h-[64px] px-8 flex items-center justify-between bg-white border-b border-[#E2E2E6] shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#1D1D1F] rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
            <Bell size={20} className="text-white" />
          </div>
          <h2 className="text-[14px] font-[950] tracking-tight text-[#1D1D1F] uppercase">STAGE MONITOR CONTROL</h2>
        </div>
        
        {activeMsg && (
          <div className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2 rounded-xl animate-pulse">
            <Info size={14} />
            <span className="text-[10px] font-black uppercase">Active: {activeMsg}</span>
          </div>
        )}
      </div>

      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
        {/* Custom Message input */}
        <div className="bg-white rounded-[32px] p-10 border border-[#E2E2E6] shadow-sm">
          <div className="flex items-center gap-2 mb-6 opacity-40">
            <MessageSquare size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">Stage Message</span>
          </div>
          
          <div className="flex gap-4">
            <input 
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              placeholder="Ketik pesan untuk dikirim ke panggung..."
              className="flex-1 bg-[#F8F9FA] border border-[#E2E2E6] rounded-2xl px-6 py-4 text-[15px] font-[600] outline-none focus:border-[#80000040]"
              onKeyDown={e => e.key === 'Enter' && sendMessage(customMsg)}
            />
            <button 
              onClick={() => { sendMessage(customMsg); setCustomMsg(''); }}
              className="px-8 bg-[#800000] text-white rounded-2xl text-[12px] font-black flex items-center gap-2 shadow-xl shadow-[#80000020] hover:scale-105 transition-all"
            >
              <Send size={16} />
              KIRIM
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-black text-[#8E8E93] tracking-[0.2em] uppercase px-2">PESAN CEPAT (PRESET)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PRESET_MESSAGES.map(msg => (
              <button 
                key={msg}
                onClick={() => sendMessage(msg)}
                className="p-6 bg-white border border-[#E2E2E6] rounded-3xl text-[12px] font-black text-[#1D1D1F] hover:border-[#80000040] hover:bg-[#80000005] hover:text-[#800000] transition-all text-center flex flex-col items-center gap-4 group"
              >
                <div className="w-10 h-10 bg-[#F1F1F3] rounded-xl flex items-center justify-center group-hover:bg-[#800000] transition-colors">
                  <Zap size={18} className="text-[#AEAEB2] group-hover:text-white" />
                </div>
                {msg.toUpperCase()}
              </button>
            ))}
            <button 
              onClick={() => sendMessage('')}
              className="p-6 bg-white border border-[#E2E2E6] rounded-3xl text-[12px] font-black text-red-500 hover:bg-red-50 transition-all text-center flex flex-col items-center gap-4"
            >
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                 <Trash2 size={18} />
              </div>
              BERSIHKAN PANEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageView;
