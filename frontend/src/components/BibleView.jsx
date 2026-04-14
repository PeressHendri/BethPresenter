import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, BookOpen, ChevronLeft, ChevronRight, 
  ChevronDown, X, Layout, Layers, Tv, Image as ImageIcon
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const BibleView = () => {
  const { language, sendBibleToLive, notify } = useProject();

  // Bible States
  const [bibleVersions, setBibleVersions] = useState({});
  const [selectedBibleVersion, setSelectedBibleVersion] = useState('IndonesiaTB');
  const [bibleBooks, setBibleBooks] = useState([]);
  const [selectedBookID, setSelectedBookID] = useState(1);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [maxChapters, setMaxChapters] = useState(50);
  const [bibleVerses, setBibleVerses] = useState([]);
  const [selectedVerseIndices, setSelectedVerseIndices] = useState([]);
  const [bibleSearch, setBibleSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingBible, setIsSearchingBible] = useState(false);
  const [bibleLayout, setBibleLayout] = useState('list'); // 'list' or 'paragraph'
  const [searchActiveIndex, setSearchActiveIndex] = useState(0);

  // Fetch Bible Meta
  useEffect(() => {
    fetch('http://localhost:5000/api/bible/versions').then(res => res.json()).then(setBibleVersions);
  }, []);

  useEffect(() => {
    if (selectedBibleVersion) {
      fetch(`http://localhost:5000/api/bible/books?version=${selectedBibleVersion}`)
        .then(res => res.json())
        .then(setBibleBooks);
    }
  }, [selectedBibleVersion]);

  // Fetch Chapters count
  useEffect(() => {
    if (selectedBookID) {
      fetch(`http://localhost:5000/api/bible/chapters/${selectedBookID}`)
        .then(res => res.json())
        .then(data => setMaxChapters(data.maxChapter || 1));
    }
  }, [selectedBookID]);

  // Fetch Verses
  useEffect(() => {
    if (selectedBibleVersion && selectedBookID && selectedChapter) {
      fetch(`http://localhost:5000/api/bible/verses?version=${selectedBibleVersion}&bookID=${selectedBookID}&chapter=${selectedChapter}`)
        .then(res => res.json())
        .then(data => {
          setBibleVerses(data);
          setSelectedVerseIndices([]);
        })
        .catch(err => {
          console.error('Fetch Bible error:', err);
          notify(language === 'id' ? 'Gagal memuat ayat Alkitab.' : 'Failed to load Bible verses.', 'error');
        });
    }
  }, [selectedBibleVersion, selectedBookID, selectedChapter]);

  const triggerSearch = (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearchingBible(true);
    fetch(`http://localhost:5000/api/bible/search?version=${selectedBibleVersion}&query=${query}`)
      .then(res => res.json())
      .then(data => {
        setSearchResults(data);
        setSearchActiveIndex(0);
        setIsSearchingBible(false);
      })
      .catch(() => setIsSearchingBible(false));
  };

  // Auto-search Search Logic (Debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (bibleSearch.length >= 3) {
        triggerSearch(bibleSearch);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [bibleSearch, selectedBibleVersion]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If results already exist, select first one automatically on Enter AND send to live
      if (searchResults.length > 0) {
        const first = searchResults[0];
        const book = bibleBooks.find(b => b.book.toLowerCase() === first.book.toLowerCase());
        
        const label = `${first.book} ${first.chapter}:${first.verse}`;
        sendBibleToLive({
          content: first.content,
          reference: label,
          referencePos: 'bottom',
        });
        notify(language === 'id' ? `Live: ${label}` : `Live: ${label}`, 'success');

        if (book) {
          setSelectedBookID(book.bookID);
          setSelectedChapter(first.chapter);
          setBibleSearch('');
          notify(language === 'id' ? `Live: ${label}` : `Live: ${label}`, 'success');
        }
      } else {
        triggerSearch(bibleSearch);
      }
    }
  };

  const toggleVerseSelection = (index, e) => {
    if (bibleVerses[index]?.type === 't') return;
    if (e.shiftKey && selectedVerseIndices.length > 0) {
      const last = selectedVerseIndices[selectedVerseIndices.length - 1];
      const start = Math.min(last, index);
      const end = Math.max(last, index);
      const range = Array.from({ length: end - start + 1 }, (_, i) => start + i)
        .filter(idx => bibleVerses[idx]?.type !== 't');
      setSelectedVerseIndices(Array.from(new Set([...selectedVerseIndices, ...range])));
    } else if (e.metaKey || e.ctrlKey) {
      setSelectedVerseIndices(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
    } else {
      setSelectedVerseIndices([index]);
    }
  };

  const sendBibleToOutput = (isPreview = false) => {
    if (selectedVerseIndices.length === 0) return;
    const sortedIndices = [...selectedVerseIndices].sort((a, b) => a - b);
    const content = sortedIndices.map(i => bibleVerses[i].content).join('\n');
    const book = bibleBooks.find(b => b.bookID === selectedBookID)?.book || 'Alkitab';
    const verseNums = sortedIndices.map(i => bibleVerses[i].verse);
    const reference = `${book} ${selectedChapter}:${verseNums[0]}${verseNums.length > 1 ? '-' + verseNums[verseNums.length-1] : ''}`;

    const bibleData = {
      type: 'bible',
      content,
      reference,
      referencePos: 'bottom',
      translation: selectedBibleVersion
    };

    if (isPreview) {
      // If preview is clicked, but currently sendToLive is not mapped for pure preview. We will map to live for now.
      sendBibleToLive(bibleData);
      notify(`Preview: ${reference}`, 'info');
    } else {
      sendBibleToLive(bibleData);
      notify(`Live: ${reference}`, 'success');
    }
  };

  const selectedBook = bibleBooks.find(b => b.bookID === selectedBookID);

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden font-['Outfit'] text-[#2D2D2E]">
      {/* Alkitab Toolbar */}
      <div className="h-[56px] px-6 border-b border-[#E2E2E6] flex items-center justify-between gap-4 bg-[#F8F9FA]/50">
        <div className="flex items-center gap-3">
          <select 
            value={selectedBibleVersion} 
            onChange={(e) => setSelectedBibleVersion(e.target.value)}
            className="bg-white border border-[#E2E2E6] px-3 py-1.5 text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-[#80000020] min-w-[200px] shadow-sm"
          >
            {Object.entries(bibleVersions).map(([lang, versions]) => (
              <optgroup key={lang} label={lang.toUpperCase()}>
                {versions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </optgroup>
            ))}
          </select>
          
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEAEB2]" />
            <input 
              type="text" 
              placeholder="Cari referensi atau teks..."
              value={bibleSearch}
              onChange={(e) => setBibleSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="bg-white border-2 border-[#E2E2E6] pl-10 pr-4 py-1.5 text-[13px] font-bold focus:border-[#800000] focus:outline-none w-[400px] transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-white p-1 border border-[#E2E2E6] shadow-sm">
           <div onClick={() => setBibleLayout('list')} className={`p-1.5 cursor-pointer ${bibleLayout === 'list' ? 'bg-[#80000010] text-[#800000]' : 'text-[#AEAEB2]'}`}><Layout size={16} /></div>
           <div onClick={() => setBibleLayout('paragraph')} className={`p-1.5 cursor-pointer ${bibleLayout === 'paragraph' ? 'bg-[#80000010] text-[#800000]' : 'text-[#AEAEB2]'}`}><Layers size={16} /></div>
        </div>
      </div>

      {/* Nav */}
      <div className="h-[48px] px-6 border-b border-[#F1F1F3] flex items-center justify-between bg-white shrink-0">
         <div className="flex items-center gap-1.5">
            <BookOpen size={14} className="text-[#8E8E93]" /><span className="text-[12px] font-black text-[#8E8E93]">KITAB</span>
            <select value={selectedBookID} onChange={(e) => { setSelectedBookID(parseInt(e.target.value)); setSelectedChapter(1); }} className="text-[12px] font-black text-[#8E8E93] bg-transparent outline-none">
               {bibleBooks.map(b => <option key={b.bookID} value={b.bookID}>{b.book}</option>)}
            </select>
            <span className="text-[#E2E2E6]">/</span>
            <select value={selectedChapter} onChange={(e) => setSelectedChapter(parseInt(e.target.value))} className="text-[12px] font-black text-[#800000] bg-transparent outline-none">
               {Array.from({ length: maxChapters }, (_, i) => i + 1).map(c => <option key={c} value={c}>Pasal {c}</option>)}
            </select>
         </div>
         <div className="flex items-center gap-1">
            <div onClick={() => setSelectedChapter(prev => Math.max(1, prev - 1))} className="p-1 text-[#AEAEB2] hover:text-[#800000] cursor-pointer"><ChevronLeft size={18} /></div>
            <div className="text-[13px] font-black text-[#800000] px-3">{selectedBook?.book} {selectedChapter}</div>
            <div onClick={() => setSelectedChapter(prev => Math.min(maxChapters, prev + 1))} className="p-1 text-[#AEAEB2] hover:text-[#800000] cursor-pointer"><ChevronRight size={18} /></div>
         </div>
      </div>

      {/* Verse List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        {isSearchingBible ? (
          <div className="h-full flex items-center justify-center spinner"></div>
        ) : bibleSearch ? (
          <div className="p-6">
            <h3 className="text-[11px] font-black text-[#AEAEB2] uppercase mb-4">Hasil: {searchResults.length} ayat</h3>
            <div className="flex flex-col gap-2">
                <div key={idx} 
                     onClick={() => {
                        const book = bibleBooks.find(b => b.book === res.book);
                        if (book) { setSelectedBookID(book.bookID); setSelectedChapter(res.chapter); setBibleSearch(''); }
                     }} 
                     onDoubleClick={() => {
                        const label = `${res.book} ${res.chapter}:${res.verse}`;
                        sendBibleToLive({ content: res.content, reference: label, referencePos: 'bottom' });
                        notify(`Live: ${label}`, 'success');
                     }}
                     className="p-4 rounded-xl border border-[#F1F1F3] hover:bg-[#80000005] cursor-pointer group transition-all"
                >
                   <div className="flex justify-between items-start">
                      <span className="text-[11px] font-black text-[#800000]">{res.book} {res.chapter}:{res.verse}</span>
                      <span className="text-[9px] font-black text-[#AEAEB2] opacity-0 group-hover:opacity-100 uppercase tracking-tighter">Double-click to Live</span>
                   </div>
                   <p className="text-[14px] font-medium text-[#2D2D2E] mt-1">{res.content}</p>
                </div>
            </div>
          </div>
        ) : (
          <div className={bibleLayout === 'paragraph' ? 'p-12 select-text' : 'flex flex-col select-text'}>
            {bibleVerses.map((v, idx) => (
              <div key={idx} id={`verse-${idx}`} 
                   onClick={(e) => toggleVerseSelection(idx, e)}
                   onDoubleClick={() => {
                      if (v.type === 't') return;
                      const book = bibleBooks.find(b => b.bookID === selectedBookID)?.book || 'Alkitab';
                      const reference = `${book} ${selectedChapter}:${v.verse}`;
                      sendBibleToLive({ content: v.content, reference, referencePos: 'bottom' });
                      notify(`Live: ${reference}`, 'success');
                   }}
                   className={`px-8 py-4 flex gap-5 transition-all cursor-pointer border-b border-[#F1F1F3]/30 ${selectedVerseIndices.includes(idx) ? 'bg-[#80000010] border-l-4 border-[#800000]' : 'hover:bg-[#F8F9FA]'}`}>
                {v.type === 't' ? (
                  <h2 className="text-[18px] font-black text-[#800000]">{v.content}</h2>
                ) : (
                  <>
                    <div className={`w-7 h-7 flex items-center justify-center shrink-0 text-[11px] font-black ${selectedVerseIndices.includes(idx) ? 'bg-[#800000] text-white' : 'bg-[#F1F1F3] text-[#AEAEB2]'}`}>{v.verse}</div>
                    <p className={`text-[17px] font-medium ${selectedVerseIndices.includes(idx) ? 'text-[#800000]' : ''}`}>{v.content}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-[64px] px-8 bg-[#F8F9FA] border-t flex items-center justify-between shrink-0">
         <span className="text-[12px] font-black text-[#800000] uppercase">{selectedVerseIndices.length} dipilih</span>
         <div className="flex items-center gap-3">
            <button onClick={() => sendBibleToOutput(true)} className="px-5 py-2.5 text-[12px] font-black text-[#AEAEB2] hover:bg-white border hover:border-[#E2E2E6]">Pratinjau</button>
            <button onClick={() => sendBibleToOutput(false)} className="bg-[#800000] text-white px-6 py-2.5 text-[12px] font-black transition-all shadow-md">Kirim ke Output</button>
         </div>
      </div>
    </div>
  );
};

export default BibleView;
