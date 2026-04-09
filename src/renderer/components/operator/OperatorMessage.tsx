import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';

const PRESETS = ['Ulangi Chorus', 'Lanjut', 'Pelan', 'Cepat', 'Selesai'];

export function OperatorMessage() {
  const [msg, setMsg] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    // Broadcast via IPC to StageDisplay
    const ipc = (window as any).electron?.ipcRenderer;
    if (ipc) {
      ipc.invoke('stage:send-message', text.trim()).catch(console.error);
    }
    
    setHistory(prev => [text.trim(), ...prev].slice(0, 5));
    setMsg('');
  };

  return (
    <div className="bg-surface-elevated border border-border-default rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
         <MessageSquare size={16} className="text-amber-500" />
         <h3 className="text-xs font-bold text-text-300 uppercase tracking-widest">Stage Message</h3>
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(msg)}
          placeholder="Tulis pesan untuk pemusik stage..."
          className="flex-1 bg-surface-base border border-border-strong rounded-lg px-3 text-[13px] text-text-100 outline-none focus:border-amber-500 transition-colors"
        />
        <button 
          onClick={() => handleSend(msg)}
          disabled={!msg.trim()}
          className="bg-amber-600 hover:bg-amber-500 text-white p-2 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center min-w-[40px]"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mt-1">
        {PRESETS.map((p) => (
           <button 
             key={p} 
             onClick={() => handleSend(p)}
             className="px-3 py-1 bg-surface-base hover:bg-surface-hover border border-border-default rounded-full text-[11px] font-semibold text-text-400 hover:text-amber-400 transition-colors"
           >
             {p}
           </button>
        ))}
      </div>

    </div>
  );
}
