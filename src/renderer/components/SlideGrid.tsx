import React from 'react';
import { SlideCard, Slide } from './SlideCard';
import { PaginationBar } from './PaginationBar';

export function SlideGrid({ 
  slides, 
  activeSlideId, 
  onSelectSlide,
  onGoLive,
  backgroundImage 
}: { 
  slides: Slide[], 
  activeSlideId: number | null, 
  onSelectSlide: (id: number) => void,
  onGoLive: (slide: Slide) => void,
  backgroundImage: string 
}) {
  return (
    <div className="flex-1 flex flex-col bg-[#0A0C10] overflow-hidden relative">
      {/* Grid Container */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1200px] mx-auto pb-10">
          {slides.map((slide) => (
            <SlideCard
              key={slide.id}
              slide={slide}
              index={slide.id}
              isSelected={slide.id === activeSlideId}
              onSelect={() => onSelectSlide(slide.id)}
              onGoLive={() => onGoLive(slide)}
              backgroundImage={backgroundImage}
            />
          ))}
        </div>
      </div>

      {/* Pagination Footer */}
      <PaginationBar current="2" total="123" />
    </div>
  );
}
