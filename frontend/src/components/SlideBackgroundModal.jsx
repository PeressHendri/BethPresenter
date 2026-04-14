import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Image as ImageIcon, Video, Palette, FolderOpen, Library, Loader2, Upload } from 'lucide-react';

const SlideBackgroundModal = ({ isOpen, onClose, onApply, slides = [], currentSlideIndex = 0 }) => {
  const [bgType, setBgType] = useState('Solid Color');
  const [color, setColor] = useState('#800000');
  const [applyTo, setApplyTo] = useState('this'); 
  const [selectedSlides, setSelectedSlides] = useState([currentSlideIndex]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedSlides([currentSlideIndex]);
      if (showLibrary) fetchMedia();
    }
  }, [isOpen, showLibrary, currentSlideIndex]);

  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const resp = await fetch('http://localhost:5000/api/media');
      if (resp.ok) {
        const data = await resp.json();
        setMediaList(data.filter(m => bgType === 'Image' ? m.type === 'image' : m.type === 'video'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch('http://localhost:5000/api/media/upload', {
        method: 'POST',
        body: formData
      });
      
      if (resp.ok) {
        const newMedia = await resp.json();
        setSelectedMedia(newMedia);
        // Refresh library in background
        fetchMedia();
      } else {
        const err = await resp.json();
        alert(err.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah file. Pastikan server aktif.');
    } finally {
      setUploading(false);
    }
  };

  const toggleSlideSelection = (idx) => {
    setSelectedSlides(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#0A0A0A] w-full max-w-xl rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden font-['Outfit'] relative">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept={bgType === 'Image' ? 'image/*' : 'video/*'} 
          className="hidden" 
        />

        {/* MEDIA LIBRARY OVERLAY */}
        {showLibrary && (
          <div className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white font-black text-[15px] uppercase tracking-widest">Pilih {bgType} dari Library</h3>
              <button onClick={() => setShowLibrary(false)} className="p-2 hover:bg-white/5 rounded-full text-white/40"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {loadingMedia ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20"><Loader2 className="animate-spin mb-2" /><span>Memuat Media...</span></div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {mediaList.length > 0 ? mediaList.map(m => (
                    <div 
                      key={m.id} 
                      onClick={() => { setSelectedMedia(m); setShowLibrary(false); }}
                      className={`aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all relative group ${selectedMedia?.id === m.id ? 'border-[#800000]' : 'border-transparent hover:border-white/20'}`}
                    >
                      {m.type === 'image' ? (
                        <img src={`http://localhost:5000${m.path}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <Video size={24} className="text-white/20" />
                          <video src={`http://localhost:5000${m.path}`} className="hidden" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2 text-[8px] font-bold text-white truncate">{m.original_name}</div>
                      {selectedMedia?.id === m.id && <div className="absolute top-2 right-2 bg-[#800000] text-white p-1 rounded-md"><Check size={10}/></div>}
                    </div>
                  )) : (
                    <div className="col-span-3 py-12 flex flex-col items-center justify-center text-white/10">
                       <Library size={48} className="mb-4" />
                       <span className="font-bold uppercase tracking-widest">Library Kosong</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
               <button onClick={() => setShowLibrary(false)} className="px-6 py-2.5 text-white/40 text-[12px] font-black uppercase tracking-widest">Batal</button>
               <button onClick={() => setShowLibrary(false)} className="px-8 py-2.5 bg-[#800000] text-white text-[12px] font-black uppercase tracking-widest rounded-lg transition-transform active:scale-95">Gunakan Media</button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-7 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <h3 className="text-white font-black text-[18px] uppercase tracking-widest">Atur Latar Belakang Slide</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-[#AEAEB2] transition-colors"><X size={22} /></button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-7 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Background Type */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.2em] ml-1">Jenis Latar Belakang</label>
            <select 
              value={bgType}
              onChange={(e) => { setBgType(e.target.value); setSelectedMedia(null); }}
              className="w-full h-14 bg-[#141414] border border-white/5 rounded-xl px-5 text-white text-[15px] font-black appearance-none outline-none focus:border-[#800000] transition-all cursor-pointer"
            >
              <option value="Solid Color">Solid Color</option>
              <option value="Image">Image</option>
              <option value="Video (MP4)">Video (MP4)</option>
            </select>
          </div>

          {bgType === 'Solid Color' ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.2em] ml-1">Warna</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-12 bg-[#141414] border border-white/5 rounded-xl p-1 cursor-pointer" />
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.2em] ml-1">{bgType}</label>
              <div className="flex gap-3">
                <button onClick={() => setShowLibrary(true)} className="flex-1 h-12 bg-[#800000] hover:bg-[#a00000] text-white rounded-xl flex items-center justify-center gap-3 transition-all text-[12px] font-black uppercase tracking-widest group">
                  <Library size={18} className="group-hover:scale-110 transition-transform" /> Pilih dari Library
                </button>
                <button 
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                  className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl flex items-center justify-center gap-3 transition-all text-[12px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : <FolderOpen size={18} />} Jelajahi File Lokal
                </button>
              </div>
              <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest pl-1">Hanya file {bgType === 'Image' ? 'gambar' : 'video'} yang ditampilkan.</p>
              
              {selectedMedia && (
                <div className="mt-4 aspect-video rounded-2xl overflow-hidden border border-[#800000] relative group shadow-2xl">
                  {selectedMedia.type === 'image' ? (
                    <img src={`http://localhost:5000${selectedMedia.path}`} className="w-full h-full object-cover" />
                  ) : (
                    <video src={`http://localhost:5000${selectedMedia.path}`} autoPlay loop muted className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setSelectedMedia(null)} className="bg-red-500/80 p-2 rounded-full text-white"><X size={20}/></button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Apply To */}
          <div className="space-y-4 font-['Outfit']">
            <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.2em] ml-1">Terapkan Ke</label>
            <div className="flex gap-2">
              {[
                { id: 'this', label: 'Slide Ini' },
                { id: 'selected', label: 'Slide Terpilih' },
                { id: 'all', label: 'Semua Slide' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setApplyTo(opt.id)}
                  className={`flex-1 py-4 px-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                    applyTo === opt.id ? 'bg-[#800000] border-[#800000] text-white shadow-[0_10px_20px_rgba(128,0,0,0.3)]' : 'bg-white/5 border-transparent text-[#444] hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Slides List */}
          {applyTo === 'selected' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
               <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.2em] ml-1">Pilih Slide</label>
               <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar p-1">
                  {slides.map((s, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => toggleSlideSelection(idx)}
                      className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${selectedSlides.includes(idx) ? 'bg-[#80000015] border-[#80000040]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                    >
                       <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${selectedSlides.includes(idx) ? 'bg-[#800000] text-white' : 'border-2 border-white/10 text-transparent'}`}>
                          <Check size={12} strokeWidth={4} />
                       </div>
                       <span className={`text-[10px] font-black w-6 h-6 flex items-center justify-center rounded ${selectedSlides.includes(idx) ? 'bg-[#800000] text-white' : 'bg-white/10 text-[#444]'}`}>{idx + 1}</span>
                       <span className={`text-[12px] font-black truncate flex-1 ${selectedSlides.includes(idx) ? 'text-white' : 'text-[#444]'}`}>{s.label || s.content.slice(0, 15) || 'Verse ' + (idx+1)}</span>
                    </div>
                  ))}
               </div>
               <div className="flex justify-end gap-5 pt-2">
                  <button onClick={() => setSelectedSlides(slides.map((_, i) => i))} className="text-[10px] font-black uppercase text-[#8E8E93] hover:text-white transition-colors">Pilih Semua</button>
                  <button onClick={() => setSelectedSlides([])} className="text-[10px] font-black uppercase text-[#8E8E93] hover:text-white transition-colors">Bersihkan</button>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 pt-2">
          <button 
            onClick={() => onApply({ bgType, color, applyTo, selectedSlides, media: selectedMedia })}
            className="w-full h-16 bg-[#800000] hover:bg-[#a00000] text-white rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] group"
          >
            <Check size={24} className="group-hover:scale-110 transition-transform" />
            <span className="font-black text-[15px] uppercase tracking-[0.2em]">
              {applyTo === 'this' ? 'Terapkan Ke Slide Ini' : applyTo === 'selected' ? `Terapkan Ke Slide Terpilih (${selectedSlides.length})` : 'Terapkan Ke Semua Slide'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideBackgroundModal;
