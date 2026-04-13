import React, { useState } from 'react';
import { 
  Monitor, X, ChevronDown, Check, Layout, 
  Clapperboard, Layers, Tv, Copy, Globe, 
  Video, Smartphone, AlertCircle, Play
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const MultiDisplayModal = ({ isOpen, onClose }) => {
  const { language, remotePin, isRemoteActive, setIsRemoteActive, createRemoteSession } = useProject();
  const [copied, setCopied] = useState(null);

  // OBS Settings States
  const [obsLayout, setObsLayout] = useState('Lower Third');
  const [obsAnim, setObsAnim] = useState('Fade');
  const [obsShadow, setObsShadow] = useState('Strong');
  const [obsBorder, setObsBorder] = useState('Thin');
  const [obsBg, setObsBg] = useState('None');
  const [obsTimer, setObsTimer] = useState('Tampilkan');

  const [openDropdown, setOpenDropdown] = useState(null);

  if (!isOpen) return null;

  const baseUrl = window.location.origin;
  const displayUrl = `${baseUrl}/display/${remotePin}`;
  const obsUrl = `${baseUrl}/obs/${remotePin}?layout=${obsLayout.toLowerCase().replace(' ', '-')}&anim=${obsAnim.toLowerCase()}`;

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const t = {
    id: {
       title: "Multi-Tampilan",
       desc: "Dukungan Multi-Monitor & OBS Browser Source",
       pinTitle: "PIN SESI",
       pinDesc: "Pindai di perangkat mana pun yang terhubung ke jaringan Wi-Fi yang sama",
       manualLabel: "Atau buka /display dan masukkan PIN ini",
       copy: "Salin",
       obsTitle: "Sumber Browser OBS",
       obsDesc: "Tambahkan sebagai Sumber Browser di OBS (1920x1080). Aktifkan \"Latar belakang transparan\" di properti sumber.",
       stopBtn: "Hentikan Sesi",
       startBtn: "Mulai Sesi",
       active: "Sesi aktif",
       inactive: "Sesi tidak aktif"
    },
    en: {
       title: "Multi-Display",
       desc: "Multi-Monitor & OBS Browser Source Support",
       pinTitle: "SESSION PIN",
       pinDesc: "Scan on any device connected to the same Wi-Fi network",
       manualLabel: "Or open /display and enter this PIN",
       copy: "Copy",
       obsTitle: "OBS Browser Source",
       obsDesc: "Add as a Browser Source in OBS (1920x1080). Enable \"Transparent background\" in source properties.",
       stopBtn: "Stop Session",
       startBtn: "Start Session",
       active: "Session active",
       inactive: "Session inactive"
    }
  }[language || 'id'];

  const Dropdown = ({ label, value, options, onSelect, id }) => (
    <div className="flex-1 relative">
      <label className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest mb-1.5 block">{label}</label>
      <div 
        onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
        className={`h-10 bg-white border ${openDropdown === id ? 'border-[#800000]' : 'border-[#E2E2E6]'} rounded-lg flex items-center justify-between px-3 cursor-pointer hover:border-[#800000] transition-all group`}
      >
        <span className="text-[12px] font-bold text-[#2D2D2E]">{value}</span>
        <ChevronDown size={14} className={`text-[#AEAEB2] transition-transform ${openDropdown === id ? 'rotate-180' : ''}`} />
      </div>
      {openDropdown === id && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E2E2E6] rounded-lg shadow-3xl z-[50] py-1 overflow-hidden animate-in fade-in slide-in-from-top-1">
          {options.map(opt => (
            <div 
              key={opt}
              onClick={() => { onSelect(opt); setOpenDropdown(null); }}
              className={`px-3 py-2 text-[11px] font-bold cursor-pointer transition-colors ${value === opt ? 'bg-[#800000] text-white' : 'text-[#8E8E93] hover:bg-[#80000005] hover:text-[#800000]'}`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-[200] flex items-center justify-center p-4 font-manrope">
      <div className="bg-[#F8F9FA] w-[540px] rounded-2xl border border-white shadow-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-[#F1F1F3] bg-white">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#800000] rounded-2xl flex items-center justify-center shadow-lg shadow-[#80000020]">
                 <Tv size={22} className="text-white" />
              </div>
              <div>
                 <h2 className="text-[18px] font-black text-[#2D2D2E] tracking-tight">{t.title}</h2>
                 <p className="text-[11px] text-[#AEAEB2] font-medium">{t.desc}</p>
              </div>
           </div>
           <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-[#AEAEB2] hover:bg-[#F8F9FA] hover:text-[#800000] transition-all">
              <X size={20} />
           </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
           {/* Section 1: PIN & URL */}
           <div className="text-center space-y-6">
              <p className="text-[12px] font-bold text-[#8E8E93] px-10">{t.pinDesc}</p>
              
              <div className="space-y-1">
                 <p className="text-[11px] font-black text-[#AEAEB2] tracking-[0.2em]">{t.pinTitle}</p>
                 <h1 className="text-[56px] font-black text-[#800000] tracking-[0.15em] font-['Outfit'] leading-tight">
                    {remotePin ? remotePin.match(/.{1,3}/g).join(' ') : '------'}
                 </h1>
              </div>

              <div className="space-y-4">
                 <p className="text-[12px] text-[#AEAEB2] font-medium">{t.manualLabel}</p>
                 <div className="bg-white border border-[#E2E2E6] rounded-2xl p-2.5 flex items-center gap-3 shadow-sm">
                    <div className="flex-1 px-4 text-[12px] text-[#2D2D2E] font-mono truncate opacity-60">{displayUrl}</div>
                    <button 
                      onClick={() => handleCopy(displayUrl, 'display')}
                      className={`h-11 px-6 rounded-xl flex items-center gap-2 text-[12px] font-black transition-all ${copied === 'display' ? 'bg-[#800000] text-white' : 'bg-[#F8F9FA] text-[#2D2D2E] border border-[#E2E2E6] hover:border-[#800000] hover:text-[#800000]'}`}
                    >
                       {copied === 'display' ? <Check size={16} /> : <Copy size={16} />}
                       {copied === 'display' ? 'Berhasil' : t.copy}
                    </button>
                 </div>
              </div>
           </div>

           {/* Section 2: OBS Settings */}
           <div className="pt-8 border-t border-[#F1F1F3] space-y-6">
              <div className="flex items-center gap-3">
                 <Video size={18} className="text-[#800000]" />
                 <h3 className="text-[14px] font-black text-[#2D2D2E]">{t.obsTitle}</h3>
              </div>

              <div className="grid grid-cols-3 gap-x-4 gap-y-6">
                 <Dropdown id="layout" label={language === 'id' ? 'TATA LETAK' : 'LAYOUT'} value={obsLayout} onSelect={setObsLayout} options={['Lower Third', 'Full Center', 'Side Left', 'Side Right']} />
                 <Dropdown id="anim" label={language === 'id' ? 'ANIMASI' : 'ANIMATION'} value={obsAnim} onSelect={setObsAnim} options={['Fade', 'Slide', 'Zoom', 'None']} />
                 <Dropdown id="shadow" label={language === 'id' ? 'BAYANGAN' : 'SHADOW'} value={obsShadow} onSelect={setObsShadow} options={['Strong', 'Soft', 'Medium', 'None']} />
                 
                 <Dropdown id="border" label={language === 'id' ? 'GARIS LUAR' : 'BORDER'} value={obsBorder} onSelect={setObsBorder} options={['Thin', 'Thick', 'Double', 'None']} />
                 <Dropdown id="bg" label={language === 'id' ? 'LATAR TEKS' : 'BG STYLE'} value={obsBg} onSelect={setObsBg} options={['None', 'Glass', 'Gradient', 'Solid']} />
                 <Dropdown id="timer" label={language === 'id' ? 'HITUNG MUNDUR' : 'COUNTDOWN'} value={obsTimer} onSelect={setObsTimer} options={['Tampilkan', 'Sembunyikan']} />
              </div>

              <div className="bg-white border border-[#E2E2E6] rounded-2xl p-2.5 flex items-center gap-3 shadow-sm">
                 <div className="flex-1 px-4 text-[12px] text-[#2D2D2E] font-mono truncate opacity-60">{obsUrl}</div>
                 <button 
                   onClick={() => handleCopy(obsUrl, 'obs')}
                   className={`h-11 px-6 rounded-xl flex items-center gap-2 text-[12px] font-black transition-all ${copied === 'obs' ? 'bg-[#800000] text-white' : 'bg-[#F8F9FA] text-[#2D2D2E] border border-[#E2E2E6] hover:border-[#800000] hover:text-[#800000]'}`}
                 >
                    {copied === 'obs' ? <Check size={16} /> : <Copy size={16} />}
                    {copied === 'obs' ? 'Berhasil' : t.copy}
                 </button>
              </div>

              <p className="text-[11px] text-[#AEAEB2] leading-relaxed italic px-4 text-center font-medium">
                 {t.obsDesc}
              </p>
           </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-white border-t border-[#F1F1F3] flex items-center justify-between">
           {isRemoteActive ? (
              <button 
                onClick={() => setIsRemoteActive(false)}
                className="flex items-center gap-3 bg-[#80000005] text-[#800000] border border-[#80000015] px-6 py-3.5 rounded-2xl font-black text-[13px] hover:bg-[#800000] hover:text-white transition-all group"
              >
                 <div className="w-4 h-4 rounded-md bg-[#800000] group-hover:bg-white"></div>
                 {t.stopBtn}
              </button>
           ) : (
              <button 
                onClick={async () => { await createRemoteSession(); setIsRemoteActive(true); }}
                className="flex items-center gap-3 bg-[#800000] text-white px-8 py-3.5 rounded-2xl font-black text-[13px] hover:bg-[#5C0000] transition-all shadow-lg"
              >
                 <Play size={18} fill="white" />
                 {t.startBtn}
              </button>
           )}

           <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isRemoteActive ? 'bg-[#800000] animate-pulse' : 'bg-[#AEAEB2]'}`}></div>
              <span className={`text-[11px] font-black tracking-widest uppercase transition-colors ${isRemoteActive ? 'text-[#800000]' : 'text-[#AEAEB2]'}`}>
                 {isRemoteActive ? t.active : t.inactive}
              </span>
           </div>
        </div>

      </div>
    </div>
  );
};

export default MultiDisplayModal;
