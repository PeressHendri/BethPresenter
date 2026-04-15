import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { 
  Loader2, Music, Video, Image as ImageIcon, Plus, 
  BookOpen, Timer, Tv, Monitor, Settings, Clock, Eye, EyeOff
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

// Import Custom Hooks and Utils
import { useThrottle } from '../hooks/useThrottle';
import useWakeLock from '../hooks/useWakeLock';
import { cleanupUnusedPreviews, unloadHiddenVideos } from '../utils/memoryCleanup';

// Import Layout Components (Modul 3)
import SchedulePanel from '../components/SchedulePanel';
import PreviewPanel from '../components/PreviewPanel';
import FlowPanel from '../components/FlowPanel';

// LAZY LOAD HEAVY MODULES
const BibleView = lazy(() => import('../components/BibleView'));
const SongLibrary = lazy(() => import('../components/SongLibrary'));
const MediaView = lazy(() => import('../components/MediaView'));
const CountdownView = lazy(() => import('../components/CountdownView'));
const StageView = lazy(() => import('../components/StageView'));

// --- UI Sub-Components ---
const TabLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
    <Loader2 size={48} className="animate-spin text-[#800000] mb-4" />
    <span className="text-[14px] font-black uppercase tracking-widest">Mempersiapkan Modul...</span>
  </div>
);

