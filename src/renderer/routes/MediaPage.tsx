import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, Search, Trash2, Play, Pause, Layout, 
  Maximize2, FileVideo, FileImage, 
  RefreshCw, Repeat, Clock, ChevronRight,
  Database, HardDrive, Filter, SortAsc
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { useMediaStore, MediaItem } from '../stores/mediaStore';
import { motion, AnimatePresence } from 'framer-motion';

export function MediaPage({ onGoLive, onImportPPT }: { onGoLive: (item: any) => void, onImportPPT?: () => void }) {
  const { showToast } = useToast();
  const { 
    media, isLoading, filter, searchQuery, sortBy,
    fetchMedia, setFilter, setSearchQuery, setSortBy, removeMedia 
  } = useMediaStore();
  
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: MediaItem } | null>(null);

  useEffect(() => {
    fetchMedia();
    loadStorageInfo();
    window.addEventListener('click', () => setContextMenu(null));
    return () => window.removeEventListener('click', () => setContextMenu(null));
  }, []);

  const loadStorageInfo = async () => {
    if ((window as any).electron?.ipcRenderer) {
      const res = await (window as any).electron.ipcRenderer.invoke('media-storage-info');
      if (res.success) setStorageInfo(res);
    }
  };

  const selectedMedia = useMemo(() => 
    media.find(m => m.id === selectedMediaId), 
  [media, selectedMediaId]);

  const sortedMedia = useMemo(() => {
    let result = [...media].filter(m => {
      const matchesFilter = filter === 'all' || m.type === filter;
      const matchesSearch = m.filename.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    if (sortBy === 'newest') result.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === 'oldest') result.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortBy === 'name') result.sort((a,b) => a.filename.localeCompare(b.filename));

    return result;
  }, [media, filter, searchQuery, sortBy]);

  const handleImport = async (paths?: string[]) => {
    if ((window as any).electron?.ipcRenderer) {
      const res = await (window as any).electron.ipcRenderer.invoke('media-import', paths);
      if (res.success) {
        showToast(`Imported ${res.files.length} assets`, 'success');
        fetchMedia();
      }
    }
  };

  const handleApplyBackground = async (m: MediaItem) => {
    const formatted = {
      ...m,
      url: `media://${m.filepath}`
    };
    if ((window as any).electron?.ipcRenderer) {
      await (window as any).electron.ipcRenderer.invoke('media-apply-background', formatted);
      showToast('Background deployed live', 'success');
    }
  };

  const handleDelete = async (id: string) => {
    await removeMedia(id);
    showToast('Asset removed', 'success');
    if (selectedMediaId === id) setSelectedMediaId(null);
  };

  const handleContextMenu = (e: React.MouseEvent, item: MediaItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden text-white font-sans select-none"
         onDragOver={(e) => e.preventDefault()}
         onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files).map(f => (f as any).path);
            if (files.length > 0) handleImport(files);
         }}>
      
      {/* ── TOP ACTION BAR ── */}
      <div className="h-20 px-8 flex items-center justify-between bg-[#0A0C10] border-b border-white/5 shadow-2xl z-20">
        <div className="flex items-center gap-6">
           <h1 className="text-xl font-black tracking-tight flex items-center gap-3">
             <Database className="w-5 h-5 text-[#2D83FF]" />
             MEDIA LIBRARY
           </h1>
           <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
              <FilterBtn active={filter === 'all'} label="All" onClick={() => setFilter('all')} />
              <FilterBtn active={filter === 'image'} label="Images" onClick={() => setFilter('image')} />
              <FilterBtn active={filter === 'video'} label="Videos" onClick={() => setFilter('video')} />
           </div>
        </div>

        <div className="flex-1 max-w-lg mx-12 relative group">
           <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#2D83FF] transition-colors" />
           <input 
              type="text" 
              placeholder="Search assets by name..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold focus:outline-none focus:border-[#2D83FF] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
             <SortAsc size={14} className="text-white/30" />
             <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value as any)}
               className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white outline-none"
             >
               <option value="newest">Newest</option>
               <option value="oldest">Oldest</option>
               <option value="name">Name</option>
             </select>
           </div>
           <button onClick={() => handleImport()} className="flex items-center gap-3 h-12 px-6 rounded-xl bg-[#2D83FF] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#1C69FF] shadow-xl shadow-[#2D83FF]/20 transition-all active:scale-95">
             <Plus size={18} />
             Add Assets
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* ── CENTRAL MEDIA GRID ── */}
         <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-[#050505]/60">
               {isLoading ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-20">
                   <div className="w-12 h-12 border-4 border-[#2D83FF] border-t-transparent rounded-full animate-spin mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Indexing Assets...</p>
                 </div>
               ) : (
                 <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    <AnimatePresence>
                      {sortedMedia.map((m) => (
                        <MediaGridCard 
                          key={m.id} 
                          item={m} 
                          active={selectedMediaId === m.id}
                          onClick={() => setSelectedMediaId(m.id)}
                          onDoubleClick={() => handleApplyBackground(m)}
                          onContextMenu={(e: any) => handleContextMenu(e, m)}
                        />
                      ))}
                    </AnimatePresence>
                 </motion.div>
               )}
            </div>

            {/* STORAGE MONITOR */}
            <div className="h-10 px-8 flex items-center justify-between bg-[#0A0C10] border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-white/30">
               <div className="flex items-center gap-3">
                 <HardDrive size={12} />
                 <span>Local Repository: {storageInfo?.path || 'Ready'}</span>
               </div>
               <span>Storage Used: {storageInfo?.used || '0 MB'}</span>
            </div>
         </div>

         {/* ── RIGHT PREVIEW PANEL ── */}
         <div className="w-[420px] bg-[#0A0C10] border-l border-white/5 flex flex-col shrink-0 z-10">
            {selectedMedia ? (
               <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-8 bg-black/20">
                     <div className="relative aspect-video bg-black/40 rounded-2xl border border-white/5 overflow-hidden shadow-2xl group">
                        {selectedMedia.type === 'video' ? (
                          <video 
                            id={`preview-${selectedMedia.id}`}
                            src={`media://${selectedMedia.filepath}`}
                            className="w-full h-full object-cover"
                            muted
                            autoPlay
                            loop
                          />
                        ) : (
                          <img 
                            src={`media://${selectedMedia.filepath}`} 
                            className="w-full h-full object-cover" 
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 right-4 h-8 px-3 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#2D83FF]">
                            {selectedMedia.type}
                          </span>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                     <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-[#2D83FF] uppercase tracking-[0.3em]">Asset Meta</p>
                          <h3 className="text-2xl font-black text-white leading-tight break-words">{selectedMedia.filename}</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <MetaBox label="Type" value={selectedMedia.type.toUpperCase()} />
                           <MetaBox label="Dimensions" value={selectedMedia.resolution || '1080P'} />
                           <MetaBox label="Added" value={new Date(selectedMedia.createdAt).toLocaleDateString()} />
                           <MetaBox label="Format" value={selectedMedia.filepath.split('.').pop()?.toUpperCase() || ''} />
                        </div>
                     </div>

                     <div className="space-y-3 pt-6 border-t border-white/5">
                        <ActionButton 
                           primary 
                           icon={<Play className="w-4 h-4 fill-current" />} 
                           label="Broadcast Live" 
                           onClick={() => handleApplyBackground(selectedMedia)}
                        />
                        <ActionButton 
                           icon={<Layout className="w-4 h-4" />} 
                           label="Add to Flow" 
                           onClick={() => showToast('Asset added to Service Order', 'success')}
                        />
                        <button 
                           onClick={() => handleDelete(selectedMedia.id)}
                           className="w-full h-14 rounded-2xl border border-white/5 text-xs font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                           Delete Asset
                        </button>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center opacity-10 p-16 text-center">
                  <div className="w-20 h-20 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mb-8 rotate-12">
                     <FileVideo size={40} />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.4em]">Media Preview</h2>
                  <p className="text-[10px] font-bold text-white/40 mt-2 uppercase">Select an asset from your library</p>
               </div>
            )}
         </div>
      </div>

      {/* ── CONTEXT MENU ── */}
      {contextMenu && (
        <div 
          className="fixed z-[100] w-64 bg-[#0A0C10] border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-2 backdrop-blur-3xl"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
           <ContextItem icon={<Maximize2 size={16}/>} label="Preview Fullscreen" onClick={() => handleApplyBackground(contextMenu.item)} />
           <ContextItem icon={<Layout size={16}/>} label="Set as Background" onClick={() => handleApplyBackground(contextMenu.item)} />
           <ContextItem icon={<Plus size={16}/>} label="Add to Service" onClick={() => {}} />
           <div className="h-px bg-white/5 my-2 mx-2" />
           <ContextItem icon={<Trash2 size={16}/>} label="Delete Asset" danger onClick={() => handleDelete(contextMenu.item.id)} />
        </div>
      )}
    </div>
  );
}

