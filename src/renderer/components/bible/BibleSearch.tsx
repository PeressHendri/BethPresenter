import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '../ui/Input';
import { Scrollbar } from '../ui/Scrollbar';

interface SearchResult {
  bookNumber: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleSearchProps {
  translation: string;
  onJumpTo: (bookNumber: number, chapter: number, verse: number) => void;
}

export function BibleSearch({ translation, onJumpTo }: BibleSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim() || !translation) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        // First try to parse as reference
        const refPattern = /^([a-zA-Z0-9\s]+)\s+(\d+)(?::(\d+))?$/i;
        if (refPattern.test(query.trim())) {
           const parsed = await (window as any).electron.ipcRenderer.invoke('bible:jumpTo', query);
           if (!parsed.error) {
              // Wait, jumpTo returns {bookNumber, chapter, verse}. 
              // We could show a "Jump to Reference" smart result at the top.
              // Let's rely on standard search first, and inject the smart result if applicable.
           }
        }

        // Full text search
        const data = await (window as any).electron.ipcRenderer.invoke('bible:search', {
          query: query.trim(),
          translation,
          limit: 30
        });
        
        setResults(data);
      } catch (e) {
        console.error('Bible search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, translation]);

  // Group results by book
  const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.book]) acc[r.book] = [];
    acc[r.book].push(r);
    return acc;
  }, {});

  const handleResultClick = (res: SearchResult) => {
    onJumpTo(res.bookNumber, res.chapter, res.verse);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-500" />
        <Input 
          className="pl-10 h-10 w-[300px] bg-surface-sidebar border-border-strong rounded-xl text-sm"
          placeholder="Yoh 3:16 or seach keywords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border-2 border-accent-600 border-t-accent-400 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && (query.trim() !== '') && (
        <div className="absolute top-12 left-0 w-[450px] max-h-[400px] bg-surface-elevated border border-border-strong shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden">
           <Scrollbar className="flex-1 p-2">
              {results.length === 0 && !isSearching ? (
                 <div className="p-4 text-center text-xs text-text-500">
                    No results found for "{query}"
                 </div>
              ) : (
                 Object.entries(groupedResults).map(([bookName, verses]) => (
                    <div key={bookName} className="mb-3">
                       <h4 className="text-[10px] font-bold text-accent-400 uppercase tracking-wider mb-1 px-2">{bookName}</h4>
                       {verses.map((v) => (
                          <button 
                             key={`${v.bookNumber}-${v.chapter}-${v.verse}`}
                             onClick={() => handleResultClick(v)}
                             className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-surface-hover text-left transition-colors group"
                          >
                             <div className="shrink-0 font-bold text-xs text-text-300 w-12 text-right mt-0.5">
                               {v.chapter}:{v.verse}
                             </div>
                             <div className="flex-1 text-xs text-text-200 line-clamp-2">
                               {/* Highlight text matching could be implemented here */}
                               {v.text}
                             </div>
                             <MapPin size={12} className="shrink-0 text-text-600 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                          </button>
                       ))}
                    </div>
                 ))
              )}
           </Scrollbar>
        </div>
      )}
    </div>
  );
}
