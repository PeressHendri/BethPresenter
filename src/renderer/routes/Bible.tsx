import React, { useState, useEffect } from 'react';
import { BookOpen, MonitorUp, FileOutput } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { TranslationList } from '../components/bible/TranslationList';
import { BookList, BibleBook } from '../components/bible/BookList';
import { VerseList, BibleVerse } from '../components/bible/VerseList';
import { BibleSearch } from '../components/bible/BibleSearch';
import { ZefaniaImport } from '../components/bible/ZefaniaImport';
import { Scrollbar } from '../components/ui/Scrollbar';
import { SlidePreview } from '../components/SlidePreview';
import { usePresentationStore } from '../stores/presentationStore';

export function Bible() {
  const [translations, setTranslations] = useState<string[]>([]);
  const [activeTranslation, setActiveTranslation] = useState<string>('');
  
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [activeBook, setActiveBook] = useState<BibleBook | null>(null);
  
  const [chapters, setChapters] = useState<number[]>([]);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);

  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedVerses, setSelectedVerses] = useState<BibleVerse[]>([]);

  const [showImport, setShowImport] = useState(false);

  // Hook into presentation store to "Add to Queue"
  const { addItem } = usePresentationStore();

  const fetchTranslations = async () => {
    try {
      const data = await (window as any).electron.ipcRenderer.invoke('bible:getTranslations');
      setTranslations(data);
      if (data.length > 0 && !activeTranslation) {
        setActiveTranslation(data[0]);
      }
    } catch (e) { console.error('Failed to load translations', e); }
  };

  useEffect(() => {
    void fetchTranslations();
  }, []);

  useEffect(() => {
    if (activeTranslation) {
      void (async () => {
        try {
          const data = await (window as any).electron.ipcRenderer.invoke('bible:getBooks', activeTranslation);
          setBooks(data);
          if (data.length > 0 && (!activeBook || !data.find((b: BibleBook) => b.bookNumber === activeBook.bookNumber))) {
            setActiveBook(data[0]);
          }
        } catch (e) { }
      })();
    }
  }, [activeTranslation]);

  useEffect(() => {
    if (activeBook && activeTranslation) {
      void (async () => {
        try {
          const data = await (window as any).electron.ipcRenderer.invoke('bible:getChapters', {
             translation: activeTranslation, bookNumber: activeBook.bookNumber
          });
          setChapters(data);
          if (data.length > 0 && (!activeChapter || !data.includes(activeChapter))) {
             setActiveChapter(data[0]);
          }
        } catch (e) { }
      })();
    }
  }, [activeBook, activeTranslation]);

  useEffect(() => {
    if (activeBook && activeChapter && activeTranslation) {
      void (async () => {
        try {
          const data = await (window as any).electron.ipcRenderer.invoke('bible:getVerses', {
             translation: activeTranslation, bookNumber: activeBook.bookNumber, chapter: activeChapter
          });
          setVerses(data);
          // Auto select verse 1 if nothing is selected (or maybe leave blank)
        } catch (e) { }
      })();
    } else {
      setVerses([]);
    }
  }, [activeBook, activeChapter, activeTranslation]);

  const handleSendToLive = () => {
    if (selectedVerses.length === 0) return;
    
    // Merge verses texts
    const mergedText = selectedVerses.map(v => `<sup style="font-size:0.6em;opacity:0.8;vertical-align:super;">${v.verse}</sup> <span>${v.text}</span>`).join(' ');
    
    // Range notation
    const first = selectedVerses[0];
    const last = selectedVerses[selectedVerses.length - 1];
    let ref = `${first.book} ${first.chapter}:${first.verse}`;
    if (first.verse !== last.verse) {
       ref += `-${last.verse}`;
    }

    const payload = {
      text: mergedText,
      reference: ref,
      translation: activeTranslation
    };

    (window as any).electron.ipcRenderer.invoke('output:send-bible', payload).catch(console.error);
  };

  const handleAddToQueue = () => {
    if (selectedVerses.length === 0) return;
    
    const mergedText = selectedVerses.map(v => `${v.verse}. ${v.text}`).join('\n');
    const first = selectedVerses[0];
    const last = selectedVerses[selectedVerses.length - 1];
    let ref = `${first.book} ${first.chapter}:${first.verse}`;
    if (first.verse !== last.verse) ref += `-${last.verse}`;

    addItem({
       id: crypto.randomUUID(),
       type: 'bible',
       content: {
          text: mergedText,
          reference: ref,
          translation: activeTranslation
       }
    });

    // Option to clear selection
    setSelectedVerses([]);
  };

  const handleSearchJump = async (bookNumber: number, chapter: number, verse: number) => {
    // Need to set book first, wait for translation? Translation should be active.
    const bk = books.find(b => b.bookNumber === bookNumber);
    if (bk) {
      setActiveBook(bk);
      setTimeout(() => {
        setActiveChapter(chapter);
        setTimeout(() => {
          const matchedVerse = verses.find(v => v.verse === verse);
          if (matchedVerse) setSelectedVerses([matchedVerse]);
          // To implement correct scrolling to verse, a ref on verse item would be needed. 
          // For now, setting it to active is good enough.
        }, 100);
      }, 50);
    }
  };

  // Preview generated payload locally
  const previewRef = selectedVerses.length > 0 
    ? `${selectedVerses[0].book} ${selectedVerses[0].chapter}:${selectedVerses[0].verse}${selectedVerses.length > 1 ? `-${selectedVerses[selectedVerses.length - 1].verse}` : ''}`
    : `Select a verse`;
  const previewText = selectedVerses.length > 0 
    ? selectedVerses.map(v => v.text).join(' ') 
    : 'No verse selected.';

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-surface-base -m-5">
        
        {/* TOP TOOLBAR */}
        <div className="bg-surface-elevated border-b border-border-default px-6 py-4 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-accent-500/20 text-accent-400 rounded-xl flex items-center justify-center">
                <BookOpen size={20} />
             </div>
             <div>
               <h1 className="text-xl font-bold text-text-100">Scripture Browser</h1>
               <p className="text-xs text-text-500">Read, search, and present the Bible</p>
             </div>
           </div>
           
           <BibleSearch translation={activeTranslation} onJumpTo={handleSearchJump} />
        </div>

        {/* WORKSPACE */}
        <div className="flex-1 flex overflow-hidden">
           
           {/* Panel 1: Translations */}
           <TranslationList 
              translations={translations}
              activeTranslation={activeTranslation}
              onSelect={setActiveTranslation}
              onImportClick={() => setShowImport(true)}
           />

           {/* Panel 2: Books */}
           <BookList 
              books={books}
              activeBookNumber={activeBook?.bookNumber || 0}
              onSelect={(b) => { setActiveBook(b); setSelectedVerses([]); }}
           />

           {/* Panel 3: Chapters */}
           <div className="w-[100px] shrink-0 border-r border-border-default bg-surface-sidebar flex flex-col h-full overflow-hidden">
             <div className="px-3 py-2 border-b border-border-default bg-surface-elevated shrink-0 min-h-[44px]">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-400">Chap</h3>
             </div>
             <Scrollbar className="flex-1 p-2">
               <div className="grid grid-cols-2 gap-1.5 pb-20">
                 {chapters.map(ch => (
                   <button
                     key={ch}
                     onClick={() => { setActiveChapter(ch); setSelectedVerses([]); }}
                     className={`flex items-center justify-center aspect-square rounded-md text-xs font-bold transition-all ${
                       activeChapter === ch
                         ? 'bg-accent-600 text-white shadow-sm'
                         : 'text-text-300 hover:bg-surface-hover hover:text-text-100'
                     }`}
                   >
                     {ch}
                   </button>
                 ))}
               </div>
             </Scrollbar>
           </div>

           {/* Panel 4: Verses */}
           <VerseList 
             verses={verses}
             selectedVerses={selectedVerses}
             onSelectChange={setSelectedVerses}
             onSendToLive={handleSendToLive}
             onAddToQueue={handleAddToQueue}
           />

           {/* Preview Panel Wrapper (Right side split) */}
           <div className="w-[360px] shrink-0 border-l border-border-default bg-surface-sidebar flex flex-col items-center justify-start p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-400 mb-6 w-full text-center">Output Preview</h3>
              <div className="w-full aspect-video shadow-2xl rounded-lg overflow-hidden border border-border-strong bg-black">
                 <SlidePreview 
                   text={previewText}
                   label=""
                   title={`${previewRef} · ${activeTranslation}`}
                 />
              </div>

              <div className="mt-8 w-full flex flex-col gap-3">
                 <button 
                   onClick={handleSendToLive}
                   disabled={selectedVerses.length === 0}
                   className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:hover:bg-accent-600 text-white font-bold tracking-wide transition-all shadow-lg hover:shadow-accent-500/25"
                 >
                   <MonitorUp size={18} /> Send to Live Projector
                 </button>
                 
                 <button 
                   onClick={handleAddToQueue}
                   disabled={selectedVerses.length === 0}
                   className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-elevated border border-border-default hover:bg-surface-hover disabled:opacity-50 text-text-200 font-bold transition-all"
                 >
                   <FileOutput size={16} /> Add to Service Queue
                 </button>
              </div>

              <div className="mt-auto pt-6 text-center text-[10px] text-text-500 max-w-[250px] mx-auto leading-relaxed">
                Tip: Press <kbd className="px-1 bg-surface-elevated rounded border border-border-default">Shift</kbd> + click to select multiple consecutive verses.
              </div>
           </div>

        </div>

      </div>

      {showImport && (
        <ZefaniaImport 
           onClose={() => setShowImport(false)}
           onSuccess={() => void fetchTranslations()}
        />
      )}
    </MainLayout>
  );
}
