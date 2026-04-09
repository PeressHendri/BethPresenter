import React, { useState, useRef, DragEvent } from 'react';
import { UploadCloud, FileVideo, FileImage, Loader2 } from 'lucide-react';

interface MediaImportProps {
  onImportComplete: () => void;
}

export function MediaImport({ onImportComplete }: MediaImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [importStats, setImportStats] = useState<{ total: number; done: number; error: number }>({ total: 0, done: 0, error: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsImporting(true);
    setImportStats({ total: files.length, done: 0, error: 0 });

    const ipc = (window as any).electron?.ipcRenderer;
    if (!ipc) {
      setIsImporting(false);
      return;
    }

    for (let i = 0; i < files.length; i++) {
       const file = files[i];
       try {
         await ipc.invoke('media:importFile', file.path);
         setImportStats(prev => ({ ...prev, done: prev.done + 1 }));
       } catch (err) {
         console.error('Import error for file:', file.name, err);
         setImportStats(prev => ({ ...prev, error: prev.error + 1 }));
       }
    }
    
    setIsImporting(false);
    onImportComplete();
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`w-full min-h-[140px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 gap-3 transition-colors cursor-pointer ${
        isDragActive 
          ? 'border-accent-500 bg-accent-500/10' 
          : 'border-border-strong bg-surface-base hover:bg-surface-hover hover:border-text-500'
      }`}
    >
      <input 
         ref={fileInputRef} 
         type="file" 
         multiple 
         accept="image/*,video/*" 
         className="hidden" 
         onChange={(e) => void processFiles(e.target.files)}
      />
      
      {isImporting ? (
        <div className="flex flex-col items-center gap-3">
           <Loader2 size={32} className="animate-spin text-accent-400" />
           <p className="text-sm font-bold text-text-200">
             Mengimpor File ({importStats.done} / {importStats.total})
           </p>
           {importStats.error > 0 && (
             <p className="text-xs text-red-400 font-semibold">{importStats.error} file gagal</p>
           )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center w-12 h-12 bg-surface-sidebar border border-border-default rounded-full shadow-inner">
             <UploadCloud size={24} className={isDragActive ? "text-accent-400" : "text-text-400"} />
          </div>
          <div className="text-center">
             <p className={`font-bold ${isDragActive ? 'text-accent-400' : 'text-text-200'}`}>
               {isDragActive ? 'Lepaskan file di sini...' : 'Tarik & Letakkan File Media'}
             </p>
             <p className="text-xs text-text-500 mt-1 flex items-center justify-center gap-3">
                <span className="flex items-center gap-1"><FileImage size={10} /> JPG/PNG/WEBP</span>
                <span className="flex items-center gap-1"><FileVideo size={10} /> MP4/WEBM/MOV</span>
             </p>
          </div>
          <button className="mt-2 px-6 py-2 bg-surface-elevated border border-border-default hover:bg-surface-hover text-xs font-bold rounded-lg transition-colors pointer-events-none">
            Pilih File via Explorer
          </button>
        </>
      )}
    </div>
  );
}
