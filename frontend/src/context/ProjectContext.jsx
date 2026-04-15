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
  
  // Countdown State (Modul 6)
  const [countdown, setCountdownState] = useState({
    isActive: false,
    isRunning: false,
    remainingSeconds: 300,
    title: 'The service is about to start',
    message: 'Silakan duduk di tempat Anda',
    type: 'duration', // 'duration' | 'target'
    targetTime: '09:00',
    mode: 'both' // 'both' | 'output' | 'stage'
  });

  const setCountdown = (update) => {
    setCountdownState(prev => {
      const newState = typeof update === 'function' ? update(prev) : { ...prev, ...update };
      
      // Broadcast to socket if running
      if (socketRef.current && remotePin) {
        socketRef.current.emit('sync-countdown', { pin: remotePin, countdown: newState });
      }
      
      return newState;
    });
  };

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
    if (outputWindow && !outputWindow.closed) {
      outputWindow.focus();
      return outputWindow;
    }

    const win = window.open('/display/local', 'beth_output', 'width=1280,height=720');
    if (win) {
      setOutputWindow(win);
      setIsLive(true);
      return win;
    }
    return null;
  };

  const setLiveSlide = (item, slideIndex) => {
    if (!item) return;

    setLiveState(prev => {
      let newState;
      const currentGlobalBg = prev.globalBackground || globalBackground;
      
      const isMedia = item.type === 'media' || item.type === 'image' || item.type === 'video' || item.type === 'ppt' || item.type === 'Media';

      if (isMedia) {
        const mediaUrl = item.url || item.mediaUrl || (item.slides && item.slides[0]?.url) || (item.slides && item.slides[0]?.mediaUrl);
        const isVideo = (item.type === 'video' || mediaUrl?.match(/\.(mp4|webm|ogg|mov|m4v)$/i));
        
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
          mediaUrl: mediaUrl,
          mediaType: isVideo ? 'video' : 'image',
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
          mediaType: bg.mediaType || (item.format?.bgMediaUrl ? (item.format.bgMediaUrl.match(/\.(mp4|webm|ogg|mov|m4v)$/i) ? 'video' : 'image') : null),
          bgType: bg.type || (item.format?.bgMediaUrl ? (item.format.bgMediaUrl.match(/\.(mp4|webm|ogg|mov|m4v)$/i) ? 'video' : 'image') : 'color'),
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

      // Broadcast to local and remote ONLY when not in rehearsal mode
      if (!isRehearsal) {
        if (outputWindow && !outputWindow.closed) {
          outputWindow.postMessage({ type: 'SET_LIVE_SLIDE', payload: envelope }, '*');
        }

        if (socketRef.current && remotePin) {
          socketRef.current.emit('broadcast-slide', { pin: remotePin, slide: envelope });
        }
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
      type: (item.mediaUrl || item.url || '').match(/\.(mp4|webm|ogg|mov|m4v)$/i) ? 'video' : 'image' 
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
      mediaType: data.mediaType || (data.mediaUrl?.match(/\.(mp4|webm|ogg|mov|m4v)$/i) ? 'video' : 'image'),
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
    const mediaType = mediaData.type || (mediaData.url?.match(/\.(mp4|webm|ogg|mov|m4v)$/i) ? 'video' : 'image');
    
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
    countdown, setCountdown,
    // Output/Live functions
    setLiveSlide,
    sendManualToLive,
    broadcastVideoControl: (control) => {
      if (socketRef.current && remotePin) {
        socketRef.current.emit('sync-video-control', { pin: remotePin, ...control });
      }
    },
    sendBibleToLive,
    sendMediaToLive,
    sendCountdownToLive,
    sendToStageDisplay,
    toggleBlank,
    loading,
    remotePin, remoteQR, createRemoteSession,
    isRemoteActive, setIsRemoteActive,
    // Live Formatting State (MODUL 7)
    globalFormat: {
      fontFamily: 'Poppins',
      fontSize: 82,
      isBold: true,
      isUppercase: false,
      spacing: 0,
      lineHeight: 1.15,
      textColor: '#FFFFFF',
      bgOpacity: 0,
      shadowType: 'Soft',
      alignment: 'center'
    },
    setGlobalFormat: (newFormat) => {
      // Update global format and broadcast to all displays
      const updatedFormat = { ...globalFormat, ...newFormat };
      
      // Update local state
      Object.assign(globalFormat, updatedFormat);
      
      // Send to output window
      if (outputWindow && !outputWindow.closed) {
        outputWindow.postMessage({
          type: 'UPDATE_GLOBAL_FORMAT',
          payload: updatedFormat
        }, '*');
      }
      
      // Send to remote displays
      if (socketRef.current && remotePin) {
        socketRef.current.emit('sync-global-format', {
          pin: remotePin,
          format: updatedFormat
        });
      }
      
      // Update live state format
      setLiveState(prev => ({ ...prev, format: updatedFormat }));
    },
    globalFormat,
    setGlobalFormat,
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
