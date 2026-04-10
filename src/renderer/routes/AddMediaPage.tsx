import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  X, 
  FileImage, 
  FileVideo, 
  FileText, 
  Search, 
  Maximize2, 
  Play, 
  Pause, 
  Volume2, 
  Repeat, 
  FolderOpen, 
  Upload, 
  Check, 
  ChevronRight,
  Monitor,
  ArrowLeft,
  Clock,
  HardDrive
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  duration?: string;
  resolution?: string;
  size?: string;
}

export function AddMediaPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // ── NAVIGATION STATE ──
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'local'>('image');
  const [searchQuery, setSearchQuery] = useState('');
  
  // ── DATA STATE ──
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // ── LOADERS ──
  useEffect(() => {
    loadMedia();
  }, [activeTab]);

  const loadMedia = async () => {
    if (activeTab === 'local') {
       setMediaList([]);
       return;
    }
    setIsLoading(true);
    if ((window as any).electron?.ipcRenderer) {
       const channel = activeTab === 'image' ? 'media-list-images' : 'media-list-videos';
       const res = await (window as any).electron.ipcRenderer.invoke(channel);
       if (res.success) setMediaList(res.media);
    }
    setIsLoading(false);
  };

  const handleOpenLocal = async () => {
    if ((window as any).electron?.ipcRenderer) {
       const paths = await (window as any).electron.ipcRenderer.invoke('media-open-local-file');
       if (paths && paths.length > 0) {
          showToast(`Selected ${paths.length} local files`, 'success');
          // In production: process these paths into local media items
       }
    }
  };

  const handleAddToService = async (media?: MediaItem) => {
    const itemToAdd = media || selectedMedia;
    if (!itemToAdd) return;
    
    setIsLoading(true);
    if ((window as any).electron?.ipcRenderer) {
       const res = await (window as any).electron.ipcRenderer.invoke('media-add-to-service', {
          filePath: itemToAdd.url,
          type: itemToAdd.type
       });
       if (res.success) {
          showToast('Media added to Service Flow', 'success');
          navigate('/');
       }
    }
    setIsLoading(false);
  };

  const filteredMedia = useMemo(() => {
    return mediaList.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [mediaList, searchQuery]);

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden text-white font-sans select-none">
      {/* ── HEADER ── */}
      <div className="h-16 px-6 flex items-center justify-between bg-[#0A0C10] border-b border-white/5 shadow-2xl z-20">
        <div className="flex items-center gap-6">
           <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-all">
             <ArrowLeft size={20} />
           </button>
           <div className="flex flex-col">
              <h1 className="text-sm font-black uppercase tracking-[0.2em]">Media Picker</h1>
              <span className="text-[9px] font-black text-[#2D83FF] uppercase tracking-widest">Select Asset to service</span>
           </div>
        </div>

        <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/5">
           <TabBtn active={activeTab === 'image'} icon={<FileImage size={14}/>} label="Images" onClick={() => setActiveTab('image')} />
           <TabBtn active={activeTab === 'video'} icon={<FileVideo size={14}/>} label="Videos" onClick={() => setActiveTab('video')} />
           <TabBtn active={activeTab === 'local'} icon={<HardDrive size={14}/>} label="Local" onClick={() => setActiveTab('local')} />
        </div>

        <div className="w-64 relative group">
           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#2D83FF]" />
           <input 
              type="text" 
              placeholder="Search library..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs font-bold focus:outline-none focus:border-[#2D83FF] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* ── LEFT: GRID GALLERY ── */}
         <div className="flex-1 flex flex-col overflow-hidden bg-[#050505]/40">
            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
               {activeTab === 'local' ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
                     <div className="w-24 h-24 rounded-full bg-[#2D83FF]/10 flex items-center justify-center text-[#2D83FF] shadow-[0_0_40px_rgba(45,131,255,0.1)]">
                        <FolderOpen size={48} />
                     </div>
                     <div className="text-center space-y-2">
                        <h3 className="text-xl font-black uppercase tracking-widest">Browse Storage</h3>
                        <p className="text-white/30 text-xs font-medium max-w-xs mx-auto">Select high-definition media directly from your computer to add to the service flow.</p>
                     </div>
                     <button 
                        onClick={handleOpenLocal}
                        className="px-8 py-3 rounded-2xl bg-white/5 hover:bg-[#2D83FF] hover:text-white text-xs font-black uppercase tracking-[0.2em] border border-white/10 transition-all shadow-xl active:scale-95"
                     >
                        Open File Explorer
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                     {filteredMedia.map((m) => (
                       <MediaCard 
                          key={m.id} 
                          item={m} 
                          active={selectedMedia?.id === m.id}
                          onClick={() => setSelectedMedia(m)}
                          onDoubleClick={() => handleAddToService(m)}
                       />
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* ── RIGHT: PREVIEW PANEL ── */}
         <div className="w-[380px] bg-[#0A0C10] border-l border-white/5 flex flex-col shrink-0 shadow-2xl z-10">
            {selectedMedia ? (
               <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-6 bg-black/40">
                     <div className="relative aspect-video bg-black rounded-3xl border border-white/5 overflow-hidden shadow-2xl group">
                        <img 
                          src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800"
                          className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-105 brightness-110' : 'brightness-50'}`}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <button 
                             onClick={() => setIsPlaying(!isPlaying)}
                             className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                           >
                             {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                     <div className="space-y-2">
                        <h3 className="text-lg font-black text-white leading-tight uppercase italic truncate">{selectedMedia.name}</h3>
                        <span className="text-[9px] font-black text-[#2D83FF] uppercase tracking-[0.2em]">{selectedMedia.type === 'video' ? 'Motion Loop' : 'Static Visual'}</span>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        <MetaBox icon={<Maximize2 size={12}/>} label="RESOLUTION" value="1920 x 1080" />
                        <MetaBox icon={<HardDrive size={12}/>} label="SIZE" value="12.4 MB" />
                        {selectedMedia.type === 'video' && (
                           <>
                              <MetaBox icon={<Clock size={12}/>} label="DURATION" value={selectedMedia.duration || '00:30'} />
                              <MetaBox icon={<Repeat size={12}/>} label="LOOP" value="Active" />
                           </>
                        )}
                     </div>
                  </div>

                  <div className="p-6 mt-auto">
                     <button 
                       onClick={() => handleAddToService()}
                       disabled={isLoading}
                       className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#2D83FF] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#1C69FF] shadow-2xl shadow-[#2D83FF]/30 active:scale-95 transition-all"
                     >
                        <Plus size={16} />
                        Add to Service
                     </button>
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center opacity-20 italic p-12 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                     <FileText size={32} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">Selection Pending</span>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

function TabBtn({ active, icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-2 px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] transition-all
        ${active ? 'bg-[#2D83FF] text-white shadow-lg' : 'text-white/40 hover:text-white'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}

function MediaCard({ item, active, onClick, onDoubleClick }: any) {
  return (
    <div 
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`
        group relative aspect-square bg-[#111] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300
        ${active ? 'border-[#2D83FF] shadow-[0_15px_30px_rgba(45,131,255,0.2)] scale-[1.03] z-10' : 'border-white/5 hover:border-white/10'}
      `}
    >
       <img 
         src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400" 
         className={`w-full h-full object-cover transition-all duration-700 opacity-60 group-hover:opacity-100 ${active ? 'scale-110 opacity-100' : ''}`}
       />
       {item.type === 'video' && (
         <div className="absolute top-2 right-2 p-1 bg-black/40 backdrop-blur-md rounded-lg text-blue-400">
            <Play size={10} fill="currentColor" />
         </div>
       )}
       <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[9px] font-black text-white truncate max-w-[90%] uppercase tracking-tighter">{item.name}</p>
       </div>
    </div>
  );
}

function MetaBox({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-2xl border border-white/5">
       <div className="flex items-center gap-2 opacity-30">
          {icon}
          <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
       </div>
       <span className="text-[10px] font-black text-white leading-none tracking-tight">{value}</span>
    </div>
  );
}
