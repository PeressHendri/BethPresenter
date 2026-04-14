import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { 
  GripVertical, Music, Layout, Image as ImageIcon, List, 
  Trash2, Monitor, EyeOff, ChevronLeft, ChevronRight, 
  Clock, Clapperboard, X, Check, FolderOpen, Globe, MonitorPlay, Plus,
  BookOpen, Timer, Loader2, Play, Pause, VolumeX, FolderIcon
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

// Import Custom Hooks and Utils
import { useThrottle } from '../hooks/useThrottle';
import { cleanupUnusedPreviews, unloadHiddenVideos } from '../utils/memoryCleanup';
import { logRenderTime } from '../utils/performanceMonitor';

// Import Static Components
import MainHeader from '../components/MainHeader';
import AddSongModal from '../components/AddSongModal';
import SongEditorModal from '../components/SongEditorModal';
import SlideBackgroundModal from '../components/SlideBackgroundModal';
import { Pencil } from 'lucide-react';
import SlideRenderer from '../components/SlideRenderer';

// LAZY LOAD HEAVY COMPONENTS
const BibleView = lazy(() => import('../components/BibleView'));
const CountdownView = lazy(() => import('../components/CountdownView'));
const SongLibrary = lazy(() => import('../components/SongLibrary'));
const MediaView = lazy(() => import('../components/MediaView'));
const StageView = lazy(() => import('../components/StageView'));

// --- UI Sub-Components ---

const TabLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
    <Loader2 size={32} className="animate-spin text-[#800000] mb-4" />
    <span className="text-[12px] font-bold text-[#2D2D2E]">Memuat modul...</span>
  </div>
);

