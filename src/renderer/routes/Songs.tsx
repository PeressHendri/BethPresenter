import { useEffect, useState, useMemo } from 'react';
import { 
  Plus, Search, Music, Trash2, 
  LayoutGrid, List as ListIcon, SortAsc, 
  UploadCloud, Settings2, Download
} from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Scrollbar } from '../components/ui/Scrollbar';
import { SongEditor } from '../components/SongEditor';
import { useSongStore } from '../stores/songStore';
import { Song } from '@/shared/types';
import { SongCard } from '../components/songs/SongCard';
import { SongRow } from '../components/songs/SongRow';
import { SongImportModal } from '../components/songs/SongImportModal';
import { motion, AnimatePresence } from 'framer-motion';

type TagStat = { tag: string; count: number };
type SortOption = 'title-asc' | 'title-desc' | 'artist-asc' | 'recent';

export function Songs() {
  const { songs, fetchSongs, deleteSong, duplicateSong, bulkDeleteSongs, loading } = useSongStore();
  
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

  const handleBulkExport = async () => {
    if (selectedIds.size === 0) return;
    try {
      const res = await (window as any).electron.ipcRenderer.invoke('backup:export', { songs: true });
      if (res.success) alert('Export completed: ' + res.filePath);
    } catch (e) {
      alert('Export failed');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === songs.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(songs.map(s => s.id)));
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

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-surface-base -m-5">
        
        {/* === TOP TOOLBAR === */}
        <div className="bg-surface-elevated border-b border-border-default p-4 flex flex-col gap-4 shrink-0 px-6 pt-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-text-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-500/20 text-accent-400 rounded-xl flex items-center justify-center">
                <Music size={20} />
              </div>
              Song Library
            </h1>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setIsImportOpen(true)} className="flex items-center gap-2">
                <UploadCloud size={16} /> Import
              </Button>
              <Button variant="primary" onClick={() => openEditor()} className="flex items-center gap-2">
                <Plus size={16} /> New Song
              </Button>
            </div>
          </div>

          {/* Controls Hook */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px] max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400" />
              <Input 
                placeholder="Search by title or lyrics..." 
                className="pl-9 h-10 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* View Toggle */}
            <div className="flex bg-surface-sidebar rounded-lg p-1 border border-border-default">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-surface-elevated text-text-100 shadow' : 'text-text-500 hover:text-text-300'}`}>
                <LayoutGrid size={16} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-surface-elevated text-text-100 shadow' : 'text-text-500 hover:text-text-300'}`}>
                <ListIcon size={16} />
              </button>
            </div>

            {/* Sort Dropdown (Simulated via Select) */}
            <div className="relative">
               <select 
                 className="appearance-none h-10 bg-surface-elevated border border-border-default rounded-lg pl-9 pr-8 text-sm outline-none focus:border-accent-500 cursor-pointer"
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value as SortOption)}
               >
                 <option value="title-asc">Sort: Title (A-Z)</option>
                 <option value="title-desc">Sort: Title (Z-A)</option>
                 <option value="artist-asc">Sort: Artist</option>
                 <option value="recent">Sort: Recently Added</option>
               </select>
               <SortAsc size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400 pointer-events-none" />
            </div>
            
            {/* Tag Filter */}
            {tags.length > 0 && (
              <div className="relative">
                 <select 
                   className="appearance-none h-10 bg-surface-elevated border border-border-default rounded-lg pl-9 pr-8 text-sm outline-none focus:border-accent-500 cursor-pointer"
                   value={activeTag || ''}
                   onChange={(e) => {
                     const val = e.target.value;
                     setActiveTag(val || null);
                   }}
                 >
                   <option value="">All Tags</option>
                   {tags.map(t => (
                     <option key={t.tag} value={t.tag}>{t.tag} ({t.count})</option>
                   ))}
                 </select>
                 <Settings2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400 pointer-events-none" />
              </div>
            )}
            
            {/* Clear Filters */}
            {(search || activeTag) && (
              <Button variant="ghost" onClick={clearFilters} className="text-xs h-10 px-3">
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* === MULTI-SELECT ACTION BAR === */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 48, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-accent-600/20 border-b border-accent-600/30 flex items-center px-6 shrink-0 overflow-hidden"
            >
               <span className="text-sm font-bold text-accent-100">{selectedIds.size} songs selected</span>
               <div className="ml-auto flex items-center gap-2">
                 <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="text-text-100">Cancel</Button>
                 <Button variant="secondary" size="sm" onClick={handleBulkExport} className="bg-surface-elevated flex items-center gap-2 border-border-default">
                   <Download size={14} /> Export Backup
                 </Button>
                 <Button variant="ghost" size="sm" onClick={handleBulkDelete} className="bg-danger/20 text-danger hover:bg-danger hover:text-white transition-colors">
                   <Trash2 size={14} className="mr-2" /> Delete Selected
                 </Button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === MAIN CONTENT SCROLL AREA === */}
        <Scrollbar className="flex-1 px-6 py-6 border-transparent">
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-40 rounded-xl bg-surface-elevated animate-pulse border border-border-default" />
                ))}
             </div>
          ) : filteredAndSortedSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-text-500">
               <Music size={48} className="opacity-20 mb-4" />
               <p className="font-semibold text-text-200">No songs found</p>
               <p className="text-sm mt-1">Try adjusting the search or filters.</p>
               {search && <Button variant="secondary" onClick={clearFilters} className="mt-4">Reset Search</Button>}
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                  {filteredAndSortedSongs.map(song => (
                    <SongCard 
                      key={song.id} 
                      song={song}
                      selected={selectedIds.has(song.id)}
                      onToggleSelect={() => toggleSelect(song.id)}
                      onEdit={() => openEditor(song)}
                      onDelete={() => handleDelete(song.id, song.title)}
                      onDuplicate={() => handleDuplicate(song.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col pb-20 rounded-xl overflow-hidden border border-border-default bg-surface-elevated">
                  {/* List Header */}
                  <div className="flex items-center gap-4 py-3 px-4 border-b border-border-strong bg-surface-sidebar sticky top-0 z-10 font-bold text-xs uppercase tracking-widest text-text-400">
                    <div className="shrink-0 flex items-center justify-center pt-0.5">
                       <input 
                         type="checkbox" 
                         checked={selectedIds.size === songs.length && songs.length > 0}
                         onChange={selectAll}
                         className="cursor-pointer"
                       />
                    </div>
                    <div className="w-[30%]">Title</div>
                    <div className="w-[20%]">Author</div>
                    <div className="w-[25%]">Tags</div>
                    <div className="w-[15%]">Info</div>
                    <div className="flex-1 text-right">Actions</div>
                  </div>
                  {/* List Rows */}
                  {filteredAndSortedSongs.map(song => (
                    <SongRow 
                      key={song.id} 
                      song={song}
                      selected={selectedIds.has(song.id)}
                      onToggleSelect={() => toggleSelect(song.id)}
                      onEdit={() => openEditor(song)}
                      onDelete={() => handleDelete(song.id, song.title)}
                      onDuplicate={() => handleDuplicate(song.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </Scrollbar>

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
