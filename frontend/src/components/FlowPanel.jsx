import React, { useMemo } from 'react';
import { 
  ChevronRight, ArrowRight, Clock, Info, 
  Settings, Play, Pause, Square, Zap
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import SlideRenderer from './SlideRenderer';

const FlowPanel = () => {
  const { 
    schedule, 
    selectedItemIndex, 
    liveSlideIndex, 
    isRehearsal,
    toggleRehearsal,
    language 
  } = useProject();

  const currentTime = useMemo(() => new Date(), []);
  
  // Calculate Next Slide
  const nextSlideData = useMemo(() => {
    if (!liveSlideIndex) return null;
    const currentItem = schedule[liveSlideIndex.item];
    if (!currentItem) return null;

    // Check if there is next slide in current item
    if (liveSlideIndex.slide < currentItem.slides.length - 1) {
      return {
        item: currentItem,
        slide: currentItem.slides[liveSlideIndex.slide + 1],
        isSameItem: true
      };
    }
    
    // Check if there is a next item
    if (liveSlideIndex.item < schedule.length - 1) {
      const nextItem = schedule[liveSlideIndex.item + 1];
      return {
        item: nextItem,
        slide: nextItem.slides?.[0],
        isSameItem: false
      };
    }

    return null;
  }, [liveSlideIndex, schedule]);

  const t = {
    id: { next: "BERIKUTNYA", flow: "ALUR IBADAH", practice: "Mulai Latihan", endPractice: "Akhiri Latihan", live: "LIVE MODE" },
    en: { next: "NEXT", flow: "SERVICE FLOW", practice: "Start Rehearsal", endPractice: "End Rehearsal", live: "LIVE MODE" }
  }[language] || t.id;

  return (
    <div className="flex-1 flex flex-col bg-white border-l border-[#E2E2E6] overflow-hidden">
      {/* Next Slide Preview */}
      <div className="h-[240px] flex flex-col shrink-0 border-b border-[#E2E2E6]">
        <div className="px-4 py-3 flex items-center justify-between bg-[#F8F9FA]/80">
          <h3 className="text-[10px] font-black tracking-[0.2em] text-[#8E8E93] uppercase flex items-center gap-2">
            <ArrowRight size={12} className="text-[#800000]" />
            {t.next}
          </h3>
          {nextSlideData && !nextSlideData.isSameItem && (
            <span className="text-[9px] font-black text-white bg-[#800000] px-2 py-0.5 rounded-full uppercase">Item Baru</span>
          )}
        </div>
        
        <div className="flex-1 p-4 bg-[#F1F1F3]">
          <div className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-white/50 bg-[#000]">
            {nextSlideData ? (
              <SlideRenderer 
                slide={{...nextSlideData.item, ...nextSlideData.slide}}
                showLabel={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#424245] opacity-20">
                <Square size={48} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Flow / Item List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F1F1F3]">
          <h3 className="text-[10px] font-black tracking-[0.2em] text-[#8E8E93] uppercase flex items-center gap-2">
            <Zap size={12} className="text-[#800000]" />
            {t.flow}
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {schedule.map((item, idx) => {
            const isSelected = selectedItemIndex === idx;
            const isLive = liveSlideIndex?.item === idx;

            return (
              <div 
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  isLive 
                  ? 'bg-[#80000005] border-[#80000020]' 
                  : isSelected ? 'bg-white border-[#F1F1F3]' : 'border-transparent'
                }`}
              >
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                  isLive ? 'bg-red-600 animate-pulse' : isSelected ? 'bg-[#80000040]' : 'bg-[#E2E2E6]'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-black truncate ${isLive ? 'text-[#800000]' : 'text-[#424245]'}`}>
                    {item.title}
                  </p>
                  <p className="text-[10px] font-bold text-[#AEAEB2] truncate uppercase tracking-tighter">
                    {item.author || 'Pujian'}
                  </p>
                </div>
                {isLive && <span className="text-[8px] font-black text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded uppercase">Live</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rehearsal Footer Controls */}
      <div className="p-4 bg-white border-t border-[#E2E2E6] space-y-3 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <button 
          onClick={toggleRehearsal}
          className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
            isRehearsal 
            ? 'bg-[#5856D6] hover:bg-[#4745B8] text-white' 
            : 'bg-white border border-[#E2E2E6] text-[#424245] hover:border-[#80000040]'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isRehearsal ? 'bg-white animate-pulse' : 'bg-[#AEAEB2]'}`} />
          <span className="text-[12px] font-black uppercase tracking-widest">
            {isRehearsal ? 'AKHIRI LATIHAN' : 'MULAI LATIHAN'}
          </span>
        </button>

        <div className="flex items-center justify-between px-2 opacity-50">
          <div className="flex items-center gap-2 text-[10px] font-black">
            <Clock size={12} />
            <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest">{isRehearsal ? 'LATIHAN MODE' : 'LIVE MODE'}</div>
        </div>
      </div>
    </div>
  );
};

export default FlowPanel;
