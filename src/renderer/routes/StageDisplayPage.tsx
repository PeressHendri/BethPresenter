import React, { useState, useEffect, useMemo } from 'react';
import { 
  Monitor, MessageSquare, Eye, EyeOff, Type, 
  Clock, Zap, ChevronRight, RefreshCw, Trash2, 
  Settings, ArrowLeft, Layout, Send, AlertTriangle, 
  CheckCircle2, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_MESSAGES = [
  "NEXT SONG", "PRAYER TIME", "OFFERING", "WELCOME", 
  "WRAP UP", "SERMON START", "ALTAR CALL", "CLOSING"
];

export function StageDisplayPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [currentSlide, setCurrentSlide] = useState<any>(null);
  const [nextSlide, setNextSlide] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [isStageConnected, setIsStageConnected] = useState(false);

  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLyrics, setShowLyrics] = useState(true);
  const [showNext, setShowNext] = useState(true);
  
  const [fontSize, setFontSize] = useState(48);
  const [isBold, setIsBold] = useState(true);

  const charCount = messageInput.length;
  const isNearLimit = charCount > 180;

  useEffect(() => {
    if ((window as any).electron?.ipcRenderer) {
      const handleUpdate = (_: any, payload: any) => {
        if (payload.currentSlide) setCurrentSlide(payload.currentSlide);
        if (payload.nextSlide) setNextSlide(payload.nextSlide);
        if (payload.isLive !== undefined) setIsLive(payload.isLive);
      };

      const handleStatus = (_: any, connected: boolean) => setIsStageConnected(connected);

      (window as any).electron.ipcRenderer.on('presentation-update', handleUpdate);
      (window as any).electron.ipcRenderer.on('stage:status-update', handleStatus);

      // Check initial status
      (window as any).electron.ipcRenderer.invoke('stage-check-connection').then(setIsStageConnected);

      return () => {
        (window as any).electron.ipcRenderer.removeAllListeners('presentation-update');
        (window as any).electron.ipcRenderer.removeAllListeners('stage:status-update');
      };
    }
  }, []);

  const handleSendMessage = async (customText?: string) => {
    const text = customText || messageInput;
    if (!text.trim()) return;
    
    setIsLoading(true);
    if ((window as any).electron?.ipcRenderer) {
      await (window as any).electron.ipcRenderer.invoke('stage-send-message', {
        text,
        flash: true
      });
      showToast('Stage informed!', 'success');
      if (!customText) setMessageInput('');
    }
    setIsLoading(false);
  };

  const handleClearMessage = async () => {
    if ((window as any).electron?.ipcRenderer) {
      await (window as any).electron.ipcRenderer.invoke('stage-clear-message');
      showToast('Stage cleared', 'success');
    }
  };

  const applyQuickMessage = (msg: string) => {
    setMessageInput(msg);
    // Optionally send immediately: handleSendMessage(msg);
  };

  const handleOpenWindow = async () => {
    if ((window as any).electron?.ipcRenderer) {
      await (window as any).electron.ipcRenderer.invoke('stage-display-open');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden text-white font-sans">
      
      {/* ── HEADER ── */}
      <div className="h-20 px-8 flex items-center justify-between bg-[#0A0C10] border-b border-white/5 shadow-2xl z-20">
        <div className="flex items-center gap-6">
           <button onClick={() => navigate('/')} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
             <ArrowLeft size={18} />
           </button>
           <div className="flex flex-col">
             <h1 className="text-xl font-black tracking-tight">STAGE COMMAND CENTER</h1>
             <p className="text-[10px] font-black text-[#2D83FF] uppercase tracking-widest">Orchestrate performer feedback & monitor panggung</p>
           </div>
        </div>

        <div className="flex items-center gap-4">
           {/* CONNECTION STATUS */}
           <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
             isStageConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-blue-500/10 border-blue-500/20 text-[#2D83FF]'
           }`}>
             {isStageConnected ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} className="animate-pulse" />}
             <span className="text-[10px] font-black uppercase tracking-[0.1em]">
               {isStageConnected ? 'Stage Display Connected' : 'No Stage Display Connected'}
             </span>
           </div>

           <button 
             onClick={handleOpenWindow}
             className="h-12 px-6 flex items-center gap-3 rounded-xl bg-[#2D83FF] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#1C69FF] shadow-xl shadow-[#2D83FF]/20 transition-all active:scale-95"
           >
             <Layout size={18} />
             Activate Window
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* ── LEFT: COMMAND PANEL ── */}
         <div className="w-[440px] border-r border-white/5 flex flex-col p-8 space-y-10 overflow-y-auto no-scrollbar bg-[#0A0C10]/40">
            
            {/* 1. LAYOUT TOGGLES */}
            <section className="space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D83FF]">Stage Layout Overrides</h3>
               <div className="grid grid-cols-2 gap-4">
                  <CommandToggle active={showLyrics} onClick={() => setShowLyrics(!showLyrics)} icon={<Type size={20}/>} label="lyrics layer" />
                  <CommandToggle active={showNext} onClick={() => setShowNext(!showNext)} icon={<ChevronRight size={20}/>} label="next up slide" />
                  <CommandToggle active={true} onClick={() => {}} icon={<Monitor size={20}/>} label="live preview" />
                  <CommandToggle active={false} onClick={() => {}} icon={<Settings size={20}/>} label="clock mode" />
               </div>
            </section>

            {/* 2. MESSAGING ENGINE */}
            <section className="space-y-5">
               <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D83FF]">Performer Messaging</h3>
                  <button onClick={handleClearMessage} className="px-3 py-1 rounded-lg bg-red-600/10 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Clear Screen</button>
               </div>

               <div className="relative group">
                  <textarea 
                    placeholder="Enter message for performers..." 
                    maxLength={200}
                    className={`w-full h-40 bg-white/5 border rounded-[24px] p-6 text-sm font-bold focus:outline-none transition-all resize-none shadow-inner ${
                      isNearLimit ? 'border-red-500/40 text-red-100' : 'border-white/10 focus:border-[#2D83FF] text-white'
                    }`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <div className="absolute top-4 right-4 text-[9px] font-black transition-colors" style={{ color: isNearLimit ? '#ef4444' : 'rgba(255,255,255,0.2)' }}>
                    {charCount}/200
                  </div>
                  
                  <div className="absolute bottom-5 right-5">
                     <button 
                        disabled={!messageInput.trim() || isLoading}
                        onClick={() => handleSendMessage()}
                        className="w-14 h-14 bg-[#2D83FF] disabled:bg-white/10 disabled:text-white/20 text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-2xl active:scale-95"
                     >
                        <Send size={24} />
                     </button>
                  </div>
               </div>

               {/* QUICK PRESETS */}
               <div className="grid grid-cols-2 gap-2">
                 {QUICK_MESSAGES.map(msg => (
                   <button 
                     key={msg}
                     onClick={() => applyQuickMessage(msg)}
                     className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:bg-[#2D83FF] hover:text-white hover:border-[#2D83FF] transition-all text-left"
                   >
                     {msg}
                   </button>
                 ))}
               </div>
            </section>

            {/* 3. APPEARANCE */}
            <section className="space-y-4 pt-6 border-t border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Display Calibration</h3>
                <div className="bg-white/5 rounded-2xl p-5 space-y-5 border border-white/5">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Master Font Scale</span>
                     <div className="flex items-center gap-5">
                        <button onClick={() => setFontSize(Math.max(20, fontSize-2))} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all font-black text-lg">-</button>
                        <span className="text-lg font-black w-10 text-center text-[#2D83FF]">{fontSize}</span>
                        <button onClick={() => setFontSize(Math.min(100, fontSize+2))} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all font-black text-lg">+</button>
                     </div>
                   </div>
                </div>
            </section>
         </div>

         {/* ── RIGHT: LIVE STAGE MIRROR ── */}
         <div className="flex-1 p-12 bg-black flex flex-col justify-center relative overflow-hidden">
            
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#2D83FF10_0%,transparent_70%)]" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            <div className="mb-10 flex items-center justify-between z-10">
               <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-white/10'} animate-pulse`} />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 leading-none">Stage Mirror</span>
                    <span className="text-xs font-bold text-white/20 uppercase tracking-widest">Real-time simulation</span>
                  </div>
               </div>
               <DigitalClock />
            </div>

            {/* STAGE CANVAS SIMULATOR */}
            <div className="aspect-[16/9] w-full max-w-6xl mx-auto bg-[#0a0a0f] rounded-[48px] border-[12px] border-white/10 shadow-[0_60px_150px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col relative group">
               
               {/* Messages Overlays */}
               <AnimatePresence>
                {messageInput && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-3xl"
                  >
                    <div className="max-w-3xl text-center px-16 py-10 bg-[#2D83FF] rounded-[40px] shadow-[0_30px_100px_rgba(45,131,255,0.4)]">
                       <span className="block text-[11px] font-black uppercase tracking-[0.5em] text-black/50 mb-6 italic">Message from Operator</span>
                       <p className="text-4xl font-black text-white uppercase tracking-tighter leading-none break-words line-clamp-3">
                         {messageInput}
                       </p>
                    </div>
                  </motion.div>
                )}
               </AnimatePresence>

               {/* Current Lyrics */}
               <div className="flex-1 flex flex-col items-center justify-center p-16 text-center">
                  <div className="text-[11px] font-black uppercase tracking-[0.6em] text-[#2D83FF] mb-12 opacity-30 italic">Now Singing</div>
                  <h1 
                    className="max-w-5xl tracking-tighter uppercase leading-[0.9] text-white/90"
                    style={{ fontSize: `${fontSize}px`, fontWeight: isBold ? 900 : 500 }}
                  >
                     {currentSlide?.text || "BETH PRESENTER"}
                  </h1>
               </div>

               {/* Bottom Tray */}
               <div className="h-[200px] bg-white/[0.02] border-t border-white/5 flex items-center px-12 gap-12">
                  <div className="flex-1">
                    <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 italic">Next Up</div>
                    <p className="text-2xl font-black text-white/40 uppercase tracking-tight truncate">
                       {nextSlide?.text || "End of Sequence"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-[9px] font-black uppercase tracking-[0.4em] text-[#00D2D2] mb-1 italic">Total Timer</div>
                    <div className="text-5xl font-black text-white tracking-widest tabular-nums">05:00</div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function DigitalClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="text-3xl font-black text-[#2D83FF] tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(45,131,255,0.3)]">
      {time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
}

function CommandToggle({ active, icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex flex-row items-center gap-4 p-5 rounded-2xl border-2 transition-all group relative overflow-hidden
        ${active 
          ? 'bg-[#2D83FF]/10 border-[#2D83FF] shadow-2xl shadow-[#2D83FF]/10' 
          : 'bg-white/5 border-transparent hover:bg-white/10'}
      `}
    >
       <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-[#2D83FF] text-white' : 'bg-white/5 text-white/20'}`}>
          {icon}
       </div>
       <div className="flex flex-col items-start">
         <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-white/30'}`}>{label}</span>
         <span className={`text-[8px] font-bold uppercase tracking-widest ${active ? 'text-emerald-500' : 'text-white/10'}`}>{active ? 'Active' : 'Hidden'}</span>
       </div>
    </button>
  );
}
