import React, { useState } from 'react';
import { X, Save, Baseline } from 'lucide-react';
import { Button } from '../ui/Button';

interface CustomSlideEditorProps {
  onAboard: (data: { title: string; text: string }) => void;
  onCancel: () => void;
}

export function CustomSlideEditor({ onAboard, onCancel }: CustomSlideEditorProps) {
  const [title, setTitle] = useState('Welcome Message');
  const [content, setContent] = useState('Selamat Datang di Ibadah Raya\nYouth Bethlehem 2026');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-elevated border border-border-default shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col">
         {/* Header */}
         <div className="flex justify-between items-center px-4 py-3 bg-surface-sidebar border-b border-border-default">
           <div className="flex items-center gap-2 text-accent-500 font-bold">
              <Baseline size={18} />
              <h3>Buat Custom Slide Teks</h3>
           </div>
           <button onClick={onCancel} className="text-text-500 hover:text-text-100"><X size={18} /></button>
         </div>

         {/* Content */}
         <div className="p-4 grid grid-cols-2 gap-4">
            <div className="space-y-4">
               <div>
                 <label className="text-xs font-bold text-text-400 uppercase tracking-widest block mb-1">Judul Service Item</label>
                 <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-surface-base border border-border-strong rounded px-3 py-2 text-sm text-text-100 outline-none focus:border-accent-500" placeholder="e.g Pengumuman..." />
               </div>
               <div>
                 <label className="text-xs font-bold text-text-400 uppercase tracking-widest block mb-1">Isi Lirik / Teks Layar</label>
                 <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} className="w-full bg-surface-base border border-border-strong rounded px-3 py-2 text-sm text-text-100 outline-none focus:border-accent-500 resize-none font-medium h-[180px]" placeholder="Ketik bait di sini..." />
               </div>
            </div>

            {/* Live Preview Mini */}
            <div className="flex flex-col space-y-2">
               <label className="text-xs font-bold text-text-400 uppercase tracking-widest block mb-1">Preview Simulator</label>
               <div className="flex-1 bg-black rounded-lg border-2 border-border-default shadow-inner overflow-hidden flex items-center justify-center p-4 relative">
                 <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-accent-600 rounded text-[9px] font-bold text-white uppercase shadow">16:9 Screen</div>
                 <p className="text-white font-bold text-center text-xl whitespace-pre-wrap leading-tight drop-shadow-md">
                   {content}
                 </p>
               </div>
            </div>
         </div>

         {/* Footer Actions */}
         <div className="px-4 py-3 bg-surface-sidebar border-t border-border-default flex justify-end gap-2">
            <Button variant="ghost" onClick={onCancel}>Batal</Button>
            <Button variant="primary" onClick={() => onAboard({ title, text: content })} className="gap-2">
               <Save size={16} /> Simpan ke Order
            </Button>
         </div>
      </div>
    </div>
  );
}
