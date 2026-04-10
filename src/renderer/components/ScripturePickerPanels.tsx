import React from 'react';
import { Search, CheckCircle2, Circle } from 'lucide-react';

export function VerseSelector({ 
  verses, 
  selectedVerses, 
  onToggleVerse 
}: { 
  verses: any[], 
  selectedVerses: number[], 
  onToggleVerse: (v: number) => void 
}) {
  return (
    <div className="flex-1 flex flex-col bg-[#212121] overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-xl font-semibold text-white tracking-tight">Select Verses</h2>
           <div className="px-2.5 py-1 bg-black/40 rounded-full border border-white/5 text-[10px] font-black text-[#00E676] uppercase tracking-widest">
              {verses.length} verses
           </div>
        </div>
        
        <div className="relative group">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666] group-focus-within:text-[#00E676] transition-all" />
           <input 
             type="text" 
             placeholder="Search verses..."
             className="w-full h-11 bg-[#1A1A1A] border border-[#333] rounded-lg pl-12 pr-4 text-xs text-white focus:outline-none focus:border-[#00E676] transition-all"
           />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
         {verses.map((v) => (
           <div 
             key={v.v}
             onClick={() => onToggleVerse(v.v)}
             className={`
              flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
              ${selectedVerses.includes(v.v) 
                ? 'bg-[#00E676]/5 border-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.05)]' 
                : 'bg-[#1A1A1A]/50 border-transparent hover:bg-[#1A1A1A] hover:border-[#333]'}
             `}
           >
              <div className={`mt-0.5 transition-colors ${selectedVerses.includes(v.v) ? 'text-[#00E676]' : 'text-[#444]'}`}>
                 {selectedVerses.includes(v.v) ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-black text-[#00E676] uppercase tracking-widest">Verse {v.v}</span>
                 <p className={`text-sm leading-relaxed ${selectedVerses.includes(v.v) ? 'text-white font-medium' : 'text-[#AAA]'}`}>
                   {v.text}
                 </p>
              </div>
           </div>
         ))}
      </div>

      {/* Footer */}
      <div className="p-6 bg-[#1A1A1A] border-t border-[#333] flex items-center justify-between">
         <div className="flex flex-col">
            <span className="text-lg font-black text-white leading-none">{selectedVerses.length}</span>
            <span className="text-[9px] font-bold text-[#666] uppercase tracking-widest mt-1">Verses Selected</span>
         </div>
         <div className="flex gap-4">
            <button className="text-[10px] font-black text-[#666] hover:text-white uppercase tracking-widest">Clear Selection</button>
            <button className="bg-[#00E676] text-black px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-[#00E676]/20 transition-all hover:scale-105 active:scale-95">Add to Service</button>
         </div>
      </div>
    </div>
  );
}

export function ScripturePreviewPanel({ 
  selectedVerses, 
  verses, 
  reference 
}: { 
  selectedVerses: number[], 
  verses: any[], 
  reference: string 
}) {
  const previewText = verses
    .filter(v => selectedVerses.includes(v.v))
    .sort((a, b) => a.v - b.v)
    .map(v => v.text)
    .join(' ');

  return (
    <div className="w-[320px] bg-[#1A1A1A] border-l border-[#333] flex flex-col shrink-0">
      <div className="p-6 border-b border-[#333]">
         <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">Preview</h3>
         <span className="text-[10px] font-bold text-[#666] uppercase tracking-widest">Scripture Output</span>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6">
        <div className="flex-1 bg-[#212121] rounded-xl border border-[#333] p-6 overflow-y-auto no-scrollbar shadow-inner relative">
          {!selectedVerses.length ? (
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center opacity-20 italic">
               <span className="text-[10px] font-bold text-white uppercase tracking-widest">Select verses to preview output</span>
            </div>
          ) : (
            <>
              <p className="text-[#00E676] text-[10px] font-black uppercase tracking-[0.3em] mb-4 border-b border-[#00E676]/20 pb-2">
                {reference}
              </p>
              <p className="text-white text-md leading-relaxed font-medium text-left">
                {previewText}
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3">
           <button className="w-full py-3 rounded-lg border border-[#333] text-[10px] font-black text-[#666] hover:text-white hover:border-[#444] uppercase tracking-widest transition-all">Clear Preview</button>
           <button className="w-full py-4 rounded-lg bg-[#00E676] text-black text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#00E676]/10 transition-all hover:brightness-110">Add to Service Order</button>
        </div>
      </div>
    </div>
  );
}
