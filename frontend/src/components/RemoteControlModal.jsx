import React from 'react';
import { Smartphone, X, Play, Layers, Check, Copy } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const RemoteControlModal = ({ isOpen, onClose }) => {
  const { isRemoteActive, setIsRemoteActive, remotePin, createRemoteSession, language } = useProject();
  const [copied, setCopied] = React.useState(false);
  const [showStopConfirm, setShowStopConfirm] = React.useState(false);

  if (!isOpen) return null;

  const remoteUrl = `${window.location.origin}/remote/${remotePin}`;

  const handleStartRemote = async () => {
    await createRemoteSession();
    setIsRemoteActive(true);
  };

  const handleStopRemote = () => {
    setIsRemoteActive(false);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(remoteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const t = {
    id: {
      title: "Remote Control",
      desc: "Hubungkan ponsel atau tablet di jaringan yang sama sebagai remote control.",
      btnStart: "Mulai Sesi Remote",
      scan: "PINDAI QR CODE",
      pinLabel: "PIN SESI",
      manual: "Atau masukkan PIN secara manual di",
      copy: "Salin Link",
      stopBtn: "Hentikan Sesi",
      active: "SESI AKTIF",
      confirm: "Hentikan sesi remote?",
      yes: "Ya",
      no: "Batal"
    },
    en: {
      title: "Remote Control",
      desc: "Connect your phone or tablet on the same network as a remote control.",
      btnStart: "Start Remote Session",
      scan: "SCAN QR CODE",
      pinLabel: "SESSION PIN",
      manual: "Or enter the PIN manually at",
      copy: "Copy Link",
      stopBtn: "Stop Session",
      active: "ACTIVE SESSION",
      confirm: "Stop remote session?",
      yes: "Yes",
      no: "Cancel"
    }
  }[language || 'id'];

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-[200] flex items-center justify-center p-4 font-manrope">
       <div className={`bg-[#F8F9FA] rounded-2xl border border-white shadow-3xl overflow-hidden animate-in fade-in zoom-in duration-200 ${isRemoteActive ? 'w-[420px]' : 'w-[460px]'}`}>
          
          <div className="px-6 py-6 border-b border-[#F1F1F3] bg-white flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#800000] rounded-xl flex items-center justify-center shadow-lg shadow-[#80000020]">
                   <Smartphone size={20} className="text-white" />
                </div>
                <h2 className="text-[17px] font-black text-[#2D2D2E] tracking-tight">{t.title}</h2>
             </div>
             <button onClick={onClose} className="w-9 h-9 bg-[#F8F9FA] border border-[#F1F1F3] rounded-full flex items-center justify-center text-[#AEAEB2] hover:text-[#800000] transition-all">
                <X size={18} />
             </button>
          </div>

          {!isRemoteActive ? (
             <div className="p-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-6 border border-[#E2E2E6] shadow-sm">
                   <Smartphone size={32} className="text-[#800000]" strokeWidth={1.5} />
                </div>
                <p className="text-[#8E8E93] text-[13px] font-bold leading-relaxed mb-10 px-6">
                   {t.desc}
                </p>
                <button 
                   onClick={handleStartRemote}
                   className="flex items-center gap-3 bg-[#800000] text-white px-10 py-4 rounded-2xl font-black text-[14px] shadow-xl shadow-[#80000010] hover:bg-[#5C0000] transition-all"
                >
                   <Play size={18} fill="white" /> {t.btnStart}
                </button>
             </div>
          ) : (
             <div className="p-8 flex flex-col items-center">
                <div className="bg-white p-5 rounded-xl border border-[#E2E2E6] mb-4 shadow-sm">
                   <div className="w-[140px] h-[140px] flex items-center justify-center bg-white p-3 rounded-2xl border border-[#F1F1F3]">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${remoteUrl}&color=800000`} alt="QR Code" />
                   </div>
                </div>
                <p className="text-[9px] font-black text-[#AEAEB2] uppercase tracking-[0.2em] mb-8">{t.scan}</p>
                
                <div className="w-full space-y-6">
                   <div className="text-center">
                      <p className="text-[10px] font-black text-[#AEAEB2] tracking-[0.2em] mb-1">{t.pinLabel}</p>
                      <h1 className="text-[48px] font-black tracking-[0.15em] text-[#800000] font-['Outfit']">
                         {remotePin}
                      </h1>
                   </div>
                   
                   <div className="bg-white rounded-2xl p-5 border border-[#E2E2E6] space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                         <p className="text-[10px] text-[#AEAEB2] font-black">{t.manualLabel}</p>
                         <button onClick={handleCopy} className="text-[10px] text-[#800000] font-black hover:underline">{t.copy}</button>
                      </div>
                      <div className="bg-[#F8F9FA] px-3 py-2.5 rounded-lg border border-[#F1F1F3] flex items-center justify-between overflow-hidden">
                         <span className="text-[11px] text-[#2D2D2E] font-mono truncate max-w-[280px] opacity-60">{remoteUrl}</span>
                         {copied ? <Check size={14} className="text-[#800000]" /> : <Copy size={14} className="text-[#AEAEB2] cursor-pointer" onClick={handleCopy} />}
                      </div>
                   </div>
                </div>

                <div className="w-full mt-10 p-1.5 bg-white rounded-2xl border border-[#F1F1F3] shadow-sm">
                   {showStopConfirm ? (
                      <div className="p-3 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-300">
                         <p className="text-[11px] font-black text-[#800000] ml-2">{t.confirm}</p>
                         <div className="flex gap-2">
                            <button onClick={() => setShowStopConfirm(false)} className="bg-[#F8F9FA] text-[#AEAEB2] px-4 py-2 rounded-lg text-[11px] font-black hover:bg-[#E2E2E6] transition-colors">{t.no}</button>
                            <button onClick={handleStopRemote} className="bg-[#800000] text-white px-4 py-2 rounded-lg text-[11px] font-black hover:bg-[#5C0000] transition-colors">{t.yes}</button>
                         </div>
                      </div>
                   ) : (
                      <div className="flex items-center justify-between p-3 px-5">
                         <button 
                            onClick={() => setShowStopConfirm(true)}
                            className="flex items-center gap-2 text-[#AEAEB2] hover:text-[#800000] transition-colors text-[11px] font-black"
                         >
                            <X size={16} /> {t.stopBtn}
                         </button>
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#800000] animate-pulse"></div>
                            <span className="text-[10px] font-black text-[#800000] tracking-widest uppercase">{t.active}</span>
                         </div>
                      </div>
                   )}
                </div>
             </div>
          )}
       </div>
    </div>
  );
};

export default RemoteControlModal;
