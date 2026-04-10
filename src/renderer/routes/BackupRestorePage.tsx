import React, { useState } from 'react';
import { Download, Upload, CheckCircle2, AlertTriangle, Archive, RefreshCcw } from 'lucide-react';

export function BackupRestorePage() {
  const [selectedTypes, setSelectedTypes] = useState(['Songs', 'Media', 'Presentations']);
  const [restoreFile, setRestoreFile] = useState<{name: string, size: string} | null>(null);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  return (
    <div className="flex-1 bg-[var(--surface-base)] flex flex-col overflow-hidden">
      <div className="p-12 pb-8">
         <h1 className="text-3xl font-black text-[var(--text-100)] tracking-tighter">Backup & Restore</h1>
         <p className="text-sm font-medium text-[var(--text-400)] mt-1 italic tracking-wide">Create backups or restore saved data.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-12 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-[1200px]">
          
          {/* 🟦 BACKUP CARD */}
          <div className="bg-[var(--surface-primary)] rounded-3xl border border-[var(--border-default)] shadow-lg p-10 flex flex-col">
             <div className="w-20 h-20 bg-[var(--accent-blue)]/10 rounded-2xl flex items-center justify-center text-[var(--accent-blue)] mb-8">
                <Archive size={40} />
             </div>
             <h2 className="text-2xl font-black text-[var(--text-100)] tracking-tight">Create Backup</h2>
             <p className="text-sm text-[var(--text-400)] mt-2 mb-8 leading-relaxed">
               Bundle your songs, media, scriptures, and themes into a single .gpbak file for portability.
             </p>

             <div className="space-y-3 mb-10 flex-1">
                {['Songs', 'Media', 'Scripture', 'Presentations', 'Themes'].map(type => (
                   <div 
                     key={type}
                     onClick={() => toggleType(type)}
                     className={`
                       flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all
                       ${selectedTypes.includes(type) ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)]/5' : 'border-[var(--border-default)] hover:border-[var(--text-600)]'}
                     `}
                   >
                      <span className={`text-xs font-black uppercase tracking-widest ${selectedTypes.includes(type) ? 'text-[var(--accent-blue)]' : 'text-[var(--text-400)]'}`}>
                         {type} Data
                      </span>
                      {selectedTypes.includes(type) ? <CheckCircle2 size={18} className="text-[var(--accent-blue)]" /> : <div className="w-4 h-4 rounded-full border border-[var(--border-default)]" />}
                   </div>
                ))}
             </div>

             <button className="h-16 w-full bg-[var(--accent-blue)] text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                <Download size={20} />
                Download Backup File
             </button>
          </div>

          {/* 🟧 RESTORE CARD */}
          <div className="bg-[var(--surface-primary)] rounded-3xl border border-[var(--border-default)] shadow-lg p-10 flex flex-col">
             <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-8">
                <RefreshCcw size={40} />
             </div>
             <h2 className="text-2xl font-black text-[var(--text-100)] tracking-tight">Restore Backup</h2>
             <p className="text-sm text-[var(--text-400)] mt-2 mb-8 leading-relaxed">
               Restore your environment from a .gpbak file. This may overwrite existing content.
             </p>

             <div className={`
                flex-1 border-2 border-dashed rounded-3xl mb-8 flex flex-col items-center justify-center p-8 gap-4 transition-all
                ${restoreFile ? 'bg-red-500/5 border-red-500' : 'bg-[var(--surface-elevated)] border-[var(--border-default)] hover:border-red-500/40'}
             `}>
                <Upload size={32} className={restoreFile ? 'text-red-500' : 'text-[var(--text-600)]'} />
                {!restoreFile ? (
                   <div className="text-center">
                      <p className="text-sm font-bold text-[var(--text-200)]">Drag & Drop .gpbak file</p>
                      <p className="text-[10px] text-[var(--text-600)] uppercase tracking-widest mt-1">or click to browse</p>
                   </div>
                ) : (
                   <div className="text-center">
                      <p className="text-sm font-bold text-red-500">{restoreFile.name}</p>
                      <p className="text-[10px] text-red-500/60 uppercase tracking-widest mt-1">{restoreFile.size}</p>
                   </div>
                )}
             </div>

             <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-4 mb-8">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                   <span className="text-[11px] font-black text-amber-900 uppercase tracking-widest leading-none">Warning</span>
                   <p className="text-[11px] text-amber-800 leading-relaxed mt-1.5">
                     Restoring will overwrite existing items if duplicates are found. We recommend creating a backup first.
                   </p>
                </div>
             </div>

             <button 
               disabled={!restoreFile}
               className={`
                 h-16 w-full text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3
                 ${restoreFile ? 'bg-red-500 text-white shadow-xl hover:scale-[1.02] active:scale-95' : 'bg-[var(--surface-elevated)] text-[var(--text-600)] cursor-not-allowed'}
               `}
             >
                <RefreshCcw size={20} />
                Restore Now
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
