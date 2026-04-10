import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Book, 
  Layers, 
  Zap, 
  Check, 
  ChevronRight, 
  Type, 
  Plus, 
  X,
  Keyboard,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

interface Verse {
  id: number;
  text: string;
}

export function AddScripturePage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // ── DATA STATE ──
  const [translations, setTranslations] = useState<string[]>([]);
  const [activeTranslation, setActiveTranslation] = useState('KJV');
  
  const [books, setBooks] = useState<string[]>([]);
  const [activeBook, setActiveBook] = useState('John');
  const [activeChapter, setActiveChapter] = useState(3);
  const [chapterCount, setChapterCount] = useState(21);
  const [verses, setVerses] = useState<Verse[]>([]);
  
  // ── SELECTION STATE ──
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ── INITIAL LOAD ──
  useEffect(() => {
    const init = async () => {
      if ((window as any).electron?.ipcRenderer) {
        const transRes = await (window as any).electron.ipcRenderer.invoke('bible-list-translations');
        const booksRes = await (window as any).electron.ipcRenderer.invoke('bible-list-books');
        if (transRes.success) setTranslations(transRes.translations);
        if (booksRes.success) setBooks(booksRes.books);
      }
    };
    init();
  }, []);

  // ── DYNAMIC SYNC ──
  useEffect(() => {
    const fetchChapters = async () => {
      if ((window as any).electron?.ipcRenderer) {
        const res = await (window as any).electron.ipcRenderer.invoke('bible-list-chapters', activeBook);
        if (res.success) setChapterCount(res.count);
      }
    };
    fetchChapters();
  }, [activeBook]);

  useEffect(() => {
    const fetchVerses = async () => {
      setIsLoading(true);
      if ((window as any).electron?.ipcRenderer) {
        const res = await (window as any).electron.ipcRenderer.invoke('bible-get-verses', {
          bookId: activeBook,
          chapterNumber: activeChapter,
          translationId: activeTranslation
        });
        if (res.success) setVerses(res.verses);
      }
      setIsLoading(false);
    };
    fetchVerses();
  }, [activeBook, activeChapter, activeTranslation]);

  // ── RANGE BUILDER LOGIC ──
  const referenceRange = useMemo(() => {
    if (selectedVerses.length === 0) return '';
    const sorted = [...selectedVerses].sort((a, b) => a - b);
    
    // Group contiguous verses
    const ranges: string[] = [];
    let start = sorted[0];
    let end = sorted[0];
    
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === end + 1) {
            end = sorted[i];
        } else {
            ranges.push(start === end ? `${start}` : `${start}–${end}`);
            start = sorted[i];
            end = sorted[i];
        }
    }
    ranges.push(start === end ? `${start}` : `${start}–${end}`);
    
    return `${activeBook} ${activeChapter}:${ranges.join(', ')}`;
  }, [activeBook, activeChapter, selectedVerses]);

  // ── HANDLERS ──
  const handleToggleVerse = (id: number, isShift?: boolean) => {
    if (isShift && selectedVerses.length > 0) {
       const last = selectedVerses[selectedVerses.length - 1];
       const start = Math.min(last, id);
       const end = Math.max(last, id);
       const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
       setSelectedVerses(Array.from(new Set([...selectedVerses, ...range])));
    } else {
       setSelectedVerses(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
    }
  };

  const handleSearch = async () => {
     if (!searchQuery) return;
     if ((window as any).electron?.ipcRenderer) {
        const res = await (window as any).electron.ipcRenderer.invoke('bible-search-reference', searchQuery);
        if (res.success && res.match) {
           setActiveBook(res.match.bookId);
           setActiveChapter(res.match.chapterNumber);
           setSelectedVerses([res.match.verseId]);
           showToast('Reference located', 'success');
        } else {
           showToast('Reference not found', 'error');
        }
     }
  };

  const handleAddToService = async () => {
    if (selectedVerses.length === 0) return;
    setIsLoading(true);
    if ((window as any).electron?.ipcRenderer) {
       const res = await (window as any).electron.ipcRenderer.invoke('scripture-add-to-service', {
          bookId: activeBook,
          chapterNumber: activeChapter,
          verses: selectedVerses,
          reference: referenceRange,
          translationId: activeTranslation
       });
       if (res.success) {
          showToast('Scripture added to Service Order', 'success');
          navigate('/');
       }
    }
    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden text-white font-sans select-none">
      {/* ── HEADER ── */}
      <div className="h-16 px-6 flex items-center justify-between bg-[#0A0C10] border-b border-white/5 shadow-2xl z-20">
        <div className="flex items-center gap-6">
           <button onClick={() => navigate('/scripture')} className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-all">
             <ArrowLeft size={20} />
           </button>
           <div className="flex flex-col">
              <h1 className="text-sm font-black uppercase tracking-[0.2em]">Scripture Picker</h1>
              <span className="text-[9px] font-black text-[#2D83FF] uppercase tracking-widest">Add to Service Flow</span>
           </div>
        </div>

        <div className="flex-1 max-w-xl mx-12 relative group">
           <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#2D83FF] transition-colors" />
           <input 
              type="text" 
              placeholder="Jump to reference (e.g. John 3:16 or Ps 23)..." 
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-[#2D83FF] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
           />
        </div>

        <div className="flex items-center gap-3">
           <select 
             value={activeTranslation}
             onChange={(e) => setActiveTranslation(e.target.value)}
             className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-black text-white/90 focus:outline-none focus:border-[#2D83FF]"
           >
             {translations.map(t => <option key={t} value={t}>{t}</option>)}
           </select>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* ── COL 1: BOOKS ── */}
         <div className="w-64 bg-[#0A0C10] border-r border-white/5 flex flex-col shrink-0">
            <div className="px-5 py-3 border-b border-white/5 bg-black/20">
               <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Books</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-2 space-y-0.5">
               {books.map(b => (
                 <NavItem key={b} label={b} active={activeBook === b} onClick={() => setActiveBook(b)} />
               ))}
            </div>
         </div>

         {/* ── COL 2: CHAPTERS ── */}
         <div className="w-56 bg-[#080808] border-r border-white/5 flex flex-col shrink-0">
            <div className="px-5 py-3 border-b border-white/5 bg-black/20">
               <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Chapters</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4">
               <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: chapterCount }, (_, i) => i + 1).map(c => (
                    <button 
                       key={c}
                       onClick={() => setActiveChapter(c)}
                       className={`aspect-square flex items-center justify-center rounded-lg text-[11px] font-black transition-all ${activeChapter === c ? 'bg-[#2D83FF] text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                      {c}
                    </button>
                  ))}
               </div>
            </div>
         </div>

         {/* ── COL 3: VERSES ── */}
         <div className="flex-1 bg-black flex flex-col overflow-hidden">
            <div className="px-8 py-3 border-b border-white/5 bg-black/20 flex items-center justify-between">
               <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Verses</span>
               <div className="flex items-center gap-4 text-[9px] font-black text-white/30 uppercase tracking-widest">
                  {selectedVerses.length} selected
                  <button onClick={() => setSelectedVerses([])} className="text-red-500/80 hover:text-red-500 transition-colors uppercase">Clear</button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-4 no-scrollbar">
               {isLoading ? (
                 <div className="h-full flex items-center justify-center opacity-20 italic">Syncing Word...</div>
               ) : (
                 <div className="space-y-1">
                    {verses.map(v => (
                       <div 
                         key={v.id}
                         onClick={(e) => handleToggleVerse(v.id, e.shiftKey)}
                         className={`
                           group flex gap-6 p-3 rounded-lg cursor-pointer transition-all
                           ${selectedVerses.includes(v.id) ? 'bg-[#2D83FF]/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}
                         `}
                       >
                          <span className={`text-[10px] font-black w-6 transition-colors ${selectedVerses.includes(v.id) ? 'text-[#2D83FF]' : 'text-white/10'}`}>{v.id}</span>
                          <p className="text-[13px] font-medium leading-relaxed tracking-tight">{v.text}</p>
                       </div>
                    ))}
                 </div>
               )}
            </div>
         </div>

         {/* ── COL 4: PREVIEW PANEL ── */}
         <div className="w-[450px] bg-[#0A0C10] border-l border-white/5 flex flex-col shrink-0 shadow-2xl z-10">
            <div className="p-8 flex-1 flex flex-col overflow-hidden">
               <div className="mb-8">
                  <h3 className="text-[10px] font-black uppercase text-[#2D83FF] tracking-[0.3em] mb-4 italic">Selection Preview</h3>
                  <div className="bg-black/40 rounded-3xl border border-white/5 p-8 h-[320px] shadow-2xl overflow-hidden flex flex-col">
                     {selectedVerses.length > 0 ? (
                        <div className="flex flex-col h-full">
                           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00D2D2] mb-4">{referenceRange}</span>
                           <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
                             {selectedVerses.sort((a,b)=>a-b).map(vId => (
                                <p key={vId} className="text-sm font-medium leading-[1.6] text-white/80 italic">
                                   <span className="text-[#2D83FF] font-black pr-2">{vId}</span>
                                   {verses.find(v => v.id === vId)?.text}
                                </p>
                             ))}
                           </div>
                        </div>
                     ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                           <Book size={40} className="mb-4" />
                           <p className="text-[10px] font-black uppercase tracking-widest leading-loose">Select verses to <br/> generate broadcast preview</p>
                        </div>
                     )}
                  </div>
               </div>

               <div className="space-y-3 mt-auto">
                  <button 
                    disabled={selectedVerses.length === 0 || isLoading}
                    onClick={handleAddToService}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#2D83FF] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#1C69FF] shadow-2xl shadow-[#2D83FF]/30 active:scale-95 disabled:opacity-20 transition-all"
                  >
                     <Plus size={16} />
                     Add to Service Order
                  </button>
                  <button 
                    onClick={() => navigate('/scripture')}
                    className="w-full py-4 rounded-2xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all"
                  >
                     Cancel Selection
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function NavItem({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group
        ${active ? 'bg-[#2D83FF]/10 text-[#2D83FF]' : 'text-white/30 hover:bg-white/5 hover:text-white/80'}
      `}
    >
       <div className={`p-1.5 rounded-md transition-all ${active ? 'bg-[#2D83FF] text-white' : 'bg-black/40 text-white/40 group-hover:text-white'}`}>
          <Book size={12} />
       </div>
       <span className="text-[11px] font-black tracking-tighter uppercase">{label}</span>
       {active && <ChevronRight size={12} className="ml-auto opacity-50" />}
    </button>
  );
}
