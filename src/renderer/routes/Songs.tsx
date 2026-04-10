import { useEffect, useState, useMemo, useRef } from 'react';
import { 
  Plus, Search, Music, Trash2, 
  LayoutGrid, List as ListIcon, SortAsc, 
  UploadCloud, Settings2, Download, Layout
} from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Scrollbar } from '../components/ui/Scrollbar';
import { SongEditor } from '../components/SongEditor';
import { useSongStore } from '../stores/songStore';
import { usePresentationStore } from '../stores/presentationStore';
import { Song } from '@/shared/types';
import { SongCard } from '../components/songs/SongCard';
import { SongRow } from '../components/songs/SongRow';
import { SongImportModal } from '../components/songs/SongImportModal';
import { motion, AnimatePresence } from 'framer-motion';

type TagStat = { tag: string; count: number };
type SortOption = 'title-asc' | 'title-desc' | 'artist-asc' | 'recent';

export function Songs() {
  const { songs, fetchSongs, deleteSong, duplicateSong, bulkDeleteSongs, loading, previewSong } = useSongStore();
  const { addItem } = usePresentationStore();
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tags, setTags] = useState<TagStat[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('title-asc');
  
  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Focus search on mount
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Init fetch
  useEffect(() => {
    fetchSongs();
    void refreshTags();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle server search on debounce
  useEffect(() => {
    fetchSongs(debouncedSearch, activeTag || undefined);
  }, [debouncedSearch, activeTag]);

  const refreshTags = async () => {
    try {
      const stats = (await (window as any).electron.ipcRenderer.invoke('tag:getAll')) as TagStat[];
      setTags(Array.isArray(stats) ? stats : []);
    } catch (e) {
      console.error('Failed to fetch tags:', e);
    }
  };

  const clearFilters = () => {
    setActiveTag(null);
    setSearch('');
  };

  const openEditor = (song: Song | null = null) => {
    setEditingSong(song);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteSong(id);
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateSong(id);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.size} songs?`)) {
      await bulkDeleteSongs(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Local Sort application
  const filteredAndSortedSongs = useMemo(() => {
    return [...songs].sort((a, b) => {
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
      if (sortBy === 'artist-asc') return (a.author || '').localeCompare(b.author || '');
      if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [songs, sortBy]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <MainLayout>
      <div className="flex flex-row h-full bg-[var(--surface-primary)] -m-5 overflow-hidden">
        
        {/* === LEFT CONTENT (Library) === */}
        <div className="flex-1 flex flex-col border-r border-[var(--border-default)] min-w-0">
          
          {/* Top Toolbar */}
          <div className="bg-[var(--surface-base)] border-b border-[var(--border-subtle)] p-6 pb-4 flex flex-col gap-5 shrink-0">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-black text-white flex items-center gap-4 tracking-tighter uppercase">
                <div className="w-12 h-12 bg-[var(--accent-blue)] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--accent-blue)]/20">
                  <Music size={24} strokeWidth={3} />
                </div>
                Song Library
              </h1>
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="md" onClick={() => setIsImportOpen(true)} className="flex items-center gap-2">
                  <UploadCloud size={18} /> Import
                </Button>
                <Button variant="accent" size="md" onClick={() => openEditor()} className="flex items-center gap-2 px-6">
                  <Plus size={18} strokeWidth={3} /> Create Song
                </Button>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[300px] max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-400" />
                <input 
                  ref={searchInputRef}
                  placeholder="Search by title, author, or lyrics..." 
                  className="pl-12 h-11 w-full bg-black/40 border border-white/5 rounded-xl outline-none focus:border-[var(--accent-teal)] transition-all font-medium text-sm text-white focus:ring-2 focus:ring-[var(--accent-teal)]/10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[var(--surface-elevated)] text-white shadow-lg' : 'text-text-500 hover:text-text-200'}`}>
                  <LayoutGrid size={18} />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[var(--surface-elevated)] text-white shadow-lg' : 'text-text-500 hover:text-text-200'}`}>
                  <ListIcon size={18} />
                </button>
              </div>

              {(search || activeTag) && (
                <Button variant="ghost" onClick={clearFilters} className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)]">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 50, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[var(--accent-blue)] text-white flex items-center px-6 shrink-0 overflow-hidden font-black text-[10px] uppercase tracking-widest"
              >
                 <span>{selectedIds.size} Songs Selected</span>
                 <div className="ml-auto flex items-center gap-3">
                   <button onClick={() => setSelectedIds(new Set())} className="hover:bg-white/10 px-3 py-1 rounded">Cancel</button>
                   <button onClick={handleBulkDelete} className="bg-red-500 px-4 py-1.5 rounded-lg shadow-lg">Delete Selected</button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List/Grid Area */}
          <Scrollbar className="flex-1 p-6 border-transparent">
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse" />
                  ))}
               </div>
            ) : filteredAndSortedSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-text-500">
                 <Music size={64} className="opacity-10 mb-6" />
                 <p className="font-black text-white uppercase tracking-widest text-sm">No songs found</p>
                 <Button variant="secondary" onClick={clearFilters} className="mt-6">Reset Search</Button>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20" : "flex flex-col gap-1 pb-20"}
              >
                {filteredAndSortedSongs.map(song => (
                  <motion.div key={song.id} variants={itemVariants}>
                    {viewMode === 'grid' ? (
                      <SongCard 
                        song={song}
                        selected={selectedIds.has(song.id)}
                        onToggleSelect={() => toggleSelect(song.id)}
                        onEdit={() => openEditor(song)}
                        onDelete={() => handleDelete(song.id, song.title)}
                        onDuplicate={() => handleDuplicate(song.id)}
                      />
                    ) : (
                      <SongRow 
                        song={song}
                        selected={selectedIds.has(song.id)}
                        onToggleSelect={() => toggleSelect(song.id)}
                        onEdit={() => openEditor(song)}
                        onDelete={() => handleDelete(song.id, song.title)}
                        onDuplicate={() => handleDuplicate(song.id)}
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </Scrollbar>
        </div>

        {/* === RIGHT PANEL (Preview) === */}
        <div className="w-[400px] bg-[var(--surface-base)] flex flex-col shrink-0 border-l border-[var(--border-default)]">
           <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--surface-primary)]">
             <h2 className="text-[10px] font-black text-[var(--accent-teal)] uppercase tracking-[0.2em] mb-1">Preview Monitor</h2>
             <p className="text-white font-black uppercase text-sm tracking-tight truncate">
               {previewSong?.title || 'No Selection'}
             </p>
           </div>
           
           <Scrollbar className="flex-1 p-6 border-transparent bg-black/20">
             {!previewSong ? (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                 <Layout size={48} className="mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Select a song to<br/>preview slides</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {JSON.parse(previewSong.lyricsJson || '[]').map((slide: any, i: number) => (
                   <div key={i} className="bg-[var(--surface-elevated)] border border-white/5 rounded-xl p-4 shadow-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-[var(--accent-teal)] uppercase bg-[var(--accent-teal)]/10 px-2 py-0.5 rounded">
                          {slide.label || `Slide ${i+1}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/90 font-bold uppercase leading-relaxed whitespace-pre-wrap">
                        {slide.text}
                      </p>
                   </div>
                 ))}
               </div>
             )}
           </Scrollbar>

           {previewSong && (
             <div className="p-6 bg-[var(--surface-primary)] border-t border-[var(--border-subtle)] flex flex-col gap-3">
                <Button variant="accent" onClick={() => {
                   addItem({ 
                      id: crypto.randomUUID(), 
                      type: 'song', 
                      songId: previewSong.id, 
                      song: previewSong,
                      title: previewSong.title,
                      slides: JSON.parse(previewSong.lyricsJson || '[]').length
                   });
                }} className="w-full">
                  Add to Service
                </Button>
                <div className="flex items-center gap-2">
                   <Button variant="secondary" onClick={() => openEditor(previewSong)} className="flex-1">Edit</Button>
                   <Button variant="ghost" onClick={() => handleDelete(previewSong.id, previewSong.title)} className="text-red-500">Delete</Button>
                </div>
             </div>
           )}
        </div>

      </div>

      {/* MODALS */}
      {isEditorOpen && (
        <SongEditor 
          song={editingSong} 
          onClose={() => {
            setIsEditorOpen(false);
            setEditingSong(null);
            fetchSongs(search, activeTag || undefined);
            void refreshTags();
          }} 
        />
      )}

      {isImportOpen && (
        <SongImportModal 
          onClose={() => setIsImportOpen(false)}
          onImportSuccess={() => {
            fetchSongs(search, activeTag || undefined);
            void refreshTags();
          }}
        />
      )}
    </MainLayout>
  );
}
