import React, { useRef } from 'react';
import { Film, ImageIcon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaItem {
  id: string;
  filename: string;
  filepath: string;
  type: 'image' | 'video';
  sizeBytes: number;
  exists: boolean;
  createdAt: string;
}

interface MediaCardProps {
  item: MediaItem;
  url?: string;
  selected: boolean;
  onSelect: () => void;
  onSetBackground: (item: MediaItem) => Promise<void>;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function MediaCard({ item, url, selected, onSelect, onSetBackground }: MediaCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (item.type === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (item.type === 'video' && videoRef.current) {
      videoRef.current.pause();
      // Optional: rewind to start
      // videoRef.current.currentTime = 0; 
    }
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      className={`group relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all bg-surface-base h-[180px] flex flex-col ${
        selected ? 'border-accent-500 shadow-xl shadow-accent-500/20' : 'border-transparent hover:border-border-strong hover:shadow-lg'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        {item.type === 'image' && url ? (
          <img 
             src={url} 
             alt={item.filename} 
             className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
          />
        ) : item.type === 'video' && url ? (
          <video 
             ref={videoRef}
             src={url}
             muted
             loop
             playsInline
             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          item.type === 'video' ? <Film size={32} className="text-white/20" /> : <ImageIcon size={32} className="text-white/20" />
        )}
        
        {/* Set as Background Hover Action */}
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
          >
             <button 
                onClick={(e) => { e.stopPropagation(); onSetBackground(item); }}
                className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-lg font-bold text-xs shadow-xl active:scale-95 transition-transform"
             >
                <Monitor size={14} /> Set as Background
             </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Info Bar */}
      <div className="h-14 bg-surface-sidebar px-3 py-2 border-t border-border-default flex flex-col justify-center">
         <p className="text-xs font-semibold text-text-100 truncate w-full" title={item.filename}>
           {item.filename.replace(/^\d+_/, '')}
         </p>
         <div className="flex items-center justify-between mt-1">
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest text-white ${item.type === 'image' ? 'bg-blue-500/70' : 'bg-purple-500/70'}`}>
              {item.type}
            </span>
            <span className="text-[10px] text-text-400 font-mono">
              {formatBytes(item.sizeBytes)}
            </span>
         </div>
      </div>
    </div>
  );
}
