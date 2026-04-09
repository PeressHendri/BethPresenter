import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlackOverlayProps {
  isVisible: boolean;
}

export function BlackOverlay({ isVisible }: BlackOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.3, ease: 'easeInOut' }}
           className="absolute inset-0 z-[100] bg-black pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}
