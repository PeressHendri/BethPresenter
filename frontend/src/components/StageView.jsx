import React, { useState } from 'react';
import { Send, Trash2, X, Info, Zap, MessageSquare } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const StageView = () => {
  const { sendManualToLive, notify } = useProject();
  const [message, setMessage] = useState('');
  const maxChars = 200;

  const quickMessages = [
    "Lagu Berikut...", "Waktu Doa", "Persembahan", "Istirahat", 
    "Pengumuman", "Waktu Penye...", "Kesaksian"
  ];

  return (
    <div className="flex-1 flex flex-col bg-white text-[#2D2D2E] font-['Outfit'] h-full overflow-hidden">
      
      {/* Header Info - More compact */}
      <div className="px-10 pt-8 pb-4">
        <h1 className="text-[24px] font-[950] text-[#800000] uppercase tracking-tight">Kontrol Tampilan Panggung</h1>
        <p className="text-[12px] font-bold text-[#AEAEB2] mt-0.5">Kirim pesan khusus ke pelayan di panggung</p>
      </div>

      <div className="px-10 flex-1 flex flex-col overflow-hidden pb-8">
         
         {/* Custom Text Message Section */}
         <div className="max-w-4xl flex flex-col h-1/2 min-h-[300px]">
            <span className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.2em] mb-2 block">PESAN TEKS KHUSUS</span>
            
            <div className="relative group flex-1">
               <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
                  placeholder="Ketik pesan disini..."
                  className="w-full h-full bg-[#F8F9FA] border-2 border-[#E2E2E6] rounded-xl p-5 text-[16px] font-bold focus:outline-none focus:border-[#80000020] focus:ring-4 focus:ring-[#80000005] transition-all resize-none placeholder:text-[#AEAEB2]"
               />
               <div className="absolute bottom-4 right-6 text-[10px] font-black text-[#AEAEB2] uppercase tracking-tighter">
                  {message.length} / {maxChars}
               </div>
            </div>

            <div className="flex gap-3 mt-4">
               <button 
                  onClick={() => {
                    if (!message.trim()) return;
                    sendManualToLive({ 
                      content: message, 
                      label: 'STAGE MESSAGE',
                      songId: 'stage-' + Date.now()
                    });
                    notify('Pesan terkirim ke Tampilan Panggung', 'success');
                  }}
                  className="flex-1 h-12 bg-[#800000] text-white rounded-xl flex items-center justify-center gap-3 font-black text-[13px] uppercase tracking-[0.1em] hover:bg-[#A00000] hover:shadow-lg transition-all active:scale-[0.98]"
               >
                  <Send size={16} strokeWidth={2.5} />
                  Kirim ke Tampilan Panggung
               </button>
               <button 
                  onClick={() => setMessage('')}
                  className="px-6 h-12 border-2 border-[#E2E2E6] text-[#AEAEB2] rounded-xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-tighter hover:bg-[#F8F9FA] hover:text-[#2D2D2E] hover:border-[#2D2D2E] transition-all"
               >
                  <X size={16} />
                  Bersihkan
               </button>
            </div>
         </div>

         {/* Status Banner - Smaller */}
         <div className="mt-4 p-3 bg-[#80000010] border border-[#80000015] rounded-xl flex items-center gap-3 text-[#800000] max-w-4xl shrink-0">
            <Info size={16} />
            <p className="text-[11px] font-bold">
               Tampilan panggung belum terhubung. Mulai sesi tampilan untuk mengirim pesan.
            </p>
         </div>

         {/* Quick Messages Section - Integrated better */}
         <div className="max-w-4xl mt-6 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 mb-3 shrink-0">
               <Zap size={12} className="text-[#800000]" />
               <span className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.2em]">PESAN CEPAT</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 h-full content-start overflow-y-auto custom-scrollbar">
               {quickMessages.map((msg, idx) => (
                  <button 
                     key={idx}
                     onClick={() => setMessage(msg)}
                     className="h-10 px-2 border border-[#E2E2E6] bg-[#F8F9FA]/50 text-[#8E8E93] rounded-lg text-[9px] font-black uppercase tracking-tighter hover:border-[#80000040] hover:bg-white hover:text-[#800000] hover:shadow-sm transition-all text-center leading-tight active:scale-95"
                  >
                     {msg}
                  </button>
               ))}
            </div>
         </div>

      </div>

    </div>
  );
};

export default StageView;
