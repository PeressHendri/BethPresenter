import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Monitor } from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

// ─── Helper: Auto-fit text ────────────────────────────────────────────────────
const useFitText = (ref, text, maxSize = 120) => {
  useEffect(() => {
    const el = ref.current;
    if (!el || !text?.trim()) return;
    const parent = el.parentElement;
    let size = maxSize;
    el.style.fontSize = size + 'px';
    while (size > 12 && (el.scrollHeight > parent.clientHeight || el.scrollWidth > parent.clientWidth)) {
      size -= 2;
      el.style.fontSize = size + 'px';
    }
  }, [text, maxSize, ref]);
};

// ─── 1. Song Display ──────────────────────────────────────────────────────────
const SongDisplay = ({ data, isBlank }) => {
  const textRef = useRef(null);
  const content = data?.content || '';
  const format = data?.format || {};
  useFitText(textRef, content, 120);

  const textStyle = {
    fontFamily: format.fontFamily ? `'${format.fontFamily}', Outfit, sans-serif` : "'Outfit', sans-serif",
    color: format.textColor || '#ffffff',
    fontWeight: format.isBold === false ? '700' : '900',
    fontStyle: format.isItalic ? 'italic' : 'normal',
    textTransform: format.isUppercase ? 'uppercase' : 'none',
    textAlign: format.alignment || 'center',
    lineHeight: format.lineHeight || 1.15,
    letterSpacing: format.spacing > 0 ? `${format.spacing}px` : 'normal',
    textShadow: (() => {
      const st = format.shadowType || 'None';
      const b = format.shadowBlur || 20;
      const c = format.textColor || '#ffffff';
      if (st === 'Soft')   return '0 4px 16px rgba(0,0,0,0.85)';
      if (st === 'Strong') return '3px 3px 0 rgba(0,0,0,0.9), 6px 6px 0 rgba(0,0,0,0.4)';
      if (st === 'Glow')   return `0 0 ${b}px ${c}, 0 0 ${b*2}px ${c}`;
      if (st === 'Large')  return '0 10px 40px rgba(0,0,0,0.85)';
      return 'none';
    })(),
    opacity: isBlank ? 0 : 1,
    transition: 'opacity 0.4s ease',
  };

  const bgStyle = (() => {
    if (data?.mediaUrl) return {};
    if (format.bgOpacity > 0) return { backgroundColor: `rgba(128,0,0,${format.bgOpacity/100})` };
    return {};
  })();

  const vAlign = format.vAlignment || 'Center';
  const justifyContent = vAlign === 'Top' ? 'flex-start' : vAlign === 'Bottom' ? 'flex-end' : 'center';

  return (
    <div className="absolute inset-0" style={bgStyle}>
      {/* Media background */}
      {data?.mediaUrl && !isBlank && (
        <div className="absolute inset-0 z-0">
          {data.mediaType === 'video'
            ? <video key={data.mediaUrl} src={data.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            : <img key={data.mediaUrl} src={data.mediaUrl} className="w-full h-full object-contain bg-black" alt="" />
          }
        </div>
      )}
      {/* Safe zone content */}
      <div className="absolute z-10" style={{ top:'10vh', bottom:'10vh', left:'5vw', right:'5vw', display:'flex', flexDirection:'column', alignItems:'center', justifyContent }}>
        <div ref={textRef} style={{ ...textStyle, width:'100%', wordWrap:'break-word', whiteSpace:'pre-wrap' }}>
          {content}
        </div>
      </div>
    </div>
  );
};

// ─── 2. Bible Display ─────────────────────────────────────────────────────────
const BibleDisplay = ({ data, isBlank }) => {
  const textRef = useRef(null);
  const mainText = data?.content || '';
  useFitText(textRef, mainText, 80);

  return (
    <div className="absolute inset-0 bg-[#0a0a14]" style={{ opacity: isBlank ? 0 : 1, transition: 'opacity 0.4s ease' }}>
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(128,0,0,0.15),transparent_70%)]" />
      
      {/* Safe zone */}
      <div className="absolute z-10 flex flex-col" style={{ top:'8vh', bottom:'8vh', left:'8vw', right:'8vw', justifyContent: data?.referencePos === 'bottom' ? 'flex-end' : 'center', gap: '2vh' }}>
        {/* Reference top */}
        {data?.reference && data?.referencePos !== 'bottom' && (
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:'clamp(14px,2vh,22px)', color:'rgba(255,255,255,0.45)', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', textAlign:'center', marginBottom:'1.5vh' }}>
            {data.reference}
          </div>
        )}

        {/* Verse text(s) */}
        {data?.versions?.length > 1 ? (
          <div className="flex gap-8 w-full h-full">
            {data.versions.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col justify-center">
                <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:'clamp(12px,1.5vh,16px)', color:'rgba(255,255,255,0.35)', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'1vh' }}>{v.name}</div>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:'clamp(22px,4vh,52px)', color:'white', fontWeight:700, lineHeight:1.5, whiteSpace:'pre-wrap' }}>{v.text}</div>
              </div>
            ))}
          </div>
        ) : (
          <div ref={textRef} style={{ fontFamily:"'Outfit',sans-serif", color:'white', fontWeight:700, lineHeight:1.5, textAlign:'center', whiteSpace:'pre-wrap', width:'100%' }}>
            {mainText}
          </div>
        )}

        {/* Reference bottom */}
        {data?.reference && data?.referencePos === 'bottom' && (
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:'clamp(14px,2vh,22px)', color:'rgba(255,255,255,0.45)', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', textAlign:'center', marginTop:'1.5vh' }}>
            {data.reference}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── 3. Media Display ─────────────────────────────────────────────────────────
const MediaDisplay = ({ data, isBlank }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (data?.paused) videoRef.current.pause();
    else videoRef.current.play().catch(() => {});
  }, [data?.paused]);

  if (!data?.url) return <div className="absolute inset-0 bg-black" />;

  return (
    <div className="absolute inset-0 bg-black" style={{ opacity: isBlank ? 0 : 1, transition: 'opacity 0.5s ease' }}>
      {data.type === 'video' ? (
        <video
          ref={videoRef}
          key={data.url}
          src={data.url}
          autoPlay
          loop={data.loop !== false}
          muted={data.muted !== false}
          playsInline
          className="w-full h-full"
          style={{ objectFit: data.fit === 'contain' ? 'contain' : 'cover' }}
        />
      ) : (
        <img
          key={data.url}
          src={data.url}
          className="w-full h-full"
          style={{ objectFit: data.fit === 'cover' ? 'cover' : 'contain', background: 'black' }}
          alt=""
        />
      )}
      {data.caption && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-center">
          <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:'clamp(16px,2.5vh,32px)', color:'white', fontWeight:700 }}>{data.caption}</p>
        </div>
      )}
    </div>
  );
};

