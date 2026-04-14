import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2, EyeOff, Monitor } from 'lucide-react';
import clsx from 'clsx';

const SlideRenderer = React.memo(({ 
  slide,           
  format,          
  globalBg,        
  showLabel = true,
  showLiveIndicator = false,
  showControls = false, 
  isPlaying = true,
  isMuted: isMutedProp = false,
  isLoop: isLoopProp = true,
  className = "",
  showCheckered = false,
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

  // Robust Normalization
  const d = slide?.data || slide || {};
  const s = d.slides && d.slides[0] ? d.slides[0] : d;
  
  const rawType = d.contentType || d.type || s.type || slide?.contentType || slide?.type || d.mediaType || s.mediaType || 'song';
  const slideType = String(rawType).toLowerCase();

  const slideContent = d.content || s.content || d.text || s.text || "";
  const slideLabel = d.label || slide?.label || d.title || "";

  const slideUrl = d.url || d.mediaUrl || s.url || s.mediaUrl || s.path || d.path;
  const slideEmbedUrl = d.embedUrl || s.embedUrl;

  const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'm4v'];
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  
  const isVideo = slideType === 'video' || (slideUrl && videoExts.some(ext => String(slideUrl).toLowerCase().endsWith(`.${ext}`))) || (slideUrl && String(slideUrl).match(/\.(mp4|webm|ogg|mov|m4v)$/i));
  const isImage = slideType === 'image' || (slideUrl && imageExts.some(ext => String(slideUrl).toLowerCase().endsWith(`.${ext}`))) || (slideUrl && String(slideUrl).match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i));
  const isPPT = slideType === 'ppt' || !!slideEmbedUrl;
  const isCountdown = slideType === 'countdown';
  const isBible = slideType === 'bible' || slideType === 'scripture';

  // Merge Styles (Prop format > Slide Format > Default)
  const styles = useMemo(() => {
    const base = format || d.format || s.format || slide?.format || {};
    const textColor = base.textColor || base.color || '#FFFFFF';
    const bgOpacity = base.bgOpacity !== undefined ? base.bgOpacity : 0;
    const txtBgColor = base.textBackgroundColor || base.txtBgColor || '#000000';
    
    // Hex Opacity Conversion
    const alpha = Math.round(bgOpacity * 2.55).toString(16).padStart(2, '0');
    const backgroundColor = bgOpacity > 0 ? (txtBgColor.startsWith('#') ? `${txtBgColor}${alpha}` : `rgba(0,0,0,${bgOpacity/100})`) : 'transparent';

    return {
      fontFamily: base.fontFamily || 'Outfit',
      fontSize: base.fontSize || '5.5cqw',
      fontWeight: base.isBold ? '900' : (base.fontWeight || '700'),
      fontStyle: base.isItalic ? 'italic' : 'normal',
      textAlign: base.textAlign || base.alignment || 'center',
      vAlignment: base.vAlignment || 'Center',
      textColor,
      lineHeight: base.lineHeight || 1.15,
      letterSpacing: base.spacing !== undefined ? `${base.spacing}px` : (base.letterSpacing || 'normal'),
      textShadow: base.textShadow || (
        base.shadowType === 'None' ? 'none' :
        base.shadowType === 'Soft' ? '0 4px 16px rgba(0,0,0,0.85)' :
        base.shadowType === 'Strong' ? '3px 3px 0 rgba(0,0,0,0.9), 6px 6px 0 rgba(0,0,0,0.4)' :
        base.shadowType === 'Large' ? '0 10px 40px rgba(0,0,0,0.85)' :
        base.shadowType === 'Glow' ? `0 0 20px ${textColor}` :
        '0 4px 16px rgba(0,0,0,0.85)'
      ),
      textTransform: base.isUppercase || base.textTransform === 'uppercase' ? 'uppercase' : 'none',
      textBackgroundColor: backgroundColor,
      bgOpacity,
    };
  }, [format, d.format, s.format, slide?.format]);

  // Reset states when URL changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [slideUrl]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextPlaying = !isPlayingLocal;
      if (nextPlaying) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
      setIsPlayingLocal(nextPlaying);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const nextMuted = !isMutedLocal;
    setIsMutedLocal(nextMuted);
    if (videoRef.current) videoRef.current.muted = nextMuted;
  };

  const renderBackground = () => {
    if (slide?.isBlank) return <div className="absolute inset-0 bg-black z-0" />;

    const sBg = s.background || d.background || slide?.background;
    const hasSlideBg = sBg && (sBg.mediaUrl || sBg.url || sBg.color || (sBg.type && sBg.type !== 'Solid Color'));
    const bg = hasSlideBg ? sBg : (globalBg || slide?.globalBackground || d.globalBackground);
    
    if (!bg) return <div className={clsx("absolute inset-0 z-0", showCheckered ? "bg-checkered" : "bg-[#0a0a0a]")} />;

    const bgUrl = bg.url || bg.mediaUrl;
    const bgType = bg.type || (bgUrl && videoExts.some(ext => String(bgUrl).toLowerCase().endsWith(`.${ext}`)) ? 'video' : 'image');

    if (bgType === 'video' || bg.type === 'Video (MP4)' || bg.mediaType === 'video' || String(bgUrl).match(/\.(mp4|webm|mov|m4v)$/i)) {
      return (
        <div className="absolute inset-0 z-0 bg-black">
          <video key={bgUrl} src={bgUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      );
    }
    if (bgType === 'image' || bg.type === 'Image' || bg.mediaType === 'image' || String(bgUrl).match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      return (
        <div className="absolute inset-0 z-0 bg-black">
          <img key={bgUrl} src={bgUrl} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      );
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
                <Loader2 className="w-10 h-10 text-[#800000] animate-spin" />
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
            <div className={clsx("absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 transition-opacity z-30", isHovered ? 'opacity-100' : 'opacity-0')}>
               <button onClick={togglePlay} className="text-white hover:text-[#800000] p-1">{isPlayingLocal ? <Pause size={18} /> : <Play size={18} />}</button>
               <div className="w-px h-4 bg-white/10" />
               <button onClick={toggleMute} className="text-white hover:text-[#800000] p-1">{isMutedLocal ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
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
            alt={slideLabel} 
            onLoad={() => setIsLoading(false)}
            onError={() => { setHasError(true); setIsLoading(false); }}
          />
        </div>
      );
    }

    if (isCountdown) {
      const mins = Math.floor((d.remainingSeconds || 0) / 60);
      const secs = (d.remainingSeconds || 0) % 60;
      const timeStr = mins + ':' + String(secs).padStart(2,'0');

      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-[8cqw] pointer-events-none z-20">
          {d.title && <div className="text-[3cqw] text-white/50 font-[900] tracking-[0.2em] uppercase mb-[2cqw]">{d.title}</div>}
          <div className="text-[20cqw] font-[950] text-white leading-none drop-shadow-2xl">{timeStr}</div>
          {d.message && <div className="text-[2.5cqw] text-white/40 font-[700] tracking-[0.2em] uppercase mt-[2cqw]">{d.message}</div>}
        </div>
      );
    }

    // Default: Text Overlay (Songs / Bible)
    if (!slideContent && !isBible) return null;

    const textStyles = {
      fontFamily: `'${styles.fontFamily}', Outfit, sans-serif`,
      fontSize: typeof styles.fontSize === 'number' ? `${styles.fontSize}px` : styles.fontSize,
      color: styles.textColor,
      fontWeight: styles.fontWeight,
      fontStyle: styles.fontStyle,
      textAlign: styles.textAlign,
      lineHeight: styles.lineHeight,
      letterSpacing: styles.letterSpacing,
      textShadow: styles.textShadow,
      textTransform: styles.textTransform,
      backgroundColor: styles.bgOpacity > 0 ? (styles.textBackgroundColor || 'rgba(0,0,0,0.5)') : 'transparent',
      padding: styles.bgOpacity > 0 ? '0.2em 0.5em' : '0',
      borderRadius: styles.bgOpacity > 0 ? '0.1em' : '0',
      boxDecorationBreak: 'clone',
      WebkitBoxDecorationBreak: 'clone'
    };

    const verticalAlignClass = styles.vAlignment === 'Top' ? 'items-start' : styles.vAlignment === 'Bottom' ? 'items-end' : 'items-center';

    return (
      <div className={clsx("absolute inset-0 flex flex-col justify-center p-[8cqw] pointer-events-none z-20", verticalAlignClass)}>
        {slideLabel && showLabel && (
          <div className="absolute top-[4cqw] left-[4cqw] text-white/40 text-[1.2cqw] font-black uppercase tracking-[0.3em] bg-black/20 px-[0.8cqw] py-[0.3cqw] rounded backdrop-blur-sm">
            {slideLabel}
          </div>
        )}
        <div style={textStyles} className="whitespace-pre-wrap break-words w-full">
          {isBible ? (
            <div className="flex flex-col gap-[2cqw]">
               {d.referencePos !== 'bottom' && <div className="text-[0.6em] opacity-50 font-bold tracking-widest uppercase mb-[1cqw]">{d.reference}</div>}
               <div>{slideContent}</div>
               {d.referencePos === 'bottom' && <div className="text-[0.6em] opacity-50 font-bold tracking-widest uppercase mt-[1cqw]">{d.reference}</div>}
            </div>
          ) : slideContent}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={clsx("relative w-full h-full overflow-hidden bg-black select-none", className)}
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
