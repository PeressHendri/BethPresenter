import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoFitText } from '../hooks/useAutoFitText';

export interface FormattingData {
  fontFamily?: string;
  fontSize?: number | 'auto'; // if auto, useAutoFitText handles it
  fontWeight?: string | number;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  textShadow?: 'none' | 'soft' | 'strong' | 'glow';
  textColor?: string;
  textBackground?: string | null;
  textBackgroundOpacity?: number;
  paddingH?: number;
  paddingV?: number;
  overlayOpacity?: number;
  aspectRatio?: string;
}

interface LyricsLayerProps {
  text: string;
  title?: string;
  reference?: string;
  translation?: string;
  formatting: FormattingData;
  isHidden: boolean;
  mode: 'slide' | 'bible';
}

const SHADOW_MAPPING: Record<string, string> = {
  none: 'none',
  soft: '2px 2px 8px rgba(0,0,0,0.6)',
  strong: '3px 3px 12px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7)',
  glow: '0 0 20px rgba(255,255,255,0.5), 2px 2px 8px rgba(0,0,0,0.8)',
};

export function LyricsLayer({ text, title, reference, translation, formatting, isHidden, mode }: LyricsLayerProps) {
  const [winSize, setWinSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pHoriz = formatting.paddingH ?? 120;
  const pVert = formatting.paddingV ?? 80;

  // Render variables ensuring we calculate font size
  const rawContent = mode === 'slide' 
    ? (formatting.textTransform === 'uppercase' ? text.toUpperCase() : text)
    : (formatting.textTransform === 'uppercase' ? text.toUpperCase() : text);
    
  // Subtext height estimate to subtract from container height calculation for autoFit
  const hasSubtext = mode === 'bible' && reference;
  const extraPadding = hasSubtext ? 100 : 0; 
  
  const autoFontSize = useAutoFitText({
    text: rawContent,
    fontFamily: formatting.fontFamily || 'Inter, sans-serif',
    fontWeight: formatting.fontWeight || 800,
    lineHeight: formatting.lineHeight || 1.3,
    letterSpacing: formatting.letterSpacing || 0,
    textTransform: formatting.textTransform || 'none',
    containerWidth: winSize.w - (pHoriz * 2),
    containerHeight: winSize.h - (pVert * 2) - extraPadding,
    minFontSize: 24,
    maxFontSize: 140,
    isActive: formatting.fontSize === 'auto' && text.length > 0
  });

  const finalFontSize = formatting.fontSize === 'auto' ? autoFontSize : (formatting.fontSize || 64);

  // Styling maps
  const applyBg = formatting.textBackground && formatting.textBackground !== 'none';
  const bgOpacityHex = Math.floor((formatting.textBackgroundOpacity ?? 0.5) * 255).toString(16).padStart(2, '0');
  const bgColorValue = applyBg ? `${formatting.textBackground}${bgOpacityHex}` : 'transparent';

  const vAlignMap = {
    top: 'justify-start',
    center: 'justify-center',
    bottom: 'justify-end'
  };
  const justifyClass = vAlignMap[formatting.verticalAlign || 'center'];

  return (
    <div 
      className={`absolute inset-0 z-10 flex flex-col ${justifyClass} pointer-events-none transition-opacity duration-300`}
      style={{ 
        padding: `${pVert}px ${pHoriz}px`, 
        opacity: isHidden ? 0 : 1 
      }}
    >
       <AnimatePresence mode="wait">
          {text && (
             <motion.div
               key={text}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.98 }}
               transition={{ duration: 0.3, ease: 'easeOut' }}
               style={{ 
                  textAlign: formatting.textAlign || 'center',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: formatting.textAlign === 'center' ? 'center' : formatting.textAlign === 'left' ? 'flex-start' : 'flex-end'
               }}
             >
                {/* Optional Title (e.g. Slide Part Name in faint text) */}
                {mode === 'slide' && title && (
                   <div 
                     className="mb-4 font-bold text-white/50 tracking-[0.3em] uppercase"
                     style={{ fontSize: Math.max(16, finalFontSize * 0.25) + 'px' }}
                   >
                     {title}
                   </div>
                )}
                
                {/* Main Lyrics */}
                {/* Render dangerously if Bible because of <sup> markup, otherwise plain text */}
                <div 
                   dangerouslySetInnerHTML={mode === 'bible' ? { __html: rawContent } : undefined}
                   className="whitespace-pre-wrap break-words inline-block"
                   style={{
                     fontFamily: formatting.fontFamily || 'Inter, system-ui, sans-serif',
                     fontWeight: formatting.fontWeight || 800,
                     fontSize: `${finalFontSize}px`,
                     lineHeight: formatting.lineHeight || 1.3,
                     letterSpacing: `${formatting.letterSpacing || 0}px`,
                     textTransform: formatting.textTransform || 'none',
                     color: formatting.textColor || '#ffffff',
                     textShadow: SHADOW_MAPPING[formatting.textShadow || 'soft'],
                     backgroundColor: applyBg ? bgColorValue : 'transparent',
                     padding: applyBg ? '8px 24px' : '0',
                     borderRadius: applyBg ? '12px' : '0',
                     boxDecorationBreak: 'clone',
                     WebkitBoxDecorationBreak: 'clone',
                   }}
                >
                   {mode !== 'bible' && rawContent}
                </div>

                {/* Subtext info for Bible */}
                {mode === 'bible' && reference && (
                   <div 
                      className="mt-8 font-medium text-white/80 tracking-wider"
                      style={{ 
                         fontSize: Math.max(20, finalFontSize * 0.35) + 'px',
                         textShadow: SHADOW_MAPPING['soft']
                      }}
                   >
                      {reference} {translation && <span className="opacity-70 text-[0.8em]">({translation})</span>}
                   </div>
                )}
             </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
}
