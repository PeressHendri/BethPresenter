import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { 
  GripVertical, Music, Layout, Image as ImageIcon, List, 
  Trash2, Monitor, EyeOff, ChevronLeft, ChevronRight, 
  Clock, Clapperboard, X, Check, FolderOpen, Globe, MonitorPlay, Plus,
  BookOpen, Timer, Loader2
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

// Import Custom Hooks and Utils
import { useThrottle } from '../hooks/useThrottle';
import { clearOldHistory, cleanupUnusedPreviews, unloadHiddenVideos } from '../utils/memoryCleanup';
import { logRenderTime } from '../utils/performanceMonitor';

// Import Static Components
import MainHeader from '../components/MainHeader';
import AddSongModal from '../components/AddSongModal';
import SongEditorModal from '../components/SongEditorModal';

// LAZY LOAD HEAVY COMPONENTS
const BibleView = lazy(() => import('../components/BibleView'));
const CountdownView = lazy(() => import('../components/CountdownView'));
const SongLibrary = lazy(() => import('../components/SongLibrary'));
const MediaView = lazy(() => import('../components/MediaView'));
const StageView = lazy(() => import('../components/StageView'));

// Loading Fallback
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

// --- Memos & Render Optimizations ---

const ScheduleItem = React.memo(({ item, idx, selectedItemIndex, onClick, onRemove }) => {
  const isSelected = selectedItemIndex === idx;
  return (
    <Reorder.Item value={item} onClick={() => onClick(idx)} 
      className={`px-4 py-4 border-b border-[#F1F1F3] cursor-pointer flex items-center gap-3 transition-all group relative ${isSelected ? 'bg-[#80000010] border-l-4 border-l-[#800000]' : 'hover:bg-[#F8F9FA] bg-white'}`}>
       <div className="flex items-center text-[#AEAEB2] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"><GripVertical size={16} /></div>
       <div className={`w-10 h-10 flex items-center justify-center border shrink-0 ${isSelected ? 'bg-white border-[#80000020] text-[#800000]' : 'bg-[#F1F1F3] border-transparent text-[#AEAEB2]'}`}>
          {item.type === 'song' ? <Music size={18} /> : item.type === 'blank' ? <Layout size={18} /> : <ImageIcon size={18} />}
       </div>
       <div className="flex-1 min-w-0">
          <h4 className={`text-[13px] font-black truncate ${isSelected ? 'text-[#800000]' : 'text-[#2D2D2E]'}`}>{item.title}</h4>
          <p className="text-[10px] font-bold text-[#AEAEB2] uppercase truncate">{item.author || (item.type === 'song' ? 'Song' : 'System')}</p>
       </div>
       <button onClick={(e) => { e.stopPropagation(); onRemove(item.instanceId); }} className="opacity-0 group-hover:opacity-100 p-1.5 text-[#AEAEB2] hover:text-[#800000]"><Trash2 size={14}/></button>
    </Reorder.Item>
  );
});

const SlidePreview = React.memo(({ slide, sIdx, selectedItem, liveState, onClick }) => {
  const isLive = liveState.songId === (selectedItem.instanceId || selectedItem.id) && liveState.slideIndex === sIdx;
  return (
    <div onClick={() => onClick(sIdx)} 
         className={`aspect-video border-2 cursor-pointer transition-all overflow-hidden relative bg-white shadow-sm ${isLive ? 'border-[#800000] ring-4 ring-[#80000010]' : 'border-white hover:border-[#80000040]'}`}>
       <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
          <p className={`text-[11px] font-black line-clamp-3 leading-tight ${isLive ? 'text-[#800000]' : 'text-[#2D2D2E]'}`}>{slide.content}</p>
       </div>
       <div className="absolute top-2 left-2 flex gap-1">
          <div className="bg-[#1A1A1A]/50 text-white px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter">{sIdx + 1}</div>
          {slide.label && <div className="bg-[#F1F1F3] text-[#8E8E93] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter border border-[#E2E2E6]">{slide.label}</div>}
       </div>
    </div>
  );
});

const FlowItem = React.memo(({ item, idx, selectedItemIndex }) => (
  <div className={`px-5 py-3 border-b border-[#F1F1F3] flex items-center justify-between ${selectedItemIndex === idx ? 'bg-[#80000010]' : 'opacity-60'}`}>
    <div className="flex items-center gap-3">
       <div className={`w-1.5 h-1.5 ${selectedItemIndex === idx ? 'bg-[#800000]' : 'bg-[#AEAEB2]'}`}></div>
       <span className={`text-[12px] font-black truncate uppercase ${selectedItemIndex === idx ? 'text-[#800000]' : 'text-[#2D2D2E]'}`}>{item.title}</span>
    </div>
    <div className="text-[9px] font-black text-[#AEAEB2] uppercase">{item.type}</div>
  </div>
));

// --- Presentation Tab Sub-Components ---

const SchedulePanel = React.memo(({ t, setIsAddSongModalOpen }) => {
  const { schedule, setSchedule, selectedItemIndex, setSelectedItemIndex, removeFromSchedule, addBlankToSchedule } = useProject();
  
  const handleItemClick = useCallback((idx) => setSelectedItemIndex(idx), [setSelectedItemIndex]);
  const handleRemove = useCallback((id) => removeFromSchedule(id), [removeFromSchedule]);

  // Virtual scrolling should be used if > 50 items, but for now we memoize the array maps.
  return (
    <div className="w-[300px] border-r border-[#E2E2E6] flex flex-col bg-white">
       <div className="px-5 py-3 border-b border-[#F1F1F3] bg-[#F8F9FA] flex justify-between items-center h-[56px]">
          <span className="text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.1em]">{t.schedule}</span>
          <div className="flex items-center gap-1">
             <button onClick={() => setIsAddSongModalOpen(true)} className="p-1.5 text-[#800000] hover:bg-[#80000010] rounded-md transition-colors"><Plus size={18}/></button>
             <button onClick={addBlankToSchedule} className="p-1.5 text-[#AEAEB2] hover:bg-[#F8F9FA] rounded-md transition-colors"><Layout size={16}/></button>
          </div>
       </div>
       <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {schedule.length > 0 ? (
            <Reorder.Group axis="y" values={schedule} onReorder={setSchedule} className="flex flex-col">
              <AnimatePresence initial={false}>
                {schedule.map((item, idx) => (
                  <ScheduleItem 
                     key={item.instanceId} 
                     item={item} 
                     idx={idx} 
                     selectedItemIndex={selectedItemIndex} 
                     onClick={handleItemClick} 
                     onRemove={handleRemove} 
                  />
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

const PreviewPanel = React.memo(({ t, liveState, setLiveSlide }) => {
  const { schedule, selectedItemIndex } = useProject();
  
  const selectedItem = useMemo(() => {
    const t0 = performance.now();
    const item = selectedItemIndex !== null ? schedule[selectedItemIndex] : null;
    logRenderTime('PreviewPanel_SelectedItem_Compute', t0);
    return item;
  }, [schedule, selectedItemIndex]);

  const handleSlideClick = useCallback((sIdx) => setLiveSlide(selectedItem, sIdx), [setLiveSlide, selectedItem]);
  const handleMediaClick = useCallback(() => setLiveSlide(selectedItem, 0), [setLiveSlide, selectedItem]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F1F1F3]/50 p-2">
       {selectedItem ? (
          <div className="flex flex-col gap-4">
             {selectedItem.type === 'media' ? (
                <div className="max-w-2xl mx-auto w-full">
                   <div onClick={handleMediaClick} 
                        className={`aspect-video border-2 bg-black flex items-center justify-center cursor-pointer transition-all overflow-hidden relative shadow-md group ${liveState.songId === selectedItem.instanceId ? 'border-[#800000] ring-4 ring-[#80000010]' : 'border-white hover:border-[#80000040]'}`}>
                      {selectedItem.url?.match(/\.(mp4|webm|ogg)$/i) ? (
                        <div className="flex flex-col items-center gap-3 text-white/40 group-hover:text-white transition-colors">
                           <Video size={48} />
                           <span className="text-[12px] font-black uppercase tracking-[0.2em]">{selectedItem.title}</span>
                        </div>
                      ) : (
                        <img src={selectedItem.url} className="w-full h-full object-contain" alt="" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                         <Play size={40} className="text-white fill-white" />
                      </div>
                   </div>
                   <p className="mt-4 text-center text-[11px] font-black text-[#8E8E93] uppercase tracking-widest italic leading-relaxed">Klik untuk menampilkan media di layar utama</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2">
                   {selectedItem.slides.map((slide, sIdx) => (
                      <SlidePreview 
                         key={sIdx} 
                         slide={slide} 
                         sIdx={sIdx} 
                         selectedItem={selectedItem} 
                         liveState={liveState} 
                         onClick={handleSlideClick} 
                      />
                   ))}
                </div>
             )}
          </div>
       ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
             <h3 className="text-[20px] font-black text-[#2D2D2E] uppercase tracking-tighter">{t.noSlides}</h3>
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

  const flowSlice = useMemo(() => schedule.slice(0, 10), [schedule]);

  return (
    <aside className="w-[380px] border-l border-[#E2E2E6] flex flex-col bg-white text-[#2D2D2E] shrink-0 font-['Outfit']">
       {isLive ? (
         <div className="h-[48px] px-5 bg-[#800000] flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div>
               <span className="text-[13px] font-[950] tracking-[0.15em] uppercase">LIVE</span>
            </div>
            <button onClick={() => { outputWindow?.close(); setOutputWindow(null); setIsLive(false); }} 
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 transition-all text-[10px] font-black uppercase text-white font-bold">
               <X size={14} /> Akhiri Live
            </button>
         </div>
       ) : isRehearsal ? (
         <div className="h-[48px] px-5 bg-[#800000] flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 bg-purple-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div>
               <div className="flex flex-col">
                  <span className="text-[12px] font-[900] tracking-[0.15em] uppercase leading-none">LATIHAN</span>
                  <span className="text-[8px] font-bold text-white/50 uppercase tracking-tight mt-0.5 whitespace-nowrap">output di jendela terpisah</span>
               </div>
            </div>
            <button onClick={() => setIsRehearsal(false)} 
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 transition-all text-[10px] font-black uppercase text-white font-bold">
               <X size={14} /> Akhiri Latihan
            </button>
         </div>
       ) : (
         <div className="h-[48px] px-5 bg-[#800000] flex justify-between items-center text-white shrink-0">
            <span className="text-[13px] font-[900] tracking-[0.15em] uppercase">PRATINJAU</span>
            <button onClick={() => setIsRehearsal(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 transition-all text-[10px] font-black uppercase text-white font-bold">
               <Clapperboard size={14} /> Mulai Latihan
            </button>
         </div>
       )}

       <div className="p-6 flex flex-col space-y-6">
          <div className="aspect-video bg-[#1A1A1A] flex items-center justify-center relative overflow-hidden group shadow-premium ring-1 ring-[#80000010]">
              {!liveState.isBlank && liveState.mediaUrl && (
                <div className="absolute inset-0 z-0">
                  {liveState.mediaType === 'video' ? (
                    <video key={liveState.mediaUrl} src={liveState.mediaUrl} autoPlay loop muted className="w-full h-full object-cover" />
                  ) : (
                    <img key={liveState.mediaUrl} src={liveState.mediaUrl} className="w-full h-full object-contain bg-black" alt="" />
                  )}
                </div>
              )}

              {liveState.content && !liveState.isBlank ? (
                <p 
                  className="w-full text-white transition-all duration-300 z-10 px-8"
                  style={{
                    fontFamily: liveState.format?.fontFamily || 'Outfit',
                    fontSize: '18px',
                    fontWeight: liveState.format?.isBold ? '900' : 'bold',
                    fontStyle: liveState.format?.isItalic ? 'italic' : 'normal',
                    textTransform: liveState.format?.isUppercase ? 'uppercase' : 'none',
                    textAlign: liveState.format?.alignment || 'center',
                    lineHeight: liveState.format?.lineHeight || '1.1',
                    color: liveState.format?.textColor || 'white',
                    textShadow: liveState.format?.shadowType === 'None' ? 'none' : '0 2px 10px rgba(0,0,0,0.8)'
                  }}
                >
                  {liveState.content}
                </p>
              ) : !liveState.isBlank && !liveState.mediaUrl && (<Monitor size={40} className="text-[#2D2D2E]" />)}
          </div>

          <div className="flex gap-2">
             <button onClick={goToPrevSlide} className="flex-1 h-12 bg-[#F1F1F3] hover:bg-[#80000010] text-[#2D2D2E] flex items-center justify-center transition-all"><ChevronLeft size={24}/></button>
             <button onClick={toggleBlank} className={`flex-1 h-12 flex items-center justify-center transition-all ${liveState.isBlank ? 'bg-[#800000] text-white' : 'bg-[#F1F1F3] text-[#AEAEB2]'}`}><EyeOff size={20}/></button>
             <button className="flex-1 h-12 bg-[#F1F1F3] text-[#AEAEB2] hover:bg-[#80000010] flex items-center justify-center font-black text-[14px]">CC</button>
             <button onClick={goToNextSlide} className="flex-1 h-12 bg-[#F1F1F3] hover:bg-[#80000010] text-[#2D2D2E] flex items-center justify-center transition-all"><ChevronRight size={24}/></button>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col border-t border-[#F1F1F3]">
          <div className="h-10 px-5 flex items-center bg-[#F8F9FA] text-[10px] font-black uppercase text-[#AEAEB2] tracking-[0.10em] border-b border-[#F1F1F3]"><ChevronRight size={14} className="mr-2" /> {t.next}</div>
          <div className="p-6">
             {selectedItemIndex !== null && schedule[selectedItemIndex].slides[liveState.slideIndex + 1] ? (
               <div className="aspect-video bg-[#1A1A1A] border border-[#80000010] flex items-center justify-center p-4 text-center">
                 <p className="text-[14px] font-[900] text-white/50 uppercase leading-tight">{schedule[selectedItemIndex]?.slides[liveState.slideIndex + 1]?.content}</p>
               </div>
             ) : (<div className="aspect-video bg-[#F1F1F3] flex items-center justify-center opacity-30 text-[#AEAEB2] text-[10px] font-black italic">Akhir presentasi</div>)}
          </div>
          <div className="h-10 px-5 flex items-center bg-[#F8F9FA] text-[10px] font-black uppercase text-[#AEAEB2] tracking-[0.10em] border-y border-[#F1F1F3]"><List size={14} className="mr-2" /> {t.serviceFlow}</div>
          <div className="flex flex-col">
            {flowSlice.map((item, idx) => <FlowItem key={idx} item={item} idx={idx} selectedItemIndex={selectedItemIndex} />)}
          </div>
       </div>

       <div className="h-14 border-t border-[#F1F1F3] px-6 flex items-center justify-between text-[14px] font-black bg-white">
          <div className="flex items-center gap-2 text-[#800000] font-[900]"><Clock size={16} className="text-[#80000040]" /> {currentTime}</div>
          <div className="flex items-center gap-4 text-[10px] font-black text-[#AEAEB2]">
             <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-[#F8F9FA] border border-[#E2E2E6] flex items-center justify-center"><ChevronLeft size={10}/></div>
                <div className="w-5 h-5 bg-[#F8F9FA] border border-[#E2E2E6] flex items-center justify-center"><ChevronRight size={10}/></div>
                <span className="ml-1 tracking-tighter uppercase font-black">Navigasi</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="h-5 px-1.5 bg-[#F8F9FA] border border-[#E2E2E6] flex items-center justify-center">B</div>
                <span className="tracking-tighter uppercase font-black">Kosong</span>
             </div>
          </div>
       </div>
    </aside>
  );
});

// --- Main Page Wrapper ---

const PresentationPage = () => {
  const { 
    activeTab, setActiveTab, language, isLive, setIsLive, isRehearsal, setIsRehearsal, 
    outputWindow, setOutputWindow, schedule, selectedItemIndex, setSelectedItemIndex,
    liveState, setLiveSlide, toggleBlank, addBlankToSchedule
  } = useProject();

  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [isSongEditorOpen, setIsSongEditorOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  // Memory Cleanup Interval (every 5 minutes)
  useEffect(() => {
    const memoryInterval = setInterval(() => {
      cleanupUnusedPreviews();
      unloadHiddenVideos();
    }, 5 * 60 * 1000);
    return () => clearInterval(memoryInterval);
  }, []);

  const t = {
    id: { schedule: "SUSUNAN IBADAH", noItems: "Kosong", preview: "PRATINJAU", practice: "Latihan", rehearsal: "LATIHAN", endRehearsal: "Akhiri Latihan", endLive: "Akhiri Live", noSlides: "Belum pilih item", next: "BERIKUTNYA", serviceFlow: "ALUR IBADAH", endPresent: "Selesai", navigation: "Navigasi", tabs: { presentasi: "Presentasi", lagu: "Lagu", alkitab: "Alkitab", media: "Media", countdown: "Countdown", panggung: "Panggung" }, addSong: "Lagu", addMedia: "Media", localFiles: "File", powerpoint: "PPT", browser: "Web", empty: "Blank" },
    en: { schedule: "SCHEDULE", noItems: "No items", preview: "PREVIEW", practice: "Practice", rehearsal: "REHEARSAL", endRehearsal: "End Practice", endLive: "End Live", noSlides: "No slides", next: "NEXT", serviceFlow: "SERVICE FLOW", endPresent: "End", navigation: "Navigation", tabs: { presentasi: "Presentation", lagu: "Songs", alkitab: "Bible", media: "Media", countdown: "Countdown", panggung: "Stage" }, addSong: "Add Song", addMedia: "Add Media", localFiles: "Local", powerpoint: "PPT", browser: "Web", empty: "Blank" }
  }[language];

  // Throttled Navigations to prevent CPU spikes on rapid keys
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
       <button onClick={() => setIsAddSongModalOpen(true)} className="h-9 px-4 border border-[#E2E2E6] bg-white hover:border-[#80000040] flex items-center gap-2 text-[12px] font-black tracking-tight"><Music size={15} className="text-[#800000]" /> Tambah Lagu</button>
       <button className="h-9 px-4 border border-[#E2E2E6] bg-white hover:border-[#80000040] flex items-center gap-2 text-[12px] font-black tracking-tight"><ImageIcon size={15} className="text-[#800000]" /> Tambah Media</button>
       <button className="h-9 px-4 border border-[#E2E2E6] bg-white hover:border-[#80000040] flex items-center gap-2 text-[12px] font-black tracking-tight"><FolderOpen size={15} className="text-[#800000]" /> File Lokal</button>
       <button className="h-9 px-4 border border-[#E2E2E6] bg-white hover:border-[#80000040] flex items-center gap-2 text-[12px] font-black tracking-tight hover:bg-[#F8F9FA]"><MonitorPlay size={15} className="text-[#800000]" /> Power Point</button>
       <button className="h-9 px-4 border border-[#E2E2E6] bg-white hover:border-[#80000040] flex items-center gap-2 text-[12px] font-black tracking-tight hover:bg-[#F8F9FA]"><Globe size={15} className="text-[#800000]" /> Web Browser</button>
       <button onClick={() => addBlankToSchedule()} className="h-9 px-4 border border-[#E2E2E6] bg-white hover:border-[#80000040] flex items-center gap-2 text-[12px] font-black tracking-tight hover:bg-[#F8F9FA]"><Layout size={15} className="text-[#AEAEB2]" /> Kosong</button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white text-[#2D2D2E] font-['Outfit']">
      <MainHeader />
      
      <div className="h-[48px] bg-white border-b border-[#E2E2E6] flex items-center shrink-0">
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
                  <PreviewPanel t={t} liveState={liveState} setLiveSlide={setLiveSlide} />
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col overflow-hidden">
               <Suspense fallback={<TabLoader />}>
                 {activeTab === 'lagu' ? (
                   <SongLibrary setIsSongEditorOpen={setIsSongEditorOpen} setEditingSong={setEditingSong} />
                 ) : activeTab === 'alkitab' ? (
                   <BibleView />
                 ) : activeTab === 'media' ? (
                   <MediaView />
                 ) : activeTab === 'countdown' ? (
                   <CountdownView />
                 ) : (
                   <StageView />
                 )}
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
    </div>
  );
};

export default PresentationPage;
