import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Clock } from 'lucide-react';
import PresentationPage from './pages/PresentationPage';
import DisplayClientPage from './pages/DisplayClientPage';
import RemotePage from './pages/RemotePage';
import OBSPage from './pages/OBSPage';

const Projector = () => (
  <div className="h-screen w-full bg-black flex flex-col items-center justify-center p-20 text-center select-none font-['Outfit']">
    <h1 className="text-7xl font-bold text-white drop-shadow-[0_10px_20px_rgba(0,0,0,1)] uppercase tracking-tight">
      Melayani Tuhan dengan Segenap Hati
    </h1>
    <p className="mt-8 text-[#800000] font-black text-sm uppercase tracking-[0.4em]">BethPresenter</p>
  </div>
);

const GlobalNotification = () => {
  const { notification } = useProject();
  if (!notification) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300 px-6">
       <div className="bg-[#1A1A1A] text-white px-8 py-5 rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-white/10 flex items-center gap-5 max-w-sm pointer-events-auto backdrop-blur-md">
          <div className="w-12 h-12 bg-[#800000] rounded-full flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(128,0,0,0.4)]">
             <Clock size={24} className="text-white" />
          </div>
          <div>
            <p className="text-[15px] font-black leading-tight tracking-tight">{notification.message}</p>
          </div>
       </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="h-screen w-full bg-[#F8F9FA] flex flex-col font-['Outfit']">
    {/* Skeleton Header */}
    <div className="h-16 bg-white border-b border-[#E2E2E6] flex items-center justify-between px-6 shrink-0">
      <div className="h-6 w-48 bg-[#F1F1F3] rounded animate-pulse"></div>
      <div className="h-8 w-64 bg-[#F1F1F3] rounded animate-pulse"></div>
    </div>
    <div className="h-[48px] bg-white border-b border-[#E2E2E6] flex items-center px-6 gap-6 shrink-0">
       <div className="h-4 w-20 bg-[#F1F1F3] rounded animate-pulse"></div>
       <div className="h-4 w-20 bg-[#F1F1F3] rounded animate-pulse"></div>
    </div>
    
    <div className="flex-1 flex p-12 items-center justify-center">
       <div className="flex flex-col items-center">
          <Clock size={48} className="text-[#80000020] animate-spin mb-4" />
          <h2 className="text-[18px] font-black text-[#8E8E93] uppercase tracking-widest">Mempersiapkan BethPresenter...</h2>
       </div>
    </div>
  </div>
);

const AppRouter = () => {
  const { loading } = useProject();

  if (loading) return <SkeletonLoader />;

  return (
    <Router>
      <GlobalNotification />
      <Routes>
        <Route path="/" element={<PresentationPage />} />
        <Route path="/songs" element={<PresentationPage />} />
        <Route path="/display/:pin" element={<DisplayClientPage />} />
        <Route path="/remote/:pin" element={<RemotePage />} />
        <Route path="/obs/:pin" element={<OBSPage />} />
        <Route path="/projector" element={<Projector />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <ProjectProvider>
      <AppRouter />
    </ProjectProvider>
  );
};

export default App;
