import React, { useState } from 'react';
import { X, Layout, AlertCircle } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const CreateProjectModal = ({ isOpen, onClose, onConfirm, projects }) => {
  const { language } = useProject();
  const [newProjectName, setNewProjectName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const t = {
    id: {
      title: "Buat Presentasi",
      label: "NAMA PRESENTASI BARU:",
      placeholder: "Ketik nama di sini...",
      empty: "Nama presentasi tidak boleh kosong!",
      exists: "Nama presentasi sudah digunakan!",
      cancel: "Batal",
      confirm: "Buat Sekarang"
    },
    en: {
      title: "Create Presentation",
      label: "NEW PRESENTATION NAME:",
      placeholder: "Type name here...",
      empty: "Presentation name cannot be empty!",
      exists: "Presentation name already exists!",
      cancel: "Cancel",
      confirm: "Create Now"
    }
  }[language || 'id'];

  const handleConfirm = () => {
    if (!newProjectName.trim()) {
      setErrorMessage(t.empty);
      return;
    }
    if (projects.includes(newProjectName.trim())) {
      setErrorMessage(t.exists);
      return;
    }
    onConfirm(newProjectName.trim());
    setNewProjectName('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/40 z-[200] flex items-center justify-center p-4 font-manrope">
       <div className="bg-white w-[480px] rounded-xl border border-[#E2E2E6] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-[#F1F1F3] flex items-center justify-between bg-white">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#80000010] rounded-xl flex items-center justify-center border border-[#80000010]">
                   <Layout size={20} className="text-[#800000]" />
                </div>
                <h2 className="text-[18px] font-black text-[#2D2D2E] tracking-tight">{t.title}</h2>
             </div>
             <button onClick={() => { onClose(); setErrorMessage(''); }} className="w-10 h-10 flex items-center justify-center text-[#AEAEB2] hover:text-[#800000] transition-all">
                <X size={20} />
             </button>
          </div>

          {/* Body */}
          <div className="p-10 flex flex-col items-center">
             <div className="w-full">
                <label className="text-[10px] font-black text-[#AEAEB2] uppercase tracking-[0.2em] mb-3 block">{t.label}</label>
                <div className="relative">
                   <input 
                      autoFocus
                      placeholder={t.placeholder}
                      className={`w-full bg-[#F8F9FA] border rounded-[16px] h-14 px-5 text-[16px] font-bold text-[#2D2D2E] outline-none transition-all ${
                         errorMessage ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]' : 'border-[#E2E2E6] focus:border-[#800000] focus:bg-white focus:shadow-[0_0_0_4px_rgba(128,0,0,0.05)]'
                      }`}
                      value={newProjectName}
                      onChange={(e) => {
                         setNewProjectName(e.target.value);
                         if (errorMessage) setErrorMessage('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                   />
                   {errorMessage && (
                      <div className="flex items-center gap-2 mt-3 text-[#800000] animate-in fade-in slide-in-from-top-1">
                         <AlertCircle size={14} />
                         <p className="text-[12px] font-bold tracking-tight">
                            {errorMessage}
                         </p>
                      </div>
                   )}
                </div>
             </div>
          </div>

          {/* Actions */}
          <div className="px-10 py-8 bg-[#F8F9FA] border-t border-[#F1F1F3] flex gap-4">
             <button 
                onClick={() => { onClose(); setErrorMessage(''); }}
                className="flex-1 px-8 py-4 rounded-[18px] bg-white border border-[#E2E2E6] text-[#8E8E93] font-black text-[14px] hover:border-[#2D2D2E] hover:text-[#2D2D2E] transition-all shadow-sm"
             >
                {t.cancel}
             </button>
             <button 
                onClick={handleConfirm}
                className="flex-[1.2] px-8 py-4 rounded-[18px] bg-[#800000] text-white font-black text-[14px] hover:bg-[#5C0000] transition-all shadow-lg active:scale-95"
             >
                {t.confirm}
             </button>
          </div>
       </div>
    </div>
  );
};

export default CreateProjectModal;
