import { Music, Layout, MoreHorizontal, Plus } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ContextMenu } from '../ui/ContextMenu';
import { Song } from '@/shared/types';
import { usePresentationStore } from '../../stores/presentationStore';
import { useSongStore } from '../../stores/songStore';

interface SongRowProps {
  song: Song;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  selected: boolean;
  onToggleSelect: () => void;
}

export function SongRow({ song, onEdit, onDuplicate, onDelete, selected, onToggleSelect }: SongRowProps) {
  const slides = JSON.parse(song.lyricsJson || '[]');
  const tags = JSON.parse(song.tags || '[]');
  const { addItem } = usePresentationStore();
  const { setPreviewSong, previewSong } = useSongStore();

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

  const contextMenuItems = [
    { id: 'edit', label: 'Edit Song', action: onEdit },
    { id: 'dup', label: 'Duplicate', action: onDuplicate },
    { id: 'add', label: 'Add to Service', action: handleAddToService },
    { id: 'div', type: 'divider' },
    { id: 'del', label: 'Delete', action: onDelete, variant: 'danger' },
  ];

  return (
    <ContextMenu items={contextMenuItems}>
      <div 
        onClick={() => {
           onToggleSelect();
           setPreviewSong(song);
        }}
        onDoubleClick={handleAddToService}
        className={`group flex items-center gap-4 py-3 px-4 border-b border-border-default hover:bg-[var(--surface-hover)] cursor-pointer transition-all duration-200 ${
          isPreviewing ? 'bg-[var(--accent-blue)]/10 ring-1 ring-inset ring-[var(--accent-blue)]/20' : ''
        } ${selected ? 'bg-accent-500/5' : ''}`}
      >
        {/* Checkbox */}
        <div className="shrink-0 flex items-center justify-center pt-0.5" onClick={(e) => e.stopPropagation()}>
          <div 
            onClick={() => onToggleSelect()}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected ? 'bg-accent-500 border-accent-500' : 'border-border-strong group-hover:border-text-400'}`}
          >
            {selected && <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        </div>

        {/* Title & Icon */}
        <div className="w-[30%] min-w-0 flex items-center gap-3">
          <Music size={14} className={isPreviewing ? 'text-[var(--accent-teal)]' : 'text-text-500'} />
          <span className={`font-black truncate tracking-tight text-[11px] uppercase ${isPreviewing ? 'text-white' : 'text-text-100'}`}>
            {song.title}
          </span>
        </div>

        {/* Author */}
        <div className="w-[20%] min-w-0">
          <span className="text-[10px] font-bold text-text-400 truncate block uppercase tracking-wider">{song.author || '-'}</span>
        </div>

        {/* Tags */}
        <div className="w-[25%] min-w-0 flex items-center gap-1.5 flex-wrap h-[20px] overflow-hidden">
          {tags.slice(0, 3).map((tag: string) => (
             <Badge key={tag} variant="neutral" className="text-[9px] py-0 px-2 bg-black/40 border-white/5 font-black uppercase tracking-widest">{tag}</Badge>
          ))}
        </div>

        {/* Info */}
        <div className="w-[15%] min-w-0 flex flex-col justify-center">
           <span className="text-[9px] font-black text-text-500 flex items-center gap-1.5 uppercase tracking-widest">
             <Layout size={10} className="text-[var(--accent-blue)]" /> {slides.length} slides
           </span>
        </div>

        {/* Quick Actions */}
        <div className="flex-1 flex justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleAddToService(); }}
            className="flex items-center gap-1.5 text-[9px] font-black px-3 py-1 bg-[var(--accent-teal)] text-black rounded hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
          >
            <Plus size={10} strokeWidth={4} /> Add
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-text-400 hover:text-text-100 p-1 rounded"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </ContextMenu>
  );
}
