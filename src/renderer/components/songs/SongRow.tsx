import { Music, Layout, MoreHorizontal } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ContextMenu } from '../ui/ContextMenu';
import { Song } from '@/shared/types';
import { usePresentationStore } from '../../stores/presentationStore';

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

  const handleAddToService = () => {
    addItem({ id: crypto.randomUUID(), type: 'song', songId: song.id, song });
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
        onClick={onToggleSelect}
        className={`group flex items-center gap-4 py-3 px-4 border-b border-border-default hover:bg-surface-hover cursor-pointer transition-colors ${
          selected ? 'bg-accent-500/10' : ''
        }`}
      >
        {/* Checkbox */}
        <div className="shrink-0 flex items-center justify-center pt-0.5">
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected ? 'bg-accent-500 border-accent-500' : 'border-border-strong group-hover:border-text-400'}`}>
            {selected && <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        </div>

        {/* Title & Icon */}
        <div className="w-[30%] min-w-0 flex items-center gap-3">
          <Music size={14} className={selected ? 'text-accent-400' : 'text-text-500'} />
          <span className={`font-semibold truncate ${selected ? 'text-accent-100' : 'text-text-100'}`}>
            {song.title}
          </span>
        </div>

        {/* Author */}
        <div className="w-[20%] min-w-0">
          <span className="text-sm text-text-400 truncate block">{song.author || '-'}</span>
        </div>

        {/* Tags */}
        <div className="w-[25%] min-w-0 flex items-center gap-1.5 flex-wrap h-[24px] overflow-hidden">
          {tags.slice(0, 3).map((tag: string) => (
             <Badge key={tag} variant="neutral" className="text-[10px] py-0 px-1.5 bg-black/40 border-transparent">{tag}</Badge>
          ))}
          {tags.length > 3 && <Badge variant="neutral" className="text-[10px] py-0 px-1.5 bg-black/40 border-transparent">+{tags.length - 3}</Badge>}
        </div>

        {/* Slides metadata */}
        <div className="w-[15%] min-w-0 flex flex-col justify-center">
           <span className="text-xs text-text-400 flex items-center gap-1.5">
             <Layout size={12} className="opacity-60" /> {slides.length} slides
           </span>
           {song.ccli && <span className="text-[10px] text-text-600 mt-0.5">CCLI {song.ccli}</span>}
        </div>

        {/* Quick Actions (only visible on hover) */}
        <div className="flex-1 flex justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleAddToService(); }}
            className="text-xs font-semibold px-2.5 py-1 bg-surface-elevated border border-border-default rounded hover:bg-black hover:text-white transition-colors"
          >
            Add
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
