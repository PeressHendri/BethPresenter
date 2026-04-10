import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Book, Search, Layers, ArrowLeft, Plus, Zap, 
  ChevronRight, MoreVertical, Maximize2, SplitSquareHorizontal,
  Bookmark, Navigation, Send, Library
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useScriptureStore } from '../stores/scriptureStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Verse {
  id: number;
  text: string;
}

export function ScripturePage({ onGoLive }: { onGoLive: (data: any) => void }) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // Zustand State
  const { 
    lastBook, lastChapter, lastTranslation, compareTranslation, viewMode,
    setLastPosition, setTranslation, setCompareTranslation, setViewMode
  } = useScriptureStore();

  // Local UI State
  const [translations, setTranslations] = useState<string[]>([]);
  const [books, setBooks] = useState<string[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [compareVerses, setCompareVerses] = useState<Verse[]>([]);
  const [selectedVerseIds, setSelectedVerseIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Initial Data Load
  useEffect(() => {
    const init = async () => {
      if ((window as any).electron?.ipcRenderer) {
        const transRes = await (window as any).electron.ipcRenderer.invoke('scripture-load-translations');
        const booksRes = await (window as any).electron.ipcRenderer.invoke('scripture-load-books');
        if (transRes.success) setTranslations(transRes.translations);
        if (booksRes.success) setBooks(booksRes.books);
      }
    };
    init();
  }, []);

  // 2. Fetch Verses whenever position or translation changes
  const fetchVerses = useCallback(async () => {
    setIsLoading(true);
    if ((window as any).electron?.ipcRenderer) {
      // Primary Translation
      const res = await (window as any).electron.ipcRenderer.invoke('scripture-load-verses', {
        book: lastBook,
        chapter: lastChapter,
        translation: lastTranslation
      });
      if (res.success) setVerses(res.verses);

      // Comparison Translation (if enabled)
      if (viewMode === 'comparison' && compareTranslation) {
        const resComp = await (window as any).electron.ipcRenderer.invoke('scripture-load-verses', {
          book: lastBook,
          chapter: lastChapter,
          translation: compareTranslation
        });
        if (resComp.success) setCompareVerses(resComp.verses);
      }
    }
    setIsLoading(false);
  }, [lastBook, lastChapter, lastTranslation, compareTranslation, viewMode]);

  useEffect(() => {
    fetchVerses();
  }, [fetchVerses]);

  // 3. Selection Logic (Click, Shift, Ctrl/Cmd)
  const handleVerseSelect = (id: number, e: React.MouseEvent) => {
    if (e.shiftKey && selectedVerseIds.length > 0) {
      const lastSelected = selectedVerseIds[selectedVerseIds.length - 1];
      const start = Math.min(lastSelected, id);
      const end = Math.max(lastSelected, id);
      const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      setSelectedVerseIds(Array.from(new Set([...selectedVerseIds, ...range])));
    } else if (e.ctrlKey || e.metaKey) {
      setSelectedVerseIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
      setSelectedVerseIds([id]);
    }
  };

  // 4. Jump to Reference
  const handleJumpToReference = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    if ((window as any).electron?.ipcRenderer) {
      const res = await (window as any).electron.ipcRenderer.invoke('scripture-search-reference', searchQuery);
      if (res.success && res.results.length > 0) {
        const result = res.results[0];
        setLastPosition(result.book, result.chapter);
        setSelectedVerseIds(result.verses);
        showToast(`Jumped to ${result.book} ${result.chapter}`, 'success');
      } else {
        showToast('Reference not found', 'error');
      }
    }
    setIsLoading(false);
  };

  // 5. Output Orchestration
  const handleGoLiveAction = async () => {
    if (selectedVerseIds.length === 0) return;
    const sortedIds = [...selectedVerseIds].sort((a,b) => a-b);
    const selectedVerses = verses.filter(v => sortedIds.includes(v.id));
    
    const payload: any = {
      type: 'scripture',
      reference: `${lastBook} ${lastChapter}:${sortedIds.join(',')}`,
      primaryText: selectedVerses.map(v => v.text).join('\n'),
      primaryTranslation: lastTranslation,
      isComparison: viewMode === 'comparison'
    };

    if (viewMode === 'comparison') {
      const compSelected = compareVerses.filter(v => sortedIds.includes(v.id));
      payload.compareText = compSelected.map(v => v.text).join('\n');
      payload.compareTranslation = compareTranslation;
    }

    onGoLive(payload);
    showToast('Scripture deployed live', 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden text-white font-sans">
      
      {/* ── TOP ACTION BAR ── */}
      <div className="h-20 px-8 flex items-center justify-between bg-[#0A0C10] border-b border-white/5 shadow-2xl z-20">
        <div className="flex items-center gap-6">
           <button onClick={() => navigate('/')} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
             <Library size={20} />
           </button>
           <div className="flex flex-col">
             <h1 className="text-xl font-black tracking-tight flex items-center gap-3">
               ALKITAB BROWSER
             </h1>
             <p className="text-[10px] font-black text-[#2D83FF] uppercase tracking-widest mt-0.5">Dual Translation Production Engine</p>
           </div>
        </div>

        <div className="flex-1 max-w-xl mx-8 relative group">
           <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
             <Search size={16} className="text-white/20 group-focus-within:text-[#2D83FF] transition-colors" />
             {!searchQuery && <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Jump to Ref</span>}
           </div>
           <input 
              type="text" 
              placeholder="e.g. Yohanes 3:16" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-24 pr-6 py-3.5 text-sm font-bold focus:outline-none focus:border-[#2D83FF] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJumpToReference()}
           />
        </div>

        <div className="flex items-center gap-4">
           <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
              <button 
                onClick={() => setViewMode('standard')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'standard' ? 'bg-[#2D83FF] text-white shadow-lg' : 'text-white/20 hover:text-white'}`}
              >
                Standard
              </button>
              <button 
                onClick={() => setViewMode('comparison')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'comparison' ? 'bg-[#2D83FF] text-white shadow-lg' : 'text-white/20 hover:text-white'}`}
              >
                <SplitSquareHorizontal size={14} />
                Compare
              </button>
           </div>

           <select 
             value={lastTranslation}
             onChange={(e) => setTranslation(e.target.value)}
             className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/90 focus:outline-none focus:border-[#2D83FF]"
           >
             {translations.map(t => <option key={t} value={t}>{t}</option>)}
           </select>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* ── LEFT: BOOK/CHAPTER NAV ── */}
         <div className="w-80 bg-[#0A0C10] border-r border-white/5 flex flex-col shrink-0">
            <div className="flex-1 overflow-y-auto no-scrollbar pt-6 px-4 space-y-6">
                <div>
                  <h3 className="px-3 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Old Testament</h3>
                  <div className="space-y-1">
                    {books.slice(0, 39).map(b => (
                      <BookNavItem key={b} name={b} active={lastBook === b} onClick={() => setLastPosition(b, 1)} />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="px-3 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">New Testament</h3>
                  <div className="space-y-1">
                    {books.slice(39).length > 0 ? books.slice(39).map(b => (
                       <BookNavItem key={b} name={b} active={lastBook === b} onClick={() => setLastPosition(b, 1)} />
                    )) : books.slice(10).map(b => (
                       <BookNavItem key={b} name={b} active={lastBook === b} onClick={() => setLastPosition(b, 1)} />
                    ))}
                  </div>
                </div>
            </div>
            
            <div className="p-6 bg-black/40 border-t border-white/5">
               <div className="text-[9px] font-black text-[#2D83FF] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                 <Navigation size={10} /> Select Chapter
               </div>
               <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-[160px] no-scrollbar">
                  {Array.from({ length: 50 }, (_, i) => i + 1).map(c => (
                    <button 
                      key={c}
                      onClick={() => setLastPosition(lastBook, c)}
                      className={`aspect-square flex items-center justify-center rounded-xl text-[11px] font-black transition-all ${lastChapter === c ? 'bg-[#2D83FF] text-white shadow-xl shadow-[#2D83FF]/30' : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white'}`}
                    >
                      {c}
                    </button>
                  ))}
               </div>
            </div>
         </div>

         {/* ── CENTER: WORKSPACE ── */}
         <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Context Bar */}
            <div className="flex items-center justify-between px-10 py-6 bg-black/20 shrink-0 border-b border-white/5">
                <div className="flex items-center gap-5">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[#2D83FF] uppercase tracking-[0.4em] mb-1 italic">Producing Reference</span>
                      <h2 className="text-3xl font-black tracking-tighter uppercase">{lastBook} {lastChapter}</h2>
                   </div>
                   {viewMode === 'comparison' && (
                     <div className="flex items-center gap-3 pl-5 border-l border-white/10">
                        <span className="text-[10px] font-black text-white/20 uppercase">VS</span>
                        <select 
                          value={compareTranslation || ''}
                          onChange={(e) => setCompareTranslation(e.target.value)}
                          className="bg-[#2D83FF]/10 text-[#2D83FF] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-[#2D83FF]/20"
                        >
                          {translations.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                     </div>
                   )}
                </div>
                
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black opacity-40 uppercase tracking-widest">
                     <Bookmark size={12} />
                     {selectedVerseIds.length} Verses Marked
                   </div>
                </div>
            </div>

            {/* Verse Display Engine */}
            <div className="flex-1 overflow-y-auto px-10 pt-10 pb-40 no-scrollbar">
               <div className={`grid gap-6 ${viewMode === 'comparison' ? 'grid-cols-2' : 'max-w-4xl mx-auto'}`}>
                  
                  {/* Primary Verses */}
                  <div className="space-y-6">
                    {viewMode === 'comparison' && <h4 className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em] mb-8 italic">{lastTranslation} View</h4>}
                    {verses.map(v => (
                       <VerseCard 
                         key={v.id} 
                         verse={v} 
                         selected={selectedVerseIds.includes(v.id)} 
                         onClick={(e: any) => handleVerseSelect(v.id, e)}
                       />
                    ))}
                  </div>

                  {/* Comparison Verses */}
                  {viewMode === 'comparison' && (
                    <div className="space-y-6">
                       <h4 className="text-[9px] font-black text-[#2D83FF]/40 uppercase tracking-[0.5em] mb-8 italic">{compareTranslation} Sync</h4>
                       {compareVerses.map(cv => (
                         <div key={cv.id} className={`p-6 rounded-3xl border-2 transition-all opacity-40 ${selectedVerseIds.includes(cv.id) ? 'bg-[#2D83FF]/5 border-[#2D83FF]/20 opacity-100' : 'border-transparent'}`}>
                            <p className="text-sm font-medium leading-relaxed italic text-white/50">{cv.text}</p>
                         </div>
                       ))}
                    </div>
                  )}

               </div>
            </div>

            {/* FLOATING ACTION HUD */}
            <AnimatePresence>
               {selectedVerseIds.length > 0 && (
                 <motion.div 
                    initial={{ y: 100, x: '-50%', opacity: 0 }}
                    animate={{ y: 0, x: '-50%', opacity: 1 }}
                    exit={{ y: 100, x: '-50%', opacity: 0 }}
                    className="fixed bottom-12 left-1/2 flex items-center gap-8 bg-[#0A0C10] border border-white/10 px-8 py-5 rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] z-50 backdrop-blur-3xl"
                 >
                    <div className="flex flex-col min-w-[120px]">
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Live Cue</span>
                       <span className="text-lg font-black text-white tracking-tighter">
                          {lastBook} {lastChapter}:{selectedVerseIds.sort((a,b)=>a-b).join(',')}
                       </span>
                    </div>
                    
                    <div className="h-10 w-px bg-white/10" />

                    <div className="flex items-center gap-3">
                       <button onClick={() => setSelectedVerseIds([])} className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/5 text-red-500 hover:bg-red-500/10 transition-all">
                          <Plus className="rotate-45" size={24} />
                       </button>
                       <button className="h-14 px-8 flex items-center gap-3 rounded-2xl bg-white/5 text-white text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                          <Plus size={18} /> Add to Flow
                       </button>
                       <button 
                          onClick={handleGoLiveAction}
                          className="h-14 px-10 flex items-center gap-4 rounded-2xl bg-[#00D2D2] text-black text-[11px] font-black uppercase tracking-widest hover:scale-[1.05] shadow-2xl shadow-[#00D2D2]/20 transition-all active:scale-95"
                       >
                          <Send size={18} fill="currentColor" /> Go Live
                       </button>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}

function VerseCard({ verse, selected, onClick }: any) {
  return (
    <motion.div 
      onClick={onClick}
      className={`
        group relative p-6 rounded-[28px] border-2 cursor-pointer transition-all duration-300
        ${selected 
          ? 'bg-[#2D83FF]/10 border-[#2D83FF] shadow-[0_20px_40px_rgba(45,131,255,0.2)] scale-[1.02]' 
          : 'bg-white/[0.02] border-transparent hover:bg-white/5 hover:border-white/10'}
      `}
    >
       <div className={`absolute top-6 left-6 text-xs font-black transition-colors ${selected ? 'text-[#2D83FF]' : 'text-white/10'}`}>
         {verse.id}
       </div>
       <div className="pl-8">
          <p className={`text-md font-bold leading-relaxed transition-colors ${selected ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
            {verse.text}
          </p>
       </div>
    </motion.div>
  );
}

function BookNavItem({ name, active, onClick }: { name: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group
        ${active ? 'bg-[#2D83FF]/10 text-[#2D83FF] shadow-inner' : 'text-white/30 hover:text-white/80 hover:bg-white/5'}
      `}
    >
       <span className="text-[11px] font-black tracking-tight uppercase">{name}</span>
       {active ? <div className="w-1.5 h-1.5 rounded-full bg-[#2D83FF] shadow-[0_0_10px_#2D83FF]" /> : <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
    </button>
  );
}
