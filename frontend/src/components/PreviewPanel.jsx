import React from 'react';
import { Play, Tv, Share2, Maximize2, Monitor } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import SlideRenderer from './SlideRenderer';

const PreviewPanel = () => {
  const { 
    schedule, 
    selectedItemIndex, 
    liveSlideIndex, 
    setLiveSlide, 
    isRehearsal,
    language 
  } = useProject();

  const selectedItem = schedule[selectedItemIndex];
  const slides = selectedItem?.slides || [];

  const t = {
    id: { preview: "PRATINJAU", practice: "LATIHAN", active: "LIVE", empty: "Pilih item untuk melihat slide" },
    en: { preview: "PREVIEW", practice: "REHEARSAL", active: "LIVE", empty: "Select an item to view slides" }
  }[language] || t.id;

  const handleSlideClick = (slideIndex) => {
    setLiveSlide(selectedItemIndex, slideIndex);
  };

  return (
    <div className="flex-[2] flex flex-col bg-white overflow-hidden">
      {/* Panel Header */}
      <div className="h-[56px] px-6 flex items-center justify-between border-b border-[#E2E2E6] bg-white shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-[11px] font-black tracking-[0.2em] text-[#8E8E93] uppercase">{t.preview}</h3>
          {selectedItem && (
            <>
              <div className="w-1 h-1 bg-[#E2E2E6] rounded-full" />
              <span className="text-[12px] font-black text-[#800000]">{selectedItem.title}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isRehearsal && (
            <div className="bg-[#5856D6] text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {t.practice.toUpperCase()}
            </div>
          )}
          <button className="p-2 text-[#AEAEB2] hover:text-[#800000] transition-colors">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Grid Slides */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA] custom-scrollbar">
        {slides.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {slides.map((slide, idx) => {
              const isLive = liveSlideIndex?.item === selectedItemIndex && liveSlideIndex?.slide === idx;
              
              return (
                <div 
                  key={idx}
                  onClick={() => handleSlideClick(idx)}
                  className={`relative aspect-video group cursor-pointer rounded-xl overflow-hidden border-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                    isLive 
                      ? 'border-[#800000] ring-4 ring-[#80000010] shadow-2xl' 
                      : 'border-white hover:border-[#80000040] shadow-md hover:shadow-xl'
                  }`}
                >
                  <SlideRenderer 
                    slide={{...selectedItem, ...slide}}
                    showLabel={false}
                    className="w-full h-full"
                  />
                  
                  {/* Overlay Info */}
                  <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${isLive ? 'opacity-100 !bg-transparent' : ''}`}>
                    {!isLive && <Play size={32} className="text-white drop-shadow-lg" fill="currentColor" />}
                  </div>

                  {/* Slide Label/Index */}
                  <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-black tracking-widest ${
                    isLive 
                      ? 'bg-[#800000] text-white' 
                      : 'bg-black/60 text-white'
                  }`}>
                    {slide.label || `${idx + 1}`}
                  </div>

                  {/* LIVE Badge */}
                  {isLive && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black shadow-lg animate-pulse">
                      <div className="w-1 h-1 bg-white rounded-full" />
                      {t.active}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <Monitor size={48} className="mb-4" />
            <p className="text-[12px] font-black uppercase tracking-widest leading-relaxed">
              {t.empty}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
