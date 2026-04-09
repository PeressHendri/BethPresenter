import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/Input';
import { Scrollbar } from '../ui/Scrollbar';

export interface BibleBook {
  bookNumber: number;
  book: string;
  name: string;
  abbr: string;
  totalChapter: number;
}

interface BookListProps {
  books: BibleBook[];
  activeBookNumber: number;
  onSelect: (b: BibleBook) => void;
}

export function BookList({ books, activeBookNumber, onSelect }: BookListProps) {
  const [search, setSearch] = useState('');

  const filteredBooks = books.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.abbr.toLowerCase().includes(search.toLowerCase())
  );

  const oldTestament = filteredBooks.filter(b => b.bookNumber <= 39);
  const newTestament = filteredBooks.filter(b => b.bookNumber > 39);

  return (
    <div className="w-[180px] shrink-0 border-r border-border-default bg-surface-sidebar flex flex-col h-full overflow-hidden">
      {/* Header & Search */}
      <div className="px-3 py-2 border-b border-border-default bg-surface-elevated flex flex-col gap-2 shrink-0">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-400">Books</h3>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-500" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search..." 
            className="h-7 w-full pl-7 text-[11px] bg-surface-base border-border-strong rounded-md placeholder:text-text-600" 
          />
        </div>
      </div>

      <Scrollbar className="flex-1 px-2 py-2">
        {oldTestament.length > 0 && (
          <div className="mb-4">
            <h4 className="text-[9px] font-bold text-text-500 uppercase tracking-wider mb-1 px-2">Old Testament</h4>
            <div className="flex flex-col gap-0.5">
              {oldTestament.map(b => (
                <button
                  key={b.bookNumber}
                  onClick={() => onSelect(b)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-colors ${
                    activeBookNumber === b.bookNumber 
                      ? 'bg-accent-600 text-white font-bold shadow-sm'
                      : 'text-text-300 hover:bg-surface-hover hover:text-text-100'
                  }`}
                >
                  <span className="text-xs truncate">{b.name}</span>
                  <span className={`text-[9px] ${activeBookNumber === b.bookNumber ? 'text-accent-200' : 'text-text-600 font-medium'}`}>{b.abbr}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {newTestament.length > 0 && (
          <div className="mb-2">
            <h4 className="text-[9px] font-bold text-text-500 uppercase tracking-wider mb-1 px-2">New Testament</h4>
            <div className="flex flex-col gap-0.5">
              {newTestament.map(b => (
                <button
                  key={b.bookNumber}
                  onClick={() => onSelect(b)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-colors ${
                    activeBookNumber === b.bookNumber 
                      ? 'bg-accent-600 text-white font-bold shadow-sm'
                      : 'text-text-300 hover:bg-surface-hover hover:text-text-100'
                  }`}
                >
                  <span className="text-xs truncate">{b.name}</span>
                  <span className={`text-[9px] ${activeBookNumber === b.bookNumber ? 'text-accent-200' : 'text-text-600 font-medium'}`}>{b.abbr}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredBooks.length === 0 && (
          <div className="text-center py-6 text-xs text-text-500">
            No matches found.
          </div>
        )}
      </Scrollbar>
    </div>
  );
}
