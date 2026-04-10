import React from 'react';
import { Music } from 'lucide-react';

export interface Song {
  id: string;
  title: string;
  author: string;
  slides: number;
  addedAt: string;
}

export function SongItem({ 
  song, 
  isSelected, 
  onSelect 
}: { 
  song: Song, 
  isSelected: boolean, 
  onSelect: () => void 
}) {
  return (
    <div 
      onClick={onSelect}
      className={`
        group flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border border-transparent
        ${isSelected 
          ? 'bg-[#0084FF] text-white shadow-lg border-blue-400/30' 
          : 'bg-[var(--surface-elevated)] bg-opacity-30 text-[var(--text-100)] hover:bg-white/5 hover:border-[var(--border-default)]'}
      `}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={`
          w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-colors
          ${isSelected ? 'bg-black/20 text-white' : 'bg-black/40 text-[var(--accent-green)]'}
        `}>
          <Music size={18} />
        </div>
        
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold truncate leading-tight tracking-tight">{song.title}</h3>
            <span className={`text-[10px] font-black opacity-60`}>({song.slides})</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
             <span className={`text-[10px] uppercase font-black tracking-widest ${isSelected ? 'text-white/70' : 'text-[var(--text-400)]'}`}>
               {song.author}
             </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
         <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-white/60' : 'text-[var(--text-600)]'}`}>
           {song.addedAt}
         </span>
         {isSelected && (
           <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
         )}
      </div>
    </div>
  );
}

export function SongList({ 
  songs, 
  selectedId, 
  onSelect 
}: { 
  songs: Song[], 
  selectedId: string | null,
  onSelect: (id: string) => void 
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scroll-smooth no-scrollbar">
      {songs.map((song) => (
        <SongItem
          key={song.id}
          song={song}
          isSelected={song.id === selectedId}
          onSelect={() => onSelect(song.id)}
        />
      ))}
      <div className="h-20" /> {/* Spacer */}
    </div>
  );
}
