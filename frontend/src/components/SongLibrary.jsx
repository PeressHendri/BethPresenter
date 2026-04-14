import React, { useState } from 'react';
import { Search, Plus, Music, Check, Clock, ChevronDown, Settings, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useDebounce } from '../hooks/useDebounce';

const SongLibrary = ({ setIsSongEditorOpen, setEditingSong }) => {
  const { songs = [], deleteSong, addToSchedule } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use debounced value for filtering to prevent UI lag
  const debouncedSearchQuery = useDebounce(searchTerm, 300);

  // Defensive check: Ensure songs is always an array
  const filteredSongs = Array.isArray(songs) ? songs.filter(s => {
    const query = (debouncedSearchQuery || '').toLowerCase();
    if (!query) return true;

    const title = (s?.title || '').toLowerCase();
    const author = (s?.author || '').toLowerCase();

    // Check tags
    let tagMatch = false;
    let slidesMatch = false;

    try {
        const tags = typeof s.tags === 'string' ? JSON.parse(s.tags) : (s.tags || []);
        tagMatch = tags.some(t => t.toLowerCase().includes(query));
    } catch(e) {}

    try {
        const slides = typeof s.slides === 'string' ? JSON.parse(s.slides) : (s.slides || []);
        slidesMatch = slides.some(sl => (sl.content || '').toLowerCase().includes(query));
    } catch(e) {}

    return title.includes(query) || author.includes(query) || tagMatch || slidesMatch;
  }) : [];

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E2E2E6] flex items-center gap-4">
         <div className="flex-1 relative">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AEAEB2]" />
           <input 
             placeholder="Cari lagu..." 
             className="w-full h-11 bg-[#F8F9FA] border border-[#E2E2E6] pl-12 pr-4 text-[14px] font-bold outline-none focus:bg-white focus:border-[#800000] focus:shadow-[0_0_0_4px_rgba(128,0,0,0.05)] transition-all" 
             value={searchTerm} 
             onChange={(e) => setSearchTerm(e.target.value)} 
           />
         </div>
         <button onClick={() => { setEditingSong(null); setIsSongEditorOpen(true); }} className="w-11 h-11 bg-[#80000010] border border-[#80000020] flex items-center justify-center text-[#800000] hover:bg-[#800000] hover:text-white transition-all"><Plus size={22} /></button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
         <div className="px-6 py-2.5 bg-[#F8F9FA] border-b flex justify-between items-center text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.15em]">
            <span>{filteredSongs.length} LAGU DITEMUKAN</span>
         </div>
         {filteredSongs.length > 0 ? (
            <div className="divide-y divide-[#F1F1F3]">
               {filteredSongs.map(song => (
                  <div key={song.id} className="px-8 py-5 flex items-center justify-between group hover:bg-[#80000005] cursor-pointer" onClick={() => addToSchedule(song)}>
                     <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-[#F8F9FA] flex items-center justify-center border group-hover:border-[#80000020] shrink-0">
                           <Music size={22} className="text-[#AEAEB2] group-hover:text-[#800000]" />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                           <div className="flex items-center gap-2 flex-wrap">
                               <h4 className="text-[16px] font-black group-hover:text-[#800000] truncate">{song.title}</h4>
                               {(() => {
                                 let tags = [];
                                 try { tags = typeof song.tags === 'string' ? JSON.parse(song.tags) : (song.tags || []); } catch(e){}
                                 return tags.slice(0, 2).map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-[#80000010] text-[#800000] rounded text-[8px] font-black uppercase tracking-widest border border-[#80000020] whitespace-nowrap">{tag}</span>
                                 ));
                               })()}
                           </div>
                           <div className="flex items-center gap-3">
                               <p className="text-[11px] font-black text-[#AEAEB2] uppercase tracking-wider truncate">{song.author || 'Unknown'}</p>
                               <div className="w-1 h-1 bg-[#E2E2E6] rounded-full"></div>
                               <p className="text-[9px] font-bold text-[#8E8E93] tracking-widest">{(() => {
                                 let slideCount = 0;
                                 try { slideCount = (typeof song.slides === 'string' ? JSON.parse(song.slides) : (song.slides || [])).length; } catch(e){}
                                 return slideCount;
                               })()} SLIDES</p>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setEditingSong(song); setIsSongEditorOpen(true); }} className="p-2 text-[#AEAEB2] hover:text-[#800000]"><Settings size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Yakin ingin menghapus lagu ini?')) deleteSong(song.id); }} className="p-2 text-[#AEAEB2] hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                        <div className="w-9 h-9 rounded-full bg-[#800000] text-white flex items-center justify-center shadow-lg"><Plus size={18} /></div>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="py-24 flex flex-col items-center justify-center opacity-30">
               <Music size={60} />
               <p className="mt-4 font-black">Lagu tidak ditemukan</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default SongLibrary;
