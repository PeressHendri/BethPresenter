import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2, EyeOff, Monitor } from 'lucide-react';

const SlideRenderer = React.memo(({ 
  slide,           
  format,          
  globalBg,        
  showLabel = true,
  showLiveIndicator = false,
  showControls = false, 
  isPlaying = true, // Added for external control
  isMuted: isMutedProp = false, // Added for external control
  isLoop: isLoopProp = true, // Added for external control
  className = "",
  onSlideEnd
}) => {
  const [isPlayingLocal, setIsPlayingLocal] = useState(isPlaying);
  const [isMutedLocal, setIsMutedLocal] = useState(isMutedProp);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  // Sync with external props
  useEffect(() => {
    setIsPlayingLocal(isPlaying);
    if (videoRef.current) {
      if (isPlaying) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    setIsMutedLocal(isMutedProp);
  }, [isMutedProp]);

  // DEBUGGING
  useEffect(() => {
    if (slide) {
      console.log("SlideRenderer Render:", {
        type: slide.type || slide.contentType,
        url: slide.url || slide.mediaUrl || slide.path,
        globalBg: !!globalBg
      });
    }
  }, [slide, globalBg]);

  // Robust Normalization
  // Unify and Robustly Extract Slide Properties
  const d = slide?.data || slide || {};
  const s = d.slides && d.slides[0] ? d.slides[0] : d;
  
  const rawType = d.contentType || d.type || s.type || slide?.contentType || slide?.type || 'song';
  const slideType = rawType.toLowerCase();

  const slideContent = d.content || s.content;
  const slideLabel = d.label || slide?.label || d.title;

  const slideUrl = d.url || d.mediaUrl || s.url || s.mediaUrl || s.path || d.path;
                   
  const slideEmbedUrl = d.embedUrl || s.embedUrl;

  const isVideo = slideType === 'video' || (slideUrl && slideUrl.match(/\.(mp4|webm|ogg|mov)$/i));
  const isImage = slideType === 'image' || (slideUrl && slideUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i));
  const isPPT = slideType === 'ppt' || !!slideEmbedUrl;
  const isCountdown = slideType === 'countdown';
  const isBible = slideType === 'bible';

  const textFormat = useMemo(() => format || slide?.format || slide?.data?.format || {}, [format, slide]);

  // Reset states when URL changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [slideUrl]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) videoRef.current.muted = !isMuted;
  };

  const renderBackground = () => {
    if (slide?.isBlank) return <div className="absolute inset-0 bg-black z-0" />;

    // Priority: Slide-Specific Background > Global Background
    const sBg = slide?.background;
    const hasSlideBg = sBg && (sBg.mediaUrl || sBg.color || (sBg.type && sBg.type !== 'Solid Color'));
    const bg = hasSlideBg ? sBg : (globalBg || slide?.globalBackground);
    
    if (!bg) return <div className="absolute inset-0 bg-[#0a0a0a] z-0" />;

    const bgUrl = bg.url || bg.mediaUrl;
    const bgType = bg.type || (bgUrl?.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image');

    if (bgType === 'video' || bg.type === 'Video (MP4)') {
      return (
        <video key={bgUrl} src={bgUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" />
      );
    }
    if (bgType === 'image' || bg.type === 'Image') {
      return <img key={bgUrl} src={bgUrl} className="absolute inset-0 w-full h-full object-cover z-0" alt="" />;
    }
    return <div className="absolute inset-0 z-0" style={{ backgroundColor: bg.color || '#0a0a0a' }} />;
  };

  const renderContent = () => {
    if (slide?.isBlank) return null;

    if (isPPT) {
      return (
        <iframe 
          key={slideEmbedUrl}
          src={slideEmbedUrl} 
          className="absolute inset-0 w-full h-full border-0 bg-white z-10"
          allowFullScreen
        />
      );
    }

    if (isVideo) {
      return (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-10 group/video">
          {isLoading && !hasError && (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/40 backdrop-blur-sm">
                <Loader2 className="w-10 h-10 text-white animate-spin opacity-50" />
                <span className="text-white/30 text-[10px] font-black uppercase mt-4 tracking-widest">Memuat Video...</span>
             </div>
          )}
          {hasError ? (
            <div className="flex flex-col items-center p-8 text-center opacity-40">
              <EyeOff size={44} className="text-white mb-4" />
              <span className="text-white text-xs font-bold uppercase tracking-widest">Video Error</span>
            </div>
          ) : (
            <video 
              ref={videoRef}
              key={slideUrl}
              src={slideUrl} 
              autoPlay={isPlayingLocal}
              loop={isLoopProp} 
              muted={isMutedLocal} 
              playsInline
              onLoadStart={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
              onError={() => { setHasError(true); setIsLoading(false); }}
              onEnded={onSlideEnd}
              className="w-full h-full object-contain"
            />
          )}
          {showControls && !hasError && (
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 transition-opacity z-30 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
               <button onClick={togglePlay} className="text-white hover:text-red-400 p-1">{isPlaying ? <Pause size={18} /> : <Play size={18} />}</button>
               <div className="w-px h-4 bg-white/10" />
               <button onClick={toggleMute} className="text-white hover:text-red-400 p-1">{isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
            </div>
          )}
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          {isLoading && !hasError && <Loader2 className="w-8 h-8 text-white/20 animate-spin" />}
          <img 
            key={slideUrl}
            src={slideUrl} 
            className="w-full h-full object-contain" 
            alt={slideLabel || ""} 
            onLoad={() => setIsLoading(false)}
            onError={() => { setHasError(true); setIsLoading(false); }}
          />
        </div>
      );
    }

    // Handle Countdown
    if (isCountdown) {
      const mins = Math.floor((d.remainingSeconds || 0) / 60);
      const secs = (d.remainingSeconds || 0) % 60;
      const timeStr = mins + ':' + String(secs).padStart(2,'0');

      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-[8cqw] pointer-events-none z-20">
          {d.title && <div className="text-[3cqw] text-white/50 font-[900] tracking-[0.2em] uppercase mb-[2cqw]">{d.title}</div>}
          <div className="text-[20cqw] font-[950] text-white leading-none">{timeStr}</div>
          {d.message && <div className="text-[2.5cqw] text-white/40 font-[700] tracking-[0.2em] uppercase mt-[2cqw]">{d.message}</div>}
        </div>
      );
    }

    // Default: Text Overlay (Songs / Bible)
    if (!slideContent && !isBible) return null;

    // Handle Bible Structure
    if (isBible) {
      const ref = d.reference || slideLabel || '';
      const verse = slideContent || '';
      const isRefBottom = d.referencePos === 'bottom';

      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-[8cqw] pointer-events-none z-20 gap-[2vh] text-center w-full">
          {!isRefBottom && ref && <div className="font-['Outfit'] text-[clamp(14px,2vh,26px)] text-white/45 font-bold tracking-[0.2em] uppercase w-full">{ref}</div>}
          <div className="font-['Outfit'] text-white font-bold leading-[1.5] whitespace-pre-wrap w-full text-[clamp(24px,4cqw,80px)]">{verse}</div>
          {isRefBottom && ref && <div className="font-['Outfit'] text-[clamp(14px,2vh,26px)] text-white/45 font-bold tracking-[0.2em] uppercase w-full">{ref}</div>}
        </div>
      );
    }

    const textStyles = {
      fontFamily: textFormat.fontFamily ? `'${textFormat.fontFamily}', Outfit, sans-serif` : "'Outfit', sans-serif",
      fontSize: textFormat.fontSize ? (typeof textFormat.fontSize === 'number' ? `${textFormat.fontSize}px` : textFormat.fontSize) : '5.5cqw',
      color: textFormat.textColor || '#FFFFFF',
      fontWeight: textFormat.isBold === false ? '700' : '900',
      fontStyle: textFormat.isItalic ? 'italic' : 'normal',
      textAlign: textFormat.textAlign || textFormat.alignment || 'center',
      lineHeight: textFormat.lineHeight || 1.15,
      letterSpacing: textFormat.spacing ? `${textFormat.spacing}px` : 'normal',
      textShadow: textFormat.shadowType === 'Strong' 
        ? '3px 3px 0 rgba(0,0,0,0.9), 6px 6px 0 rgba(0,0,0,0.4)'
        : textFormat.shadowType === 'Large'
        ? '0 10px 40px rgba(0,0,0,0.85)'
        : textFormat.shadowType === 'Glow'
        ? `0 0 20px ${textFormat.textColor || '#FFFFFF'}`
        : textFormat.shadowType === 'None'
        ? 'none'
        : '0 4px 16px rgba(0,0,0,0.85)',
      backgroundColor: textFormat.bgOpacity > 0 
        ? ((textFormat.textBackgroundColor && !textFormat.textBackgroundColor.startsWith('#')) ? textFormat.textBackgroundColor : `rgba(${textFormat.textBackgroundColor ? parseInt(textFormat.textBackgroundColor.slice(1,3),16)+','+parseInt(textFormat.textBackgroundColor.slice(3,5),16)+','+parseInt(textFormat.textBackgroundColor.slice(5,7),16) : '0,0,0'},${textFormat.bgOpacity/100})`)
        : 'transparent',
      padding: '2cqw',
      borderRadius: '1cqw',
    };

    const vAlign = textFormat.vAlignment || 'Center';
    const verticalAlignClass = vAlign === 'Top' ? 'items-start' : vAlign === 'Bottom' ? 'items-end' : 'items-center';

    // Add textTransform
    textStyles.textTransform = textFormat.isUppercase ? 'uppercase' : 'none';

    return (
      <div className={`absolute inset-0 flex flex-col ${verticalAlignClass} justify-center p-[8cqw] pointer-events-none z-20`}>
        {slideLabel && showLabel && (
          <div className="absolute top-[4cqw] left-[4cqw] text-white/40 text-[1.2cqw] font-black uppercase tracking-[0.3em] bg-black/20 px-[0.8cqw] py-[0.3cqw] rounded backdrop-blur-sm">
            {slideLabel}
          </div>
        )}
        <div style={textStyles} className="whitespace-pre-wrap break-words w-full">
          {slideContent}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden bg-black select-none ${className}`}
      style={{ containerType: 'inline-size' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderBackground()}
      {renderContent()}
      {showLiveIndicator && (
        <div className="absolute top-[2cqw] right-[2cqw] z-30 bg-red-600 text-white px-[1.2cqw] py-[0.4cqw] rounded-full text-[1cqw] font-black flex items-center gap-[0.5cqw] shadow-2xl">
          <span className="w-[0.5cqw] h-[0.5cqw] bg-white rounded-full animate-pulse"></span>
          LIVE
        </div>
      )}
    </div>
  );
});

export default SlideRenderer;
