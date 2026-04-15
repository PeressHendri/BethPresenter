import React, { useState, useMemo } from 'react';
import { Search, Plus, Music, Settings, Trash2, Tag, X, Hash, FileText, ChevronDown } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useDebounce } from '../hooks/useDebounce';

const ALL_TAGS = ['Worship', 'Praise', 'Natal', 'Paskah', 'Advent', 'Persembahan', 'Doa', 'Fast', 'Slow', 'Bridge'];

const SongLibrary = ({ setIsSongEditorOpen, setEditingSong }) => {
  const { songs = [], deleteSong, addToSchedule, addSong, updateSong } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [searchMode, setSearchMode] = useState('title'); // 'title' | 'lyric'
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredSongs = useMemo(() => {
    if (!Array.isArray(songs)) return [];
    return songs.filter(s => {
      const q = (debouncedSearch || '').toLowerCase();
      const tagMatch = activeTag
        ? (s.tags || []).some(t => t.toLowerCase() === activeTag.toLowerCase())
        : true;

      if (!q) return tagMatch;

      if (searchMode === 'lyric') {
        const lyricsText = (s.slides || []).map(sl => sl.content || sl.text || '').join(' ').toLowerCase();
        return tagMatch && lyricsText.includes(q);
      }
      // Default: title + author
      const title = (s.title || '').toLowerCase();
      const author = (s.author || '').toLowerCase();
      return tagMatch && (title.includes(q) || author.includes(q));
    });
  }, [songs, debouncedSearch, activeTag, searchMode]);

  const handleDelete = (e, song) => {
    e.stopPropagation();
    if (window.confirm(`Hapus lagu "${song.title}"? Tindakan ini tidak bisa dibatalkan.`)) {
      deleteSong(song.id);
    }
  };

  const handleEdit = (e, song) => {
    e.stopPropagation();
    setEditingSong(song);
    setIsSongEditorOpen(true);
  };

  const handleAddToSchedule = (e, song) => {
    e.stopPropagation();
    addToSchedule(song);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* ─── TOOLBAR ─── */}
      <div className="px-6 py-3 border-b border-[#E2E2E6] flex items-center gap-3 bg-[#F8F9FA] shrink-0">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AEAEB2]" />
          <input
            placeholder={searchMode === 'lyric' ? 'Cari dari potongan lirik...' : 'Cari judul atau penulis...'}
            className="w-full h-10 bg-white border border-[#E2E2E6] pl-10 pr-4 text-[13px] font-semibold outline-none focus:bg-white focus:border-[#800000] focus:shadow-[0_0_0_4px_rgba(128,0,0,0.05)] transition-all rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#AEAEB2] hover:text-[#800000]">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Mode Toggle */}
        <div className="flex bg-white border border-[#E2E2E6] rounded overflow-hidden shrink-0">
          <button
            onClick={() => setSearchMode('title')}
            title="Cari Judul/Penulis"
            className={`w-9 h-10 flex items-center justify-center text-[11px] font-black transition-all ${searchMode === 'title' ? 'bg-[#800000] text-white' : 'text-[#AEAEB2] hover:text-[#800000]'}`}
          >
            <Hash size={15} />
          </button>
          <button
            onClick={() => setSearchMode('lyric')}
            title="Cari dari Lirik"
            className={`w-9 h-10 flex items-center justify-center transition-all ${searchMode === 'lyric' ? 'bg-[#800000] text-white' : 'text-[#AEAEB2] hover:text-[#800000]'}`}
          >
            <FileText size={15} />
          </button>
        </div>

        {/* Tag Filter Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowTagDropdown(p => !p)}
            className={`h-10 px-3 border rounded flex items-center gap-2 text-[12px] font-bold transition-all ${activeTag ? 'bg-[#800000] text-white border-[#800000]' : 'bg-white text-[#AEAEB2] border-[#E2E2E6] hover:border-[#80000040]'}`}
          >
            <Tag size={14} />
            <span>{activeTag || 'Tag'}</span>
            <ChevronDown size={12} />
          </button>
          {showTagDropdown && (
            <div className="absolute right-0 top-[calc(100%+4px)] bg-white border border-[#E2E2E6] rounded shadow-xl z-50 py-1 min-w-[140px]">
              <div
                onClick={() => { setActiveTag(null); setShowTagDropdown(false); }}
                className={`px-4 py-2 text-[12px] font-bold cursor-pointer hover:bg-[#80000008] ${!activeTag ? 'text-[#800000]' : 'text-[#6C6C70]'}`}
              >
                Semua Tag
              </div>
              {ALL_TAGS.map(t => (
                <div
                  key={t}
                  onClick={() => { setActiveTag(t); setShowTagDropdown(false); }}
                  className={`px-4 py-2 text-[12px] font-bold cursor-pointer hover:bg-[#80000008] flex items-center gap-2 ${activeTag === t ? 'text-[#800000] bg-[#80000008]' : 'text-[#6C6C70]'}`}
                >
                  <div className="w-2 h-2 rounded-full bg-[#800000]/40" />
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Song */}
        <button
          onClick={() => { setEditingSong(null); setIsSongEditorOpen(true); }}
          className="w-10 h-10 bg-[#800000] text-white flex items-center justify-center hover:bg-[#5C0000] transition-all rounded shadow-md shrink-0"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* ─── TAG CHIPS BAR ─── */}
      <div className="px-6 py-2 border-b border-[#F1F1F3] bg-white flex items-center gap-2 overflow-x-auto shrink-0 custom-scrollbar">
        <button
          onClick={() => setActiveTag(null)}
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap ${!activeTag ? 'bg-[#800000] text-white border-[#800000]' : 'bg-white text-[#AEAEB2] border-[#E2E2E6] hover:border-[#80000040]'}`}
        >
          Semua
        </button>
        {ALL_TAGS.map(t => (
          <button
            key={t}
            onClick={() => setActiveTag(activeTag === t ? null : t)}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap ${activeTag === t ? 'bg-[#800000] text-white border-[#800000]' : 'bg-white text-[#AEAEB2] border-[#E2E2E6] hover:border-[#80000040] hover:text-[#800000]'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ─── STATS BAR ─── */}
      <div className="px-6 py-2 bg-[#F8F9FA] border-b flex items-center justify-between text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.15em] shrink-0">
        <span>{filteredSongs.length} LAGU DITEMUKAN</span>
        {searchMode === 'lyric' && <span className="text-[#800000]">MODE: CARI LIRIK</span>}
      </div>

      {/* ─── SONG LIST ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" onClick={() => setShowTagDropdown(false)}>
        {filteredSongs.length > 0 ? (
          <div className="divide-y divide-[#F1F1F3]">
            {filteredSongs.map(song => {
              const slideCount = song.slides?.length || 0;
              const songTags = song.tags || [];
              return (
                <div
                  key={song.id}
                  className="px-6 py-4 flex items-center justify-between group hover:bg-[#80000005] cursor-pointer transition-colors"
                  onClick={(e) => handleAddToSchedule(e, song)}
                >
                  {/* Left: Icon + Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-[#F8F9FA] flex items-center justify-center border border-transparent group-hover:border-[#80000020] rounded-lg shrink-0 transition-colors">
                      <Music size={20} className="text-[#AEAEB2] group-hover:text-[#800000] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-black group-hover:text-[#800000] transition-colors truncate">{song.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-wider">{song.author || 'Unknown'}</p>
                        {slideCount > 0 && (
                          <span className="text-[9px] font-black bg-[#F1F1F3] text-[#8E8E93] px-2 py-0.5 rounded-full">
                            {slideCount} slide{slideCount > 1 ? 's' : ''}
                          </span>
                        )}
                        {songTags.map((t, i) => (
                          <span key={i} className="text-[9px] font-black bg-[#80000010] text-[#800000] px-2 py-0.5 rounded-full border border-[#80000020]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Action buttons (visible on hover) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3">
                    <button
                      title="Edit Lagu"
                      onClick={(e) => handleEdit(e, song)}
                      className="w-9 h-9 flex items-center justify-center text-[#AEAEB2] hover:text-[#800000] hover:bg-[#80000010] rounded-lg transition-all"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      title="Hapus Lagu"
                      onClick={(e) => handleDelete(e, song)}
                      className="w-9 h-9 flex items-center justify-center text-[#AEAEB2] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      title="Tambah ke Susunan Ibadah"
                      onClick={(e) => handleAddToSchedule(e, song)}
                      className="w-9 h-9 flex items-center justify-center bg-[#800000] text-white rounded-lg hover:bg-[#5C0000] transition-all shadow-md"
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center opacity-30">
            <Music size={56} />
            <p className="mt-4 font-black text-sm">
              {searchTerm || activeTag ? 'Lagu tidak ditemukan' : 'Belum ada lagu. Klik + untuk menambah.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongLibrary;