function MediaGridCard({ item, active, onClick, onDoubleClick, onContextMenu }: any) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      className={`
        group relative aspect-video bg-black rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-500
        ${active ? 'border-[#2D83FF] shadow-[0_20px_40px_rgba(45,131,255,0.25)] scale-[1.05]' : 'border-white/5 hover:border-white/20 hover:scale-[1.02]'}
      `}
    >
       {item.type === 'video' ? (
         <div className="w-full h-full relative">
            <video 
              src={`media://${item.filepath}#t=1`} 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
               <Play size={24} className="text-white fill-white" />
            </div>
         </div>
       ) : (
         <img 
           src={`media://${item.filepath}`} 
           className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
         />
       )}
       
       <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10">
          {item.type === 'video' ? <FileVideo size={10} className="text-[#2D83FF]" /> : <FileImage size={10} className="text-emerald-400" />}
          <span className="text-[8px] font-black text-white uppercase tracking-widest">{item.type}</span>
       </div>

       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <p className="text-[10px] font-black text-white truncate uppercase tracking-tight">{item.filename}</p>
       </div>
    </motion.div>
  );
}

function FilterBtn({ active, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${active ? 'bg-[#2D83FF] text-white shadow-xl' : 'text-white/20 hover:text-white'}`}
    >
      {label}
    </button>
  );
}

function MetaBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
       <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{label}</p>
       <p className="text-sm font-black text-white/90">{value}</p>
    </div>
  );
}

function ActionButton({ icon, label, onClick, primary }: any) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full h-14 flex items-center justify-between px-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all
        ${primary ? 'bg-[#2D83FF] text-white shadow-xl hover:bg-[#1C69FF] hover:scale-[1.02] active:scale-[0.98]' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}
      `}
    >
       <div className="flex items-center gap-4">
          {icon}
          {label}
       </div>
       <ChevronRight size={14} className="opacity-20" />
    </button>
  );
}

function ContextItem({ icon, label, onClick, danger }: any) {
  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`
        flex items-center gap-4 px-5 py-3.5 rounded-xl cursor-pointer text-[11px] font-black uppercase tracking-widest transition-all
        ${danger ? 'text-red-500 hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/10' : 'text-white/50 hover:bg-white/5 hover:text-white'}
      `}
    >
       {icon}
       {label}
    </div>
  );
}