const NavItem = React.memo(({ icon: Icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-6 h-full cursor-pointer transition-all border-r border-[#E2E2E6]/50 ${active ? 'bg-[#800000] text-white' : 'text-[#8E8E93] hover:text-[#2D2D2E] hover:bg-[#F1F1F3]'}`}>
    <Icon size={17} strokeWidth={2} /><span className="text-[13px] font-bold">{label}</span>
  </div>
));

const ScheduleItem = React.memo(({ item, idx, selectedItemIndex, onClick, onRemove }) => {
  const isSelected = selectedItemIndex === idx;
  const isMedia = item.type === 'media' || item.type === 'image' || item.type === 'video' || item.type === 'ppt' || item.type === 'Media';
  const mediaUrl = item.url || (item.slides && item.slides[0]?.url);

  return (
    <Reorder.Item 
      value={item} 
      onTap={() => {
        console.log('Schedule Item Tapped:', { idx, title: item.title });
        onClick(idx);
      }}
      className={`px-4 py-3 border-b border-[#F1F1F3] flex items-center gap-3 cursor-pointer transition-all group relative ${isSelected ? 'bg-[#80000010] border-l-4 border-l-[#800000]' : 'hover:bg-[#F8F9FA] bg-white'}`}
    >
       <div className="flex items-center text-[#AEAEB2] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0 z-10">
          <GripVertical size={16} />
       </div>
       
       <div className={`w-12 h-12 rounded-lg flex items-center justify-center border shrink-0 overflow-hidden relative z-10 ${isSelected ? 'bg-white border-[#800000] text-[#800000] shadow-lg shadow-[#80000010]' : 'bg-[#F1F1F3] border-transparent text-[#AEAEB2]'}`}>
          {item.type === 'song' ? <Music size={18} /> : item.type === 'blank' ? <Layout size={18} /> : isMedia ? (
            <div className="w-full h-full relative">
               {item.type === 'video' || mediaUrl?.match(/\.(mp4|webm|ogg|mov|m4v)$/i) ? (
                 <>
                   <video src={mediaUrl} className="w-full h-full object-cover grayscale-[0.5]" muted />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Play size={12} fill="white" className="text-white" /></div>
                 </>
               ) : item.type === 'ppt' ? (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50">
                    <MonitorPlay size={18} className="text-blue-600" />
                    <span className="text-[7px] font-black text-blue-800 uppercase mt-0.5 tracking-tighter">PPT</span>
                 </div>
               ) : <img src={mediaUrl} className="w-full h-full object-cover" alt="" />}
            </div>
          ) : <ImageIcon size={18} />}
       </div>

       <div className="flex-1 min-w-0 z-10 pointer-events-none">
          <h4 className={`text-[12px] font-[900] truncate uppercase tracking-tight ${isSelected ? 'text-[#800000]' : 'text-[#2D2D2E]'}`}>{item.title}</h4>
          <div className="flex items-center gap-2 mt-1">
             <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${isSelected ? 'bg-[#800000] text-white' : 'bg-[#AEAEB220] text-[#AEAEB2]'}`}>{item.type}</span>
             {item.author && <span className="text-[9px] font-bold text-[#AEAEB2] truncate opacity-60">/ {item.author}</span>}
          </div>
       </div>
       
       <button 
         onClick={(e) => { e.stopPropagation(); onRemove(item.instanceId); }} 
         className="opacity-0 group-hover:opacity-100 p-2 text-[#AEAEB2] hover:text-[#800000] z-20 relative transition-all"
       >
         <Trash2 size={14}/>
       </button>
    </Reorder.Item>
  );
});

const SlidePreview = React.memo(({ slide, sIdx, selectedItem, liveState, onClick, onEdit, onBackground }) => {
  const isLive = liveState.songId === (selectedItem.instanceId || selectedItem.id) && liveState.slideIndex === sIdx;
  const bg = slide.background || {};
  const hasBg = bg.type && bg.type !== 'Solid Color' ? !!bg.mediaUrl : !!bg.color;

  return (
    <div onClick={() => onClick(sIdx)} 
         className={`aspect-video border-2 cursor-pointer transition-all overflow-hidden relative shadow-sm group rounded-lg ${isLive ? 'border-[#800000] ring-4 ring-[#80000020]' : 'border-white/10 hover:border-[#80000040]'}`}>
       <div className="absolute inset-0 pointer-events-none">
          <SlideRenderer 
            slide={slide}
            format={slide.format || selectedItem.format}
            globalBg={liveState.globalBackground}
            showLabel={false}
            showLiveIndicator={false}
          />
       </div>
       <div className="absolute inset-0 bg-black/10 z-[1] group-hover:bg-black/0 transition-colors" />
       
       <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-5px] group-hover:translate-y-0 z-20">
          <button onClick={(e) => { e.stopPropagation(); onEdit(selectedItem); }} className="w-7 h-7 bg-black/70 text-white rounded-lg flex items-center justify-center hover:bg-black transition-colors"><Pencil size={12} /></button>
          <button onClick={(e) => { e.stopPropagation(); onBackground(sIdx); }} className="w-7 h-7 bg-black/70 text-white rounded-lg flex items-center justify-center hover:bg-[#800000] transition-colors"><ImageIcon size={12} /></button>
       </div>

       <div className="absolute top-2 left-2 flex gap-1 z-10">
          <div className="bg-black/50 text-white px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter rounded-sm">{sIdx + 1}</div>
          {slide.label && <div className="bg-black/50 text-white px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter rounded-sm">{slide.label}</div>}
       </div>
    </div>
  );
});

const FlowItem = React.memo(({ item, idx, selectedItemIndex }) => (
  <div className={`px-5 py-3 border-b border-[#F1F1F3] flex items-center justify-between transition-all ${selectedItemIndex === idx ? 'bg-[#80000008] border-l-2 border-[#800000]' : 'opacity-60 bg-white hover:opacity-100'}`}>
    <div className="flex items-center gap-3">
       <span className={`text-[12px] font-black truncate uppercase tracking-tight ${selectedItemIndex === idx ? 'text-[#800000]' : 'text-[#2D2D2E]'}`}>{item.title}</span>
    </div>
    <div className="text-[9px] font-black text-[#AEAEB2] uppercase tracking-widest">{item.type}</div>
  </div>
));

// --- Main Panels ---

const SchedulePanel = React.memo(({ t, setIsAddSongModalOpen }) => {
  const { schedule, setSchedule, selectedItemIndex, setSelectedItemIndex, removeFromSchedule, addBlankToSchedule } = useProject();
  
  const handleItemClick = useCallback((idx) => setSelectedItemIndex(idx), [setSelectedItemIndex]);
  const handleRemove = useCallback((id) => removeFromSchedule(id), [removeFromSchedule]);

  return (
    <div className="w-[300px] border-r border-[#E2E2E6] flex flex-col bg-white">
       <div className="px-5 py-3 border-b border-[#F1F1F3] bg-[#F8F9FA] flex justify-between items-center h-[56px]">
          <span className="text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.1em]">{t.schedule}</span>
          <div className="flex items-center gap-1">
             <button onClick={() => setIsAddSongModalOpen(true)} className="p-1.5 text-[#800000] hover:bg-[#80000010] rounded-md"><Plus size={18}/></button>
             <button onClick={addBlankToSchedule} className="p-1.5 text-[#AEAEB2] hover:bg-[#F8F9FA] rounded-md"><Layout size={16}/></button>
          </div>
       </div>
       <div className="flex-1 overflow-y-auto custom-scrollbar">
          {schedule.length > 0 ? (
            <Reorder.Group axis="y" values={schedule} onReorder={setSchedule} className="flex flex-col">
              <AnimatePresence initial={false}>
                {schedule.map((item, idx) => (
                  <ScheduleItem key={item.instanceId} item={item} idx={idx} selectedItemIndex={selectedItemIndex} onClick={handleItemClick} onRemove={handleRemove} />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-40">
                <p className="text-[14px] font-bold text-[#2D2D2E]">{t.noItems}</p>
             </div>
          )}
       </div>
    </div>
  );
});

const PreviewPanel = React.memo(({ t, liveState, setLiveSlide, setIsSongEditorOpen, setEditingSong, setIsBgModalOpen }) => {
  const { schedule, selectedItemIndex } = useProject();
  const selectedItem = useMemo(() => selectedItemIndex !== null ? schedule[selectedItemIndex] : null, [schedule, selectedItemIndex]);

  const handleSlideClick = useCallback((sIdx) => setLiveSlide(selectedItem, sIdx), [setLiveSlide, selectedItem]);
  const handleMediaClick = useCallback(() => setLiveSlide(selectedItem, 0), [setLiveSlide, selectedItem]);

  // Media Control States (Internal for preview)
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F1F1F3]/50 p-6 flex flex-col">
       {selectedItem ? (
          <div className="flex-1 flex flex-col items-center">
              { (selectedItem.type === 'media' || selectedItem.type === 'image' || selectedItem.type === 'video' || selectedItem.type === 'ppt' || selectedItem.type === 'Media') ? (
                <div className="max-w-4xl w-full flex-1 flex flex-col justify-center">
                   <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-6 bg-[#800000] rounded-full"></div>
                         <h2 className="text-[14px] font-[900] text-[#2D2D2E] uppercase tracking-tighter">{selectedItem.title}</h2>
                      </div>
                      <div className="bg-[#800000]/10 text-[#800000] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#800000]/20">
                         {selectedItem.type === 'ppt' ? 'PowerPoint Display' : 'Media Monitor'}
                      </div>
                   </div>

                   <div onClick={handleMediaClick} className={`aspect-video border-2 bg-black rounded-2xl flex items-center justify-center cursor-pointer transition-all overflow-hidden relative shadow-2xl group ${liveState.songId === (selectedItem.instanceId || selectedItem.id) ? 'border-[#800000] ring-4 ring-[#80000010]' : 'border-white hover:border-[#80000040]'}`}>
                      <SlideRenderer 
                        slide={selectedItem} 
                        format={selectedItem.format || liveState.format} 
                        globalBg={liveState.globalBackground} 
                        showLabel={true} 
                        showLiveIndicator={liveState.songId === (selectedItem.instanceId || selectedItem.id)} 
                        showControls={true} 
                        isPlaying={isPlaying}
                        isMuted={isMuted}
                        isLoop={isLooping}
                        className="scale-[1.01]"
                      />
                      {liveState.songId !== (selectedItem.instanceId || selectedItem.id) && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-20">
                           <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
                             <Play size={44} className="text-white fill-white transform translate-x-1" />
                           </div>
                        </div>
                      )}
                   </div>
                   
                   {/* DEDICATED MEDIA COMMAND BAR */}
                   <div className="mt-8 bg-white border border-[#E2E2E6] rounded-3xl p-5 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={handleMediaClick} 
                                className={`h-12 px-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-lg ${liveState.songId === (selectedItem.instanceId || selectedItem.id) ? 'bg-[#800000] text-white shadow-[#80000030]' : 'bg-[#1A1A1A] text-white shadow-black/10 hover:bg-black'}`}>
                           {liveState.songId === (selectedItem.instanceId || selectedItem.id) ? (
                             <><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> SEDANG LIVE</>
                           ) : (
                             <><Clapperboard size={16} /> TAYANGKAN LIVE</>
                           )}
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <div className="flex items-center gap-1 bg-[#F1F1F3] p-1 rounded-2xl border border-[#E2E2E6]">
                            <button onClick={() => setIsLooping(!isLooping)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isLooping ? 'bg-white text-[#800000] shadow-sm' : 'text-[#8E8E93] hover:text-[#2D2D2E]'}`} title="Ulangi (Loop)"><Timer size={18} /></button>
                            <button onClick={() => setIsMuted(!isMuted)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isMuted ? 'bg-white text-[#800000] shadow-sm' : 'text-[#8E8E93] hover:text-[#2D2D2E]'}`} title="Bisu (Mute)"><VolumeX size={18} /></button>
                         </div>
                         <div className="w-px h-8 bg-[#E2E2E6] mx-3" />
                         <div className="flex items-center gap-2">
                            <button onClick={() => { if(selectedItemIndex > 0) handleItemClick(selectedItemIndex - 1); }} 
                                    className="w-10 h-10 flex items-center justify-center text-[#2D2D2E] hover:bg-[#F1F1F3] rounded-xl transition-all" title="Sebelumnya">
                               <ChevronLeft size={24}/>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} 
                                    className="w-14 h-14 bg-[#80000010] text-[#800000] rounded-2xl flex items-center justify-center hover:bg-[#800000] hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-[#80000010]">
                              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                            </button>
                            <button onClick={() => { if(selectedItemIndex < schedule.length - 1) handleItemClick(selectedItemIndex + 1); }}
                                    className="w-10 h-10 flex items-center justify-center text-[#2D2D2E] hover:bg-[#F1F1F3] rounded-xl transition-all" title="Selanjutnya">
                               <ChevronRight size={24}/></button>
                         </div>
                      </div>

                      <div className="flex items-center gap-4 text-[#AEAEB2]">
                         <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#2D2D2E]">Broadcast</span>
                            <span className="text-[8px] font-bold uppercase tracking-widest">4K Engine</span>
                         </div>
                      </div>
                   </div>
                   
                   <p className="mt-6 text-center text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.3em] opacity-40">Monitor Preview ini hanya untuk operator (tidak tampil di proyektor)</p>
                </div>
              ) : (
                <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                   {selectedItem.slides?.map((slide, sIdx) => (
                      <SlidePreview key={sIdx} slide={slide} sIdx={sIdx} selectedItem={selectedItem} liveState={liveState} onClick={handleSlideClick} onEdit={(song) => { setEditingSong(song); setIsSongEditorOpen(true); }} onBackground={() => setIsBgModalOpen(true)} />
                   ))}
                </div>
              )}
          </div>
       ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
             <div className="w-20 h-20 bg-[#AEAEB2]/10 rounded-3xl flex items-center justify-center mb-6 border border-[#AEAEB2]/20"><Monitor size={40} /></div>
             <h3 className="text-[20px] font-black text-[#2D2D2E] uppercase tracking-tighter">Pilih Jadwal untuk Mulai</h3>
             <p className="text-[11px] font-bold mt-2 uppercase tracking-[0.3em] text-[#8E8E93]">Sistem Siap Menayangkan</p>
          </div>
       )}
    </div>
  );
});

const FlowPanel = React.memo(({ t, liveState, goToNextSlide, goToPrevSlide, toggleBlank, isLive, isRehearsal, setIsLive, setIsRehearsal, outputWindow, setOutputWindow }) => {
  const { schedule, selectedItemIndex } = useProject();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 60000);
    return () => clearInterval(timer);
  }, []);

  const flowSlice = useMemo(() => schedule.slice(0, 15), [schedule]);

  return (
    <aside className="w-[380px] border-l border-[#E2E2E6] flex flex-col bg-white text-[#2D2D2E] shrink-0">
       {/* STATUS BAR */}
       <div className={`h-[48px] px-5 flex justify-between items-center text-white shrink-0 ${isLive || isRehearsal ? 'bg-[#800000]' : 'bg-[#1A1A1A]'}`}>
          <div className="flex items-center gap-3">
             <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-xl ${(isLive || isRehearsal) ? 'bg-red-400' : 'bg-green-400'}`}></div>
             <span className="text-[12px] font-black tracking-widest uppercase">{isLive ? 'LIVE' : isRehearsal ? 'LATIHAN' : 'PRATINJAU'}</span>
          </div>
          {(isLive || isRehearsal) && (
            <button onClick={() => { if(isLive) { outputWindow?.close(); setOutputWindow(null); setIsLive(false); } else { setIsRehearsal(false); } }} 
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 transition-all text-[10px] font-black uppercase rounded">
               <X size={14} /> {isLive ? 'Akhiri Live' : 'Akhiri Latihan'}
            </button>
          )}
          {!isLive && !isRehearsal && (
            <button onClick={() => setIsRehearsal(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 transition-all text-[10px] font-black uppercase rounded">
               <Clapperboard size={14} /> Mulai Latihan
            </button>
          )}
       </div>

       {/* MONITOR LIVE */}
       <div className="p-6 pb-0 flex flex-col space-y-4">
           <div className="aspect-video bg-black rounded-xl border border-[#E2E2E6] shadow-2xl relative overflow-hidden group">
              <SlideRenderer slide={liveState} format={liveState.format} globalBg={liveState.globalBackground} showLabel={true} showLiveIndicator={isLive && !isRehearsal} />
              <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-xl" />
           </div>

           <div className="flex gap-[1px] bg-[#E2E2E6] rounded-xl overflow-hidden border border-[#E2E2E6] shadow-sm">
              <button onClick={goToPrevSlide} className="flex-1 h-12 bg-white hover:bg-[#800000] hover:text-white text-[#2D2D2E] flex items-center justify-center transition-all"><ChevronLeft size={20}/></button>
              <button onClick={toggleBlank} className={`flex-1 h-12 flex items-center justify-center transition-all ${liveState.isBlank ? 'bg-[#800000] text-white' : 'bg-white text-[#AEAEB2] hover:text-[#800000]'}`}><EyeOff size={18}/></button>
              <button className="flex-1 h-12 bg-white text-[#AEAEB2] hover:text-[#800000] flex items-center justify-center font-black text-[12px] tracking-widest uppercase">CC</button>
              <button onClick={goToNextSlide} className="flex-1 h-12 bg-white hover:bg-[#800000] hover:text-white text-[#2D2D2E] flex items-center justify-center transition-all"><ChevronRight size={20}/></button>
           </div>
       </div>

       {/* MONITOR BERIKUTNYA */}
       <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col mt-4">
          <div className="px-6 py-3 flex items-center gap-2 text-[10px] font-black uppercase text-[#8E8E93] tracking-[0.2em] border-t border-[#F1F1F3]">
             <div className="w-1.5 h-4 bg-[#800000]/20 rounded-full"></div>
             <span>Berikutnya</span>
          </div>
          
          <div className="px-6 pb-6">
             <div className="aspect-video bg-[#0a0a0a] rounded-xl border border-[#E2E2E6] shadow-lg relative overflow-hidden group bg-monitor">
                {(() => {
                  let nextSlide = null;
                  let nextFormat = liveState.format;
                  if (selectedItemIndex !== null) {
                    const currentItem = schedule[selectedItemIndex];
                    if (currentItem.type === 'media' || currentItem.type === 'image' || currentItem.type === 'video' || currentItem.type === 'ppt' || currentItem.type === 'Media') {
                       if (selectedItemIndex < schedule.length - 1) {
                         const nextItem = schedule[selectedItemIndex + 1];
                         nextSlide = nextItem.type === 'media' ? nextItem : nextItem.slides[0];
                         nextFormat = nextItem.format || liveState.format;
                       }
                    } else {
                        if (liveState.slideIndex < currentItem.slides.length - 1) {
                          nextSlide = currentItem.slides[liveState.slideIndex + 1];
                          nextFormat = currentItem.format || liveState.format;
                        } else if (selectedItemIndex < schedule.length - 1) {
                          const nextItem = schedule[selectedItemIndex + 1];
                          nextSlide = nextItem.type === 'media' ? nextItem : nextItem.slides[0];
                          nextFormat = nextItem.format || liveState.format;
                        }
                    }
                  }
                  if (nextSlide) {
                    return <SlideRenderer slide={nextSlide} format={nextFormat} globalBg={liveState.globalBackground} showLabel={false} showLiveIndicator={false} className="opacity-60 scale-[0.98]" />;
                  }
                  return (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-[#AEAEB2]">
                       <EyeOff size={24} className="mb-2" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Selesai</span>
                    </div>
                  );
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
             </div>
          </div>

          <div className="px-6 py-3 flex items-center gap-2 text-[10px] font-black uppercase text-[#8E8E93] tracking-[0.2em] border-y border-[#F1F1F3] bg-[#F8F9FA]">
             <List size={14} />
             <span>Alur Ibadah</span>
          </div>
          <div className="flex flex-col bg-white">
            {flowSlice.map((item, idx) => (
              <FlowItem key={item.instanceId || idx} item={item} idx={idx} selectedItemIndex={selectedItemIndex} />
            ))}
          </div>
       </div>

       {/* FOOTER CLOCK */}
       <div className="h-14 border-t border-[#F1F1F3] px-6 flex items-center justify-between text-[14px] font-black bg-white shrink-0">
          <div className="flex items-center gap-2 text-[#800000] font-[900]"><Clock size={16} className="opacity-30" /> {currentTime}</div>
          <div className="flex gap-4 text-[10px] font-black text-[#AEAEB2] uppercase tracking-tighter">
             <div className="flex items-center gap-1"><div className="w-5 h-5 bg-[#F8F9FA] border border-[#E2E2E6] flex items-center justify-center rounded text-[8px] tracking-normal">←</div> <div className="w-5 h-5 bg-[#F8F9FA] border border-[#E2E2E6] flex items-center justify-center rounded text-[8px] tracking-normal">→</div> NAV</div>
             <div className="flex items-center gap-1"><div className="w-5 h-5 bg-[#F8F9FA] border border-[#E2E2E6] flex items-center justify-center rounded text-[8px] tracking-normal">B</div> KOSONG</div>
          </div>
       </div>
    </aside>
  );
});

// --- Main Page Wrapper ---

const PresentationPage = () => {
  const { 
    activeTab, setActiveTab, language, isLive, setIsLive, isRehearsal, setIsRehearsal, 
    outputWindow, setOutputWindow, schedule, setSchedule, selectedItemIndex, setSelectedItemIndex,
    liveState, setLiveSlide, toggleBlank, addBlankToSchedule
  } = useProject();

  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [isSongEditorOpen, setIsSongEditorOpen] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  useEffect(() => {
    console.log("PRESENTATION_PAGE_STATE:", { selectedItemIndex, hasSchedule: schedule.length > 0 });
  }, [selectedItemIndex, schedule]);

  useEffect(() => {
    const memoryInterval = setInterval(() => {
      cleanupUnusedPreviews();
      unloadHiddenVideos();
    }, 5 * 60 * 1000);
    return () => clearInterval(memoryInterval);
  }, []);

  const t = useMemo(() => ({
    id: { schedule: "SUSUNAN IBADAH", noItems: "Kosong", preview: "PRATINJAU", practice: "Latihan", rehearsal: "LATIHAN", endRehearsal: "Akhiri Latihan", endLive: "Akhiri Live", noSlides: "Belum pilih item", next: "BERIKUTNYA", serviceFlow: "ALUR IBADAH", endPresent: "Selesai", navigation: "Navigasi", tabs: { presentasi: "Presentasi", lagu: "Lagu", alkitab: "Alkitab", media: "Media", countdown: "Countdown", panggung: "Panggung" }, addSong: "Lagu", addMedia: "Media", localFiles: "File", powerpoint: "PPT", browser: "Web", empty: "Blank" },
    en: { schedule: "SCHEDULE", noItems: "No items", preview: "PREVIEW", practice: "Practice", rehearsal: "REHEARSAL", endRehearsal: "End Practice", endLive: "End Live", noSlides: "No slides", next: "NEXT", serviceFlow: "SERVICE FLOW", endPresent: "End", navigation: "Navigation", tabs: { presentasi: "Presentation", lagu: "Songs", alkitab: "Bible", media: "Media", countdown: "Countdown", panggung: "Stage" }, addSong: "Add Song", addMedia: "Add Media", localFiles: "Local", powerpoint: "PPT", browser: "Web", empty: "Blank" }
  }[language]), [language]);

  const goToNextSlide = useThrottle(() => {
    if (selectedItemIndex === null) return;
    const currentItem = schedule[selectedItemIndex];
    if (liveState.slideIndex < currentItem.slides.length - 1) {
      setLiveSlide(currentItem, liveState.slideIndex + 1);
    } else if (selectedItemIndex < schedule.length - 1) {
      setSelectedItemIndex(selectedItemIndex + 1);
      setLiveSlide(schedule[selectedItemIndex + 1], 0);
    }
  }, 150);

  const goToPrevSlide = useThrottle(() => {
    if (selectedItemIndex === null) return;
    if (liveState.slideIndex > 0) {
      setLiveSlide(schedule[selectedItemIndex], liveState.slideIndex - 1);
    } else if (selectedItemIndex > 0) {
      setSelectedItemIndex(selectedItemIndex - 1);
      const prevItem = schedule[selectedItemIndex - 1];
      setLiveSlide(prevItem, prevItem.slides.length - 1);
    }
  }, 150);

  const ServiceToolbar = () => (
    <div className="h-[48px] bg-[#F8F9FA] border-b border-[#E2E2E6] flex items-center px-4 gap-2 shrink-0">
       <button onClick={() => setIsAddSongModalOpen(true)} className="h-9 px-4 border border-[#E2E2E6] bg-white hover:border-[#80000040] flex items-center gap-2 text-[12px] font-black tracking-tight rounded-md transition-colors"><Music size={15} className="text-[#800000]" /> Tambah Lagu</button>
       <button onClick={() => setActiveTab('media')} className="h-9 px-4 border border-[#E2E2E6] bg-white hover:border-[#80000040] flex items-center gap-2 text-[12px] font-black tracking-tight rounded-md transition-colors"><ImageIcon size={15} className="text-[#800000]" /> Tambah Media</button>
       <button className="h-9 px-4 border border-[#E2E2E6] bg-white hover:border-[#80000040] flex items-center gap-2 text-[12px] font-black tracking-tight rounded-md"><FolderOpen size={15} className="text-[#800000]" /> File Lokal</button>
       <button className="h-9 px-4 border border-[#E2E2E6] bg-white hover:border-[#80000040] flex items-center gap-2 text-[12px] font-black tracking-tight rounded-md"><MonitorPlay size={15} className="text-[#800000]" /> Power Point</button>
       <button onClick={() => addBlankToSchedule()} className="h-9 px-4 border border-[#E2E2E6] bg-white hover:border-[#80000040] flex items-center gap-2 text-[12px] font-black tracking-tight rounded-md opacity-60"><Layout size={15} /> Kosong</button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white text-[#2D2D2E] font-['Outfit'] select-none">
      <MainHeader />
      
      <div className="h-[52px] bg-white border-b border-[#E2E2E6] flex items-center shrink-0">
         {Object.keys(t.tabs).map(key => (
           <NavItem key={key} icon={key === 'lagu' ? Music : key === 'alkitab' ? BookOpen : key === 'media' ? Clapperboard : key === 'countdown' ? Timer : key === 'panggung' ? MonitorPlay : Layout} 
                    label={t.tabs[key]} active={activeTab === key} onClick={() => setActiveTab(key)} />
         ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
           {activeTab === 'presentasi' ? (
             <>
               <ServiceToolbar />
               <div className="flex-1 flex overflow-hidden">
                  <SchedulePanel t={t} setIsAddSongModalOpen={setIsAddSongModalOpen} />
                  <PreviewPanel t={t} liveState={liveState} setLiveSlide={setLiveSlide} setIsSongEditorOpen={setIsSongEditorOpen} setEditingSong={setEditingSong} setIsBgModalOpen={setIsBgModalOpen} />
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col overflow-hidden">
               <Suspense fallback={<TabLoader />}>
                 {activeTab === 'lagu' ? <SongLibrary setIsSongEditorOpen={setIsSongEditorOpen} setEditingSong={setEditingSong} /> : 
                  activeTab === 'alkitab' ? <BibleView /> : 
                  activeTab === 'media' ? <MediaView /> : 
                  activeTab === 'countdown' ? <CountdownView /> : <StageView />}
               </Suspense>
             </div>
           )}
        </div>

        <FlowPanel t={t} liveState={liveState} goToNextSlide={goToNextSlide} goToPrevSlide={goToPrevSlide} toggleBlank={toggleBlank}
                    isLive={isLive} isRehearsal={isRehearsal} setIsLive={setIsLive} setIsRehearsal={setIsRehearsal} 
                    outputWindow={outputWindow} setOutputWindow={setOutputWindow} />
      </div>

      <AddSongModal isOpen={isAddSongModalOpen} onClose={() => setIsAddSongModalOpen(false)} onAddNew={() => { setEditingSong(null); setIsSongEditorOpen(true); }} />
      <SongEditorModal isOpen={isSongEditorOpen} onClose={() => { setIsSongEditorOpen(false); setEditingSong(null); }} song={editingSong} />
      <SlideBackgroundModal 
        isOpen={isBgModalOpen} 
        onClose={() => setIsBgModalOpen(false)} 
        onApply={(data) => { 
          if (selectedItemIndex === null) return;
          try {
            const newSchedule = [...schedule];
            const originalItem = newSchedule[selectedItemIndex];
            if (!originalItem) return;
            const item = { ...originalItem };
            const newSlides = [...(item.slides || [])];
            const bgData = {
              type: data.bgType,
              color: data.bgType === 'Solid Color' ? data.color : null,
              mediaUrl: data.media ? `http://localhost:5000${data.media.path}` : (data.bgType === 'Solid Color' ? data.color : null),
              mediaType: data.bgType === 'Video (MP4)' ? 'video' : (data.bgType === 'Image' ? 'image' : 'color')
            };
            if (data.applyTo === 'this') {
              const currentIdx = liveState.slideIndex;
              if (newSlides[currentIdx]) newSlides[currentIdx] = { ...newSlides[currentIdx], background: bgData };
            } else if (data.applyTo === 'selected') {
              data.selectedSlides.forEach(idx => { if (newSlides[idx]) newSlides[idx] = { ...newSlides[idx], background: bgData }; });
            } else {
              item.slides = newSlides.map(s => ({ ...s, background: bgData }));
            }
            if (data.applyTo !== 'all') item.slides = newSlides;
            newSchedule[selectedItemIndex] = item;
            setSchedule(newSchedule);
            setIsBgModalOpen(false);
            if (liveState.songId === (item.instanceId || item.id)) setLiveSlide(item, liveState.slideIndex);
          } catch (err) { console.error(err); alert("Gagal menerapkan background"); }
        }} 
        slides={selectedItemIndex !== null ? (schedule[selectedItemIndex]?.slides || []) : []}
        currentSlideIndex={liveState.slideIndex}
      />
    </div>
  );
};

export default PresentationPage;
