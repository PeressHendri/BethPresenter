import React, { useMemo } from 'react';
import { SlideCard } from './SlideCard';
import { ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import { usePresentationStore } from '../../stores/presentationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

const FOREST_BG = 'media:///Users/mac/.gemini/antigravity/brain/cf3b98ec-4448-4e7a-8f01-3c8b866cfa3c/dark_forest_background_1775749896276.png';

export function SlideGrid() {
  const { 
    currentServiceItem, 
    activeSlideIndex, 
    activeSlideId, 
    setActiveSlide, 
    nextSlide, 
    prevSlide,
    activeItemIndex,
    isRehearsal,
    toggleRehearsal
  } = usePresentationStore();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  const slides = useMemo(() => {
    if (!currentServiceItem) return [];
    
    if (currentServiceItem.type === 'song' && currentServiceItem.song) {
      try {
        const lyrics = JSON.parse(currentServiceItem.song.lyricsJson);
        return lyrics.map((l: any, i: number) => ({
          id: `${activeItemIndex}-${i}`,
          index: i + 1,
          label: l.label,
          text: l.text
        }));
      } catch (e) {
        return [];
      }
    }
    
    // For other types (Bible, Media, etc), treat as single slide for now or expand accordingly
    return [{
       id: `${activeItemIndex}-0`,
       index: 1,
       label: currentServiceItem.type.toUpperCase(),
       text: currentServiceItem.text || currentServiceItem.title || '(No Content)'
    }];
  }, [currentServiceItem, activeItemIndex]);

  return (
    <div className="flex-1 flex flex-col bg-[#0A0C10] overflow-hidden relative selection:bg-none">
      {/* Grid Container */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          <motion.div 
            key={activeItemIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-[1600px] mx-auto pb-32"
          >
            {slides.map((slide: any) => (
              <SlideCard
                key={slide.id}
                id={slide.id}
                index={slide.index}
                label={slide.label}
                text={slide.text}
                backgroundImage={FOREST_BG}
                isSelected={activeSlideId === slide.id}
                onClick={() => setActiveSlide(activeItemIndex, slide.index - 1)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination / Navigation Footer */}
      <div className="h-24 bg-[#0F1115] border-t border-[var(--border-subtle)] flex items-center justify-center gap-16 shrink-0 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] z-20">
        <div className="flex items-center gap-4">
           <button 
             onClick={toggleRehearsal}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-black text-[9px] uppercase tracking-widest ${isRehearsal ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-white/5 border-white/10 text-[var(--text-400)] hover:bg-white/10'}`}
           >
             {isRehearsal ? <Lock size={14}/> : <Unlock size={14}/>}
             {isRehearsal ? 'Rehearsal Mode' : 'Live Enabled'}
           </button>
        </div>

        <button 
          onClick={prevSlide}
          className="flex items-center gap-3 h-12 px-8 bg-[var(--surface-elevated)] border border-[var(--border-default)] text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[var(--accent-teal)] hover:border-[var(--accent-teal)] hover:text-black hover:scale-105 active:scale-95 transition-all shadow-xl active:brightness-90 group"
        >
          <ChevronLeft size={20} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
          Prev
        </button>
        
        <div className="flex flex-col items-center gap-2 min-w-[150px]">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-sm font-black text-white px-4 py-1.5 bg-black/60 border border-white/10 rounded-full shadow-inner tracking-[0.2em]">
              {(activeSlideIndex + 1).toString().padStart(2, '0')} <span className="text-[var(--text-600)] font-medium text-xs">/ {slides.length.toString().padStart(2, '0')}</span>
            </span>
          </div>
          <div className="flex items-center gap-5 text-[9px] font-black text-[var(--text-600)] uppercase tracking-[0.2em] opacity-80">
            <span className="flex items-center gap-1.5"><kbd className="bg-white/10 text-white px-2 py-0.5 rounded-lg border border-white/10 shadow-sm">← →</kbd> Next/Prev</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-[var(--danger)]/20 text-red-500 px-2 py-0.5 rounded-lg border border-red-500/20 shadow-sm">B</kbd> Blank</span>
          </div>
        </div>

        <button 
          onClick={nextSlide}
          className="flex items-center gap-3 h-12 px-8 bg-[var(--surface-elevated)] border border-[var(--border-default)] text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[var(--accent-teal)] hover:border-[var(--accent-teal)] hover:text-black hover:scale-105 active:scale-95 transition-all shadow-xl active:brightness-90 group"
        >
          Next
          <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="w-px h-10 bg-[var(--border-subtle)]" />
        
        <div className="flex flex-col items-start -gap-1">
           <span className="text-[10px] font-black text-[var(--text-400)] uppercase tracking-widest">Presenter</span>
           <span className="text-xs font-black text-white uppercase tracking-tighter truncate max-w-[120px]">
             {currentServiceItem?.title || 'No Selection'}
           </span>
        </div>
      </div>
    </div>
  );
}
