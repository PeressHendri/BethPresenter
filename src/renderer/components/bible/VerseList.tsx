import React, { useState, useEffect } from 'react';
import { Send, ListPlus, Search } from 'lucide-react';
import { Scrollbar } from '../ui/Scrollbar';
import { Button } from '../ui/Button';

export interface BibleVerse {
  bookNumber: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

interface VerseListProps {
  verses: BibleVerse[];
  selectedVerses: BibleVerse[];
  onSelectChange: (selected: BibleVerse[]) => void;
  onSendToLive: () => void;
  onAddToQueue: () => void;
}

export function VerseList({ verses, selectedVerses, onSelectChange, onSendToLive, onAddToQueue }: VerseListProps) {
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // Clear selection if verses change (e.g., changing chapter)
  useEffect(() => {
    // We might want to keep selection if user is just browsing, but usually selection is cleared
    // Actually, only clear if the selected verses are NOT in the current chapter might be better.
    // For simplicity, we trust the parent component to handle `selectedVerses` persistence.
  }, [verses]);

  const toggleVerse = (index: number, shiftKey: boolean) => {
    const verse = verses[index];
    const isSelected = selectedVerses.some(v => v.bookNumber === verse.bookNumber && v.chapter === verse.chapter && v.verse === verse.verse);
    
    let newSelection = [...selectedVerses];

    if (shiftKey && lastSelectedIndex !== null && lastSelectedIndex !== index) {
      // Range selection
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const range = verses.slice(start, end + 1);
      
      // Add missing from range
      for (const v of range) {
        if (!newSelection.some(sel => sel.bookNumber === v.bookNumber && sel.chapter === v.chapter && sel.verse === v.verse)) {
          newSelection.push(v);
        }
      }
    } else {
      if (isSelected) {
        newSelection = newSelection.filter(v => !(v.bookNumber === verse.bookNumber && v.chapter === verse.chapter && v.verse === verse.verse));
      } else {
        newSelection.push(verse);
      }
    }

    // Sort selection by chronological order (book -> chapter -> verse)
    newSelection.sort((a, b) => {
      if (a.bookNumber !== b.bookNumber) return a.bookNumber - b.bookNumber;
      if (a.chapter !== b.chapter) return a.chapter - b.chapter;
      return a.verse - b.verse;
    });

    onSelectChange(newSelection);
    setLastSelectedIndex(index);
  };

  const isVerseSelected = (verse: BibleVerse) => {
    return selectedVerses.some(v => v.bookNumber === verse.bookNumber && v.chapter === verse.chapter && v.verse === verse.verse);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-base">
      <div className="px-4 py-2 border-b border-border-default bg-surface-elevated flex justify-between items-center shrink-0 min-h-[44px]">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-400">Verses</h3>
        
        {selectedVerses.length > 0 && (
          <div className="flex items-center gap-2 animate-fade-in">
            <span className="text-xs font-bold text-accent-400 mr-2">{selectedVerses.length} selected</span>
            <Button variant="ghost" size="sm" onClick={() => onSelectChange([])} className="h-7 text-xs">Clear</Button>
            <Button variant="secondary" size="sm" onClick={onAddToQueue} className="h-7 text-xs flex items-center gap-1.5 border-border-strong">
              <ListPlus size={14} /> Queue
            </Button>
            <Button variant="primary" size="sm" onClick={onSendToLive} className="h-7 text-xs flex items-center gap-1.5">
              <Send size={14} /> Send Live
            </Button>
          </div>
        )}
      </div>

      <Scrollbar className="flex-1 p-4">
        {verses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-500 opacity-60 pb-20">
             <Search size={32} className="mb-3" />
             <p className="text-xs">No verses to display</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 pb-20 max-w-4xl">
            {verses.map((v, i) => {
              const selected = isVerseSelected(v);
              return (
                <div 
                  key={`${v.bookNumber}-${v.chapter}-${v.verse}`}
                  onClick={(e) => toggleVerse(i, e.shiftKey)}
                  className={`group flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-colors border ${
                    selected 
                      ? 'bg-accent-600/10 border-accent-500 shadow-[0_0_10px_rgba(var(--color-accent-500),0.1)]' 
                      : 'border-transparent hover:bg-surface-hover hover:border-border-default'
                  }`}
                >
                  <div className="shrink-0 pt-0.5">
                    <input 
                      type="checkbox" 
                      readOnly
                      checked={selected}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 flex text-sm leading-relaxed">
                    <span className={`shrink-0 mr-2 text-[10px] font-bold mt-0.5 ${selected ? 'text-accent-400' : 'text-text-400'}`}>
                       {v.chapter}:{v.verse}
                    </span>
                    <p className={`${selected ? 'text-text-100 font-medium' : 'text-text-300'}`}>
                      {v.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Scrollbar>
    </div>
  );
}
