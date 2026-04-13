import React, { useState, useEffect, useRef } from 'react';
import {
   X, Music, Plus, Trash2, Clipboard,
   ChevronDown, AlignLeft, AlignCenter,
   AlignRight, Save, Check, ChevronLeft,
   ChevronRight, Layout, Settings2,
   Bold, Italic, Underline, Tag, User, MousePointer2,
   Keyboard, FileText, PlusCircle, 
   Scissors, AlertCircle, Layers,
   Monitor, GripVertical, CheckCircle,
   Type, Clock, Play, MonitorPlay, Copy,
   Menu, Minus
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Reorder, AnimatePresence, motion } from 'framer-motion';

const SongEditorModal = ({ isOpen, onClose, song = null }) => {
   const { addSong, updateSong } = useProject();
   const textareaRef = useRef(null);

   // Notifications System
   const [notification, setNotification] = useState(null);
   const showNotify = (msg, type = 'success') => {
      setNotification({ msg, type });
      setTimeout(() => setNotification(null), 3000);
   };

   // Essential States
   const [songTitle, setSongTitle] = useState('');
   const [author, setAuthor] = useState('');
   const [ccli, setCcli] = useState('');
   const [tags, setTags] = useState(['Worship']);
   const [isAddingTag, setIsAddingTag] = useState(false);

   // Slides State
   const [slides, setSlides] = useState([{ id: `s-${Date.now()}`, content: '', label: 'Slide 1' }]);
   const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
   const [isLabelDropdownOpen, setIsLabelDropdownOpen] = useState(false);
   const [showFormat, setShowFormat] = useState(false);
   
   // Custom Order States
   const [customOrder, setCustomOrder] = useState([]);
   const [isCustomOrderEnabled, setIsCustomOrderEnabled] = useState(false);
   
   // Format States
   const [fontFamily, setFontFamily] = useState('Poppins');
   const [fontSize, setFontSize] = useState(102);
   const [isBold, setIsBold] = useState(true);
   const [isItalic, setIsItalic] = useState(false);
   const [isUnderline, setIsUnderline] = useState(false);
   const [isUppercase, setIsUppercase] = useState(false);
   const [spacing, setSpacing] = useState(0);
   const [lineHeight, setLineHeight] = useState(1.4);
   const [textColor, setTextColor] = useState('#FFFFFF');
   const [txtBgColor, setTxtBgColor] = useState('#000000');
   const [bgOpacity, setBgOpacity] = useState(0);
   const [radius, setRadius] = useState(0);
   const [shadowType, setShadowType] = useState('None');
   const [shadowBlur, setShadowBlur] = useState(15);
   const [strokeWidth, setStrokeWidth] = useState(0);
   const [strokeColor, setStrokeColor] = useState('#000000');
   const [bgMediaUrl, setBgMediaUrl] = useState('');
   const [alignment, setAlignment] = useState('center');
   const [vAlignment, setVAlignment] = useState('Center');
   const [animType, setAnimType] = useState('None');
   const [animDuration, setAnimDuration] = useState(0.6);

   const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
   const [pasteText, setPasteText] = useState('');

   // Dropdown Visibility States
   const [activeDropdown, setActiveDropdown] = useState(null); // 'font', 'size', 'valign', 'shadow', 'anim'

   const labels = ['Verse 1', 'Verse 1b', 'Verse 2', 'Verse 2b', 'Verse 3', 'Verse 3b', 'Verse 4', 'Chorus', 'Chorus b', 'Pre-Chorus', 'Bridge', 'Bridge b', 'Tag', 'Intro', 'Outro', 'Ending', 'Custom...'];

   useEffect(() => {
      if (isOpen && song) {
         setSongTitle(song.title || '');
         setAuthor(song.author || '');
         setCcli(song.ccli || '');
         setTags(song.tags || ['Worship']);
         setSlides(song.slides?.length ? song.slides : [{ id: `s-${Date.now()}`, content: '', label: 'Verse 1' }]);
         setCustomOrder(song.customOrder || []);
         setIsCustomOrderEnabled(!!song.customOrder?.length);
         if (song.format) {
            setFontFamily(song.format.fontFamily || 'Poppins');
            setFontSize(song.format.fontSize || 102);
            setIsBold(song.format.isBold !== undefined ? song.format.isBold : true);
            setSpacing(song.format.spacing || 0);
            setLineHeight(song.format.lineHeight || 1.4);
            setTextColor(song.format.textColor || '#FFFFFF');
            setBgOpacity(song.format.bgOpacity !== undefined ? song.format.bgOpacity : 0);
            setRadius(song.format.radius || 0);
            setShadowType(song.format.shadowType || 'None');
            setBgMediaUrl(song.format.bgMediaUrl || '');
            setAlignment(song.format.alignment || 'center');
            setVAlignment(song.format.vAlignment || 'Center');
            setAnimType(song.format.animType || 'None');
            setAnimDuration(song.format.animDuration || 'Medium (0.6s)');
         }
         setCurrentSlideIndex(0);
      } else if (isOpen) {
         setSongTitle(''); setAuthor(''); setCcli('');
         setSlides([{ id: `s-${Date.now()}`, content: '', label: 'Slide 1' }]);
         setCustomOrder([]); setIsCustomOrderEnabled(false);
         setCurrentSlideIndex(0);
      }
   }, [isOpen, song]);

   if (!isOpen) return null;

   const currentSlide = slides[currentSlideIndex] || slides[0];

   const handleSave = async () => {
      if (!songTitle.trim()) { showNotify("Judul lagu diperlukan", "error"); return; }
      const songData = {
         title: songTitle, author, ccli, tags, slides, customOrder,
         format: { fontFamily, fontSize, isBold, isItalic, isUnderline, isUppercase, spacing, lineHeight, textColor, shadowType, shadowBlur, strokeWidth, strokeColor, bgOpacity, radius, bgMediaUrl, alignment, vAlignment, animType, animDuration }
      };
      try {
         if (song && song.id) await updateSong(song.id, songData);
         else await addSong(songData);
         showNotify("Lagu Berhasil Disimpan", "success");
         onClose();
      } catch (err) { showNotify(err.message, "error"); }
   };

   const getLabelColor = (label) => {
      if (!label) return '#E5E7EB';
      const l = label.toLowerCase();
      if (l.includes('verse')) return '#1FB1EA'; // Blue
      if (l.includes('chorus')) return '#800000'; // Maroon
      if (l.includes('bridge')) return '#F59E0B'; // Amber
      if (l.includes('intro')) return '#10B981'; // Green
      if (l.includes('outro')) return '#6366F1'; // Indigo
      if (l.includes('ending')) return '#EF4444'; // Red
      if (l.includes('slide')) return '#9CA3AF'; // Slate/Gray for general Slides
      return '#E5E7EB'; // Light Gray Fallback
   };

   return (
      <div className="absolute inset-0 bg-[#F5F5F7] z-[250] flex flex-col font-manrope animate-in fade-in duration-500 text-[#1D1D1F]">
         <div className="flex-1 flex flex-col overflow-hidden shadow-2xl">
            
            {/* 1. HEADER: White Background, Maroon Text */}
            <div className="h-20 px-10 flex items-center justify-between bg-white border-b border-[#E2E2E6] shrink-0">
               <div className="flex items-center gap-10 flex-1 h-full">
                  <div className="flex items-center gap-4 group">
                     <Music size={24} className="text-[#800000] shrink-0" />
                     <input autoFocus placeholder="Judul lagu..." className="bg-transparent border-none outline-none text-[22px] font-black text-[#800000] w-full max-w-[400px] placeholder:text-[#80000040]" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} />
                  </div>
                  
                  <div className="flex items-center gap-8 h-full">
                     {/* AUTHOR */}
                     <div className="relative group pt-2">
                        <span className="absolute top-[-2px] left-1 text-[9px] font-black text-[#800000] uppercase tracking-widest opacity-80 z-10">PENULIS</span>
                        <input 
                           placeholder="Nama penulis..." 
                           className="bg-[#F8F9FA] border border-[#F1F1F3] rounded-sm px-3 h-10 text-[13px] font-bold text-[#800000] w-48 placeholder:text-[#80000020] focus:outline-none focus:border-[#800000]/30 transition-all shadow-sm" 
                           value={author} 
                           onChange={(e) => setAuthor(e.target.value)} 
                        />
                     </div>

                     {/* CCLI */}
                     <div className="relative group pt-2">
                        <span className="absolute top-[-2px] left-1 text-[9px] font-black text-[#800000] uppercase tracking-widest opacity-80 z-10">CCLI</span>
                        <input 
                           placeholder="CCLI #" 
                           className="bg-[#F8F9FA] border border-[#F1F1F3] rounded-sm px-3 h-10 text-[13px] font-bold text-[#800000] w-32 placeholder:text-[#80000020] focus:outline-none focus:border-[#800000]/30 transition-all shadow-sm" 
                           value={ccli} 
                           onChange={(e) => setCcli(e.target.value)} 
                        />
                     </div>
                  </div>
               </div>
               
               <button onClick={onClose} className="text-[#AEAEB2] hover:text-[#800000] transition-colors ml-4 h-full flex items-center">
                  <X size={28} />
               </button>
            </div>

            {/* TAGS Row: White Background, Maroon Label */}
            <div className="px-10 h-14 flex items-center gap-6 border-b border-[#E2E2E6] bg-white text-[10px] font-black text-[#AEAEB2] uppercase tracking-widest shrink-0">
               <span className="text-[#800000]">TAG</span>
               <div className="flex items-center gap-3">
                  {tags.map((t, i) => (
                     <span key={i} className="bg-[#800000] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 group">
                        <span>{t}</span>
                        <X size={12} className="cursor-pointer opacity-60 group-hover:opacity-100" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} />
                     </span>
                  ))}
                  <button onClick={() => setTags([...tags, 'New Tag'])} className="hover:text-[#800000] transition-all flex items-center gap-1">
                     <PlusCircle size={14} className="opacity-40" />
                     <span>TAMBAH TAG</span>
                  </button>
               </div>
            </div>

            {/* WORKSPACE Toolbar: White, Maroon Accents, Sharp Borders, Full Height Dividers */}
            <div className="px-0 h-14 flex items-center bg-[#F5F5F7] border-b border-[#E2E2E6] shrink-0">
               <div className="h-full px-6 flex items-center border-r border-[#E2E2E6]">
                  <div onClick={() => setIsLabelDropdownOpen(!isLabelDropdownOpen)} className="flex items-center gap-3 bg-white border border-[#E2E2E6] px-3 h-9 rounded-none cursor-pointer text-[#800000] hover:border-[#800000]/30 relative min-w-[150px] shadow-sm transition-all group">
                     <span className="text-[13px] font-bold uppercase tracking-tight">{currentSlide?.label}</span>
                     <ChevronDown size={14} className="text-[#C6C6C8] ml-auto group-hover:text-[#800000]" />
                     {isLabelDropdownOpen && (
                        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-[#E2E2E6] rounded-none shadow-2xl z-[300] py-1 max-h-80 overflow-y-auto custom-scrollbar border-t-2 border-t-[#800000]">
                           <div className="px-4 py-2 text-[10px] font-black text-[#AEAEB2] tracking-[0.2em] uppercase border-b border-[#F8F9FA] bg-[#F8F9FA]/50 mb-1 text-center">Slide Label</div>
                           {labels.map(l => (
                              <div 
                                 key={l} 
                                 onClick={(e)=>{e.stopPropagation(); const s=[...slides]; s[currentSlideIndex].label=l; setSlides(s); setIsLabelDropdownOpen(false);}} 
                                 className={`px-5 py-2.5 font-bold transition-all text-[#800000] hover:bg-[#80000010] text-[12px] cursor-pointer flex items-center gap-3 ${currentSlide?.label === l ? 'bg-[#80000010] border-l-4 border-l-[#800000]' : ''}`}
                              >
                                 <div className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: getLabelColor(l) }}></div>
                                 {l}
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
               <div className="h-full px-6 flex items-center border-r border-[#E2E2E6]">
                  <button 
                     id="toggle-format-btn"
                     onClick={() => setShowFormat(!showFormat)} 
                     className={`flex items-center gap-2 px-5 h-9 rounded-none font-black text-[11px] uppercase tracking-widest transition-all border ${showFormat ? 'bg-[#800000] text-white border-[#800000] shadow-inner' : 'bg-white text-[#8E8E93] border-[#E2E2E6] hover:border-[#800000]/30 shadow-sm'}`}
                  >
                     <Settings2 size={16} />
                     <span>{showFormat ? 'Tutup Format' : 'Tampilkan Format'}</span>
                  </button>
               </div>
               <div className="flex-1"></div>
               <div className="h-full px-10 flex items-center border-l border-[#E2E2E6] gap-8">
                  <span className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.2em]">{currentSlideIndex + 1} OF {slides.length}</span>
                  <div className="flex gap-0 border border-[#E2E2E6]">
                     <button onClick={()=>setCurrentSlideIndex(Math.max(0, currentSlideIndex-1))} className="w-10 h-10 bg-white border-r border-[#E2E2E6] flex items-center justify-center text-[#C6C6C8] hover:text-[#800000] transition-all"><ChevronLeft size={20} /></button>
                     <button onClick={()=>setCurrentSlideIndex(Math.min(slides.length-1, currentSlideIndex+1))} className="w-10 h-10 bg-white flex items-center justify-center text-[#C6C6C8] hover:text-[#800000] transition-all"><ChevronRight size={20} /></button>
                  </div>
               </div>
            </div>

            {/* MAIN WORKSPACE Area: Balanced 60/40 Split */}
            <div className="flex-1 flex overflow-hidden">
               {/* Left Column: Preview area (includes Format Panel) */}
               <div className="w-[74%] flex flex-col bg-[#E5E5E7] overflow-hidden border-r border-[#E2E2E6]">
                  
                  {/* FORMAT Panel: Moved here so it doesn't push the sidebar */}
                  <AnimatePresence mode="wait">
                  {showFormat && (
                     <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }} 
                        className="bg-white border-b border-[#E2E2E6] px-8 py-6 flex flex-col gap-6 shadow-xl shrink-0 z-20 overflow-visible"
                     >
                        {/* SECTION: GAYA TEKS (Compact with Breathing Space) */}
                        <div className="relative border border-[#F1F1F3] p-4 pt-6 group bg-[#F8F9FA]/20">
                           <span className="absolute -top-2.5 left-4 bg-white px-3 py-0.5 text-[9px] font-black text-[#800000] border border-[#F1F1F3] uppercase tracking-widest shadow-sm">GAYA TEKS</span>
                           <div className="flex items-center gap-10 flex-wrap">
                              {/* Typography Group */}
                              <div className="flex bg-white border border-[#E2E2E6] p-0.5 shadow-sm">
                                 <button onClick={()=>setIsUppercase(!isUppercase)} className={`w-9 h-9 flex items-center justify-center font-black text-[11px] transition-all ${isUppercase ? 'bg-[#800000] text-white shadow-inner' : 'text-[#AEAEB2] hover:text-[#800000]'}`}>AA</button>
                                 <button onClick={()=>setIsBold(!isBold)} className={`w-9 h-9 flex items-center justify-center transition-all ${isBold ? 'bg-[#800000] text-white shadow-inner' : 'text-[#AEAEB2] hover:text-[#800000]'}`}><Bold size={15}/></button>
                              </div>

                              <div className="flex items-center gap-4 border-l border-[#E2E2E6] pl-8">
                                 <div className="relative">
                                    <div onClick={() => setActiveDropdown(activeDropdown === 'font' ? null : 'font')} className="bg-white border border-[#E2E2E6] px-4 h-9 flex items-center gap-3 cursor-pointer min-w-[140px] hover:border-[#80000040] transition-all text-[12px] font-bold text-[#4A4A4E] shadow-sm">
                                       <span>{fontFamily}</span>
                                       <ChevronDown size={14} className="text-[#C6C6C8] ml-auto" />
                                    </div>
                                    {activeDropdown === 'font' && (
                                       <div className="absolute top-[calc(100%+2px)] left-0 w-full bg-white border border-[#E2E2E6] shadow-2xl z-[100] py-1">
                                          {['Poppins', 'Inter', 'Roboto', 'Open Sans', 'Montserrat'].map(f => <div key={f} onClick={()=>{setFontFamily(f); setActiveDropdown(null);}} className="px-5 py-2 hover:bg-[#800000] hover:text-white text-[12px] font-bold text-[#6C6C70] cursor-pointer">{f}</div>)}
                                       </div>
                                    )}
                                 </div>
                                 <div className="relative">
                                    <div onClick={() => setActiveDropdown(activeDropdown === 'size' ? null : 'size')} className="bg-white border border-[#E2E2E6] px-4 h-9 flex items-center gap-3 cursor-pointer min-w-[90px] hover:border-[#80000040] transition-all text-[12px] font-bold text-[#4A4A4E] shadow-sm">
                                       <span>{fontSize}px</span>
                                       <ChevronDown size={14} className="text-[#C6C6C8] ml-auto" />
                                    </div>
                                    {activeDropdown === 'size' && (
                                       <div className="absolute top-[calc(100%+2px)] left-0 w-full bg-white border border-[#E2E2E6] shadow-2xl z-[100] py-1">
                                          {[72, 82, 92, 102, 112, 122].map(s => <div key={s} onClick={()=>{setFontSize(s); setActiveDropdown(null);}} className="px-5 py-2 hover:bg-[#800000] hover:text-white text-[12px] font-bold text-[#6C6C70] cursor-pointer">{s}px</div>)}
                                       </div>
                                    )}
                                 </div>
                              </div>

                              {/* Sliders Group */}
                              <div className="flex items-center gap-8 border-l border-[#E2E2E6] pl-8">
                                 <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-3">
                                       <span className="text-[8px] font-black text-[#AEAEB2] uppercase w-10">Spacing</span>
                                       <input type="range" min="0" max="10" step="0.5" value={spacing} onChange={(e)=>setSpacing(parseFloat(e.target.value))} className="w-20 h-1 accent-[#800000] cursor-pointer" />
                                       <span className="text-[#800000] text-[10px] font-bold w-6 text-right">{spacing}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <span className="text-[8px] font-black text-[#AEAEB2] uppercase w-10">Line</span>
                                       <input type="range" min="1" max="2" step="0.1" value={lineHeight} onChange={(e)=>setLineHeight(parseFloat(e.target.value))} className="w-20 h-1 accent-[#800000] cursor-pointer" />
                                       <span className="text-[#800000] text-[10px] font-bold w-6 text-right">{lineHeight}</span>
                                    </div>
                                 </div>
                                 <div className="flex flex-col gap-1.5 border-l border-[#F1F1F3] pl-8">
                                    <div className="flex items-center gap-3">
                                       <span className="text-[8px] font-black text-[#AEAEB2] uppercase w-10">BG %</span>
                                       <input type="range" min="0" max="100" value={bgOpacity} onChange={(e)=>setBgOpacity(parseInt(e.target.value))} className="w-20 h-1 accent-[#800000] cursor-pointer" />
                                       <span className="text-[#800000] text-[10px] font-bold w-8 text-right">{bgOpacity}%</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <span className="text-[8px] font-black text-[#AEAEB2] uppercase w-10">Radius</span>
                                       <input type="range" min="0" max="20" value={radius} onChange={(e)=>setRadius(parseInt(e.target.value))} className="w-20 h-1 accent-[#800000] cursor-pointer" />
                                       <span className="text-[#800000] text-[10px] font-bold w-6 text-right">{radius}</span>
                                    </div>
                                 </div>
                              </div>

                              {/* Color & Shadow Group */}
                              <div className="flex items-center gap-6 border-l border-[#E2E2E6] pl-8">
                                 <div className="flex items-center gap-2.5">
                                    <span className="text-[8px] font-black text-[#AEAEB2] uppercase">TEXT</span>
                                    <div className="w-8 h-6 bg-white border border-[#E2E2E6] relative shadow-sm overflow-hidden"><div className="w-full h-full" style={{backgroundColor: textColor}}/><input type="color" value={textColor} onChange={(e)=>setTextColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" /></div>
                                 </div>
                                 <div className="flex items-center gap-2.5 border-r border-[#F1F1F3] pr-8">
                                    <span className="text-[8px] font-black text-[#AEAEB2] uppercase">BKG</span>
                                    <div className="w-8 h-6 bg-white border border-[#E2E2E6] relative shadow-sm overflow-hidden"><div className="w-full h-full" style={{backgroundColor: txtBgColor}}/><input type="color" value={txtBgColor} onChange={(e)=>setTxtBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" /></div>
                                 </div>
                                 <div className="relative">
                                    <div onClick={() => setActiveDropdown(activeDropdown === 'shadow' ? null : 'shadow')} className="bg-white border border-[#E2E2E6] px-4 h-9 flex items-center gap-3 cursor-pointer min-w-[130px] hover:border-[#80000040] transition-all text-[#8E8E93] uppercase font-black text-[10px] shadow-sm">
                                       <span>{shadowType} Shadow</span>
                                       <ChevronDown size={12} className="ml-auto" />
                                    </div>
                                    {activeDropdown === 'shadow' && (
                                       <div className="absolute top-[calc(100%+2px)] left-0 w-full bg-white border border-[#E2E2E6] shadow-2xl z-[100] py-1">
                                          {['None', 'Soft', 'Strong', 'Glow'].map(st => <div key={st} onClick={()=>{setShadowType(st); setActiveDropdown(null);}} className="px-5 py-2 hover:bg-[#800000] hover:text-white text-[10px] font-bold text-[#6C6C70] cursor-pointer">{st}</div>)}
                                       </div>
                                    )}
                                 </div>
                              </div>

                              <button onClick={()=>showNotify("Diterapkan ke semua")} className="flex items-center gap-2 text-[#800000] hover:text-black transition-all ml-auto pr-16 whitespace-nowrap shrink-0">
                                 <Layers size={14} className="shrink-0" />
                                 <span className="text-[9px] font-black uppercase tracking-widest">Apply to All</span>
                              </button>
                           </div>
                        </div>

                        <div className="relative border border-[#F1F1F3] p-3 pt-6 group bg-[#F8F9FA]/20">
                           <span className="absolute -top-2.5 left-4 bg-white px-3 py-0.5 text-[9px] font-black text-[#800000] border border-[#F1F1F3] uppercase tracking-widest shadow-sm">ADVANCED & GLOBAL</span>
                           <div className="flex items-center justify-between gap-4">
                              {/* Group: Layout Settings */}
                              <div className="flex items-center gap-4">
                                 <div className="flex items-center gap-4">
                                    <span className="text-[9px] font-black text-[#AEAEB2] uppercase tracking-widest">Align</span>
                                    <div className="flex bg-white border border-[#E2E2E6] p-0.5 shadow-sm">
                                       {['left', 'center', 'right'].map(a=>(
                                          <button key={a} onClick={()=>setAlignment(a)} className={`w-9 h-9 flex items-center justify-center transition-all ${alignment===a ? 'bg-[#800000] text-white shadow-inner' : 'text-[#AEAEB2] hover:text-[#800000]'}`}>
                                             {a==='left'?<AlignLeft size={16}/>:a==='center'?<AlignCenter size={16}/>:<AlignRight size={16}/>}
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-3 border-l border-[#E2E2E6] pl-4">
                                    <span className="text-[9px] font-black text-[#AEAEB2] uppercase tracking-widest">Vertical</span>
                                    <div className="relative">
                                       <div onClick={() => setActiveDropdown(activeDropdown === 'valign' ? null : 'valign')} className="bg-white border border-[#E2E2E6] px-3 h-9 flex items-center gap-2 cursor-pointer min-w-[90px] hover:border-[#80000040] transition-all text-[#4A4A4E] font-bold text-[11px] shadow-sm">
                                          <span>{vAlignment}</span>
                                          <ChevronDown size={14} className="ml-auto" />
                                       </div>
                                       {activeDropdown === 'valign' && (
                                          <div className="absolute top-[calc(100%+2px)] left-0 w-full bg-white border border-[#E2E2E6] shadow-2xl z-[100] py-1">
                                             {['Top', 'Center', 'Bottom'].map(v => <div key={v} onClick={()=>{setVAlignment(v); setActiveDropdown(null);}} className="px-5 py-2 hover:bg-[#800000] hover:text-white text-[12px] font-bold text-[#6C6C70] cursor-pointer">{v}</div>)}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>

                              {/* Group: Animation Settings */}
                              <div className="flex items-center gap-4 border-l border-[#E2E2E6] pl-4">
                                 <span className="text-[9px] font-black text-[#AEAEB2] uppercase tracking-widest">Animation</span>
                                 <div className="flex items-center gap-2">
                                    <div className="relative">
                                       <div onClick={() => setActiveDropdown(activeDropdown === 'anim' ? null : 'anim')} className="bg-white border border-[#E2E2E6] px-3 h-9 flex items-center gap-2 cursor-pointer min-w-[100px] hover:border-[#80000040] transition-all text-[#8E8E93] uppercase font-bold text-[10px] shadow-sm">
                                          <span>{animType}</span>
                                          <ChevronDown size={14} className="ml-auto" />
                                       </div>
                                       {activeDropdown === 'anim' && (
                                          <div className="absolute top-[calc(100%+2px)] left-0 w-full bg-white border border-[#E2E2E6] shadow-2xl z-[100] py-1">
                                             {['None', 'Fade', 'Slide Up', 'Slide Down'].map(at => <div key={at} onClick={()=>{setAnimType(at); setActiveDropdown(null);}} className="px-5 py-2 hover:bg-[#800000] hover:text-white text-[11px] font-bold text-[#8E8E93] cursor-pointer">{at}</div>)}
                                          </div>
                                       )}
                                    </div>
                                    <div className="relative">
                                       <div onClick={() => setActiveDropdown(activeDropdown === 'dur' ? null : 'dur')} className="bg-white border border-[#E2E2E6] px-3 h-9 flex items-center gap-2 cursor-pointer min-w-[80px] hover:border-[#80000040] transition-all text-[#4A4A4E] font-bold text-[11px] shadow-sm">
                                          <span>{animDuration === 0.3 ? 'Fast' : animDuration === 0.6 ? 'Med' : 'Slow'}</span>
                                          <ChevronDown size={14} className="ml-auto" />
                                       </div>
                                       {activeDropdown === 'dur' && (
                                          <div className="absolute top-[calc(100%+2px)] left-0 w-full bg-white border border-[#E2E2E6] shadow-2xl z-[100] py-1">
                                             {[{l:'Fast',d:0.3}, {l:'Medium',d:0.6}, {l:'Slow',d:1.0}].map(opt => <div key={opt.d} onClick={()=>{setAnimDuration(opt.d); setActiveDropdown(null);}} className="px-5 py-2 hover:bg-[#800000] hover:text-white text-[11px] font-bold text-[#6C6C70] cursor-pointer">{opt.l} ({opt.d}s)</div>)}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>

                               <div className="flex items-center gap-4 border-l border-[#E2E2E6] pl-4">
                                  <span className="text-[9px] font-black text-[#AEAEB2] uppercase tracking-widest">BG Media URL</span>
                                  <input type="text" placeholder="URL" value={bgMediaUrl} onChange={(e)=>setBgMediaUrl(e.target.value)} className="bg-white border border-[#E2E2E6] px-3 h-8 text-[11px] font-bold text-[#800000] w-32 shadow-sm" />
                               </div>
                              {/* APPLY TO ALL - Endpoint Inside Box */}
                              <button onClick={handleSave} className="text-[#800000] hover:text-black transition-all flex items-center gap-1.5 font-black text-[10px] uppercase tracking-[0.1em] whitespace-nowrap shrink-0 pr-2">
                                 <Layers size={13} className="shrink-0" />
                                 <span>APPLY TO ALL</span>
                              </button>
                           </div>
                        </div>
                     </motion.div>
                  )}
                  </AnimatePresence>

                  <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#E5E5E7] overflow-hidden">
                     <div className="max-w-full max-h-full aspect-video border-[10px] border-white rounded-none relative overflow-hidden group shadow-2xl shrink-0 flex items-center justify-center bg-black" style={{ width: 'min(98%, 1300px)' }}>
                        {/* Darker Checkerboard Pattern */}
                        <div className="absolute inset-0 bg-[repeating-conic-gradient(#A0A0A5_0%_25%,#BDBDC2_0%_50%)] bg-[length:40px_40px]"></div>
                        
                        <div className={`absolute inset-0 flex flex-col px-16 py-12 ${vAlignment==='Top'?'justify-start':vAlignment==='Bottom'?'justify-end':'justify-center'} transition-all duration-500`} style={{backgroundColor: bgOpacity > 0 ? `rgba(128,0,0,${bgOpacity/100})` : 'transparent'}}>
                           <textarea
                              ref={textareaRef}
                              className="w-full bg-transparent border-none outline-none resize-none font-bold placeholder:text-white/70 text-center transition-all duration-300 custom-scrollbar overflow-hidden px-8"
                              style={{ 
                                 fontFamily, 
                                 fontSize: `${fontSize}px`, 
                                 fontWeight: isBold ? '900' : 'normal', 
                                 fontStyle: isItalic ? 'italic' : 'normal',
                                 textDecoration: isUnderline ? 'underline' : 'none',
                                 textTransform: isUppercase ? 'uppercase' : 'none',
                                 letterSpacing: `${spacing}px`, 
                                 lineHeight, 
                                 color: textColor, 
                                 textAlign: alignment,
                                WebkitTextStroke: strokeWidth > 0 ? `${strokeWidth}px ${strokeColor}` : 'none',
                                textShadow: shadowType === 'None' ? 'none' : shadowType === 'Small' ? '1px 1px 2px rgba(0,0,0,0.8)' : shadowType === 'Medium' ? '3px 3px 6px rgba(0,0,0,0.8)' : shadowType === 'Large' ? `0 ${shadowBlur/5}px ${shadowBlur}px rgba(0,0,0,0.9)` : `0 0 ${shadowBlur}px ${textColor}`
                              }}
                              value={currentSlide?.content}
                              placeholder="Ketik Disini Lirik nya"
                              onChange={(e)=>{const s=[...slides]; s[currentSlideIndex].content=e.target.value; setSlides(s);}}
                           />
                        </div>
                        <button className="absolute bottom-10 right-10 w-16 h-16 rounded-full bg-[#800000] text-white flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95">
                           <Scissors size={28} />
                        </button>
                     </div>
                  </div>
               </div>

            {/* Right Column: Sidebar (26% Total with 50/50 sub-split) */}
            <div className="w-[26%] bg-white flex shrink-0">
                  
                  {/* SLIDE Section */}
                  <div className="w-1/2 border-r border-[#E2E2E6] flex flex-col overflow-hidden bg-white">
                     <div className="p-4 space-y-4 border-b border-[#F1F1F3] h-[100px] flex flex-col justify-center">
                        <span className="text-[10px] font-black text-[#800000] tracking-[0.2em] uppercase">Slide Manajemen</span>
                        <div className="flex gap-2">
                           <button onClick={()=>{const n=[...slides, {id:`s-${Date.now()}`,content:'',label:`Slide ${slides.length+1}`}]; setSlides(n); setCurrentSlideIndex(n.length-1);}} className="flex-1 bg-[#800000] text-white h-9 rounded-none font-bold text-[10px] flex items-center justify-center gap-1.5 hover:bg-[#5C0000] transition-all shadow-md active:scale-95 uppercase tracking-tighter">
                              <Plus size={14} /> <span className="whitespace-nowrap">Slide Baru</span>
                           </button>
                           <button onClick={()=>{ if(window.confirm('Hapus slide?')) { const n=[...slides]; n.splice(currentSlideIndex,1); setSlides(n.length?n:[{id:`s-${Date.now()}`,content:'',label:'Verse 1'}]); setCurrentSlideIndex(0); } }} className="w-9 h-9 rounded-none bg-red-50 text-red-600 border border-red-100 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </div>
                     <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
                        {slides.map((s, idx) => (
                           <div key={s.id} onClick={()=>setCurrentSlideIndex(idx)} className={`py-2 px-3 rounded-none flex items-center gap-3 cursor-pointer transition-all border ${currentSlideIndex === idx ? 'bg-[#80000010] border-[#800000]' : 'bg-transparent border-transparent hover:bg-[#F8F9FA]'}`}>
                              <div className="w-2.5 h-2.5 rounded-none transition-colors" style={{ backgroundColor: getLabelColor(s.label) }}></div>
                              <span className={`text-[11px] font-bold flex-1 uppercase transition-colors ${currentSlideIndex === idx ? 'text-[#800000]' : 'text-[#AEAEB2]'}`}>{s.label}</span>
                              <div className="flex gap-2">
                                 <button onClick={(e)=>{e.stopPropagation(); const n=[...slides]; n.splice(idx+1,0,{...s, id:`c-${Date.now()}`}); setSlides(n);}} className="text-[#C6C6C8] hover:text-[#800000] transition-colors"><Copy size={14}/></button>
                                 <button onClick={(e)=>{e.stopPropagation(); setCustomOrder([...customOrder, {...s, instanceId:Date.now()+Math.random()}]);}} className="text-[#80000040] hover:text-[#800000] transition-colors"><PlusCircle size={16}/></button>
                              </div>
                           </div>
                        ))}
                     </div>
                     <div className="p-4 border-t border-[#F1F1F3] space-y-3 bg-[#F8F9FA]">
                        <button onClick={()=>setIsPasteModalOpen(true)} className="w-full h-10 bg-white border border-[#E2E2E6] rounded-none flex items-center justify-center gap-2 font-bold text-[11px] hover:border-[#80000040] transition-all text-[#800000] shadow-sm uppercase tracking-tight"><FileText size={14} /> Paste Lyrics</button>
                        <button onClick={()=>{ if(window.confirm('Reset semua?')) setSlides([{id:`s-${Date.now()}`,content:'',label:'Slide 1'}]); }} className="w-full text-center text-[9px] font-black text-[#AEAEB2] uppercase tracking-widest hover:text-[#800000] transition-all"><Trash2 size={12} className="inline mr-1" /> Hapus Semua</button>
                     </div>
                  </div>

                  {/* CUSTOM ORDER Section */}
                  <div className="w-1/2 flex flex-col overflow-hidden bg-[#fafafa]">
                     <div className="p-4 h-[100px] flex flex-col justify-center border-b border-[#F1F1F3] bg-white shadow-sm">
                        <span className="text-[10px] font-black text-[#800000] tracking-[0.2em] uppercase">Urutan Kustom</span>
                     </div>
                     <Reorder.Group axis="y" values={customOrder} onReorder={setCustomOrder} className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {customOrder.map((item, idx) => (
                           <Reorder.Item key={item.instanceId} value={item} className="py-2 px-3 bg-white border border-transparent hover:border-[#E2E2E6] rounded-none flex items-center gap-3 cursor-grab active:grabbing group transition-all shadow-sm">
                              <div className="w-2.5 h-2.5 rounded-none" style={{ backgroundColor: getLabelColor(item.label) }}></div>
                              <span className={`text-[11px] font-bold flex-1 uppercase text-[#4A4A4E]`}>{item.label}</span>
                              <button onClick={()=>setCustomOrder(customOrder.filter(o=>o.instanceId!==item.instanceId))} className="text-[#800000]/20 hover:text-red-600 transition-all"><AlertCircle size={16}/></button>
                           </Reorder.Item>
                        ))}
                        {!customOrder.length && <div className="flex-1 flex flex-col items-center justify-center h-full opacity-10 py-20 grayscale scale-75">
                           <Layout size={64} className="mb-4" />
                           <p className="text-[12px] font-black uppercase tracking-widest text-center">Seret slide ke sini</p>
                        </div>}
                     </Reorder.Group>
                     <div className="p-6 border-t border-[#F1F1F3] bg-white">
                        <div onClick={()=>setIsCustomOrderEnabled(!isCustomOrderEnabled)} className="flex items-center gap-4 cursor-pointer group">
                           <div className={`w-4 h-4 rounded-none border-2 transition-all flex items-center justify-center ${isCustomOrderEnabled ? 'bg-[#800000] border-[#800000]' : 'border-[#E2E2E6] group-hover:border-[#800000]/30'}`}>
                              {isCustomOrderEnabled && <Check size={12} className="text-white" />}
                           </div>
                           <span className={`text-[11px] font-black transition-all ${isCustomOrderEnabled ? 'text-[#800000]' : 'text-[#AEAEB2]'}`}>SET CUSTOM ORDER</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer Area: Smaller Height */}
            <div className="h-14 px-10 border-t border-[#E2E2E6] bg-white flex items-center justify-between shrink-0">
               <span className="text-[10px] font-black text-[#800000] uppercase tracking-[0.2em]">{slides.length} SLIDE TERSEDIA</span>
               <div className="flex items-center gap-10">
                  <button onClick={onClose} className="text-[12px] font-black text-[#AEAEB2] hover:text-[#800000] transition-all uppercase tracking-widest">Batal</button>
                  <button onClick={handleSave} className="bg-[#800000] text-white h-10 px-10 rounded-none font-black text-[14px] flex items-center gap-3 hover:bg-[#5C0000] transition-all shadow-lg active:scale-95 uppercase">
                     <Save size={18} /> SIMPAN PERUBAHAN
                  </button>
               </div>
            </div>
         </div>

          {/* Paste Modal (G-Presenter Refined Style) */}
          <AnimatePresence>
             {isPasteModalOpen && (
                <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }} 
                   transition={{ duration: 0.2 }}
                   className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[500] flex items-center justify-center p-6"
                >
                   <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white w-full max-w-lg rounded-xl flex flex-col shadow-2xl overflow-hidden border border-[#F1F1F3]"
                   >
                      <div className="p-6 flex flex-col gap-5">
                         <div className="flex items-center justify-between">
                            <h3 className="text-[18px] font-black text-[#800000] uppercase tracking-tight">Paste Lyrics</h3>
                            <button onClick={()=>setIsPasteModalOpen(false)} className="text-[#C6C6C8] hover:text-[#800000] transition-colors"><X size={20} /></button>
                         </div>

                         <div className="space-y-4">
                            <p className="text-[12px] text-[#8E8E93] leading-relaxed">
                               Paste your full lyrics below. Separate slides with <span className="font-black text-[#4A4A4E]">blank lines</span>. 
                               Lines starting with <span className="font-black text-[#4A4A4E]">[Verse], [Chorus]</span>, etc. will auto-detect labels.
                            </p>

                            <textarea 
                               autoFocus 
                               placeholder={`Amazing grace, how sweet the sound\nThat saved a wretch like me\n\n[Chorus]\nI once was lost, but now I'm found\nWas blind but now I see`}
                               className="w-full h-64 bg-white border border-[#E2E2E6] rounded-lg p-4 text-[13px] font-mono text-[#1D1D1F] outline-none focus:border-[#80000040] transition-all resize-none placeholder:text-[#C6C6C8]" 
                               value={pasteText} 
                               onChange={(e)=>setPasteText(e.target.value)} 
                            />
                         </div>

                         <div className="flex items-center justify-end gap-5 mt-2">
                            <button 
                               onClick={()=>setIsPasteModalOpen(false)} 
                               className="text-[13px] font-bold text-[#8E8E93] hover:text-[#800000] transition-all uppercase tracking-widest"
                            >
                               Batal
                            </button>
                            <button 
                               onClick={()=>{
                                  const blocks = pasteText.split(/\n\s*\n/).filter(x=>x.trim());
                                  const newSlides = blocks.map((block, i) => {
                                     const lines = block.split('\n');
                                     let label = `Verse ${i + 1}`;
                                     let content = block;
                                     
                                     // Basic Label Detection
                                     if (lines[0].trim().startsWith('[') && lines[0].trim().endsWith(']')) {
                                        label = lines[0].trim().replace(/[\[\]]/g, '');
                                        content = lines.slice(1).join('\n').trim();
                                     }
                                     
                                     return { id: `s-${Date.now()}-${i}`, content, label };
                                  });
                                  
                                  setSlides(newSlides);
                                  setIsPasteModalOpen(false); 
                                  setPasteText('');
                                  showNotify("Lirik Berhasil Diimpor");
                               }} 
                               className="bg-[#800000] text-white px-8 py-2.5 rounded-full font-black text-[13px] hover:bg-[#5C0000] transition-all shadow-md uppercase tracking-widest"
                            >
                               Import Slides
                            </button>
                         </div>
                      </div>
                   </motion.div>
                </motion.div>
             )}
          </AnimatePresence>

         {/* Notifications */}
         <AnimatePresence>
         {notification && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-10 right-10 py-5 px-8 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] bg-white border border-[#80000020] flex items-center gap-4 z-[1000]">
               <CheckCircle size={24} className="text-[#800000]" />
               <span className="text-[15px] font-black text-[#1D1D1F] tracking-tight">{notification.msg}</span>
            </motion.div>
         )}
         </AnimatePresence>
      </div>
   );
};

export default SongEditorModal;
