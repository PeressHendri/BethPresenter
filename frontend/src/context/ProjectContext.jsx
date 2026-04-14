import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const ProjectContext = createContext();
const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('beth_projects');
    return saved ? JSON.parse(saved) : ['beth', 'Youth'];
  });
  const [currentProject, setCurrentProject] = useState(() => {
    const saved = localStorage.getItem('beth_current_project');
    return saved || 'beth';
  });
  const [isLive, setIsLive] = useState(false);
  const [isRehearsal, setIsRehearsal] = useState(false);
  const [outputWindow, setOutputWindow] = useState(null);
  const [activeTab, setActiveTab] = useState('presentasi');
  const [language, setLanguage] = useState('id');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Appearance State
  const [appTheme, setAppTheme] = useState(() => {
    return localStorage.getItem('beth_app_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('beth_app_theme', appTheme);
    if (appTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appTheme]);


  // Notification State
  const [notification, setNotification] = useState(null); // { message, type }

  const notify = (message, type = 'info') => {
    setNotification({ message, type });
    // Auto-hide after 3s
    setTimeout(() => setNotification(null), 3000);
  };
  // Multi-Project Schedules
  const [allSchedules, setAllSchedules] = useState(() => {
    const saved = localStorage.getItem('beth_all_schedules');
    return saved ? JSON.parse(saved) : {};
  });

  // Current active schedule derived from currentProject
  const schedule = allSchedules[currentProject] || [];

  const setSchedule = (updateFnOrValue) => {
    setAllSchedules(prev => {
      const currentSched = prev[currentProject] || [];
      const newValue = typeof updateFnOrValue === 'function' ? updateFnOrValue(currentSched) : updateFnOrValue;
      const updatedSchedules = { ...prev, [currentProject]: newValue };
      localStorage.setItem('beth_all_schedules', JSON.stringify(updatedSchedules));
      return updatedSchedules;
    });
  };

  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [liveState, setLiveState] = useState({
    songId: null,
    slideIndex: null,
    content: '',
    label: '',
    isBlank: false,
    format: {
      fontFamily: 'Outfit',
      fontSize: '72px',
      textColor: '#FFFFFF',
      textAlign: 'center',
      vAlignment: 'Center',
      lineHeight: 1.15,
      bgOpacity: 0,
      shadowType: 'Soft'
    },
    globalBackground: null
  });

  const [globalBackground, setGlobalBackgroundState] = useState(() => {
    const saved = localStorage.getItem('beth_global_bg');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist Projects
  useEffect(() => {
    localStorage.setItem('beth_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('beth_current_project', currentProject);
    // Reset selection when switching projects
    setSelectedItemIndex(null);
  }, [currentProject]);

  // Remote Session State
  const [remotePin, setRemotePin] = useState(localStorage.getItem('beth_remote_pin') || '');
  const [remoteQR, setRemoteQR] = useState('');
  const [isRemoteActive, setIsRemoteActive] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    
    // Initial data load
    fetchSongs();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const fetchSongs = async () => {
    // Failsafe: force loading to end after 5 seconds regardless of network
    const failsafe = setTimeout(() => setLoading(false), 5000);

    try {
      const response = await fetch(`${API_URL}/songs`);
      if (response.ok) {
        const data = await response.json();
        setSongs(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      clearTimeout(failsafe);
      setLoading(false);
    }
  };

  const addToSchedule = (item) => {
    const newItem = {
      ...item,
      instanceId: Date.now(), // Unique ID for this instance in the schedule
      type: item.slides ? 'song' : 'media'
    };
    setSchedule(prev => [...prev, newItem]);
    if (selectedItemIndex === null) setSelectedItemIndex(0);
  };

  const addBlankToSchedule = () => {
    const blankItem = {
      id: 'blank-' + Date.now(),
      instanceId: Date.now(),
      title: language === 'id' ? 'Slide Kosong' : 'Blank Slide',
      type: 'blank',
      slides: [{ content: '', label: 'BLANK' }]
    };
    setSchedule(prev => [...prev, blankItem]);
    if (selectedItemIndex === null) setSelectedItemIndex(schedule.length);
  };

  const removeFromSchedule = (instanceId) => {
    setSchedule(prev => prev.filter(item => item.instanceId !== instanceId));

    // Auto-blank when item is removed for safety
    const blankState = {
      songId: null,
      slideIndex: null,
      content: '',
      label: '',
      isBlank: true
    };
    setLiveState(blankState);
    if (socketRef.current && remotePin) socketRef.current.emit('broadcast-slide', { pin: remotePin, slide: blankState });
    if (outputWindow && !isRehearsal) outputWindow.postMessage({ type: 'UPDATE_SLIDE', data: blankState }, '*');

    // Reset selection if needed
    setSelectedItemIndex(null);
  };

  const openOutput = () => {
    setIsRehearsal(false);
    if (outputWindow) {
      outputWindow.focus();
      return;
    }

    const win = window.open('', 'beth_output', 'width=1280,height=720');
    if (win) {
      win.document.open();
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>BethPresenter - Output</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Inter:wght@400;700;900&family=Poppins:wght@400;700;900&family=Roboto:wght@400;700;900&family=Open+Sans:wght@400;700;900&family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }

              body {
                background: black;
                height: 100vh;
                width: 100vw;
                overflow: hidden;
                position: relative;
                font-family: 'Outfit', sans-serif;
              }

              /* === MEDIA LAYER (background) === */
              #media-container {
                position: absolute;
                inset: 0;
                z-index: 1;
              }
              #media-container video,
              #media-container img {
                width: 100%;
                height: 100%;
              }
              #media-container img { object-fit: contain; background: black; }
              #media-container video { object-fit: cover; }

              /* === SAFE ZONE — top & bottom 10vh only === */
              #content-wrapper {
                position: absolute;
                top:    10vh;        /* safe zone atas */
                bottom: 10vh;       /* safe zone bawah */
                left:   5vw;        /* padding kiri (bukan safe zone) */
                right:  5vw;        /* padding kanan (bukan safe zone) */
                z-index: 10;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              }

              /* Safe zone guide — garis tipis atas & bawah saja */
              #safe-zone-guide {
                position: absolute;
                left: 0; right: 0;
                top:    10vh;
                bottom: 10vh;
                z-index: 5;
                border-top:    1px dashed rgba(255,255,255,0.12);
                border-bottom: 1px dashed rgba(255,255,255,0.12);
                pointer-events: none;
                animation: guideFade 3s ease forwards;
              }
              @keyframes guideFade {
                0%   { opacity: 1; }
                60%  { opacity: 1; }
                100% { opacity: 0; }
              }

              #content {
                width: 100%;
                word-wrap: break-word;
                white-space: pre-wrap;
                text-align: center;
                color: white;
                font-size: 102px;
                font-weight: 900;
                font-family: 'Outfit', sans-serif;
                line-height: 1.15;
                opacity: 0;
              }

              /* === ANIMATIONS === */
              @keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
              @keyframes slideUp   { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
              @keyframes slideDown { from { opacity: 0; transform: translateY(-60px); } to { opacity: 1; transform: translateY(0); } }
              @keyframes zoomIn    { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }

              .anim-fade      { animation: fadeIn    var(--anim-dur, 0.6s) ease forwards; }
              .anim-slideup   { animation: slideUp   var(--anim-dur, 0.6s) cubic-bezier(0.22,1,0.36,1) forwards; }
              .anim-slidedown { animation: slideDown var(--anim-dur, 0.6s) cubic-bezier(0.22,1,0.36,1) forwards; }
              .anim-zoom      { animation: zoomIn    var(--anim-dur, 0.6s) cubic-bezier(0.34,1.56,0.64,1) forwards; }

              /* === LIVE BADGE === */
              #live-badge {
                position: absolute;
                top: 20px;
                right: 20px;
                z-index: 100;
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(128, 0, 0, 0.85);
                border: 1px solid rgba(255,255,255,0.15);
                backdrop-filter: blur(10px);
                padding: 6px 16px;
                border-radius: 999px;
                font-family: 'Outfit', sans-serif;
                font-size: 13px;
                font-weight: 900;
                color: white;
                letter-spacing: 0.15em;
                text-transform: uppercase;
              }
              #live-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #ff4444;
                animation: pulse 1.5s infinite;
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.4; transform: scale(0.7); }
              }
            </style>
          </head>
          <body>
            <div id="media-container"></div>
            <div id="safe-zone-guide"></div>
            <div id="content-wrapper">
              <div id="content"></div>
            </div>
            <div id="live-badge">
              <div id="live-dot"></div>
              LIVE
            </div>

            <script>
              // ─── Fit text within safe zone (top/bottom only) ──────────────
              function fitText() {
                const el = document.getElementById('content');
                const wrapper = document.getElementById('content-wrapper');
                if (!el || !el.innerText.trim()) return;

                const maxW = wrapper.clientWidth;
                const maxH = wrapper.clientHeight;

                // Start from a large size, shrink until it fits
                let fontSize = 120;
                el.style.fontSize = fontSize + 'px';

                while (fontSize > 14 && (el.scrollHeight > maxH || el.scrollWidth > maxW)) {
                  fontSize -= 2;
                  el.style.fontSize = fontSize + 'px';
                }
              }

              // ─── Apply animation class ───────────────────────────────────
              function applyAnim(el, animType, duration) {
                el.classList.remove('anim-fade', 'anim-slideup', 'anim-slidedown', 'anim-zoom');
                el.style.setProperty('--anim-dur', (duration || 0.6) + 's');
                const map = { 'Fade': 'anim-fade', 'Slide Up': 'anim-slideup', 'Slide Down': 'anim-slidedown', 'Zoom': 'anim-zoom' };
                if (map[animType]) {
                  void el.offsetWidth; // force reflow
                  el.classList.add(map[animType]);
                }
              }

              // ─── Message handler ─────────────────────────────────────────
              window.addEventListener('message', (event) => {
                if (event.data.type === 'SET_GLOBAL_BG') {
                  const bg = event.data.payload;
                  const mediaContainer = document.getElementById('media-container');
                  if (!bg) {
                    mediaContainer.innerHTML = '';
                    return;
                  }
                  const type = bg.type || (bg.url?.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image');
                  if (type === 'video') {
                    mediaContainer.innerHTML = '<video src="' + bg.url + '" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;"></video>';
                  } else {
                    mediaContainer.innerHTML = '<img src="' + bg.url + '" style="width:100%;height:100%;object-fit:cover;" />';
                  }
                  return;
                }

                if (event.data.type !== 'UPDATE_SLIDE') return;

                const raw = event.data.data;
                const wrapper = document.getElementById('content-wrapper');
                const contentEl = document.getElementById('content');
                const mediaContainer = document.getElementById('media-container');

                // ── Normalise envelope ────────────────────────────────────
                // New format: { contentType, isBlank, data: {...} }
                // Old format: { content, format, mediaUrl, ... }  (flat)
                const isEnvelope = raw && raw.contentType;
                const contentType = isEnvelope ? raw.contentType : 'song';
                const isBlank = raw ? raw.isBlank : true;
                const d = isEnvelope ? (raw.data || {}) : raw;

                // ── BLANK ────────────────────────────────────────────────
                if (isBlank) {
                  contentEl.style.opacity = '0';
                  mediaContainer.innerHTML = '';
                  document.body.style.background = 'black';
                  return;
                }

                // ── Route by contentType ──────────────────────────────────
                if (contentType === 'media') {
                  // Pure media: fullscreen, no text
                  document.body.style.background = 'black';
                  const url = d.url;
                  const type = d.type || (url && url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image');
                  const fit = d.fit || 'cover';
                  const cur = mediaContainer.querySelector('video, img');
                  if (!cur || cur.getAttribute('src') !== url) {
                    if (type === 'video') {
                      mediaContainer.innerHTML = '<video src="' + url + '" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:' + fit + '"></video>';
                    } else {
                      mediaContainer.innerHTML = '<img src="' + url + '" style="width:100%;height:100%;object-fit:' + fit + ';background:black;" />';
                    }
                  }
                  contentEl.style.opacity = '0';
                  return;
                }

                if (contentType === 'bible') {
                  // Bible: dark background + reference + verse text
                  document.body.style.background = '#0a0a14';
                  mediaContainer.innerHTML = '';
                  wrapper.style.justifyContent = 'center';
                  wrapper.style.flexDirection = 'column';
                  wrapper.style.gap = '2vh';

                  // Build HTML: reference + verse
                  const ref = d.reference || '';
                  const verse = d.content || '';
                  const isRefBottom = d.referencePos === 'bottom';

                  const refHtml = ref ? '<div id="bible-ref" style="font-family:Outfit,sans-serif;font-size:clamp(14px,2vh,26px);color:rgba(255,255,255,0.45);font-weight:700;letter-spacing:0.2em;text-transform:uppercase;text-align:center;width:100%;">' + ref + '</div>' : '';
                  const verseHtml = '<div id="bible-verse" style="font-family:Outfit,sans-serif;color:white;font-weight:700;line-height:1.5;text-align:center;white-space:pre-wrap;width:100%;">' + verse + '</div>';

                  contentEl.innerHTML = isRefBottom ? verseHtml + refHtml : refHtml + verseHtml;
                  contentEl.style.display = 'flex';
                  contentEl.style.flexDirection = 'column';
                  contentEl.style.gap = '2vh';
                  contentEl.style.alignItems = 'center';
                  contentEl.style.fontSize = '';
                  contentEl.style.textShadow = 'none';

                  // Fit the verse text
                  const verseEl = document.getElementById('bible-verse');
                  if (verseEl && verse) {
                    const maxH = wrapper.clientHeight - 60;
                    const maxW = wrapper.clientWidth;
                    let fs = 80;
                    verseEl.style.fontSize = fs + 'px';
                    while (fs > 14 && (contentEl.scrollHeight > maxH || contentEl.scrollWidth > maxW)) {
                      fs -= 2;
                      verseEl.style.fontSize = fs + 'px';
                    }
                  }
                  applyAnim(contentEl, 'Fade', 0.5);
                  contentEl.style.opacity = '1';
                  return;
                }

                if (contentType === 'countdown') {
                  document.body.style.background = d.background?.color || 'black';
                  mediaContainer.innerHTML = '';
                  wrapper.style.justifyContent = 'center';
                  const mins = Math.floor((d.remainingSeconds || 0) / 60);
                  const secs = (d.remainingSeconds || 0) % 60;
                  const timeStr = mins + ':' + String(secs).padStart(2,'0');
                  contentEl.innerHTML = (d.title ? '<div style="font-size:clamp(16px,3vh,36px);color:rgba(255,255,255,0.5);font-weight:900;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:2vh;text-align:center;">' + d.title + '</div>' : '') +
                    '<div style="font-size:clamp(80px,18vw,200px);font-weight:950;color:white;line-height:1;text-align:center;">' + timeStr + '</div>' +
                    (d.message ? '<div style="font-size:clamp(14px,2vh,28px);color:rgba(255,255,255,0.4);font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-top:2vh;text-align:center;">' + d.message + '</div>' : '');
                  contentEl.style.display = 'flex';
                  contentEl.style.flexDirection = 'column';
                  contentEl.style.alignItems = 'center';
                  contentEl.style.fontSize = '';
                  contentEl.style.textShadow = 'none';
                  contentEl.style.opacity = '1';
                  return;
                }

                // ── SONG (default) ────────────────────────────────────────
                const content  = d.content  || '';
                const format   = d.format   || null;
                const mediaUrl = d.mediaUrl || null;
                const mediaType = d.mediaType || null;

                // Reset to plain text mode
                contentEl.innerHTML = '';
                contentEl.style.display = '';
                contentEl.style.flexDirection = '';
                contentEl.style.gap = '';
                contentEl.style.alignItems = '';

                // Media background
                if (mediaUrl) {
                  const cur = mediaContainer.querySelector('video, img');
                  if (!cur || cur.getAttribute('src') !== mediaUrl) {
                    if (mediaType === 'video') {
                      mediaContainer.innerHTML = '<video src="' + mediaUrl + '" autoplay loop muted playsinline></video>';
                    } else {
                      mediaContainer.innerHTML = '<img src="' + mediaUrl + '" />';
                    }
                  }
                  document.body.style.background = 'black';
                } else {
                  mediaContainer.innerHTML = '';
                  if (format && format.bgOpacity > 0) {
                    document.body.style.background = 'transparent';
                  } else {
                    document.body.style.background = 'transparent';
                  }
                }

                const vAlign = (format && format.vAlignment) || 'Center';
                wrapper.style.justifyContent = vAlign === 'Top' ? 'flex-start' : vAlign === 'Bottom' ? 'flex-end' : 'center';

                contentEl.style.fontFamily    = (format && format.fontFamily) ? format.fontFamily + ', Outfit, sans-serif' : 'Outfit, sans-serif';
                contentEl.style.color         = (format && format.textColor)  ? format.textColor : 'white';
                contentEl.style.fontWeight    = (format && format.isBold === false) ? '700' : '900';
                contentEl.style.fontStyle     = (format && format.isItalic) ? 'italic' : 'normal';
                contentEl.style.textTransform = (format && format.isUppercase) ? 'uppercase' : 'none';
                contentEl.style.textAlign     = (format && format.alignment) ? format.alignment : 'center';
                contentEl.style.lineHeight    = (format && format.lineHeight) ? String(format.lineHeight) : '1.15';
                contentEl.style.letterSpacing = (format && format.spacing > 0) ? format.spacing + 'px' : 'normal';

                const sType  = (format && format.shadowType)  || 'None';
                const blur   = (format && format.shadowBlur)  || 20;
                const sColor = 'rgba(0,0,0,0.85)';
                const tColor = contentEl.style.color;
                const shadows = {
                  'None':   'none',
                  'Soft':   '0 4px 16px ' + sColor,
                  'Strong': '3px 3px 0px rgba(0,0,0,0.9), 6px 6px 0px rgba(0,0,0,0.4)',
                  'Glow':   '0 0 ' + blur + 'px ' + tColor + ', 0 0 ' + (blur*2) + 'px ' + tColor,
                  'Large':  '0 10px 40px ' + sColor
                };
                contentEl.style.textShadow = shadows[sType] || 'none';

                if (content) {
                  contentEl.innerText = content;
                  fitText();
                  const animType = (format && format.animType) || 'Fade';
                  const animDur  = (format && format.animDuration) || 0.6;
                  applyAnim(contentEl, animType, animDur);
                  contentEl.style.opacity = '1';
                } else {
                  contentEl.style.opacity = '0';
                }
              });

              window.addEventListener('resize', fitText);
            </script>
          </body>
        </html>
      `);
      win.document.close();
      setOutputWindow(win);
      setIsLive(true);
      return win;  // ← return win so caller can use it immediately
    }
    return null;
  };

  const setLiveSlide = (item, slideIndex) => {
    if (!item) return;

    setLiveState(prev => {
      let newState;
      const currentGlobalBg = prev.globalBackground || globalBackground;
      
      if (item.type === 'media') {
        newState = {
          songId: item.instanceId || item.id,
          slideIndex: 0,
          content: '',
          label: item.title,
          format: item.format || prev.format || {
            fontFamily: 'Outfit',
            fontSize: '72px',
            textColor: '#FFFFFF',
            textAlign: 'center',
            vAlignment: 'Center',
            lineHeight: 1.15,
            bgOpacity: 0,
            shadowType: 'Soft'
          },
          mediaUrl: item.url,
          mediaType: item.url?.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image',
          globalBackground: currentGlobalBg,
          isBlank: false
        };
      } else {
        if (!item.slides || !item.slides[slideIndex]) return prev;
        const slide = item.slides[slideIndex];
        const bg = slide.background || {};
        
        newState = {
          songId: item.instanceId || item.id,
          slideIndex: slideIndex,
          content: slide.content,
          label: (item.type === 'bible' || item.type === 'countdown') ? item.title : (slide.label || null),
          format: item.format || prev.format || {
            fontFamily: 'Outfit',
            fontSize: '72px',
            textColor: '#FFFFFF',
            textAlign: 'center',
            vAlignment: 'Center',
            lineHeight: 1.15,
            bgOpacity: 0,
            shadowType: 'Soft'
          },
          mediaUrl: bg.mediaUrl || bg.url || (item.format?.bgMediaUrl) || null,
          mediaType: bg.mediaType || (item.format?.bgMediaUrl ? (item.format.bgMediaUrl.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image') : null),
          bgType: bg.type || (item.format?.bgMediaUrl ? (item.format.bgMediaUrl.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image') : 'color'),
          globalBackground: currentGlobalBg,
          isBlank: false
        };
      }

      const envelope = { 
        ...newState,
        contentType: item.type || 'song', 
        data: newState, 
        payload: newState,
        type: 'SET_LIVE_SLIDE'
      };

      // Broadcast to local and remote
      if (outputWindow && !outputWindow.closed) {
        outputWindow.postMessage({ type: 'SET_LIVE_SLIDE', payload: envelope }, '*');
      }

      if (socketRef.current && remotePin) {
        socketRef.current.emit('broadcast-slide', { pin: remotePin, slide: envelope });
      }

      return newState;
    });
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Helper: reliably get or open the output window
  // ──────────────────────────────────────────────────────────────────────────
  const getOrOpenOutput = () => {
    if (outputWindow && !outputWindow.closed) return outputWindow;
    return openOutput();
  };

  const setGlobalBackground = (item) => {
    const bg = item ? { 
      url: item.mediaUrl || item.url, 
      type: (item.mediaUrl || item.url || '').match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image' 
    } : null;
    
    setGlobalBackgroundState(bg);
    
    setLiveState(prev => {
      const newState = { ...prev, globalBackground: bg };
      
      const bgEnvelope = { type: 'SET_GLOBAL_BG', payload: bg };

      // 1. Broadcast to LOCAL window
      if (outputWindow && !outputWindow.closed) {
        outputWindow.postMessage(bgEnvelope, '*');
      }

      // 2. Broadcast to REMOTE clients
      if (socketRef.current && remotePin) {
        socketRef.current.emit('broadcast-global-bg', { pin: remotePin, bg: bg });
      }

      return newState;
    });

    if (bg) {
      localStorage.setItem('beth_global_bg', JSON.stringify(bg));
      notify(language === 'id' ? 'Background global diperbarui' : 'Global background updated', 'success');
    } else {
      localStorage.removeItem('beth_global_bg');
    }
  };

  // Helper: broadcast via postMessage + socket
  const broadcast = (envelope, delayMs = 300) => {
    if (isRehearsal) return;
    const win = getOrOpenOutput();
    setTimeout(() => {
      const w = win || outputWindow;
      if (w && !w.closed) w.postMessage({ type: 'UPDATE_SLIDE', data: envelope }, '*');
    }, delayMs);
    if (socketRef.current && remotePin) {
      socketRef.current.emit('broadcast-slide', { pin: remotePin, slide: envelope });
    }
  };

  // ── sendManualToLive (Countdown / generic text) ────────────────────────────
  const sendManualToLive = (data) => {
    const newState = { 
      songId: data.songId || 'manual', 
      slideIndex: 0,
      content: data.content || '',
      label: data.label || '',
      format: data.format || liveState.format,
      mediaUrl: data.mediaUrl || null,
      mediaType: data.mediaType || null,
      globalBackground: liveState.globalBackground || globalBackground,
      isBlank: false
    };
    
    const envelope = {
      contentType: 'song',
      isBlank: false,
      data: newState
    };
    
    setLiveState(newState);
    broadcast(envelope);
  };

  // ── sendBibleToLive ────────────────────────────────────────────────────────
  const sendBibleToLive = (bibleData, style, background) => {
    const activeBg = background || liveState.globalBackground || globalBackground;
    
    const newState = {
      songId: 'bible',
      slideIndex: 0,
      content: bibleData.content,
      label: bibleData.reference || 'Alkitab',
      isBlank: false,
      globalBackground: activeBg,
      format: style || liveState.format
    };

    const envelope = {
      contentType: 'bible',
      isBlank: false,
      data: {
        ...newState,
        reference: bibleData.reference || '',
        referencePos: bibleData.referencePos || 'top',
        versions: bibleData.versions || null,
        background: activeBg
      }
    };
    
    setLiveState(newState);
    broadcast(envelope);
  };

  // ── sendMediaToLive ────────────────────────────────────────────────────────
  const sendMediaToLive = (mediaData) => {
    const mediaType = mediaData.type || (mediaData.url?.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image');
    
    const newState = {
      songId: 'media', 
      slideIndex: 0, 
      content: '', 
      isBlank: false,
      mediaUrl: mediaData.url, 
      mediaType: mediaType,
      globalBackground: liveState.globalBackground || globalBackground,
      label: mediaData.caption || 'Media'
    };

    const envelope = {
      contentType: 'media',
      isBlank: false,
      data: {
        ...newState,
        type: mediaType,
        url: mediaData.url,
        caption: mediaData.caption || null,
        loop: mediaData.loop !== false,
        muted: mediaData.muted !== false,
        fit: mediaData.fit || 'cover',
        background: newState.globalBackground
      }
    };

    setLiveState(newState);
    broadcast(envelope);
  };

  // ── sendCountdownToLive ────────────────────────────────────────────────────
  const sendCountdownToLive = (countdownData) => {
    const newState = {
      songId: 'countdown',
      slideIndex: 0,
      content: '',
      isBlank: false,
      label: countdownData.title || 'Countdown',
      globalBackground: liveState.globalBackground || globalBackground
    };

    const envelope = {
      contentType: 'countdown',
      isBlank: false,
      data: {
        ...newState,
        remainingSeconds: countdownData.remainingSeconds || countdownData.duration || 0,
        isRunning: countdownData.isRunning || false,
        title: countdownData.title || '',
        message: countdownData.message || '',
        endMessage: countdownData.endMessage || '',
        background: newState.globalBackground
      }
    };
    setLiveState(newState);
    broadcast(envelope);
  };

  // ── sendToStageDisplay ────────────────────────────────────────────────────
  const sendToStageDisplay = (stageData) => {
    if (socketRef.current && remotePin) {
      socketRef.current.emit('stage-message', {
        pin: remotePin,
        currentSlide: stageData.currentSlide || null,
        nextSlide: stageData.nextSlide || null,
        message: stageData.message || '',
        countdown: stageData.countdown || null,
      });
    }
  };

  // ── toggleBlank ───────────────────────────────────────────────────────────
  const toggleBlank = () => {
    const newIsBlank = !liveState.isBlank;
    const newState = { ...liveState, isBlank: newIsBlank };
    setLiveState(newState);
    // For output window
    if (outputWindow && !outputWindow.closed && !isRehearsal) {
      outputWindow.postMessage({ type: 'UPDATE_SLIDE', data: { ...newState, isBlank: newIsBlank } }, '*');
    }
    // For remote displays via socket
    if (socketRef.current && remotePin) {
      const currentEnvelope = { contentType: 'song', isBlank: newIsBlank, data: newState };
      socketRef.current.emit('broadcast-slide', { pin: remotePin, slide: currentEnvelope });
    }
  };

  const createRemoteSession = async () => {
    try {
      const response = await fetch(`${API_URL}/session/create`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setRemotePin(data.pin);
        setRemoteQR(data.qrCode);
        localStorage.setItem('beth_remote_pin', data.pin);
        return data.pin;
      }
    } catch (error) {
      console.error('Session creation failed:', error);
    }
  };

  const addSong = async (newSong) => {
    try {
      const response = await fetch(`${API_URL}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSong),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save');
      }

      fetchSongs();
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  };

  const updateSong = async (id, updatedSong) => {
    try {
      const response = await fetch(`${API_URL}/songs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSong),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update');
      }

      fetchSongs();
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  };

  const deleteSong = async (id) => {
    try {
      const response = await fetch(`${API_URL}/songs/${id}`, { method: 'DELETE' });
      if (response.ok) fetchSongs();
      else notify('Gagal menghapus lagu', 'error');
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const exportLibrary = async () => {
    try {
      const response = await fetch(`${API_URL}/songs/backup`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beth_presenter_library_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        notify(language === 'id' ? 'Library berhasil diekspor!' : 'Library exported successfully!', 'success');
      }
    } catch (error) {
      notify(language === 'id' ? 'Gagal ekspor' : 'Export failed', 'error');
    }
  };

  const importLibrary = async (jsonData) => {
    try {
      const response = await fetch(`${API_URL}/songs/import-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      if (response.ok) {
        const result = await response.json();
        notify(language === 'id' ? `Impor berhasil: ${result.imported} ditambahkan` : `Import success: ${result.imported} added`, 'success');
        fetchSongs();
      }
    } catch (error) {
      notify(language === 'id' ? 'Impor gagal' : 'Import failed', 'error');
    }
  };

  const value = {
    projects, setProjects,
    currentProject, setCurrentProject,
    isLive, setIsLive,
    isRehearsal, setIsRehearsal,
    openOutput,
    outputWindow, setOutputWindow,
    activeTab, setActiveTab,
    language, setLanguage,
    appTheme, setAppTheme,
    songs, setSongs,
    addSong, updateSong, deleteSong,
    exportLibrary, importLibrary,
    notification, notify,
    schedule, setSchedule, addToSchedule, addBlankToSchedule, removeFromSchedule,
    addMediaToSchedule: (mediaItem) => {
      const isPPT = mediaItem.type === 'ppt' || (mediaItem.path || '').match(/\.(pptx|ppt)$/i);
      const mediaUrl = `${API_URL.replace('/api', '')}${mediaItem.path}`;
      
      const newItem = {
        id: mediaItem.id,
        instanceId: `media-${Date.now()}`,
        title: mediaItem.name,
        type: isPPT ? 'ppt' : mediaItem.type, 
        mediaType: mediaItem.type,
        slides: [{
          type: isPPT ? 'ppt' : mediaItem.type,
          url: mediaUrl,
          mediaUrl: mediaUrl,
          path: mediaItem.path,
          thumbnail: mediaItem.thumbnail,
          caption: mediaItem.name,
          duration: mediaItem.duration,
          loop: true,
          embedUrl: isPPT ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(mediaUrl)}` : null
        }],
        url: mediaUrl,
        mediaUrl: mediaUrl,
        author: 'Media',
        thumbnail: mediaItem.thumbnail
      };
      
      setSchedule(prev => [...prev, newItem]);
    },
    setGlobalBackground,
    selectedItemIndex, setSelectedItemIndex,
    liveState,
    // Output/Live functions
    setLiveSlide,
    sendManualToLive,
    sendBibleToLive,
    sendMediaToLive,
    sendCountdownToLive,
    sendToStageDisplay,
    toggleBlank,
    loading,
    remotePin, remoteQR, createRemoteSession,
    isRemoteActive, setIsRemoteActive,
    socket: socketRef.current
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
