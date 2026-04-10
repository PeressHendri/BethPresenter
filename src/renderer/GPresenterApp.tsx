import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { ServiceOrderSidebar, ServiceItem } from './components/ServiceOrderSidebar';
import { SlideGrid } from './components/SlideGrid';
import { LivePanel } from './components/LivePanel';
import { SongLibraryPage } from './routes/SongLibraryPage';
import { ScripturePage } from './routes/ScripturePage';
import { MediaPage } from './routes/MediaPage';
import { CountdownPage } from './routes/CountdownPage';
import { StageDisplayPage } from './routes/StageDisplayPage';
import { SongEditorPage } from './routes/SongEditorPage';
import { SettingsPage } from './routes/SettingsPage';
import { AddScripturePage } from './routes/AddScripturePage';
import { AddMediaPage } from './routes/AddMediaPage';
import { ServiceOrderManagerPage } from './routes/ServiceOrderManagerPage';
import { MobileRemotePage } from './routes/MobileRemotePage';
import { ProjectManagerPage } from './routes/ProjectManagerPage';
import { ThemeManagerPage } from './routes/ThemeManagerPage';
import { BackupRestorePage } from './routes/BackupRestorePage';
import { DisplayManagementPage } from './routes/DisplayManagementPage';
import { LandingPage } from './routes/LandingPage';
import { AppShell } from './components/layout/AppShell';
import { OutputSettingsOverlay } from './components/OutputSettingsOverlay';
import { PowerPointImportModal } from './components/PowerPointImportModal';
import { RehearsalModeOverlay } from './components/RehearsalModeOverlay';
import { MOCK_MEDIA_LIBRARY } from './data/media-library';
import { ToastProvider, useToast } from './components/Toast';
import { useGPProduction } from './hooks/useGPProduction';

// Background asset
const FOREST_BG = 'media:///Users/mac/.gemini/antigravity/brain/cf3b98ec-4448-4e7a-8f01-3c8b866cfa3c/dark_forest_background_1775749896276.png';

// Mock Data
const MOCK_SERVICE_ITEMS: ServiceItem[] = [
  { id: 1, type: 'STANDBY', title: 'STANDBY', slides: 0 },
  { id: 2, type: 'SONG', title: 'HERE AGAIN', slides: 10 },
  { id: 3, type: 'SONG', title: 'BELIEVE FOR IT ..', slides: 38 },
  { id: 4, type: 'SONG', title: 'WAY MAKER', slides: 20 },
  { id: 5, type: 'SONG', title: 'From the Inside ..', slides: 5 },
  { id: 6, type: 'SONG', title: 'KING OF GLORY', slides: 24 },
];

const MOCK_SLIDES_FOR_HERE_AGAIN = [
  { id: 1, label: '', text: '(blank)' },
  { id: 2, label: 'V1', text: "CAN'T GO BACK TO THE BEGINNING" },
  { id: 3, label: 'V1B', text: "CAN'T CONTROL WHAT TOMORROW WILL BRING" },
  { id: 4, label: 'V1', text: "BUT I KNOW HERE IN THE MIDDLE\n IS A PLACE WHERE YOU PROMISE TO BE" },
  { id: 5, label: 'CHORUS', text: "I'M NOT ENOUGH UNLESS YOU COME\n WILL YOU MEET ME HERE AGAIN?" },
  { id: 6, label: 'CHORUS', text: "'CAUSE ALL I WANT IS ALL YOU ARE\n WILL YOU MEET ME HERE AGAIN?" },
  { id: 7, label: 'V2', text: "AS I WALK NOW THROUGH THE VALLEY\n LET YOUR LOVE RISE ABOVE EVERY FEAR" },
  { id: 8, label: 'V2', text: "LIKE THE SUN SHAPING THE SHADOW" },
  { id: 9, label: 'V2B', text: "IN MY WEAKNESS YOUR GLORY APPEARS" },
  { id: 10, label: 'CHORUS', text: "WILL YOU MEET ME HERE AGAIN? (LOOP)" },
];

