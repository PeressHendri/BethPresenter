import React, { useState, useEffect } from 'react';
import { 
  X, Smartphone, ShieldCheck, RefreshCcw, 
  ExternalLink, Copy, Check, QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../context/ProjectContext';

const RemoteControlModal = ({ isOpen, onClose }) => {
  const { remotePin, setRemotePin, language, notify } = useProject();
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const generatePin = () => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setRemotePin(newPin);
    localStorage.setItem('beth_remote_pin', newPin);
    notify('PIN Remote diperbarui', 'success');
  };

  useEffect(() => {
    if (remotePin) {
      const url = `${window.location.origin}/remote?pin=${remotePin}`;
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`);
    } else if (isOpen) {
      generatePin();
    }
  }, [remotePin, isOpen]);

  const copyLink = () => {
    const url = `${window.location.origin}/remote?pin=${remotePin}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    notify('Link disalin ke clipboard', 'info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 font-['Outfit']">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col border border-white/20"
      >
        {/* Header */}
        <div className="p-8 border-b border-[#F1F1F3] flex justify-between items-center bg-[#F8F9FA]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#800000] rounded-2xl flex items-center justify-center shadow-lg shadow-[#80000020]">
              <Smartphone size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-[18px] font-black text-[#1D1D1F]">Remote Control</h3>
              <p className="text-[11px] font-bold text-[#AEAEB2] uppercase tracking-widest mt-1">Mobile Studio Extension</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#AEAEB2] hover:text-[#2D2D2E] transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 flex flex-col items-center text-center">
          {/* QR Code */}
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-[#800000] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity rounded-full" />
            <div className="relative w-56 h-56 bg-white p-4 rounded-[32px] shadow-2xl border border-[#F1F1F3] flex items-center justify-center overflow-hidden">
              {qrUrl ? (
                <img src={qrUrl} alt="Remote QR Code" className="w-full h-full object-contain" />
              ) : (
                <QrCode size={48} className="text-[#E2E2E6] animate-pulse" />
              )}
            </div>
          </div>

          <p className="text-[13px] font-bold text-[#424245] max-w-xs leading-relaxed mb-8">
            Scan QR Code ini dengan HP atau tablet Anda untuk mengontrol presentasi secara real-time.
          </p>

          {/* PIN Card */}
          <div className="w-full bg-[#F8F9FA] rounded-[24px] border border-[#E2E2E6] p-6 mb-8 flex flex-col items-center">
            <span className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.3em] mb-4">ACCESS PIN</span>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-[950] text-[#1D1D1F] tracking-[0.2em]">{remotePin}</span>
              <button 
                onClick={generatePin}
                className="p-2 text-[#AEAEB2] hover:text-[#800000] hover:bg-white rounded-lg transition-all"
                title="Refresh PIN"
              >
                <RefreshCcw size={20} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex gap-3">
            <button 
              onClick={copyLink}
              className="flex-1 py-4 bg-[#1D1D1F] text-white rounded-2xl text-[12px] font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-black/10"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'BERHASIL DISALIN' : 'SALIN LINK'}
            </button>
            <button 
              onClick={() => window.open(`/remote?pin=${remotePin}`, '_blank')}
              className="w-14 h-14 bg-white border border-[#E2E2E6] text-[#AEAEB2] rounded-2xl flex items-center justify-center hover:text-[#800000] hover:border-[#80000040] transition-all"
            >
              <ExternalLink size={20} />
            </button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="px-10 py-6 bg-[#F8F9FA] border-t border-[#F1F1F3] flex items-center gap-3">
          <ShieldCheck size={16} className="text-[#800000]" />
          <span className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-widest">
            Koneksi aman melalui enkripsi jaringan lokal.
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default RemoteControlModal;
