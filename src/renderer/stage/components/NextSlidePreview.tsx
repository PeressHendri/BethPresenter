import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlideInfo {
  label: string;
  text: string;
  songTitle?: string;
}

interface NextSlidePreviewProps {
  slide: SlideInfo | null;
}

export function NextSlidePreview({ slide }: NextSlidePreviewProps) {
  return (
    <div className="flex-1 bg-surface-sidebar border-b border-border-default flex flex-col p-6 min-w-[280px]">
      
      <div className="text-[10px] text-accent-400 font-bold uppercase tracking-[0.12em] mb-4">
        BERIKUTNYA ▼
      </div>

      <AnimatePresence mode="wait">
        {slide ? (
          <motion.div
            key={slide.text}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 0.6, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            {slide.label && (
              <span className="text-xs font-bold tracking-wider text-text-400 mb-2 uppercase">
                {slide.label}
              </span>
            )}
            <p className="text-2xl font-semibold leading-relaxed text-text-200 whitespace-pre-wrap flex-1">
              {slide.text}
            </p>
            {slide.songTitle && (
              <div className="mt-4 text-xs font-semibold text-amber-500">
                ♪ Next Item: {slide.songTitle}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center text-text-500 text-sm font-semibold"
          >
            End of Service / Last Slide
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
