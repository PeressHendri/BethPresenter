import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Music, Video, Image as ImageIcon, FileText, 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Eye, EyeOff
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import useLyricsToggle from '../hooks/useLyricsToggle';

// Inline clsx replacement
const cx = (...args) => args.filter(Boolean).join(' ');

const SlideRenderer = React.memo(({
  slide,
  format,
  globalBg,
  showLabel       = true,
  showLiveIndicator = false,
  showControls    = false,
  isPlaying       = true,
  isMuted: isMutedProp  = false,
  isLoop: isLoopProp    = true,
  className       = '',
  showCheckered   = false,
  onSlideEnd,
}) => {
  const [isPlayingLocal, setIsPlayingLocal] = useState(isPlaying);
  const [isMutedLocal,   setIsMutedLocal]   = useState(isMutedProp);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError,  setHasError]  = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  // Sync external props to local state
  useEffect(() => {
    setIsPlayingLocal(isPlaying);
    if (videoRef.current) {
      if (isPlaying) videoRef.current.play().catch(() => {});
      else           videoRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    setIsMutedLocal(isMutedProp);
    if (videoRef.current) videoRef.current.muted = isMutedProp;
  }, [isMutedProp]);

  // MODUL 19: Lyrics Toggle with Fade Animation
  const {
    isLyricsVisible,
    isTransitioning,
    toggleLyrics,
    showLyrics,
    hideLyrics,
    styles: lyricsStyles
  } = useLyricsToggle(true); // Default to visible

  // Data Normalization
  const d = useMemo(() => {
    if (!slide) return {};
    const inner = slide.data || slide.payload || slide;
    if (inner.slides && inner.slides.length > 0 && !inner.content && !inner.url && !inner.mediaUrl) {
      return { ...inner, ...inner.slides[0] };
    }
    return inner;
  }, [slide]);

  const rawType   = d.contentType || d.type || d.mediaType || 'song';
  const slideType = String(rawType).toLowerCase();
  const slideUrl  = d.url || d.mediaUrl || d.path || '';
  
  const isVideo = slideType === 'video' || /\.(mp4|webm|ogg|mov|m4v)$/i.test(slideUrl);
  const isImage = slideType === 'image' || (/\.(jpg|jpeg|png|gif|webp)$/i.test(slideUrl) && !isVideo);
  const isBlank = !!(slide?.isBlank || d.isBlank);

  // Formatting Logic (Modul 7)
  const styles = useMemo(() => {
    const f = format || d.format || slide?.format || {};
    const textColor = f.textColor || '#FFFFFF';
    const opacity = f.bgOpacity !== undefined ? Number(f.bgOpacity) : 0;
    
    const shadow = (() => {
      const type = f.shadowType;
      if (type === 'None') return 'none';
      if (type === 'Soft') return '0 8px 32px rgba(0,0,0,0.8)';
      if (type === 'Strong') return '4px 4px 0 rgba(0,0,0,0.9)';
      if (type === 'Glow') return `0 0 25px ${textColor}`; // Glow feature
      return '0 4px 16px rgba(0,0,0,0.85)';
    })();

    return {
      fontFamily: f.fontFamily || 'Outfit',
      fontSize: f.fontSize || '5.5cqw',
      fontWeight: f.isBold ? '900' : '700',
      textAlign: f.textAlign || f.alignment || 'center',
      vAlignment: f.vAlignment || 'Center',
      textColor,
      lineHeight: f.lineHeight || 1.15,
      letterSpacing: f.spacing !== undefined ? `${f.spacing}px` : 'normal',
      textTransform: f.isUppercase ? 'uppercase' : 'none',
      textShadow: shadow,
      textBg: opacity > 0 ? `rgba(0,0,0,${opacity/100})` : 'transparent',
    };
  }, [format, d.format, slide?.format]);

  // Rendering logic for Background and Content...
  const renderContent = () => {
    if (isBlank) return null;

    if (isVideo && slideUrl) {
      return (
        <div 
          className="absolute inset-0 bg-black flex items-center justify-center z-10 group/video"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <video
            ref={videoRef}
            src={slideUrl}
            autoPlay={isPlayingLocal}
            loop={isLoopProp}
            muted={isMutedLocal}
            playsInline
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onEnded={onSlideEnd}
            className="w-full h-full object-contain"
          />
          
          {/* VIDEO CONTROLS OVERLAY (Modul 8) */}
          {showControls && (
            <div className={cx(
              "absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4",
              "bg-black/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 z-30 transition-all duration-300",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <button onClick={() => {
                if (videoRef.current) {
                  const next = !isPlayingLocal;
                  if (next) videoRef.current.play(); else videoRef.current.pause();
                  setIsPlayingLocal(next);
                }
              }} className="text-white hover:text-[#800000]">
                {isPlayingLocal ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <button 
                onClick={() => { if(videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); setIsPlayingLocal(true); }}} 
                className="text-white hover:text-[#800000]"
              >
                <RotateCw size={18} />
              </button>
              <div className="w-px h-4 bg-white/20" />
              <button onClick={() => setIsMutedLocal(!isMutedLocal)} className="text-white hover:text-[#800000]">
                {isMutedLocal ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (isImage && slideUrl) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <img src={slideUrl} className="w-full h-full object-contain" alt="" />
        </div>
      );
    }

    // Default: Song Text Rendering
    const textStyle = {
      fontFamily: styles.fontFamily,
      fontSize: typeof styles.fontSize === 'number' ? `${styles.fontSize}px` : styles.fontSize,
      color: styles.textColor,
      fontWeight: styles.fontWeight,
      textAlign: styles.textAlign,
      lineHeight: styles.lineHeight,
      letterSpacing: styles.letterSpacing,
      textTransform: styles.textTransform,
      textShadow: styles.textShadow,
      backgroundColor: styles.textBg,
      padding: styles.textBg !== 'transparent' ? '0.2em 0.5em' : '0',
      borderRadius: '0.1em',
      boxDecorationBreak: 'clone',
      WebkitBoxDecorationBreak: 'clone'
    };

    return (
      <div className={cx("absolute inset-0 flex flex-col p-[8cqw] pointer-events-none z-20", 
        styles.vAlignment === 'Top' ? 'justify-start' : styles.vAlignment === 'Bottom' ? 'justify-end' : 'justify-center'
      )}>
        <div style={textStyle} className="whitespace-pre-wrap break-words w-full">
          {d.content || d.text}
        </div>
      </div>
    );
  };

  const handleLyricsToggle = () => {
    toggleLyrics();
  };

  return (
    <div className={cx("relative w-full h-full overflow-hidden bg-black select-none", className)} style={{ containerType: 'inline-size' }}>
      {/* Global/Slide Background */}
      {(globalBg || (slide?.globalBackground)) && (
        <div className="absolute inset-0 z-0">
          {globalBg?.type === 'video' ? (
            <video
              src={globalBg?.url}
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={globalBg?.url}
              className="w-full h-full object-cover"
              alt=""
            />
          )}
        </div>
      )}
      
      {isBlank ? (
        <div className="absolute inset-0 bg-black z-10" />
      ) : (
        <div className="absolute inset-0 z-10">
          {renderContent()}
        </div>
      )}
    </div>
  );
});

export default SlideRenderer;
