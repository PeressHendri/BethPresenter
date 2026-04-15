import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, ChevronRight, ChevronLeft, 
  Plus, Send, Layout, Layers, X, BookText
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const BibleView = () => {
  const { setLiveSlide, language, notify } = useProject();
  
  const translations = ['KJV', 'ASV', 'Tagalog', 'IndonesiaTB', 'BIS', 'FAYH'];
  const [versions] = useState(['KJV', 'ASV', 'TB-ID']);
  const [selectedVersion, setSelectedVersion] = useState('TB-ID');
  
  const [books] = useState([
    { id: 1, name: 'Kejadian', chapters: 50 },
    { id: 2, name: 'Keluaran', chapters: 40 },
    { id: 3, name: 'Imamat', chapters: 27 },
    { id: 4, name: 'Bilangan', chapters: 36 },
    { id: 40, name: 'Matius', chapters: 28 },
    { id: 43, name: 'Yohanes', chapters: 21 },
    { id: 44, name: 'Kisah Para Rasul', chapters: 28 },
    { id: 45, name: 'Roma', chapters: 16 },
    { id: 46, name: '1 Korintus', chapters: 16 },
    { id: 50, name: 'Whyakubus', chapters: 5 },
    { id: 51, name: '1 Petrus', chapters: 5 },
    { id: 52, name: '2 Petrus', chapters: 3 },
    { id: 53, name: '1 Yohanes', chapters: 5 },
    { id: 54, name: 'Wahyu', chapters: 22 },
  ]);
  
  const [selectedBook, setSelectedBook] = useState(books[0]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [selectedVerseIds, setSelectedVerseIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // MODUL 14: Multi-version side-by-side state
  const [multiVersionMode, setMultiVersionMode] = useState(false);
  const [selectedTranslations, setSelectedTranslations] = useState(['KJV', 'IndonesiaTB']);
  const [layoutMode, setLayoutMode] = useState('side-by-side'); // 'side-by-side' or 'stacked'
  const [multiVerses, setMultiVerses] = useState([]);

  // Mock data generator for Bible verses
  useEffect(() => {
    const dummyVerses = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      number: i + 1,
      text: `Ini adalah teks ayat Alkitab ke-${i + 1} dari kitab ${selectedBook.name} pasal ${selectedChapter}. Tuhan itu baik bagi semua orang.`
    }));
    setVerses(dummyVerses);
    setSelectedVerseIds([]);
  }, [selectedBook, selectedChapter]);

  const handleVerseToggle = (id, event) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd + Click
      setSelectedVerseIds(prev => 
        prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
      );
    } else if (event.shiftKey && selectedVerseIds.length > 0) {
      // Range select with Shift + Click
      const lastSelected = Math.max(...selectedVerseIds);
      const current = id;
      const start = Math.min(lastSelected, current);
      const end = Math.max(lastSelected, current);
      const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      setSelectedVerseIds(range);
    } else {
      // Single select
      setSelectedVerseIds([id]);
    }
  };

  const handleSendToOutput = () => {
    if (selectedVerseIds.length === 0) return;
    
    const sortedIds = [...selectedVerseIds].sort((a,b) => a-b);
    const selectedText = sortedIds.map(id => {
      const v = verses.find(verse => verse.id === id);
      return `(${v.number}) ${v.text}`;
    }).join('\n\n');

    const bibleSlide = {
      id: `bible-${Date.now()}`,
      title: `${selectedBook.name} ${selectedChapter}:${sortedIds.join(',')}`,
      type: 'bible',
      content: selectedText,
      reference: `${selectedBook.name} ${selectedChapter}:${sortedIds[0]}${sortedIds.length > 1 ? '-' + sortedIds[sortedIds.length-1] : ''}`,
      format: {
        fontSize: '42px',
        fontFamily: 'Outfit',
        textAlign: 'center',
        vAlignment: 'Center',
        textColor: '#FFFFFF',
        bgOpacity: 50,
        shadowType: 'Strong'
      }
    };

    // Send to output using sendBibleToLive
    const { sendBibleToLive } = useProject();
    sendBibleToLive(bibleSlide, bibleSlide.format);
    
    notify('Ayat dikirim ke Output', 'success');
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Parse reference like "Yohanes 3:16" or "John 3:16-17"
    const refMatch = searchQuery.match(/^(\w+)\s+(\d+):(\d+)(?:-(\d+))?$/i);
    if (refMatch) {
      const [, bookName, chapter, verseStart, verseEnd] = refMatch;
      const book = books.find(b => b.name.toLowerCase().includes(bookName.toLowerCase()));
      if (book) {
        setSelectedBook(book);
        setSelectedChapter(parseInt(chapter));
        if (verseStart && verseEnd) {
          const start = parseInt(verseStart);
          const end = parseInt(verseEnd);
          const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
          setSelectedVerseIds(range);
        } else if (verseStart) {
          setSelectedVerseIds([parseInt(verseStart)]);
        }
      }
    } else {
      // Search by content
      const results = verses.filter(v => 
        v.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (results.length > 0) {
        setSelectedVerseIds(results.map(v => v.id));
      }
    }
  };

  // MODUL 14: Multi-version verse selection
  const handleMultiVerseSelect = async (verse) => {
    try {
      const multiVerseData = {
        reference: verse.reference,
        translations: {}
      };

      // Fetch verse from each selected translation
      for (const translation of selectedTranslations) {
        // Mock API call - replace with actual API
        const verseText = await fetchVerseFromTranslation(translation, verse.book, verse.chapter, verse.verse);
        multiVerseData.translations[translation] = verseText;
      }

      setMultiVerses(prev => {
        const exists = prev.find(v => v.reference === verse.reference);
        if (exists) {
          return prev.filter(v => v.reference !== verse.reference);
        } else {
          return [...prev, multiVerseData];
        }
      });
    } catch (error) {
      console.error('Failed to fetch multi-version verses:', error);
    }
  };

  // Mock function to fetch verse from translation
  const fetchVerseFromTranslation = async (translation, book, chapter, verse) => {
    // This would be an actual API call to the backend
    // For now, return mock text based on translation
    const mockTexts = {
      'KJV': `In the beginning God created the heaven and the earth. (${book} ${chapter}:${verse})`,
      'ASV': `In the beginning God created the heavens and the earth. (${book} ${chapter}:${verse})`,
      'Tagalog': `Sa simula ay nilikha ng Dios ang langit at ang lupa. (${book} ${chapter}:${verse})`,
      'IndonesiaTB': `Pada mulanya Allah menciptakan langit dan bumi. (${book} ${chapter}:${verse})`,
      'BIS': `Pada waktu permulaan, Allah menciptakan langit dan bumi. (${book} ${chapter}:${verse})`,
      'FAYH': `Pada mulanya Allah menciptakan langit dan bumi. (${book} ${chapter}:${verse})`
    };
    
    return mockTexts[translation] || `Verse ${verse} from ${translation}`;
  };

  // MODUL 14: Send multi-version verses to output
  const sendMultiVersesToOutput = () => {
    if (multiVerses.length === 0) return;
    
    const { sendBibleToLive } = useProject();
    
    // Create combined slide data
    const slideData = {
      type: 'bible-multi',
      reference: multiVerses[0].reference,
      translations: multiVerses[0].translations,
      layoutMode: layoutMode,
      selectedTranslations: selectedTranslations
    };
    
    sendBibleToLive(slideData);
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-[#2D2D2E] font-['Outfit'] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E2E2E6] bg-[#F8F9FA]">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-black text-[#1D1D1F]">Alkitab</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setMultiVersionMode(!multiVersionMode)}
              className={`px-4 py-2 rounded-lg text-[12px] font-black transition-all ${
                multiVersionMode 
                  ? 'bg-[#800000] text-white' 
                  : 'bg-white border border-[#E2E2E6] text-[#AEAEB2]'
              }`}
            >
              {multiVersionMode ? 'Single Version' : 'Multi Version'}
            </button>
            <button 
              onClick={multiVersionMode ? sendMultiVersesToOutput : handleSendToOutput}
              disabled={(multiVersionMode ? multiVerses : selectedVerseIds).length === 0}
              className="px-4 py-2 bg-[#800000] text-white rounded-lg text-[12px] font-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Kirim ke Output ({multiVersionMode ? multiVerses.length : selectedVerseIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* MODUL 14: Multi-version controls */}
      {multiVersionMode && (
        <div className="px-6 py-4 border-b border-[#E2E2E6] bg-[#F8F9FA]">
          <div className="space-y-4">
            <div>
              <h3 className="text-[12px] font-black text-[#8E8E93] uppercase tracking-[0.2em] mb-3">Pilih Terjemahan</h3>
              <div className="flex flex-wrap gap-2">
                {translations.map(translation => (
                  <button
                    key={translation}
                    onClick={() => {
                      setSelectedTranslations(prev => {
                        if (prev.includes(translation)) {
                          return prev.filter(t => t !== translation);
                        } else if (prev.length < 3) {
                          return [...prev, translation];
                        }
                        return prev;
                      });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                      selectedTranslations.includes(translation)
                        ? 'bg-[#800000] text-white'
                        : 'bg-white border border-[#E2E2E6] text-[#AEAEB2]'
                    }`}
                  >
                    {translation}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-[12px] font-black text-[#8E8E93] uppercase tracking-[0.2em] mb-3">Layout</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setLayoutMode('side-by-side')}
                  className={`px-4 py-2 rounded-lg text-[11px] font-black transition-all ${
                    layoutMode === 'side-by-side'
                      ? 'bg-[#800000] text-white'
                      : 'bg-white border border-[#E2E2E6] text-[#AEAEB2]'
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setLayoutMode('stacked')}
                  className={`px-4 py-2 rounded-lg text-[11px] font-black transition-all ${
                    layoutMode === 'stacked'
                      ? 'bg-[#800000] text-white'
                      : 'bg-white border border-[#E2E2E6] text-[#AEAEB2]'
                  }`}
                >
                  Stacked
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigasi Kitab & Pasal */}
      <div className="w-[240px] border-r border-[#E2E2E6] flex flex-col overflow-hidden bg-[#F8F9FA]">
        <div className="p-4 border-b border-[#E2E2E6] bg-white">
          <span className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.2em]">KITAB</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {books.map(book => (
            <div 
              key={book.id}
              onClick={() => { setSelectedBook(book); setSelectedChapter(1); }}
              className={`px-6 py-3 text-[13px] font-bold cursor-pointer transition-all ${
                selectedBook.id === book.id ? 'bg-[#800000] text-white' : 'hover:bg-[#80000005] text-[#424245]'
              }`}
            >
              {book.name}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-[#E2E2E6] bg-white">
          <span className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.2em]">PASAL</span>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(c => (
              <div 
                key={c}
                onClick={() => setSelectedChapter(c)}
                className={`aspect-square flex items-center justify-center text-[11px] font-black rounded-lg cursor-pointer transition-all ${
                  selectedChapter === c ? 'bg-[#800000] text-white shadow-lg shadow-[#80000020]' : 'bg-white border border-[#E2E2E6] text-[#AEAEB2] hover:border-[#80000040]'
                }`}
              >
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daftar Ayat */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="p-4 px-8 border-b border-[#F1F1F3] bg-white flex items-center justify-between">
          <h4 className="text-[14px] font-black text-[#1D1D1F]">{selectedBook.name} {selectedChapter}</h4>
          <span className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-widest">{selectedVerseIds.length} verse{selectedVerseIds.length !== 1 ? 's' : ''} selected</span>
        </div>
        
        {/* MODUL 14: Multi-version Preview */}
        {multiVersionMode && multiVerses.length > 0 && (
          <div className="px-8 py-4 border-b border-[#E2E2E6] bg-[#F8F9FA]">
            <h3 className="text-[12px] font-black text-[#8E8E93] uppercase tracking-[0.2em] mb-4">Preview Multi-Version</h3>
            {multiVerses.map((multiVerse, index) => (
              <div key={index} className="mb-4 p-4 bg-white rounded-lg border border-[#E2E2E6]">
                <p className="font-black text-sm mb-3">{multiVerse.reference}</p>
                {layoutMode === 'side-by-side' ? (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTranslations.map(translation => (
                      <div key={translation} className="text-center">
                        <p className="text-[10px] font-black text-[#800000] mb-1">{translation}</p>
                        <p className="text-sm leading-relaxed">{multiVerse.translations[translation]}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedTranslations.map(translation => (
                      <div key={translation} className="border-l-4 border-[#800000] pl-3">
                        <p className="text-[10px] font-black text-[#800000] mb-1">{translation}</p>
                        <p className="text-sm leading-relaxed">{multiVerse.translations[translation]}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
          {verses.map(v => (
            <div 
              key={v.id}
              onClick={(e) => handleVerseToggle(v.id, e)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedVerseIds.includes(v.id) 
                  ? 'bg-[#80000005] border-[#800000] shadow-md' 
                  : 'bg-white border-transparent hover:border-[#F1F1F3]'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-[12px] font-black text-[#800000] mt-1">{v.number}</span>
                <p className="flex-1 text-[14px] leading-relaxed">
                  {v.text}
                </p>
              </div>
            </div>
            ))}
          </div>

          {/* Send Bar */}
          <div className="p-6 bg-white border-t border-[#E2E2E6] flex justify-end shrink-0">
            <button 
              onClick={handleSendToOutput}
              disabled={selectedVerseIds.length === 0}
              className={`px-8 py-3 rounded-xl flex items-center gap-3 text-[12px] font-black transition-all shadow-xl shadow-[#80000010] ${
                selectedVerseIds.length > 0 ? 'bg-[#800000] text-white hover:bg-black' : 'bg-[#F1F1F3] text-[#AEAEB2] cursor-not-allowed shadow-none'
              }`}
            >
              <Send size={16} />
              KIRIM KE OUTPUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BibleView;