function AppContent() {
  const { showToast } = useToast();
  const production = useGPProduction();
  const navigate = useNavigate();
  const location = useLocation();

  // ── THEME ENGINE ──
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('beth-theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('beth-theme', theme);
  }, [theme]);

  // Navigation state mapped to tabs for Header UI
  const activeTab = useMemo(() => {
    const p = location.pathname;
    if (p === '/') return 'presentation';
    return p.substring(1).replace('/', '-');
  }, [location.pathname]);

  const [showOutputSettings, setShowOutputSettings] = useState(false);
  const [showPPTImport, setShowPPTImport] = useState(false);
  const [isRehearsalMode, setIsRehearsalMode] = useState(false);
  const [showRehearsalOverlay, setShowRehearsalOverlay] = useState(false);
  
  // Production State Local Cache
  const [activeServiceId, setActiveServiceId] = useState(2);
  const [activeSlideId, setActiveSlideId] = useState<number | null>(1);
  const [liveItem, setLiveItem] = useState<any>(null);

  // Derived State
  const activeSlide = useMemo(() => {
    return MOCK_SLIDES_FOR_HERE_AGAIN.find(s => s.id === activeSlideId) || null;
  }, [activeSlideId]);

  const nextSlide = useMemo(() => {
    if (!activeSlideId) return null;
    return MOCK_SLIDES_FOR_HERE_AGAIN.find(s => s.id === activeSlideId + 1) || null;
  }, [activeSlideId]);

  // IPC Helpers
  const invokeIPC = async (channel: string, payload?: any) => {
    if ((window as any).electron?.ipcRenderer) {
      try {
        return await (window as any).electron.ipcRenderer.invoke(channel, payload);
      } catch (err) {
        console.error(`IPC Error [${channel}]:`, err);
        showToast(`Hardware Error: ${channel}`, 'error');
      }
    }
    return null;
  };

  // ── HANDLERS ──
  const handleOpenOutput = async () => {
    const res = await invokeIPC('output-open');
    if (res?.success) showToast('Output Window Activated', 'success');
  };

  const handleEndLive = async () => {
    await invokeIPC('presentation-end-live');
    setLiveItem(null);
    production.setProductionState(s => ({ ...s, isLive: false }));
    showToast('Broadcast Ended', 'success');
  };

  const handleToggleBlank = async () => {
    const newState = !production.isBlackout;
    await invokeIPC('output-blank', newState);
    production.toggleBlackout();
    showToast(newState ? 'Output Blanked' : 'Output Restored', 'success');
  };

  const handleGoLive = async (slide?: any) => {
     const itemToLive = slide || activeSlide || liveItem;
     if (!itemToLive) return;
     
     await invokeIPC('slide-live', itemToLive);
     setLiveItem(itemToLive);
     production.setProductionState(s => ({ ...s, isLive: true }));
     showToast('Signal Sent to Projector', 'success');
  };

  const handleNextSlide = () => {
    if (activeSlideId && activeSlideId < MOCK_SLIDES_FOR_HERE_AGAIN.length) {
      const nextId = activeSlideId + 1;
      setActiveSlideId(nextId);
      const next = MOCK_SLIDES_FOR_HERE_AGAIN.find(s => s.id === nextId);
      if (production.isLive) handleGoLive(next);
    }
  };

  const handlePrevSlide = () => {
    if (activeSlideId && activeSlideId > 1) {
      const prevId = activeSlideId - 1;
      setActiveSlideId(prevId);
      const prev = MOCK_SLIDES_FOR_HERE_AGAIN.find(s => s.id === prevId);
      if (production.isLive) handleGoLive(prev);
    }
  };

  // Suppress Live Panel on specific routes
  const hideLivePanel = ['/stage', '/settings', '/add-bible', '/add-media', '/service-manager', '/remote', '/projects', '/themes', '/backup', '/display'].includes(location.pathname);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--surface-primary)] font-sans text-[var(--text-100)]">
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        
        <Route path="*" element={
          <AppShell>
            <div className="flex-1 flex overflow-hidden min-h-0">
               <Routes>
                  <Route path="/" element={
                    <>
                      <ServiceOrderSidebar 
                        items={MOCK_SERVICE_ITEMS} 
                        onGoLive={(id: number) => {
                          showToast(`Item ${id} is now Live`, 'success');
                        }}
                      />
                      <SlideGrid 
                        slides={activeServiceId === 2 ? MOCK_SLIDES_FOR_HERE_AGAIN : []} 
                        activeSlideId={activeSlideId}
                        onSelectSlide={(id) => {
                          setActiveSlideId(id);
                          invokeIPC('slide-preview', MOCK_SLIDES_FOR_HERE_AGAIN.find(s => s.id === id));
                        }}
                        onGoLive={(slide) => handleGoLive(slide)}
                        backgroundImage={FOREST_BG}
                      />
                    </>
                  } />
                  <Route path="/songs" element={<SongLibraryPage activeSongId="2" onSelectSong={() => {}} onGoLive={() => showToast('Song Deployed Live', 'success')} />} />
                  <Route path="/bible" element={ <ScripturePage onGoLive={(data) => { setActiveSlideId(null); setLiveItem(data); handleGoLive(data); }} /> } />
                  <Route path="/media" element={ <MediaPage onGoLive={(item) => { setActiveSlideId(null); setLiveItem(item); handleGoLive(item); }} onImportPPT={() => setShowPPTImport(true)} /> } />
                  <Route path="/timer" element={ <CountdownPage /> } />
                  <Route path="/stage" element={<StageDisplayPage />} />
                  <Route path="/projects" element={<ProjectManagerPage />} />
                  <Route path="/themes" element={<ThemeManagerPage />} />
                  <Route path="/backup" element={<BackupRestorePage />} />
                  <Route path="/display" element={<DisplayManagementPage />} />
                  <Route path="/settings" element={<SettingsPage onThemeChange={setTheme} currentTheme={theme} />} />
                  <Route path="/song-editor" element={<SongEditorPage />} />
                  <Route path="/add-bible" element={<AddScripturePage />} />
                  <Route path="/add-media" element={<AddMediaPage />} />
                  <Route path="/service-manager" element={<ServiceOrderManagerPage />} />
                  <Route path="/remote" element={<MobileRemotePage activeSlide={liveItem || activeSlide} />} />
               </Routes>
               
               {/* RIGHT: Live Panel */}
               {!hideLivePanel && (
                 <LivePanel 
                   activeSlide={liveItem || activeSlide}
                   nextSlide={activeTab === 'presentation' ? nextSlide : null}
                   backgroundImage={FOREST_BG}
                   serviceItems={MOCK_SERVICE_ITEMS}
                   activeServiceId={activeServiceId}
                   onEndLive={handleEndLive}
                   onNext={handleNextSlide}
                   onPrev={handlePrevSlide}
                   onToggleHide={handleToggleBlank}
                   onToggleSubtitle={() => showToast('Subtitles Toggled', 'success')}
                   isLyricsHidden={production.isBlackout}
                 />
               )}
            </div>

            {/* OVERLAYS (within shell context) */}
            {showOutputSettings && <OutputSettingsOverlay onClose={() => setShowOutputSettings(false)} />}
            {showPPTImport && <PowerPointImportModal onClose={() => setShowPPTImport(false)} />}
            {showRehearsalOverlay && (
              <RehearsalModeOverlay 
                onClose={() => setShowRehearsalOverlay(false)} 
                onExit={() => {
                  setIsRehearsalMode(false);
                  setShowRehearsalOverlay(false);
                  showToast('Live Signals Re-enabled', 'success');
                }}
              />
            )}
          </AppShell>
        } />
      </Routes>
    </div>
  );
}

export function BethPresenterApp() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default BethPresenterApp;
