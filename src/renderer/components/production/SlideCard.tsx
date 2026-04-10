import React from 'react';
import { motion } from 'framer-motion';

export interface SlideCardProps {
  id: string | number;
  index: number;
  label?: string; 
  text: string;
  backgroundImage?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function SlideCard({ 
  id, index, label, text, backgroundImage, isSelected, onClick 
}: SlideCardProps) {
  return (
    <motion.div 
      layoutId={`slide-${id}`}
      onClick={onClick}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.96 }}
      className={`
        relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300
        ${isSelected 
          ? 'border-[var(--accent-green)] shadow-[0_12px_24px_rgba(0,224,145,0.25)] ring-2 ring-[var(--accent-green)]/20' 
          : 'border-white/5 hover:border-[var(--accent-teal)]/40'}
        bg-[#050505] aspect-video z-0
      `}
    >
      {/* Background Layer with Dark Forest Image */}
      {backgroundImage && (
        <motion.div 
          initial={false}
          animate={{ opacity: isSelected ? 0.6 : 0.3 }}
          className="absolute inset-0 bg-cover bg-center grayscale-[0.3] group-hover:grayscale-0"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      {/* Grid Overlay for Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

      {/* Index Badge */}
      <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/80 border border-white/10 rounded-lg text-[10px] text-white font-black tracking-tighter z-10">
        {index}
      </div>

      {/* Section Badge (V1, CHORUS, etc.) */}
      {label && (
        <div className={`
          absolute top-3 right-3 px-3 py-1 rounded-lg text-[10px] text-black font-black uppercase tracking-widest z-10
          ${label.startsWith('V') ? 'bg-[var(--accent-blue)]' : 'bg-[var(--accent-green)]'}
          ${label.includes('B') ? 'bg-orange-500' : ''}
        `}>
          {label}
        </div>
      )}

      {/* Main Content Text */}
      <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/10">
        <p className={`
          text-white text-center font-bold uppercase tracking-[0.15em] text-[15px] leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,1)]
          ${text === '(blank)' ? 'opacity-30 italic lowercase font-normal' : ''}
          line-clamp-4
        `}>
          {text}
        </p>
      </div>
      
      {/* Active Indicator Pulse */}
      {isSelected && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
           <span className="text-[9px] font-black text-[var(--accent-green)] uppercase tracking-widest">Live Now</span>
           <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-green)] shadow-[0_0_12px_var(--accent-green)] animate-ping" />
        </div>
      )}
    </motion.div>
  );
}
