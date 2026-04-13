import React, { useState } from 'react';
import { 
  Monitor, Smartphone, Settings, Plus, Search, 
  ChevronDown, X, Save, FolderOpen, Trash2, Check
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import CreateProjectModal from './CreateProjectModal';
import RemoteControlModal from './RemoteControlModal';
import MultiDisplayModal from './MultiDisplayModal';
import SettingsModal from './SettingsModal';

const MainHeader = () => {
  const { 
    projects, setProjects, currentProject, setCurrentProject, 
    isLive, setIsLive, openOutput, outputWindow, setOutputWindow, notify 
  } = useProject();
  
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRemoteModalOpen, setIsRemoteModalOpen] = useState(false);
  const [isMultiDisplayModalOpen, setIsMultiDisplayModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSaveProject = () => {
    const blob = new Blob([JSON.stringify({ name: currentProject })], { type: 'application/json' });
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = `${currentProject}.beth`; 
    a.click();
  };

  const handleOpenFileManager = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.beth';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const name = file.name.replace('.beth', '');
      if (!projects.includes(name)) setProjects([...projects, name]);
      setCurrentProject(name);
      setIsProjectDropdownOpen(false);
    };
    input.click();
  };

  const filteredProjects = projects.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <header className="h-[64px] flex items-center justify-between px-6 border-b border-[#E2E2E6] bg-white z-50 shrink-0 shadow-sm font-['Outfit']">
        <div className="flex items-center gap-12">
          <h1 className="text-[26px] font-[900] text-[#800000] tracking-tight">BethPresenter</h1>
          <div className="flex items-center gap-2 relative">
            <div onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)} className="flex items-center bg-[#F8F9FA] h-[38px] px-4 gap-8 border border-[#E2E2E6] cursor-pointer hover:border-[#80000040] transition-all">
              <span className="text-[13px] text-[#2D2D2E] font-bold">{currentProject}</span>
              <ChevronDown size={14} className="text-[#8E8E93]" />
            </div>
            {isProjectDropdownOpen && (
              <div className="absolute top-[44px] left-0 w-64 bg-white border border-[#E2E2E6] shadow-premium z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                 <div className="p-2 border-b border-[#F1F1F3]">
                    <div className="flex items-center bg-[#F8F9FA] px-2 h-9 border border-[#E2E2E6]">
                       <input autoFocus placeholder="Cari..." className="bg-transparent border-none outline-none text-[13px] w-full text-black placeholder:text-[#AEAEB2]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                 </div>
                 <div className="max-h-60 overflow-y-auto">
                    {filteredProjects.map(proj => (
                       <div key={proj} onClick={() => { setCurrentProject(proj); setIsProjectDropdownOpen(false); }} className="px-3 py-2.5 text-[14px] text-[#2D2D2E] hover:bg-[#F8F9FA] cursor-pointer flex items-center justify-between group transition-colors">
                          <span className={proj === currentProject ? 'text-[#800000] font-black' : 'font-medium'}>{proj}</span>
                          {proj === currentProject && <Check size={14} className="text-[#800000]" />}
                       </div>
                    ))}
                 </div>
                 <div className="p-1 border-t border-[#F1F1F3]">
                    <div onClick={handleOpenFileManager} className="px-3 py-2 text-[12px] text-[#8E8E93] hover:text-[#800000] hover:bg-[#F8F9FA] cursor-pointer flex items-center gap-2 rounded-lg transition-colors font-bold">
                       <FolderOpen size={14} /> Open File Manager
                    </div>
                 </div>
              </div>
            )}
            <div className="flex items-center ml-2 gap-1">
              <button onClick={handleSaveProject} className="p-2 text-[#8E8E93] hover:text-[#800000] transition-colors"><Save size={20}/></button>
              <button onClick={() => setIsCreateModalOpen(true)} className="p-2 text-[#8E8E93] hover:text-[#800000] transition-colors"><Plus size={20}/></button>
              <button onClick={() => {
                   if (projects.length <= 1) return notify("Minimal harus ada satu projek!", "warning");
                   const updated = projects.filter(p => p !== currentProject);
                   setProjects(updated);
                   setCurrentProject(updated[0]);
                }} className="p-2 text-[#AEAEB2] hover:text-red-600 transition-colors"><Trash2 size={20}/></button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-5">
          {!isLive ? (
            <button onClick={openOutput} className="bg-[#800000] text-white h-[40px] px-6 text-[14px] font-[900] flex items-center gap-2 shadow-premium hover:bg-[#A00000] transition-all"><Monitor size={18} /> Buka Output</button>
          ) : (
            <div className="flex items-center gap-2">
               <div className="border border-[#80000030] h-[40px] px-4 flex items-center gap-2 bg-[#80000005]">
                  <div className="w-2 h-2 bg-[#800000] animate-pulse rounded-full"></div>
                  <span className="text-[#800000] font-black uppercase text-[12px]">Live</span>
               </div>
               <button onClick={() => { outputWindow?.close(); setIsLive(false); }} className="w-[34px] h-[34px] bg-[#800000] flex items-center justify-center text-white shadow-premium hover:bg-[#5C0000] transition-all"><X size={18}/></button>
            </div>
          )}

          <div className="h-6 border-l border-[#E2E2E6] mx-1"></div>

          <div className="flex items-center gap-6 text-[#8E8E93]">
            <Smartphone size={22} className="cursor-pointer hover:text-[#800000] transition-colors" onClick={() => setIsRemoteModalOpen(true)} />
            <Monitor size={22} className="cursor-pointer hover:text-[#800000] transition-colors" onClick={() => setIsMultiDisplayModalOpen(true)} />
            <div className="h-6 border-l border-[#E2E2E6] mx-1"></div>
            <Settings size={22} className="cursor-pointer hover:text-[#800000] transition-colors" onClick={() => setIsSettingsModalOpen(true)} />
          </div>
        </div>
      </header>

      <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} projects={projects} onConfirm={(name) => { setProjects([...projects, name]); setCurrentProject(name); }} />
      <RemoteControlModal isOpen={isRemoteModalOpen} onClose={() => setIsRemoteModalOpen(false)} />
      <MultiDisplayModal isOpen={isMultiDisplayModalOpen} onClose={() => setIsMultiDisplayModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </>
  );
};

export default MainHeader;
