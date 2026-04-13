import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Upload, CheckSquare, Image as ImageIcon, 
  Video, Play, List, Grid, MoreVertical, 
  Filter, Trash2, Clock, Loader2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import { optimizeImage, getOptimizedUrl } from '../utils/imageOptimize';

const API_BASE = 'http://localhost:5000';

const MediaView = () => {
  const { notify, addToSchedule } = useProject();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/media`);
      if (response.ok) {
        const data = await response.json();
        setMediaList(data);
      }
    } catch (error) {
       console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (20MB)
    if (file.size > 20 * 1024 * 1024) {
      notify('Ukuran file terlalu besar! Maksimal 20MB.', 'warning');
      return;
    }

    // Check count limit
    if (mediaList.length >= 50) {
      notify('Kapasitas penuh! Maksimal 50 media.', 'warning');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    // Optimize logic for image files
    if (file.type.startsWith('image/')) {
        const optimizedDataUrl = await optimizeImage(file, 1920, 0.8);
        const optimizedBlob = await (await fetch(optimizedDataUrl)).blob();
        formData.append('file', optimizedBlob, file.name.replace(/\.[^/.]+$/, "") + ".jpeg");
    } else {
        formData.append('file', file);
    }

    try {
      const response = await fetch(`${API_BASE}/api/media/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        notify('File berhasil diunggah!', 'success');
        fetchMedia();
      } else {
        const errorData = await response.json();
        notify(errorData.error || 'Gagal mengunggah file', 'error');
      }
    } catch (error) {
      notify('Kesalahan jaringan saat mengunggah', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus media ini secara permanen?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/media/${id}`, { method: 'DELETE' });
      if (response.ok) {
        notify('Media berhasil dihapus', 'success');
        fetchMedia();
      }
    } catch (error) {
      notify('Gagal menghapus media', 'error');
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredMedia = mediaList.filter(item => {
    const matchesSearch = item.original_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'Semua' || 
                         (activeFilter === 'Gambar' && item.type === 'image') ||
                         (activeFilter === 'Video' && item.type === 'video');
    return matchesSearch && matchesFilter;
  });

  const totalSize = mediaList.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="flex-1 flex flex-col bg-white text-[#2D2D2E] font-['Outfit'] overflow-hidden">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="image/*,video/*"
      />

      {/* Search & Tool Area */}
      <div className="px-6 py-4 flex flex-col gap-4 border-b border-[#E2E2E6] bg-[#F8F9FA]">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93] group-focus-within:text-[#800000] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-white border border-[#E2E2E6] rounded-lg pl-10 pr-4 text-[13px] font-bold focus:outline-none focus:border-[#80000040] transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || mediaList.length >= 50}
              className={`h-10 px-4 flex items-center gap-2 bg-[#800000] text-white rounded-lg hover:bg-[#A00000] transition-all shadow-sm font-bold text-[13px] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} strokeWidth={2.5} />}
              {uploading ? 'Mengunggah...' : 'Unggah'}
            </button>
            <button className="h-10 w-10 flex items-center justify-center bg-white border border-[#E2E2E6] text-[#8E8E93] rounded-lg hover:text-[#800000] transition-all">
              <CheckSquare size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {['Semua', 'Gambar', 'Video'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-wider transition-all border ${
                  activeFilter === filter 
                    ? 'bg-[#800000] border-[#800000] text-white shadow-sm' 
                    : 'bg-white border-[#E2E2E6] text-[#8E8E93] hover:text-[#2D2D2E]'
                }`}
              >
                {filter === 'Gambar' ? <ImageIcon size={14}/> : filter === 'Video' ? <Video size={14}/> : null}
                {filter}
                <span className={`ml-1 px-1.5 rounded-full text-[10px] ${activeFilter === filter ? 'bg-white/20' : 'bg-[#F1F1F3]'}`}>
                  {mediaList.filter(m => filter === 'Semua' || (filter === 'Gambar' ? m.type==='image' : m.type==='video')).length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-[#AEAEB2] text-[11px] font-black uppercase">
                <Clock size={14} />
                <span>Terbaru</span>
             </div>
             <div className="h-4 border-l border-[#E2E2E6]"></div>
             <div className="flex bg-[#F1F1F3] rounded-lg p-0.5 border border-[#E2E2E6]">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-[#800000] shadow-sm' : 'text-[#AEAEB2]'}`}
                >
                  <Grid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-[#800000] shadow-sm' : 'text-[#AEAEB2]'}`}
                >
                  <List size={16} />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-[#AEAEB2] gap-2">
             <Loader2 size={32} className="animate-spin" />
             <span className="text-[14px] font-bold uppercase tracking-widest">Memuat Library...</span>
          </div>
        ) : filteredMedia.length > 0 ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'} gap-6`}>
            <AnimatePresence mode="popLayout">
              {filteredMedia.map((media) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={media.id}
                  onClick={() => {
                    addToSchedule({
                      id: media.id,
                      title: media.original_name,
                      url: `${API_BASE}${encodeURI(media.path)}`,
                      type: 'media'
                    });
                    notify(`Ditambahkan: ${media.original_name}`, 'success');
                  }}
                  className={`group cursor-pointer flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row items-center p-3'} bg-white border border-[#E2E2E6] rounded-xl overflow-hidden hover:border-[#80000040] hover:shadow-lg transition-all relative`}
                >
                  {/* Thumbnail Layer */}
                  <div className={`${viewMode === 'grid' ? 'aspect-video w-full' : 'w-24 aspect-video rounded-lg mr-4'} relative overflow-hidden bg-[#F1F1F3]`}>
                     {media.type === 'image' ? (
                       <img loading="lazy" src={getOptimizedUrl(`${API_BASE}${media.path}`, 'thumbnail')} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-black relative">
                          <video 
                            src={`${API_BASE}${encodeURI(media.path)}`} 
                            muted 
                            className="w-full h-full object-cover opacity-60"
                            onMouseOver={e => e.target.play()}
                            onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <Video size={24} className="text-white/40" />
                          </div>
                       </div>
                     )}
                     
                     <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md p-1.5 rounded-md border border-[#E2E2E6] shadow-sm">
                        {media.type === 'video' ? <Video size={12} className="text-[#800000]" /> : <ImageIcon size={12} className="text-[#800000]" />}
                     </div>

                     {media.type === 'video' && (
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/10">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl scale-75 group-hover:scale-100 transition-all duration-300">
                             <Play size={18} fill="currentColor" className="text-[#800000] ml-1" />
                          </div>
                       </div>
                     )}
                  </div>

                  {/* Info Layer */}
                  <div className={`flex-1 ${viewMode === 'grid' ? 'p-4' : 'py-1'}`}>
                    <h3 className="text-[13px] font-black group-hover:text-[#800000] truncate leading-tight mb-1 transition-all">{media.original_name}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#AEAEB2] uppercase tracking-tighter">
                      <span className="shrink-0">{formatSize(media.size)}</span>
                      <span className="w-1 h-1 bg-[#E2E2E6] rounded-full"></span>
                      <span className="truncate">{new Date(media.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(media.id); }}
                      className="p-1.5 bg-white border border-[#E2E2E6] text-[#800000] hover:bg-red-50 transition-all rounded-md shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button className="p-1.5 bg-white border border-[#E2E2E6] text-[#AEAEB2] hover:text-[#2D2D2E] transition-all rounded-md shadow-sm">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#AEAEB2] gap-4 opacity-40">
             <AlertCircle size={48} />
             <div className="text-center">
                <p className="text-[18px] font-black uppercase tracking-widest">Library Kosong</p>
                <p className="text-[12px] font-bold mt-1">Gunakan tombol Unggah untuk menambahkan media (Maks 20MB)</p>
             </div>
          </div>
        )}
      </div>

      {/* Library Footer Info */}
      <div className="px-6 py-4 border-t border-[#E2E2E6] bg-[#F8F9FA] flex justify-between items-center shadow-inner">
        <div className="text-[11px] font-black text-[#8E8E93] uppercase tracking-widest flex items-center gap-4">
          <div className={mediaList.length >= 45 ? 'text-red-600' : ''}>
            {mediaList.length} / 50 file {mediaList.length >= 50 && '(Penuh)'}
          </div>
          <span className="text-[#E2E2E6]">|</span> 
          <span>Total: {formatSize(totalSize)} digunakan</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="w-48 h-1.5 bg-[#E2E2E6] rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${mediaList.length >= 45 ? 'bg-red-600' : 'bg-[#800000]'}`} 
                style={{ width: `${(mediaList.length / 50) * 100}%` }}
              ></div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default MediaView;
