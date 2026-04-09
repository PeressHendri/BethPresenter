import React, { useState, useEffect } from 'react';
import { Search, Music, BookOpen, Image, Plus, Baseline, Clock } from 'lucide-react';
import { Input } from '../ui/Input';
import { useDraggable } from '@dnd-kit/core';

interface QuickLibraryProps {
  onQuickAdd: (type: 'blank' | 'custom' | 'timer') => void;
}

export function QuickLibrary({ onQuickAdd }: QuickLibraryProps) {
  const [tab, setTab] = useState<'songs' | 'bible' | 'media'>('songs');
  const [term, setTerm] = useState('');
  
  // Fake search payload representing DB IPC
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    // Simulated IPC fetch
    const fetchMocks = () => {
       if (tab === 'songs') {
          setResults([
            { id: 'S1', type: 'song', title: 'Lingkupiku', artist: 'Symphony Music', slideCount: 5 },
            { id: 'S2', type: 'song', title: 'S\'perti Rusa Rindu SungaiMu', artist: 'Asaph', slideCount: 3 },
            { id: 'S3', type: 'song', title: 'Yesus Kekuatan', artist: 'JPCC', slideCount: 6 },
          ]);
       } else if (tab === 'bible') {
          setResults([
            { id: 'B1', type: 'bible', title: 'Yohanes 3:16', preview: 'Karena begitu besar kasih Allah akan dunia ini...', slideCount: 1 },
            { id: 'B2', type: 'bible', title: 'Mazmur 23:1', preview: 'Tuhan adalah gembalaku, takkan kekurangan aku.', slideCount: 1 },
          ]);
       } else {
          setResults([
            { id: 'M1', type: 'media', title: 'Loop_Aurora_4K.mp4', slideCount: 1 },
            { id: 'M2', type: 'media', title: 'Welcoming_BG.jpg', slideCount: 1 },
          ]);
       }
    };
    fetchMocks();
  }, [tab]);

  const filtered = results.filter(r => r.title.toLowerCase().includes(term.toLowerCase()));

  return (
    <div className="w-[300px] h-full bg-surface-sidebar border-r border-border-default flex flex-col shrink-0">
       <div className="p-4 shrink-0 space-y-3">
          <h2 className="text-lg font-bold text-text-100 uppercase tracking-widest text-sm">Library Laci</h2>
          <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400" />
             <Input 
                placeholder={`Cari di ${tab}...`}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="pl-9 h-9 text-sm w-full"
             />
          </div>
          <div className="flex bg-surface-elevated rounded border border-border-strong overflow-hidden shrink-0">
             <TabBtn active={tab === 'songs'} onClick={() => setTab('songs')} icon={<Music size={14}/>} label="Lagu" />
             <TabBtn active={tab === 'bible'} onClick={() => setTab('bible')} icon={<BookOpen size={14}/>} label="Alkitab" />
             <TabBtn active={tab === 'media'} onClick={() => setTab('media')} icon={<Image size={14}/>} label="Media" />
          </div>
       </div>

       <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
          {filtered.map(item => (
             <DraggableLibItem key={item.id} item={item} />
          ))}
          {filtered.length === 0 && (
             <div className="h-24 flex items-center justify-center text-text-500 text-xs font-semibold">
               Tidak ada kecocokan ditemukan.
             </div>
          )}
       </div>

       {/* Quick Add Buttons Block */}
       <div className="p-4 border-t border-border-default shrink-0 bg-surface-elevated flex flex-wrap gap-2">
          <button onClick={() => onQuickAdd('custom')} className="flex items-center gap-1.5 px-2 py-1.5 bg-surface-hover border border-border-strong rounded text-[11px] font-bold text-text-200 hover:text-accent-400 flex-1 justify-center transition-colors">
            <Baseline size={12} /> Custom
          </button>
          <button onClick={() => onQuickAdd('timer')} className="flex items-center gap-1.5 px-2 py-1.5 bg-surface-hover border border-border-strong rounded text-[11px] font-bold text-text-200 hover:text-blue-400 flex-1 justify-center transition-colors">
            <Clock size={12} /> Timer
          </button>
          <button onClick={() => onQuickAdd('blank')} className="flex items-center gap-1.5 px-2 py-1.5 bg-surface-hover border border-border-strong rounded text-[11px] font-bold text-text-200 hover:text-red-400 w-full justify-center transition-colors">
            <Plus size={12} /> Tambah Layar Kosong (Blank)
          </button>
       </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[10px] font-bold transition-colors ${active ? 'bg-accent-600/20 text-accent-400' : 'text-text-400 hover:bg-surface-hover hover:text-text-200'}`}
    >
       {icon} {label}
    </button>
  );
}

function DraggableLibItem({ item }: { item: any }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `lib-${item.id}`,
    data: { 
      type: 'library-item',
      payload: item 
    }
  });

  return (
    <div 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-2.5 rounded-lg border flex flex-col bg-surface-base cursor-grab active:cursor-grabbing transition-opacity ${
         isDragging ? 'opacity-50 border-accent-500 shadow-xl' : 'border-border-default hover:border-border-strong'
      }`}
    >
       <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
             <h4 className="text-xs font-bold text-text-100 truncate">{item.title}</h4>
             {item.artist && <p className="text-[10px] text-text-400 truncate mt-0.5">{item.artist}</p>}
             {item.preview && <p className="text-[10px] text-text-400 truncate mt-0.5">{item.preview}</p>}
          </div>
          <span className="shrink-0 px-1.5 py-0.5 rounded bg-surface-hover text-[9px] font-bold text-text-500 block">
             {item.type === 'song' && '🎵 Lagu'}
             {item.type === 'bible' && '📖 Firman'}
             {item.type === 'media' && '🎬 Media'}
          </span>
       </div>
    </div>
  );
}
