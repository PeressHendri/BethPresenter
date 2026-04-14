import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Upload, CheckSquare, Image as ImageIcon, 
  Video, Play, List, Grid, MoreVertical, 
  Filter, Trash2, Clock, Loader2, AlertCircle, MonitorPlay, X, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import { optimizeImage, getOptimizedUrl } from '../utils/imageOptimize';

const API_BASE = 'http://localhost:5000';

const MediaView = () => {
  const { notify, addToSchedule, setGlobalBackground, liveState, addMediaToSchedule } = useProject();
  const [selectedMedia, setSelectedMedia] = useState(null);
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

    if (file.size > 20 * 1024 * 1024) {
      notify('Ukuran file terlalu besar! Maksimal 20MB.', 'warning');
      return;
    }

    if (mediaList.length >= 50) {
      notify('Kapasitas penuh! Maksimal 50 media.', 'warning');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
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
    const matchesSearch = (item.original_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'Semua' || 
                         (activeFilter === 'Gambar' && item.type === 'image') ||
                         (activeFilter === 'Video' && item.type === 'video');
    return matchesSearch && matchesFilter;
  });

  const totalSize = mediaList.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="flex-1 flex flex-col bg-white text-[#2D2D2E] font-['Outfit'] overflow-hidden relative">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />

      {/* Header Search */}
      <div className="px-6 py-4 flex flex-col gap-4 border-b border-[#E2E2E6] bg-[#F8F9FA]">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93] group-focus-within:text-[#800000] transition-colors" />
            <input 
              type="text" placeholder="Cari media..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-white border border-[#E2E2E6] rounded-lg pl-10 pr-4 text-[13px] font-bold focus:outline-none focus:border-[#80000040]"
            />
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || mediaList.length >= 50}
            className="h-10 px-4 flex items-center gap-2 bg-[#800000] text-white rounded-lg hover:bg-black transition-all shadow-sm font-bold text-[13px]"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span>Unggah</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {['Semua', 'Gambar', 'Video'].map(f => (
              <button 
                key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase transition-all ${activeFilter === f ? 'bg-[#800000] text-white' : 'bg-white border border-[#E2E2E6] text-[#AEAEB2]'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex bg-[#F1F1F3] rounded-lg p-0.5 border border-[#E2E2E6]">
             <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white text-[#800000] shadow-sm' : 'text-[#AEAEB2]'}`}><Grid size={16} /></button>
             <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white text-[#800000] shadow-sm' : 'text-[#AEAEB2]'}`}><List size={16} /></button>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30"><Loader2 size={32} className="animate-spin" /></div>
        ) : (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'} gap-6`}>
            {filteredMedia.map(media => (
              <motion.div 
                key={media.id} layout
                className="group relative bg-white border border-[#E2E2E6] rounded-xl overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedMedia(media)}
              >
                <div className="aspect-video bg-black relative overflow-hidden">
                  {media.type === 'image' ? (
                    <img src={getOptimizedUrl(`${API_BASE}${media.path}`, 'thumbnail')} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  ) : (
                    <video src={`${API_BASE}${media.path}`} className="w-full h-full object-cover opacity-60" muted />
                  )}
                  {media.type === 'video' && <div className="absolute inset-0 flex items-center justify-center"><Play size={24} className="text-white opacity-40" /></div>}
                  
                  {/* Hover Actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setGlobalBackground({ url: `${API_BASE}${media.path}`, type: media.type }); }}
                      className="p-2 bg-white text-[#800000] rounded-lg shadow-xl hover:bg-[#800000] hover:text-white transition-all" title="Jadikan BG"
                    >
                      <MonitorPlay size={18} />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        addMediaToSchedule({ id: media.id, name: media.original_name, path: media.path, type: media.type });
                        notify('Ditambahkan ke jadwal', 'success');
                      }}
                      className="p-2 bg-white text-[#800000] rounded-lg shadow-xl hover:bg-[#800000] hover:text-white transition-all" title="Tambah ke Jadwal"
                    >
                      <Plus size={18} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(media.id); }} className="p-2 bg-white text-red-600 rounded-lg shadow-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-[12px] font-black truncate">{media.original_name}</h3>
                  <p className="text-[10px] font-bold text-[#AEAEB2] uppercase mt-1">{formatSize(media.size)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 border-t border-[#E2E2E6] bg-[#F8F9FA] text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.2em] flex justify-between items-center">
        <span>{mediaList.length} / 50 FILE DIGUNAKAN</span>
        <span>TOTAL: {formatSize(totalSize)} / 200MB</span>
      </div>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[2000] flex items-center justify-center p-8"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white w-full max-w-5xl rounded-2xl overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b flex justify-between items-center px-8">
                <h3 className="font-black uppercase tracking-tight text-[#1D1D1F]">{selectedMedia.original_name}</h3>
                <button onClick={() => setSelectedMedia(null)} className="text-[#AEAEB2] hover:text-[#800000]"><X size={24} /></button>
              </div>
              <div className="bg-black aspect-video flex items-center justify-center">
                {selectedMedia.type === 'image' ? (
                  <img src={`${API_BASE}${selectedMedia.path}`} className="max-w-full max-h-full object-contain" alt="" />
                ) : (
                  <video src={`${API_BASE}${selectedMedia.path}`} controls autoPlay className="max-w-full max-h-full" />
                )}
              </div>
              <div className="p-6 border-t flex justify-end gap-4 shadow-inner">
                <button onClick={() => setSelectedMedia(null)} className="text-[12px] font-black text-[#AEAEB2] hover:text-black uppercase tracking-widest px-4">Tutup</button>
                <button 
                  onClick={() => { addMediaToSchedule({ id: selectedMedia.id, name: selectedMedia.original_name, path: selectedMedia.path, type: selectedMedia.type }); setSelectedMedia(null); notify('Ditambahkan ke jadwal', 'success'); }}
                  className="bg-[#800000] text-white px-8 py-3 rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-[#80000040]"
                >
                  Tambahkan ke Jadwal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MediaView;