// ─── 4. Countdown Display ─────────────────────────────────────────────────────
const CountdownDisplay = ({ data, isBlank }) => {
  const [timeLeft, setTimeLeft] = useState(data?.remainingSeconds || 0);
  const isDone = timeLeft <= 0;

  useEffect(() => {
    setTimeLeft(data?.remainingSeconds || 0);
  }, [data?.remainingSeconds]);

  useEffect(() => {
    if (!data?.isRunning || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(id);
  }, [data?.isRunning, timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = timeLeft >= 3600
    ? `${Math.floor(timeLeft/3600)}:${String(mins % 60).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
    : `${mins}:${String(secs).padStart(2,'0')}`;

  const bgStyle = data?.background?.type === 'image'
    ? { backgroundImage: `url(${data.background.url})`, backgroundSize:'cover', backgroundPosition:'center' }
    : data?.background?.type === 'video' ? {}
    : { backgroundColor: data?.background?.color || '#000000' };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ ...bgStyle, opacity: isBlank ? 0 : 1, transition: 'opacity 0.4s ease' }}>
      {data?.background?.type === 'video' && data?.background?.url && (
        <video key={data.background.url} src={data.background.url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="relative z-10 flex flex-col items-center gap-4 text-white text-center px-16">
        {data?.title && (
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'clamp(18px,3vw,40px)', fontWeight:900, color:'rgba(255,255,255,0.55)', letterSpacing:'0.25em', textTransform:'uppercase' }}>
            {data.title}
          </h2>
        )}
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:'clamp(80px,20vw,240px)', fontWeight:950, lineHeight:1, tabularNums:true, letterSpacing:'-0.05em', transition:'all 0.3s ease', color: isDone ? '#ff4444' : 'white', textShadow: isDone ? '0 0 60px rgba(255,68,68,0.5)' : '0 10px 40px rgba(0,0,0,0.5)' }}>
          {timeStr}
        </div>
        {data?.message && (
          <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:'clamp(14px,2vw,28px)', fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'0.25em', textTransform:'uppercase', marginTop:'2vh' }}>
            {data.message}
          </p>
        )}
        {isDone && data?.endMessage && (
          <div className="mt-4 px-8 py-3 border-2 border-white/30 rounded-full" style={{ fontSize:'clamp(16px,2vw,28px)', fontWeight:900, letterSpacing:'0.2em' }}>
            {data.endMessage}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── 5. Stage Display ─────────────────────────────────────────────────────────
const StageDisplay = ({ data }) => {
  return (
    <div className="absolute inset-0 bg-[#111] text-white p-5 flex flex-col gap-4" style={{ fontFamily:"'Outfit',sans-serif" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between h-8">
        <span style={{ fontSize:10, fontWeight:900, letterSpacing:'0.2em', color:'rgba(255,255,255,0.25)', textTransform:'uppercase' }}>BethPresenter · Stage Monitor</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#800000] animate-pulse" />
          <span style={{ fontSize:10, fontWeight:900, letterSpacing:'0.15em', color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>LIVE</span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Current Slide */}
        <div className="flex-[3] bg-[#1a1a1a] rounded-2xl p-8 flex flex-col justify-center overflow-hidden border border-white/5">
          <div style={{ fontSize:11, fontWeight:900, letterSpacing:'0.2em', color:'rgba(255,255,255,0.25)', textTransform:'uppercase', marginBottom:16 }}>
            {data?.currentSlide?.label || 'NOW'}
          </div>
          <div style={{ fontSize:'clamp(28px,5vw,72px)', fontWeight:900, lineHeight:1.3, whiteSpace:'pre-wrap', color:'white' }}>
            {data?.currentSlide?.content || '—'}
          </div>
        </div>

        {/* Right column */}
        <div className="flex-[1.2] flex flex-col gap-4">
          {/* Next Slide */}
          <div className="flex-1 bg-[#1a1a1a] rounded-2xl p-6 flex flex-col justify-center border border-white/5 overflow-hidden">
            <div style={{ fontSize:10, fontWeight:900, letterSpacing:'0.2em', color:'rgba(255,255,255,0.2)', textTransform:'uppercase', marginBottom:10 }}>UP NEXT</div>
            <div style={{ fontSize:'clamp(16px,2.5vw,32px)', fontWeight:700, lineHeight:1.4, color:'rgba(255,255,255,0.5)', whiteSpace:'pre-wrap', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical' }}>
              {data?.nextSlide?.content || '— End —'}
            </div>
          </div>

          {/* Info panel */}
          <div className="flex-1 bg-[#1a1a1a] rounded-2xl p-6 flex flex-col justify-center gap-4 border border-white/5">
            {data?.countdown && (
              <div className="text-center">
                <div style={{ fontSize:'clamp(32px,5vw,64px)', fontWeight:950, color:'#800000', lineHeight:1, tabularNums:true }}>{data.countdown}</div>
                <div style={{ fontSize:9, fontWeight:900, letterSpacing:'0.2em', color:'rgba(255,255,255,0.2)', textTransform:'uppercase', marginTop:4 }}>COUNTDOWN</div>
              </div>
            )}
            {data?.message && (
              <div className="bg-[#80000020] border-l-4 border-[#800000] rounded p-3">
                <p style={{ fontSize:'clamp(13px,1.8vw,20px)', fontWeight:700, color:'rgba(255,255,255,0.8)' }}>{data.message}</p>
              </div>
            )}
            {!data?.countdown && !data?.message && (
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.15)', textAlign:'center', letterSpacing:'0.1em' }}>Belum ada pesan</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── 6. Default/Idle Display ──────────────────────────────────────────────────
const DefaultDisplay = ({ isConnected }) => (
  <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-6">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(128,0,0,0.08),transparent_70%)]" />
    <Monitor size={64} strokeWidth={1} className="text-white/10" />
    <div className="text-center">
      <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:11, fontWeight:900, letterSpacing:'0.35em', color:'rgba(255,255,255,0.2)', textTransform:'uppercase' }}>
        {isConnected ? 'Menunggu Signal Live...' : 'Menghubungkan...'}
      </p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DisplayClientPage = () => {
  const { pin } = useParams();
  const [slide, setSlide] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current.emit('join-session', pin);
    });
    socketRef.current.on('disconnect', () => setIsConnected(false));
    socketRef.current.on('sync-slide', (data) => setSlide(data));
    return () => socketRef.current?.disconnect();
  }, [pin]);

  const renderContent = () => {
    if (!slide) return <DefaultDisplay isConnected={isConnected} />;
    const isBlank = slide.isBlank;

    switch (slide.contentType) {
      case 'bible':
        return <BibleDisplay data={slide.data} isBlank={isBlank} />;
      case 'media':
        return <MediaDisplay data={slide.data} isBlank={isBlank} />;
      case 'countdown':
        return <CountdownDisplay data={slide.data} isBlank={isBlank} />;
      case 'stage':
        return <StageDisplay data={slide.data} />;
      case 'song':
      default:
        // Legacy format support (old sync-slide without contentType)
        return <SongDisplay data={slide.data || slide} isBlank={isBlank} />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-black select-none">
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap" rel="stylesheet" />
      {renderContent()}

      {/* Connection dot */}
      <div className="absolute top-3 left-3 z-50">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#800000]' : 'bg-red-500 animate-pulse'}`} />
      </div>
    </div>
  );
};

export default DisplayClientPage;
