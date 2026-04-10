import React from 'react';
import { Music, MoreVertical, Layout } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Song } from '@/shared/types';
import { usePresentationStore } from '../../stores/presentationStore';
import { useSongStore } from '../../stores/songStore';
import { motion } from 'framer-motion';

interface SongCardProps {
  song: Song;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function SongCard({ song, selected, onToggleSelect, onEdit, onDelete, onDuplicate }: SongCardProps) {
  const slides = JSON.parse(song.lyricsJson || '[]');
  const { addItem } = usePresentationStore();
  const { previewSong, setPreviewSong } = useSongStore();

  const isPreviewing = previewSong?.id === song.id;

  const handleAddToService = () => {
    addItem({ 
       id: crypto.randomUUID(), 
       type: 'song', 
       songId: song.id, 
       song,
       title: song.title,
       slides: slides.length
    });
  };

  return (
    <motion.div 
      layout
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => {
        onToggleSelect();
        setPreviewSong(song);
      }}
      onDoubleClick={handleAddToService}
      className={`group relative h-44 rounded-2xl p-5 cursor-pointer transition-all duration-300 border-2 bg-black/40 ${
        isPreviewing 
          ? 'border-[var(--accent-teal)] shadow-[0_15px_30px_rgba(0,210,210,0.15)] ring-4 ring-[var(--accent-teal)]/10' 
          : 'border-white/5 hover:border-white/20'
      } ${selected ? 'bg-[var(--accent-blue)]/5' : ''}`}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <div className={`p-2 rounded-xl border transition-colors ${isPreviewing ? 'bg-[var(--accent-teal)] text-black border-transparent' : 'bg-black/60 border-white/5 text-[var(--accent-teal)]'}`}>
            <Music size={18} />
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 hover:bg-white/10 rounded-lg text-text-400 hover:text-white"
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </div>

        <h3 className={`text-sm font-black truncate mb-1 uppercase tracking-tight ${isPreviewing ? 'text-white' : 'text-text-100'}`}>
          {song.title}
        </h3>
        <p className="text-[10px] font-bold text-text-400 truncate uppercase tracking-widest mb-4">
          {song.author || 'Unknown Artist'}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Badge variant="neutral" className="text-[9px] py-0 px-2 bg-black/60 border-white/5 font-black uppercase tracking-widest leading-4">
              {slides.length} SLIDES
            </Badge>
          </div>
          {isPreviewing && (
             <div className="px-2 py-0.5 bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] text-[8px] font-black uppercase tracking-widest rounded border border-[var(--accent-teal)]/20 animate-pulse">
               Previewing
             </div>
          )}
        </div>
      </div>
      
      {/* Background Glow */}
      {isPreviewing && (
        <div className="absolute inset-0 bg-radial-gradient from-[var(--accent-teal)]/5 to-transparent pointer-events-none rounded-2xl" />
      )}
    </motion.div>
  );
}