const PresentationPage = () => {
  const { 
    language, 
    activeTab, 
    setActiveTab, 
    isLive, 
    openOutput, 
    isRehearsal,
    setRehearsalMode,
    notify
  } = useProject();

  // MODUL 18: Screen Wake Lock
  const { 
    isSupported: wakeLockSupported, 
    isActive: wakeLockActive, 
    error: wakeLockError,
    requestWakeLock,
    releaseWakeLock,
    toggle: toggleWakeLock 
  } = useWakeLock(isLive); // Enable wake lock when in live mode

  // MODUL 16: Enhanced Rehearsal Mode State
  const [rehearsalSettings, setRehearsalSettings] = useState({
    showPreview: true,
    showFlowPanel: true,
    showSchedule: true,
    autoAdvance: false,
    advanceInterval: 5000, // 5 seconds
    loopMode: false,
    blackoutEnabled: false
  });

  const [isSongLibraryOpen, setIsSongLibraryOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [showRehearsalControls, setShowRehearsalControls] = useState(false);

  // Auto-switch to Presentation tab if library modal closed
  useEffect(() => {
    if (activeTab === 'lagu' || activeTab === 'media' || activeTab === 'alkitab') {
      // Keep it
    }
  }, [activeTab]);

  // MODUL 16: Enhanced Rehearsal Mode Functions
  const toggleRehearsalMode = () => {
    const newMode = !isRehearsal;
    setRehearsalMode(newMode);
    
    if (newMode) {
      notify('Rehearsal Mode ON - No output to projector', 'info');
      setShowRehearsalControls(true);
    } else {
      notify('Rehearsal Mode OFF - Live output enabled', 'info');
      setShowRehearsalControls(false);
    }
  };

  const updateRehearsalSetting = (key, value) => {
    setRehearsalSettings(prev => ({ ...prev, [key]: value }));
  };

  // Auto-advance functionality for rehearsal
  useEffect(() => {
    if (!rehearsalSettings.autoAdvance || !isRehearsal) return;

    const interval = setInterval(() => {
      // Trigger next slide logic here
      // This would integrate with your existing slide navigation
      console.log('Auto-advancing slide in rehearsal mode');
    }, rehearsalSettings.advanceInterval);

    return () => clearInterval(interval);
  }, [rehearsalSettings.autoAdvance, rehearsalSettings.advanceInterval, isRehearsal]);

  // MODUL 18: Wake Lock notifications
  useEffect(() => {
    if (wakeLockError) {
      console.warn('[WakeLock] Error:', wakeLockError);
    }
  }, [wakeLockError]);

  useEffect(() => {
    if (isLive && wakeLockActive) {
      console.log('[WakeLock] Screen wake lock active - projector will not sleep');
    } else if (isLive && !wakeLockActive && wakeLockSupported) {
      console.log('[WakeLock] Screen wake lock inactive - projector may sleep');
    }
  }, [isLive, wakeLockActive, wakeLockSupported]);

  const t = useMemo(() => ({
    id: { 
      tabs: { presentasi: "Presentasi", lagu: "Lagu", alkitab: "Alkitab", media: "Media", countdown: "Timer", panggung: "Panggung" },
      output: "BUKA OUTPUT"
    },
    en: { 
      tabs: { presentasi: "Present", lagu: "Songs", alkitab: "Bible", media: "Media", countdown: "Timer", panggung: "Stage" },
      output: "OPEN OUTPUT"
    }
  }[language] || t.id), [language]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'presentasi':
        return (
          <div className="flex-1 flex overflow-hidden bg-[#F8F9FA]">
            {showRehearsalControls && (
              <div className="h-[60px] bg-orange-50 border-t border-orange-200 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                  <span className="text-[12px] font-black text-orange-800 uppercase tracking-wider">Rehearsal Settings</span>
                  
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-[11px] font-medium text-orange-700">
                      <input
                        type="checkbox"
                        checked={rehearsalSettings.showSchedule}
                        onChange={(e) => updateRehearsalSetting('showSchedule', e.target.checked)}
                        className="rounded text-orange-500"
                      />
                      Show Schedule
                    </label>
                    
                    <label className="flex items-center gap-2 text-[11px] font-medium text-orange-700">
                      <input
                        type="checkbox"
                        checked={rehearsalSettings.showFlowPanel}
                        onChange={(e) => updateRehearsalSetting('showFlowPanel', e.target.checked)}
                        className="rounded text-orange-500"
                      />
                      Show Flow Panel
                    </label>
                    
                    <label className="flex items-center gap-2 text-[11px] font-medium text-orange-700">
                      <input
                        type="checkbox"
                        checked={rehearsalSettings.autoAdvance}
                        onChange={(e) => updateRehearsalSetting('autoAdvance', e.target.checked)}
                        className="rounded text-orange-500"
                      />
                      Auto Advance
                    </label>
                    
                    {rehearsalSettings.autoAdvance && (
                      <select
                        value={rehearsalSettings.advanceInterval}
                        onChange={(e) => updateRehearsalSetting('advanceInterval', parseInt(e.target.value))}
                        className="text-[11px] px-2 py-1 rounded border border-orange-300 text-orange-700"
                      >
                        <option value={3000}>3s</option>
                        <option value={5000}>5s</option>
                        <option value={10000}>10s</option>
                        <option value={15000}>15s</option>
                      </select>
                    )}
                    
                    <label className="flex items-center gap-2 text-[11px] font-medium text-orange-700">
                      <input
                        type="checkbox"
                        checked={rehearsalSettings.loopMode}
                        onChange={(e) => updateRehearsalSetting('loopMode', e.target.checked)}
                        className="rounded text-orange-500"
                      />
                      Loop Mode
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-[11px] font-medium text-orange-600">
                    {isRehearsal ? '🔴 No output to projector' : '🟢 Live output enabled'}
                  </div>
                  
                  {/* MODUL 18: Wake Lock Status in Rehearsal Controls */}
                  {isLive && wakeLockSupported && (
                    <div className="flex items-center gap-2 text-[11px] font-medium">
                      {wakeLockActive ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          Wake Lock Active
                        </span>
                      ) : (
                        <span className="text-yellow-600 flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          Wake Lock Inactive
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex-1 flex overflow-hidden">
              {renderMainContent()}
            </div>
          </div>
        );
      case 'lagu':
        return <Suspense fallback={<TabLoader />}><SongLibrary setIsSongEditorOpen={() => {}} setEditingSong={() => {}} /></Suspense>;
      case 'alkitab':
        return <Suspense fallback={<TabLoader />}><BibleView /></Suspense>;
      case 'media':
        return <Suspense fallback={<TabLoader />}><MediaView /></Suspense>;
      case 'countdown':
        return <Suspense fallback={<TabLoader />}><CountdownView /></Suspense>;
      case 'panggung':
        return <Suspense fallback={<TabLoader />}><StageView /></Suspense>;
      default:
        return null;
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'lagu':
        return (
          <Suspense fallback={<TabLoader />}>
            <SongLibrary />
          </Suspense>
        );
      case 'media':
        return (
          <Suspense fallback={<TabLoader />}>
            <MediaView />
          </Suspense>
        );
      case 'alkitab':
        return (
          <Suspense fallback={<TabLoader />}>
            <BibleView />
          </Suspense>
        );
      case 'timer':
        return (
          <Suspense fallback={<TabLoader />}>
            <CountdownView />
          </Suspense>
        );
      case 'stage':
        return (
          <Suspense fallback={<TabLoader />}>
            <StageView />
          </Suspense>
        );
      default:
        return (
          <div className="flex-1 flex bg-[#F1F1F3]">
            {(!isRehearsal || rehearsalSettings.showSchedule) && (
              <SchedulePanel 
                setIsSongLibraryOpen={setIsSongLibraryOpen}
                setIsMediaLibraryOpen={setIsMediaLibraryOpen}
              />
            )}

            <PreviewPanel />

            {(!isRehearsal || rehearsalSettings.showFlowPanel) && <FlowPanel />}
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden font-['Outfit']">
      {/* GLOBAL HEADER */}
      <header className="h-[64px] bg-white border-b border-[#E2E2E6] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6 h-full">
          <div className="flex items-center gap-3 pr-6 border-r border-[#E2E2E6]">
            <div className="w-10 h-10 bg-[#800000] rounded-xl flex items-center justify-center shadow-lg shadow-[#80000030]">
              <Tv size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-[950] tracking-tight leading-none text-[#1D1D1F]">BethPresenter</h1>
              <span className="text-[9px] font-black text-[#8E8E93] uppercase tracking-[0.2em] mt-1 block">Studio Pro</span>
            </div>
          </div>

          <nav className="flex h-full">
            {Object.entries(t.tabs).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-6 h-full text-[13px] font-black transition-all border-b-2 ${
                  activeTab === key 
                  ? 'border-[#800000] text-[#800000] bg-[#80000005]' 
                  : 'border-transparent text-[#AEAEB2] hover:text-[#2D2D2E]'
                }`}
              >
                <span>{label.toUpperCase()}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isLive && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 animate-pulse">
              <div className="w-2 h-2 bg-red-600 rounded-full" />
              <span className="text-[11px] font-black tracking-widest">LIVE</span>
            </div>
          )}
          <button 
            onClick={openOutput}
            className={`px-4 py-2 rounded-lg text-[12px] font-black transition-all flex items-center gap-2 ${
              isLive 
                ? 'bg-[#800000] text-white shadow-lg shadow-[#80000020]' 
                : 'bg-[#F8F9FA] text-[#6B7280] border border-[#E2E2E6] hover:bg-white'
            }`}
          >
            <Monitor size={16} />
            {isLive ? 'LIVE' : 'LATIHAN'}
            {isLive && wakeLockActive && (
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Screen wake lock active" />
            )}
          </button>
          
          {/* MODUL 18: Wake Lock Status Indicator */}
          {isLive && wakeLockSupported && (
            <button
              onClick={toggleWakeLock}
              className={`px-3 py-2 rounded-lg text-[11px] font-black transition-all flex items-center gap-2 ${
                wakeLockActive 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}
              title={wakeLockActive ? 'Screen wake lock active - Click to disable' : 'Screen wake lock inactive - Click to enable'}
            >
              {wakeLockActive ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  Wake Lock ON
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  Wake Lock OFF
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex overflow-hidden bg-[#F8F9FA]">
        {renderActiveTab()}
      </main>
    </div>
  );
};

export default PresentationPage;
