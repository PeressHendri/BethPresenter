import React, { useState } from 'react';
import { Search, Plus, X, Music, ChevronRight } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const AddSongModal = ({ isOpen, onClose, onAddNew }) => {
  const { language, songs, addToSchedule } = useProject();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const t = {
    id: {
      title: "Tambah Lagu",
      searchPlaceholder: "Cari berdasarkan judul, penulis, atau lirik...",
      newSong: "Lagu Baru",
      noSongs: "Belum ada lagu",
      noResults: "Tidak ada lagu yang cocok dengan pencarian Anda"
    },
    en: {
      title: "Add Song",
      searchPlaceholder: "Search by title, author, or lyrics...",
      newSong: "New Song",
      noSongs: "No songs found",
      noResults: "No songs match your search"
    }
  }[language || 'id'];

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="absolute inset-0 bg-black/40 z-[200] flex items-center justify-center p-4 font-manrope">
       <div className="bg-white w-[640px] rounded-xl border border-[#E2E2E6] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="px-8 py-6 border-b border-[#F1F1F3] flex items-center justify-between">
             <h2 className="text-[20px] font-black text-[#2D2D2E] tracking-tight">{t.title}</h2>
             <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#AEAEB2] hover:text-[#800000] transition-all">
                <X size={20} />
             </button>
          </div>

          {/* Search & Actions */}
          <div className="px-8 py-6 border-b border-[#F1F1F3] flex gap-4 bg-[#F8F9FA]/30">
             <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AEAEB2]" />
                <input 
                   autoFocus
                   placeholder={t.searchPlaceholder}
                   className="w-full bg-white border border-[#E2E2E6] h-12 pl-12 pr-4 rounded-xl text-[14px] font-bold text-[#2D2D2E] focus:border-[#800000] outline-none transition-all shadow-sm"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <button 
                onClick={() => { onClose(); onAddNew(); }}
                className="flex items-center gap-2 bg-[#800000] text-white px-6 py-3 rounded-xl font-black text-[14px] shadow-lg hover:bg-[#5C0000] transition-all"
             >
                <Plus size={18} /> {t.newSong}
             </button>
          </div>

          {/* Song List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-white">
             {filteredSongs.length > 0 ? (
                <div className="divide-y divide-[#F1F1F3]">
                   {filteredSongs.map(song => (
                      <div 
                         key={song.id} 
                         onClick={() => {
                           addToSchedule(song);
                           onClose();
                         }}
                         className="px-8 py-5 flex items-center justify-between group hover:bg-[#80000005] cursor-pointer transition-colors"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#F8F9FA] rounded-xl flex items-center justify-center border border-[#E2E2E6] group-hover:border-[#80000020] transition-colors">
                               <Music size={18} className="text-[#8E8E93] group-hover:text-[#800000]" />
                            </div>
                            <div>
                               <h4 className="text-[14px] font-black text-[#2D2D2E] group-hover:text-[#800000]">{song.title}</h4>
                               <p className="text-[11px] font-bold text-[#AEAEB2] uppercase tracking-wide">{song.author}</p>
                            </div>
                         </div>
                         <div className="w-8 h-8 rounded-full border border-[#E2E2E6] flex items-center justify-center text-[#AEAEB2] group-hover:text-white group-hover:bg-[#800000] group-hover:border-[#800000] transition-all">
                            <Plus size={16} />
                         </div>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center px-12">
                   <div className="w-20 h-20 bg-[#F8F9FA] rounded-lg flex items-center justify-center mb-6">
                      <Music size={40} className="text-[#AEAEB2]" strokeWidth={1} />
                   </div>
                   <p className="text-[14px] font-black text-[#8E8E93]">{searchQuery ? t.noResults : t.noSongs}</p>
                   <p className="text-[12px] text-[#AEAEB2] mt-2 italic">You can start by creating a new song entry</p>
                </div>
             )}
          </div>

          {/* Footer Info */}
          <div className="px-8 py-4 bg-[#F8F9FA] border-t border-[#F1F1F3] flex justify-between items-center text-[#AEAEB2]">
             <span className="text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#800000]"></div> BETH SONG LIBRARY
             </span>
             <span className="text-[10px] font-bold italic">{filteredSongs.length} items available</span>
          </div>
       </div>
    </div>
  );
};

export default AddSongModal;
