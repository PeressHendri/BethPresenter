import { Music, Layout, MoreVertical, Play } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ContextMenu } from '../ui/ContextMenu';
import { Song } from '@/shared/types';
import { usePresentationStore } from '../../stores/presentationStore';

interface SongCardProps {
  song: Song;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  selected: boolean;
  onToggleSelect: () => void;
}

export function SongCard({ song, onEdit, onDuplicate, onDelete, selected, onToggleSelect }: SongCardProps) {
  const slides = JSON.parse(song.lyricsJson || '[]');
  const tags = JSON.parse(song.tags || '[]');
  const { addItem } = usePresentationStore();

  const handleAddToService = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ id: crypto.randomUUID(), type: 'song', songId: song.id, song });
  };

  const contextMenuItems = [
    { id: 'edit', label: 'Edit Song', action: onEdit },
    { id: 'dup', label: 'Duplicate', action: onDuplicate },
    { id: 'add', label: 'Add to Service', action: () => addItem({ id: crypto.randomUUID(), type: 'song', songId: song.id, song }) },
    { id: 'div', type: 'divider' },
    { id: 'del', label: 'Delete', action: onDelete, variant: 'danger' },
  ];

  return (
    <ContextMenu items={contextMenuItems}>
      <Card 
        onClick={onToggleSelect}
        className={`group relative overflow-hidden transition-all duration-200 cursor-pointer ${
          selected 
            ? 'ring-2 ring-accent-500 bg-accent-500/5' 
            : 'hover:border-accent-500/50 hover:bg-surface-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20'
        }`}
      >
        {/* Selection Checkbox */}
        <div className={`absolute top-3 left-3 z-20 transition-opacity ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className={`w-5 h-5 rounded border flex items-center justify-center ${selected ? 'bg-accent-500 border-accent-500' : 'border-border-strong bg-black/40 backdrop-blur'}`}>
            {selected && <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pt-8">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-base font-bold text-text-100 truncate flex items-center gap-2">
                <Music size={14} className="text-accent-400 shrink-0" />
                <span className="truncate">{song.title}</span>
              </h3>
              <p className="text-xs text-text-400 truncate mt-1.5 font-medium">
                {song.author || 'Unknown Artist'}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Tags */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Badge variant="neutral" className="text-[10px] py-0 px-1.5 flex items-center gap-1 bg-surface-elevated">
              <Layout size={10} /> {slides.length} Slides
            </Badge>
            {tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="neutral" className="text-[10px] py-0 px-1.5">{tag}</Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="neutral" className="text-[10px] py-0 px-1.5">+{tags.length - 2}</Badge>
            )}
          </div>

          {/* Preview Overlay (Hover) */}
          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-surface-sidebar to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
            <div className="flex gap-2 w-full mt-auto translate-y-4 group-hover:translate-y-0 transition-transform">
               <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="flex-1 py-1.5 px-3 bg-white/10 hover:bg-white/20 rounded font-semibold text-xs text-center backdrop-blur transition-colors">
                 Edit
               </button>
               <button onClick={handleAddToService} className="flex-1 py-1.5 px-3 bg-accent-600 hover:bg-accent-500 rounded font-semibold text-xs text-center shadow-lg transition-colors flex items-center justify-center gap-1.5">
                 <Play size={12} fill="currentColor" /> Service
               </button>
            </div>
          </div>
          
          {/* Default Preview Text (Non hover) */}
          <div className="mt-1 h-[42px] group-hover:opacity-0 transition-opacity">
            <p className="text-[11px] text-text-500 line-clamp-2 leading-relaxed italic border-l-2 border-border-default pl-2">
              {slides[0]?.text || 'No lyrics available'}
            </p>
          </div>
        </div>

        {/* Options dot */}
        <div className="absolute top-3 right-2 text-text-500 opacity-0 group-hover:opacity-100 hover:text-text-100 transition-all p-1 cursor-pointer">
          <MoreVertical size={16} />
        </div>
      </Card>
    </ContextMenu>
  );
}
