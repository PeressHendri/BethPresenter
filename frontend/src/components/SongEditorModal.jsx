import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Save, Plus, Trash2, Layout, Layers, Type, 
  AlignCenter, AlignLeft, AlignRight, Shadow, 
  Droplet, Bold as BoldIcon, Italic, Underline, CaseUpper,
  Maximize2, Minimize2, Copy, Scissors, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import SlideRenderer from './SlideRenderer';

const ALL_LABELS = ['Verse 1', 'Verse 1b', 'Verse 2', 'Chorus', 'Chorus b', 'Bridge', 'Pre-Chorus', 'Tag', 'Intro', 'Outro'];
const FONT_FAMILIES = ['Poppins', 'Arial', 'Inter', 'Outfit', 'Roboto', 'Open Sans', 'Montserrat'];
const FONT_SIZES = [72, 82, 92, 102, 112, 122];

const SongEditorModal = ({ isOpen, onClose, song }) => {
  const { saveSong, language, liveState, sendManualToLive, globalFormat, setGlobalFormat } = useProject();

  // Metadata State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [ccli, setCcli] = useState('');
  const [tags, setTags] = useState([]);
  
  // Slides State
  const [slides, setSlides] = useState([{ id: 's1', content: '', label: 'Verse 1', format: {} }]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Formatting State
  const [fontSize, setFontSize] = useState(82);
  const [fontFamily, setFontFamily] = useState('Poppins');
  const [isBold, setIsBold] = useState(true);
  const [isUppercase, setIsUppercase] = useState(false);
  const [spacing, setSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.15);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [bgOpacity, setBgOpacity] = useState(0);
  const [shadowType, setShadowType] = useState('Soft');
  const [alignment, setAlignment] = useState('center');

  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const currentSlide = slides[currentSlideIndex];

  // Sync styles with Project Context if currently LIVE
  const syncToLive = useCallback((newFormat) => {
    if (liveState.songId === (song?.instanceId || song?.id)) {
      sendManualToLive({
        ...liveState,
        format: newFormat
      });
    }
  }, [liveState, song, sendManualToLive]);

  useEffect(() => {
    if (song) {
      setTitle(song.title || '');
      setAuthor(song.author || '');
      setCcli(song.ccli || '');
      setTags(song.tags || []);
      setSlides(song.slides || [{ id: 's1', content: '', label: 'Verse 1' }]);
      
      const format = song.format || {};
      setFontSize(format.fontSize || 82);
      setFontFamily(format.fontFamily || 'Poppins');
      setShadowType(format.shadowType || 'Soft');
      setAlignment(format.alignment || format.textAlign || 'center');
      setIsBold(format.isBold ?? true);
      setIsUppercase(format.isUppercase ?? false);
      setSpacing(format.spacing || 0);
      setLineHeight(format.lineHeight || 1.15);
      setBgOpacity(format.bgOpacity || 0);
    }
  }, [song, isOpen]);

  // Effect to sync live changes
  useEffect(() => {
    if (isOpen) {
      syncToLive({
        fontSize, fontFamily, isBold, isUppercase, spacing, lineHeight,
        textColor, bgOpacity, shadowType, alignment
      });
    }
  }, [fontSize, fontFamily, isBold, isUppercase, spacing, lineHeight, textColor, bgOpacity, shadowType, alignment]);

  const handleSave = () => {
    const format = {
      fontSize, fontFamily, isBold, isUppercase, spacing, lineHeight,
      textColor, bgOpacity, shadowType, alignment
    };
    const newSong = {
      ...song,
      title, author, ccli, tags, slides,
      format
    };
    saveSong(newSong);
    onClose();
  };

  const processPaste = () => {
    const blocks = pasteText.split(/\n\s*\n/).filter(x => x.trim());
    const newSlides = blocks.map((block, i) => {
      const lines = block.split('\n');
      let label = 'Verse 1';
      let content = block;
      
      // Auto-detect section headers
      if (lines[0] && lines[0].trim()) {
        const firstLine = lines[0].trim();
        if (firstLine.match(/^\[(verse|chorus|bridge|pre-chorus|tag|intro|outro)\s*[\d]*\b*\]$/i)) {
          label = firstLine.replace(/[\[\]]/g, '');
          content = lines.slice(1).join('\n').trim();
        }
      }
      
      return { id: `p-${Date.now()}-${i}`, content, label };
    });
    setSlides(newSlides.length > 0 ? newSlides : slides);
    setIsPasteModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 font-['Outfit']">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-7xl h-full bg-[#F8F9FA] rounded-[32px] overflow-hidden flex flex-col border border-white/20"
      >
        {/* HEADER */}
        <div className="h-20 bg-white border-b border-[#E2E2E6] flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#800000] rounded-2xl flex items-center justify-center"><Type size={24} className="text-white" /></div>
            <div>
              <h2 className="text-[18px] font-black tracking-tight">{song ? 'Edit Lagu' : 'Lagu Baru'}</h2>
              <span className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.2em] mt-1 block">Live Formatting Studio</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setIsPasteModalOpen(true)} className="px-6 py-2.5 bg-white border rounded-xl text-[12px] font-black">PASTE LYRICS</button>
            <button onClick={handleSave} className="px-8 py-2.5 bg-[#800000] text-white rounded-xl text-[12px] font-black shadow-xl shadow-[#80000020]">SIMPAN</button>
            <button onClick={onClose} className="p-3 text-[#AEAEB2] hover:text-black"><X size={24} /></button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* FORMAT PANEL */}
          <div className="w-[380px] border-r border-[#E2E2E6] bg-white flex flex-col p-8 gap-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-[#8E8E93] tracking-[0.2em] uppercase">METADATA</h3>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Judul Lagu" className="w-full bg-[#F8F9FA] border rounded-xl px-4 py-3 text-[14px] font-bold" />
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Penulis" className="w-full bg-[#F8F9FA] border rounded-xl px-4 py-3 text-[13px] font-bold" />
              <input value={ccli} onChange={e => setCcli(e.target.value)} placeholder="CCLI #" className="w-full bg-[#F8F9FA] border rounded-xl px-4 py-3 text-[13px] font-bold" />
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-[#80000010] text-[#800000] rounded-full text-[10px] font-black border border-[#80000020]">
                    {tag}
                    <button onClick={() => setTags(tags.filter((_, j) => j !== i))} className="ml-2 text-[#800000] hover:text-red-600">×</button>
                  </span>
                ))}
                <button onClick={() => {
                  const newTag = prompt('Tambah tag:');
                  if (newTag && newTag.trim()) {
                    setTags([...tags, newTag.trim()]);
                  }
                }} className="px-3 py-1 border border-dashed border-[#80000040] text-[#800000] rounded-full text-[10px] font-black hover:border-[#800000]">
                  + Tambah Tag
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-[#8E8E93] tracking-[0.2em] uppercase">LIVE FORMATTING</h3>
              
              {/* MODUL 7: Global Formatting Controls */}
              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E2E2E6]">
                <h4 className="text-[10px] font-black text-[#800000] uppercase tracking-[0.2em] mb-4">GLOBAL STYLE CONTROLS</h4>
                
                {/* Font Family & Size */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[#AEAEB2] uppercase">Font Family</label>
                    <select 
                      value={globalFormat.fontFamily}
                      onChange={(e) => setGlobalFormat({ fontFamily: e.target.value })}
                      className="w-full bg-white border border-[#E2E2E6] rounded-lg px-2 py-1.5 text-[11px] font-black"
                    >
                      {['Poppins', 'Arial', 'Inter', 'Roboto', 'Open Sans', 'Montserrat'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[#AEAEB2] uppercase">Font Size</label>
                    <select 
                      value={globalFormat.fontSize}
                      onChange={(e) => setGlobalFormat({ fontSize: parseInt(e.target.value) })}
                      className="w-full bg-white border border-[#E2E2E6] rounded-lg px-2 py-1.5 text-[11px] font-black"
                    >
                      {[72, 82, 92, 102, 112, 122].map(s => (
                        <option key={s} value={s}>{s}px</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bold & Uppercase */}
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={() => setGlobalFormat({ isBold: !globalFormat.isBold })}
                    className={`flex-1 py-2 rounded-lg border text-[10px] font-black transition-all ${
                      globalFormat.isBold 
                        ? 'bg-[#800000] text-white border-[#800000]' 
                        : 'bg-white text-[#AEAEB2] border-[#E2E2E6]'
                    }`}
                  >
                    BOLD
                  </button>
                  <button 
                    onClick={() => setGlobalFormat({ isUppercase: !globalFormat.isUppercase })}
                    className={`flex-1 py-2 rounded-lg border text-[10px] font-black transition-all ${
                      globalFormat.isUppercase 
                        ? 'bg-[#800000] text-white border-[#800000]' 
                        : 'bg-white text-[#AEAEB2] border-[#E2E2E6]'
                    }`}
                  >
                    UPPERCASE
                  </button>
                </div>

                {/* Spacing & Line Height */}
                <div className="space-y-3 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-[#AEAEB2] uppercase">Letter Spacing</label>
                      <span className="text-[9px] text-[#800000] font-black">{globalFormat.spacing}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      step="0.5" 
                      value={globalFormat.spacing}
                      onChange={(e) => setGlobalFormat({ spacing: parseFloat(e.target.value) })}
                      className="w-full accent-[#800000]"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-[#AEAEB2] uppercase">Line Height</label>
                      <span className="text-[9px] text-[#800000] font-black">{globalFormat.lineHeight}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1.0" 
                      max="2.0" 
                      step="0.1" 
                      value={globalFormat.lineHeight}
                      onChange={(e) => setGlobalFormat({ lineHeight: parseFloat(e.target.value) })}
                      className="w-full accent-[#800000]"
                    />
                  </div>
                </div>

                {/* Text Shadow & Alignment */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[#AEAEB2] uppercase">Text Shadow</label>
                    <select 
                      value={globalFormat.shadowType}
                      onChange={(e) => setGlobalFormat({ shadowType: e.target.value })}
                      className="w-full bg-white border border-[#E2E2E6] rounded-lg px-2 py-1.5 text-[11px] font-black"
                    >
                      {['None', 'Soft', 'Strong', 'Glow'].map(s => (
                        <option key={s} value={s}>{s.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[#AEAEB2] uppercase">Text Alignment</label>
                    <div className="flex bg-white rounded-lg p-1 border border-[#E2E2E6]">
                      {['left', 'center', 'right'].map(a => (
                        <button 
                          key={a}
                          onClick={() => setGlobalFormat({ alignment: a })}
                          className={`flex-1 flex items-center justify-center rounded-md text-[10px] ${
                            globalFormat.alignment === a 
                              ? 'bg-[#800000] text-white' 
                              : 'text-[#AEAEB2]'
                          }`}
                        >
                          {a === 'left' ? 'L' : a === 'center' ? 'C' : 'R'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Text Background Opacity */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black text-[#AEAEB2] uppercase">Text Background</label>
                    <span className="text-[9px] text-[#800000] font-black">{globalFormat.bgOpacity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5" 
                    value={globalFormat.bgOpacity}
                    onChange={(e) => setGlobalFormat({ bgOpacity: parseInt(e.target.value) })}
                    className="w-full accent-[#800000]"
                  />
                </div>

                {/* Apply to All Button */}
                <button 
                  onClick={() => {
                    setSlides(slides.map(s => ({ ...s, format: globalFormat })));
                  }}
                  className="w-full py-3 border-2 border-dashed border-[#E2E2E6] rounded-xl text-[10px] font-black text-[#AEAEB2] hover:border-[#80000040] hover:text-[#800000] transition-all uppercase tracking-[0.2em]"
                >
                  APPLY TO ALL SLIDES
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#AEAEB2] uppercase">Font Family</label>
                  <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full bg-[#F8F9FA] border rounded-lg px-2 py-2 text-[12px] font-black">
                    {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#AEAEB2] uppercase">Font Size</label>
                  <select value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full bg-[#F8F9FA] border rounded-lg px-2 py-2 text-[12px] font-black">
                    {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setIsBold(!isBold)} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${isBold ? 'bg-[#800000] text-white' : 'bg-white text-[#AEAEB2]'}`}><BoldIcon size={18} /><span className="text-[10px] font-black">BOLD</span></button>
                <button onClick={() => setIsUppercase(!isUppercase)} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${isUppercase ? 'bg-[#800000] text-white' : 'bg-white text-[#AEAEB2]'}`}><CaseUpper size={18} /><span className="text-[10px] font-black">CAPS</span></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-[#AEAEB2] uppercase">Spacing ({spacing}px)</label>
                    <span className="text-[10px] text-[#800000] font-black">{spacing}px</span>
                  </div>
                  <input type="range" min="0" max="10" step="0.5" value={spacing} onChange={e => setSpacing(parseFloat(e.target.value))} className="w-full accent-[#800000]" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-[#AEAEB2] uppercase">Line Height ({lineHeight})</label>
                    <span className="text-[10px] text-[#800000] font-black">{lineHeight}</span>
                  </div>
                  <input type="range" min="1.0" max="2.0" step="0.1" value={lineHeight} onChange={e => setLineHeight(parseFloat(e.target.value))} className="w-full accent-[#800000]" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-[#AEAEB2] uppercase">Text Background ({bgOpacity}%)</label>
                    <span className="text-[10px] text-[#800000] font-black">{bgOpacity}%</span>
                  </div>
                  <input type="range" min="0" max="100" step="5" value={bgOpacity} onChange={e => setBgOpacity(parseInt(e.target.value))} className="w-full accent-[#800000]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-[#AEAEB2] uppercase">Text Color</label>
                  <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-12 h-8 border rounded cursor-pointer" />
                </div>
                <label className="text-[10px] font-black text-[#AEAEB2] uppercase">Shadow & Alignment</label>
                <div className="grid grid-cols-2 gap-3">
                  <select value={shadowType} onChange={e => setShadowType(e.target.value)} className="bg-[#F8F9FA] border rounded-lg px-2 py-2 text-[12px] font-black">
                    {['None', 'Soft', 'Strong', 'Glow'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                  <div className="flex bg-[#F8F9FA] rounded-lg p-1 border">
                    {['left', 'center', 'right'].map(a => (
                      <button key={a} onClick={() => setAlignment(a)} className={`flex-1 flex items-center justify-center rounded-md ${alignment === a ? 'bg-white shadow text-[#800000]' : 'text-[#AEAEB2]'}`}>
                        {a === 'left' ? <AlignLeft size={16} /> : a === 'center' ? <AlignCenter size={16} /> : <AlignRight size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSlides(slides.map(s => ({...s, format: { fontSize, fontFamily, isBold, isUppercase, spacing, lineHeight, textColor, bgOpacity, shadowType, alignment }})))}
                className="w-full py-4 border-2 border-dashed border-[#E2E2E6] rounded-2xl text-[10px] font-black text-[#AEAEB2] hover:border-[#80000040] hover:text-[#800000] transition-all uppercase tracking-[0.2em]"
              >
                APPLY TO ALL SLIDES
              </button>
            </div>
          </div>

          {/* EDITOR AREA */}
          <div className="flex-1 flex flex-col p-12 overflow-hidden">
            <div className="flex items-center justify-between mb-8 shrink-0">
               <div className="flex items-center gap-4">
                  <select value={currentSlide?.label} onChange={(e) => {
                    const next = [...slides]; next[currentSlideIndex].label = e.target.value; setSlides(next);
                  }} className="bg-[#1D1D1F] text-white px-4 py-2 rounded-lg text-[11px] font-black">
                    {ALL_LABELS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                  </select>
                  <span className="text-[12px] font-black text-[#AEAEB2] uppercase tracking-[0.2em]">{currentSlideIndex + 1} OF {slides.length}</span>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} className="w-10 h-10 border rounded-xl text-[#AEAEB2] hover:text-black disabled:opacity-50" disabled={currentSlideIndex === 0}>{'<'}</button>
                 <button onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))} className="w-10 h-10 border rounded-xl text-[#AEAEB2] hover:text-black disabled:opacity-50" disabled={currentSlideIndex === slides.length - 1}>{'>'}</button>
               </div>
            </div>

            <div className="flex-1 relative bg-black rounded-[32px] overflow-hidden shadow-2xl ring-1 ring-white/10 group">
               <div className="absolute inset-0 bg-[repeating-conic-gradient(#1A1A1A_0%_25%,#2A2A2A_0%_50%)] bg-[length:40px_40px] z-0 opacity-40" />
               <div className="absolute inset-0 bg-checkerboard bg-[length:20px_20px] z-0 opacity-30" />
               <div className="absolute inset-0 z-10 p-16 flex flex-col justify-center text-center">
                  <textarea 
                    value={currentSlide?.content}
                    onChange={(e) => {
                      const next = [...slides]; next[currentSlideIndex].content = e.target.value; setSlides(next);
                    }}
                    onKeyDown={(e) => {
                      if (e.altKey && e.key === 'Enter') {
                        e.preventDefault();
                        const pos = e.target.selectionStart;
                        const t1 = currentSlide.content.substring(0, pos);
                        const t2 = currentSlide.content.substring(pos);
                        const next = [...slides];
                        next[currentSlideIndex].content = t1.trimEnd();
                        next.splice(currentSlideIndex + 1, 0, { id: `s-${Date.now()}`, content: t2.trimStart(), label: currentSlide.label });
                        setSlides(next); setCurrentSlideIndex(currentSlideIndex + 1);
                      }
                    }}
                    style={{
                      fontFamily, fontSize: `${fontSize}px`, color: textColor, lineHeight, textAlign: alignment, letterSpacing: `${spacing}px`,
                      fontWeight: isBold ? '900' : 'normal',
                      textTransform: isUppercase ? 'uppercase' : 'none',
                      textShadow: shadowType === 'None' ? 'none' : shadowType === 'Soft' ? '0 8px 32px rgba(0,0,0,0.8)' : shadowType === 'Strong' ? '4px 4px 0 rgba(0,0,0,0.9)' : `0 0 20px ${textColor}`,
                      backgroundColor: bgOpacity > 0 ? `rgba(0,0,0,${bgOpacity/100})` : 'transparent'
                    }}
                    className="w-full h-full bg-transparent border-none outline-none resize-none placeholder:text-white/20 text-center"
                    placeholder="Masukkan lirik (Alt+Enter untuk split)..."
                  />
               </div>
               <button onClick={() => setSlides([...slides, { id: Date.now(), content: '', label: 'Verse 1' }])} className="absolute bottom-10 right-10 w-14 h-14 bg-[#800000] text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">+</button>
            </div>

            <div className="h-[120px] mt-8 flex gap-4 overflow-x-auto p-4 custom-scrollbar shrink-0">
               {slides.map((s, idx) => (
                 <div key={s.id} onClick={() => setCurrentSlideIndex(idx)} className={`relative min-w-[160px] aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${currentSlideIndex === idx ? 'border-[#800000]' : 'border-white opacity-60'}`}>
                    <div className="absolute inset-0 bg-[#1D1D1F] p-4 flex items-center justify-center text-[6px] text-white font-bold text-center overflow-hidden">{s.content || 'Blank Slide'}</div>
                    <button onClick={(e) => { e.stopPropagation(); if (slides.length > 1) setSlides(slides.filter((_,i) => i !== idx)); }} className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100"><Trash2 size={10} /></button>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => {
                      const newSlide = { id: Date.now(), content: '', label: 'Verse 1', format: { fontSize, fontFamily, isBold, isUppercase, spacing, lineHeight, textColor, bgOpacity, shadowType, alignment } };
                      const newSlides = [...slides];
                      newSlides.splice(idx + 1, 0, newSlide);
                      setSlides(newSlides);
                    }} className="px-3 py-1 bg-[#800000] text-white rounded text-[10px] font-black">+ Slide</button>
                    <button onClick={() => {
                      if (slides.length === 1) return;
                      const newSlides = [...slides];
                      const currentSlide = newSlides[idx];
                      const lines = currentSlide.content.split('\n');
                      if (lines.length === 1) return;
                      
                      const cursorPos = Math.floor(lines.length / 2);
                      const slide1Content = lines.slice(0, cursorPos).join('\n');
                      const slide2Content = lines.slice(cursorPos).join('\n');
                      
                      newSlides[idx] = { ...currentSlide, content: slide1Content };
                      newSlides.splice(idx + 1, 0, { 
                        ...currentSlide, 
                        id: Date.now(), 
                        content: slide2Content, 
                        label: currentSlide.label + 'b' 
                      });
                      setSlides(newSlides);
                    }} className="px-3 py-1 bg-[#64748b] text-white rounded text-[10px] font-black">Split</button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* PASTE MODAL (Simplified for brevity) */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-12">
          <div className="w-full max-w-2xl bg-white rounded-[32px] p-10">
            <h3 className="text-[20px] font-black mb-6">Paste Lyrics</h3>
            <div className="mb-4">
              <p className="text-[12px] font-black mb-2">Contoh format yang didukung:</p>
              <div className="bg-[#F8F9FA] border rounded-lg p-4 text-[11px] font-mono">
                <p className="text-[#800000] font-bold">Amazing Grace</p>
                <p className="text-gray-600">Verse 1</p>
                <p>Amazing grace how sweet the sound</p>
                <p>That saved a wretch like me</p>
                <p></p>
                <p className="text-[#800000] font-bold">Chorus</p>
                <p>Amazing grace how sweet the sound</p>
              </div>
            </div>
            <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} className="w-full h-80 bg-[#F8F9FA] border rounded-[24px] p-6 outline-none" placeholder="Paste lirik di sini..." />
            <div className="mt-8 flex gap-4">
              <button onClick={processPaste} className="flex-1 py-4 bg-[#800000] text-white rounded-2xl font-black">IMPORT</button>
              <button onClick={() => setIsPasteModalOpen(false)} className="flex-1 py-4 bg-white border rounded-2xl font-black">BATAL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongEditorModal;
