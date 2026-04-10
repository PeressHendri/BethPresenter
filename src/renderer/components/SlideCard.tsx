import React from 'react';

export interface Slide {
  id: number;
  label: string;
  text: string;
}

export function SlideCard({ 
  slide, 
  index, 
  isSelected, 
  onSelect,
  onGoLive,
  backgroundImage 
}: { 
  slide: Slide, 
  index: number, 
  isSelected: boolean, 
  onSelect: () => void,
  onGoLive?: () => void,
  backgroundImage: string 
}) {
  return (
    <div 
      onClick={onSelect}
      onDoubleClick={onGoLive}
      className={`
        relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 aspect-video
        ${isSelected 
          ? 'border-[#00D2D2] shadow-[0_0_25px_rgba(0,210,210,0.5)] scale-[1.03] z-10' 
          : 'border-transparent hover:border-white/20 hover:bg-white/5'}
        bg-[#050505]
      `}
    >
      {/* Background Image Layer */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ${isSelected ? 'opacity-80 scale-105' : 'opacity-40 group-hover:opacity-50'}`}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
      {/* Number Badge */}
      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md border border-white/5 rounded text-[10px] text-white font-black">
        {index}
      </div>

      {/* Type Badge (V1, CHORUS, etc.) */}
      {slide.label && (
        <div className={`
          absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] text-black font-black uppercase tracking-wider
          ${slide.label.startsWith('V') ? 'bg-[#008CFF]' : 'bg-[#00D2D2]'}
          ${slide.label.includes('B') ? 'bg-[#FF7E33]' : ''}
        `}>
          {slide.label}
        </div>
      )}

      {/* Centered Text Content */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <p className={`
          text-white text-center font-bold uppercase tracking-[0.08em] text-[13px] leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,1)]
          ${slide.text === '(blank)' ? 'opacity-30 italic lowercase font-normal text-[10px]' : ''}
        `}>
          {slide.text}
        </p>
      </div>

      {/* Selected Indicator Shine */}
      {isSelected && (
        <div className="absolute top-0 right-0 p-1">
           <div className="w-1.5 h-1.5 rounded-full bg-[#00D2D2] animate-ping" />
        </div>
      )}

      {/* Hover State Info */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00D2D2]">Double-click to Live</span>
      </div>
    </div>
  );
}
