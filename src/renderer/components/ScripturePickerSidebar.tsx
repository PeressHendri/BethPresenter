import React from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';

export function ScriptureSidebar({ 
  books, 
  activeBook, 
  onSelectBook, 
  chapterCount, 
  activeChapter, 
  onSelectChapter 
}: { 
  books: string[], 
  activeBook: string, 
  onSelectBook: (b: string) => void,
  chapterCount: number,
  activeChapter: number,
  onSelectChapter: (c: number) => void
}) {
  return (
    <div className="w-64 bg-[#1A1A1A] border-r border-[#333] flex flex-col shrink-0">
      {/* Translation Header */}
      <div className="p-4 border-b border-[#333]">
        <span className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-2 block">Translation</span>
        <div className="bg-[#212121] border border-[#333] rounded px-3 py-2 flex items-center justify-between cursor-pointer hover:border-[#00E676] transition-all group">
           <span className="text-xs font-bold text-white">King James (KJV)</span>
           <ChevronDown size={14} className="text-[#666] group-hover:text-[#00E676]" />
        </div>
      </div>

      {/* Book List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex">
        <div className="w-full py-4">
           {books.map(book => (
             <div 
               key={book}
               onClick={() => onSelectBook(book)}
               className={`
                px-6 py-2.5 cursor-pointer relative transition-all group
                ${activeBook === book ? 'text-white font-black' : 'text-[#888] hover:text-white'}
               `}
             >
               {activeBook === book && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#00E676] rounded-r shadow-[0_0_10px_#00E676]" />}
               <span className="text-xs">{book}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Chapter Grid (Shown below or alongside) */}
      <div className="p-4 border-t border-[#333] bg-[#1a1a1a]">
         <span className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-3 block">Chapters</span>
         <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                onClick={() => onSelectChapter(i + 1)}
                className={`
                  aspect-square flex items-center justify-center rounded text-[10px] font-black cursor-pointer transition-all border
                  ${activeChapter === i + 1 
                    ? 'bg-[#00E676] text-black border-[#00E676]' 
                    : 'bg-[#212121] text-[#888] border-[#333] hover:border-[#00E676] hover:text-white'}
                `}
              >
                {i + 1}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
