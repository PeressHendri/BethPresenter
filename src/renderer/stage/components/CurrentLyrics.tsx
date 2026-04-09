import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoFitText } from '../../../renderer/output/hooks/useAutoFitText';

interface SlideInfo {
  label: string;
  text: string;
  songTitle?: string;
}

interface CurrentLyricsProps {
  slide: SlideInfo | null;
  isBlank: boolean;
}

export function CurrentLyrics({ slide, isBlank }: CurrentLyricsProps) {
  const [dims, setDims] = React.useState({ w: 0, h: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
       const { width, height } = entries[0].contentRect;
       setDims({ w: width, h: height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const fontSize = useAutoFitText({
    text: slide?.text || '',
    fontFamily: 'system-ui',
    fontWeight: 800,
    lineHeight: 1.4,
    letterSpacing: 0,
    textTransform: 'none',
    containerWidth: dims.w - 80, // Padding compensation
    containerHeight: dims.h - 80,
    minFontSize: 30,
    maxFontSize: 140,
    isActive: !!slide?.text && !isBlank && dims.w > 0
  });

  return (
    <div className="relative flex-1 bg-black flex flex-col items-center justify-center border-r-[3px] border-border-default p-10 overflow-hidden box-border h-full" ref={containerRef}>
      
      {/* Label and Info */}
      <div className="absolute top-8 left-10 flex gap-4 items-center z-20">
        {slide?.label && (
          <span className="text-sm font-bold tracking-widest text-[#6B7280] uppercase">
            {slide.label}
          </span>
        )}
        {slide?.songTitle && (
          <span className="text-xs font-semibold tracking-wide text-[#9CA3AF]">
            ♪ {slide.songTitle}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {slide && !isBlank ? (
          <motion.div
            key={slide.text}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex items-center justify-center"
          >
            <p
              className="font-bold text-[#F9FAFB] text-center whitespace-pre-wrap drop-shadow-2xl"
              style={{ lineHeight: 1.4, fontSize: `${fontSize}px` }}
            >
              {slide.text}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="blank"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center w-full h-full"
          >
             {isBlank ? (
               <span className="text-xl font-bold tracking-[0.2em] text-[#EF4444] border-2 border-[#EF4444] px-4 py-1 rounded-full bg-red-900/20">BLANK</span>
             ) : (
               <span className="text-xl text-[#374151]">No Active Slide</span>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
