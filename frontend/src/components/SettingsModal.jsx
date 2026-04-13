import React, { useState, useEffect } from 'react';
import { 
  Settings, X, ChevronDown, Copy, Check, 
  ExternalLink, Crown, Database, Globe, 
  Monitor, Book, FileText, Download, Upload, 
  Trash2, Heart, Scale, ShieldCheck, Play
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { language, setLanguage, appTheme, setAppTheme, exportLibrary, importLibrary, notify } = useProject();
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [buildDate, setBuildDate] = useState('');
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  
  const appVersion = "1.0.0";
  const developerName = "Peress Hendri Virgiawan";

  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setBuildDate(`${formattedDate}, ${formattedTime}`);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImportLagu = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            importLibrary(data);
          } catch (err) {
            notify(language === 'id' ? 'Format file tidak valid' : 'Invalid file format', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleUpdateCheck = () => {
    setIsCheckingUpdates(true);
    setUpdateStatus(null);
    setTimeout(() => {
        setIsCheckingUpdates(false);
        setUpdateStatus(t.upToDate);
        setTimeout(() => setUpdateStatus(null), 3000);
    }, 1500);
  };

  const t = {
    id: {
      title: "Pengaturan",
      langLabel: "Bahasa",
      langDesc: "Pilih bahasa antarmuka",
      aspectLabel: "Rasio Aspek Output",
      aspectDesc: "Pilih koordinat untuk tampilan proyektor",
      bibleTitle: "Impor Alkitab",
      bibleDesc: "Impor terjemahan Alkitab dalam format XML Zefania.",
      dataTitle: "Penyimpanan & Cadangan",
      dataDesc: "Cadangan lengkap semua lagu, presentasi, dan media.",
      export: "Ekspor",
      import: "Impor",
      close: "Selesai",
      upToDate: "Versi Terbaru",
      appTitle: "INFORMASI APLIKASI",
      version: "Versi",
      build: "Build",
      updates: "Pembaruan",
      developer: "Pengembang",
      support: "Dukung Proyek Ini",
      terms: "Syarat & Hak Cipta",
      checking: "Memeriksa...",
      check: "Cek"
    },
    en: {
      title: "Settings",
      langLabel: "Language",
      langDesc: "Choose interface language",
      aspectLabel: "Output Aspect Ratio",
      aspectDesc: "Choose coordinates for projector display",
      bibleTitle: "Bible Import",
      bibleDesc: "Import Bible translations in Zefania XML format.",
      dataTitle: "Storage & Backup",
      dataDesc: "Full backup of all songs and presentations.",
      export: "Export",
      import: "Import",
      close: "Done",
      upToDate: "Up to date",
      appTitle: "APPLICATION INFO",
      version: "Version",
      build: "Build",
      updates: "Updates",
      developer: "Developer",
      support: "Support This Project",
      terms: "Terms & Copyright",
      checking: "Checking...",
      check: "Check"
    }
  }[language || 'id'];

  const SelectionCard = ({ label, description, value, dropdownId, options }) => {
    const isDropdownOpen = openDropdown === dropdownId;
    return (
      <div className="relative mb-6">
        <div className="bg-white rounded-lg p-6 border border-[#E2E2E6] hover:border-[#80000030] transition-all group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-[14px] font-black text-[#2D2D2E]">{label}</h4>
              <p className="text-[11px] text-[#8E8E93] font-medium">{description}</p>
            </div>
            <div 
              onClick={() => setOpenDropdown(isDropdownOpen ? null : dropdownId)}
              className="flex items-center gap-3 bg-[#F8F9FA] px-5 py-3 rounded-xl border border-[#E2E2E6] cursor-pointer hover:border-[#800000] transition-all group/btn"
            >
              <span className="text-[13px] text-[#2D2D2E] font-bold group-hover/btn:text-[#800000]">{value}</span>
              <ChevronDown size={14} className={`text-[#AEAEB2] group-hover/btn:text-[#800000] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
        
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-[#E2E2E6] rounded-2xl shadow-3xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            {options.map(opt => (
              <div 
                key={opt.label}
                onClick={() => { opt.action(); setOpenDropdown(null); }}
                className={`px-5 py-4 text-[13px] cursor-pointer flex items-center justify-between transition-colors ${value === opt.label ? 'text-white bg-[#800000] font-black' : 'text-[#8E8E93] font-bold hover:text-[#800000] hover:bg-[#80000005]'}`}
              >
                {opt.label}
                {value === opt.label && <Check size={16} />}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const DataManagementCard = ({ title, onExport, onImport, isLarge = false }) => (
    <div className={`bg-white border border-[#E2E2E6] rounded-xl p-6 ${isLarge ? 'md:p-8' : 'p-6'} space-y-5 hover:border-[#80000030] transition-all shadow-sm`}>
       <div className="space-y-1">
          <h4 className={`font-black text-[#2D2D2E] ${isLarge ? 'text-[16px]' : 'text-[14px]'}`}>{title}</h4>
          {isLarge && <p className="text-[11px] text-[#8E8E93] font-medium leading-relaxed">Cadangan lengkap semua lagu, presentasi, dan media (termasuk file).</p>}
       </div>
       <div className="flex gap-2.5">
          <button onClick={onExport} className="flex-1 bg-[#F8F9FA] text-[#2D2D2E] border border-[#E2E2E6] h-10 rounded-xl text-[12px] font-black flex items-center justify-center gap-2 hover:bg-[#800000] hover:text-white hover:border-[#800000] transition-all shadow-sm">
             <Download size={15} /> {t.export}
          </button>
          <button onClick={onImport} className="flex-1 bg-[#F8F9FA] text-[#2D2D2E] border border-[#E2E2E6] h-10 rounded-xl text-[12px] font-black flex items-center justify-center gap-2 hover:bg-[#800000] hover:text-white hover:border-[#800000] transition-all shadow-sm">
             <Upload size={15} /> {t.import}
          </button>
       </div>
    </div>
  );

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-[200] flex items-center justify-center p-4 font-manrope">
      <div className="bg-[#F8F9FA] w-[540px] h-[90vh] rounded-2xl border border-white shadow-3xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-10 py-8 flex items-center justify-between border-b border-[#F1F1F3] bg-white">
          <h2 className="text-[22px] font-black text-[#2D2D2E] tracking-tight">{t.title}</h2>
          <button onClick={onClose} className="w-10 h-10 bg-[#F8F9FA] border border-[#E2E2E6] rounded-full flex items-center justify-center text-[#AEAEB2] hover:text-[#800000] hover:border-[#800000] transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-24 space-y-12 pt-8">
          
          <section>
            <p className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.2em] mb-6">PREFERENCE</p>
            <SelectionCard 
              label={t.themeLabel || "Tema Aplikasi"} 
              description={t.themeDesc || "Atur antara Light dan Dark Mode"} 
              value={appTheme === 'dark' ? 'Dark Mode' : 'Light Mode'} 
              dropdownId="theme"
              options={[
                { label: 'Light Mode', action: () => setAppTheme('light') },
                { label: 'Dark Mode', action: () => setAppTheme('dark') }
              ]}
            />
            <SelectionCard 
              label={t.langLabel} 
              description={t.langDesc} 
              value={language === 'id' ? 'Bahasa Indonesia' : 'English'} 
              dropdownId="lang"
              options={[
                { label: 'Bahasa Indonesia', action: () => setLanguage('id') },
                { label: 'English', action: () => setLanguage('en') }
              ]}
            />
            <SelectionCard 
              label={t.aspectLabel} 
              description={t.aspectDesc} 
              value={aspectRatio} 
              dropdownId="aspect"
              options={[
                { label: '16:9', action: () => setAspectRatio('16:9') },
                { label: '4:3', action: () => setAspectRatio('4:3') },
                { label: '21:9', action: () => setAspectRatio('21:9') }
              ]}
            />
          </section>

          <section>
            <p className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.2em] mb-6">TERJEMAHAN ALKITAB</p>
            <div className="bg-white rounded-xl p-8 border border-[#E2E2E6] space-y-6 shadow-sm">
                <div className="space-y-1">
                   <h4 className="text-[15px] font-black text-[#2D2D2E]">Impor Alkitab</h4>
                   <p className="text-[12px] text-[#8E8E93] font-medium leading-relaxed">{t.bibleDesc}</p>
                </div>
                <button 
                   onClick={() => alert('Impor Alkitab...')}
                   className="flex items-center gap-3 bg-[#800000] text-white px-8 py-3.5 rounded-2xl font-black text-[13px] hover:bg-[#5C0000] transition-all shadow-lg"
                >
                   <ShieldCheck size={18} className="text-white" /> Import Zefania XML
                </button>
                <p className="text-[10px] text-[#AEAEB2] italic font-medium">No imported Bibles yet.</p>
            </div>
          </section>

          <section>
            <p className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.2em] mb-6">MANAJEMEN DATA</p>
            
            <div className="space-y-4">
               <DataManagementCard 
                 title="Cadangan Lengkap" 
                 isLarge={true} 
                 onExport={exportLibrary} 
                 onImport={handleImportLagu} 
               />

               <div className="grid grid-cols-1 gap-4">
                  <DataManagementCard title="Lagu" onExport={exportLibrary} onImport={handleImportLagu} />
                  <DataManagementCard title="Presentasi" onExport={() => {}} onImport={() => {}} />
                  <DataManagementCard title="Media" onExport={() => {}} onImport={() => {}} />
               </div>
            </div>
          </section>

          <section>
            <p className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.2em] mb-6">{t.appTitle}</p>
            <div className="bg-white rounded-xl border border-[#E2E2E6] overflow-hidden divide-y divide-[#F1F1F3] shadow-sm">
               <div className="flex items-center justify-between p-6 hover:bg-[#F8F9FA] transition-colors">
                 <span className="text-[13px] text-[#8E8E93] font-bold">{t.version}</span>
                 <span className="text-[14px] text-[#2D2D2E] font-black">{appVersion}</span>
               </div>
               <div className="flex items-center justify-between p-6 hover:bg-[#F8F9FA] transition-colors">
                 <span className="text-[13px] text-[#8E8E93] font-bold">{t.build}</span>
                 <span className="text-[14px] text-[#2D2D2E] font-black tracking-tight">{buildDate}</span>
               </div>
               <div className="flex items-center justify-between p-6 hover:bg-[#F8F9FA] transition-colors">
                 <span className="text-[13px] text-[#8E8E93] font-bold">{t.updates}</span>
                 <div className="flex items-center gap-4">
                   <span className="text-[13px] text-[#2D2D2E] font-bold">{isCheckingUpdates ? t.checking : (updateStatus || '')}</span>
                   {!isCheckingUpdates && !updateStatus && <button onClick={handleUpdateCheck} className="text-[13px] text-[#800000] font-black hover:underline">{t.check}</button>}
                   {updateStatus && <Check size={14} className="text-[#800000]" />}
                 </div>
               </div>
               <div className="flex items-center justify-between p-6 hover:bg-[#F8F9FA] transition-colors">
                 <span className="text-[13px] text-[#8E8E93] font-bold">{t.developer}</span>
                 <span className="text-[14px] text-[#800000] font-black uppercase tracking-wider">{developerName}</span>
               </div>
            </div>

            <div className="flex gap-4 mt-8">
               <button className="flex-1 flex items-center justify-center gap-2.5 bg-[#80000005] border border-[#80000010] text-[#800000] py-4 rounded-[16px] text-[13px] font-black hover:bg-[#80000010] transition-all">
                  <Heart size={18} fill="#800000" /> {t.support}
               </button>
               <button className="flex-1 flex items-center justify-center gap-2.5 bg-white border border-[#E2E2E6] text-[#AEAEB2] py-4 rounded-[16px] text-[13px] font-bold hover:text-[#2D2D2E] hover:border-[#2D2D2E] transition-all">
                  <Scale size={18} /> {t.terms}
               </button>
            </div>
          </section>

          <footer className="text-center pt-8 border-t border-[#F1F1F3]">
             <div className="flex items-center justify-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#800000]"></div>
                <p className="text-[10px] font-black text-[#AEAEB2] tracking-[0.3em] uppercase">BethPresenter Production Engine © 2026</p>
             </div>
          </footer>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-[#F1F1F3] flex justify-end bg-white">
           <button 
             onClick={onClose}
             className="bg-[#800000] text-white px-10 py-3 rounded-xl font-black text-[13px] shadow-lg shadow-[#80000020] hover:bg-[#5C0000] transition-all"
           >
              {t.close}
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
