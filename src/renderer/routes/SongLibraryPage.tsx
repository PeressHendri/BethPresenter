import React, { useState } from 'react';
import { Clock } from 'lucide-react';

export function SongLibraryPage({ 
  onSelectSong, 
  activeSongId, 
  onGoLive 
}: { 
  onSelectSong: (id: string) => void,
  activeSongId: string | null,
  onGoLive: (songId: string) => void
}) {
  return (
    <div className="flex-1 flex flex-col bg-[var(--surface-base)] overflow-hidden">
      {/* Search & Filters */}
      <SongSearchBar />
      <SongFilters />

      {/* Main List Area */}
      <SongList 
        songs={MOCK_SONG_LIBRARY} 
        selectedId={activeSongId}
        onSelect={onSelectSong}
      />

      {/* Unique Library Footer */}
      <LibraryFooter />
    </div>
  );
}

import { SongSearchBar } from '../components/SongSearchBar';
import { SongFilters } from '../components/SongFilters';
import { SongList } from '../components/SongList';
import { MOCK_SONG_LIBRARY } from '../data/song-library';

function LibraryFooter() {
  return (
    <div className="h-12 px-6 bg-[var(--surface-primary)] border-t border-[var(--border-default)] flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 text-[var(--accent-green)]">
        <Clock size={12} />
        <span className="text-xs font-black tracking-tight">09:28 PM</span>
      </div>
      
      <div className="flex items-center gap-6">
        <Shortcut label="Navigate" keys="↑↓" />
        <Shortcut label="Edit" keys="E" />
        <Shortcut label="Delete" keys="DEL" color="text-red-500" />
      </div>
    </div>
  );
}

function Shortcut({ label, keys, color }: { label: string, keys: string, color?: string }) {
  return (
    <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-default">
       <kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase">{keys}</kbd>
       <span className={`text-[9px] font-black uppercase tracking-widest ${color || 'text-[var(--text-600)]'}`}>{label}</span>
    </div>
  );
}
