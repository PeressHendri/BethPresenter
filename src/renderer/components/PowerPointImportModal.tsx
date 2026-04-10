import React, { useState, useCallback } from 'react';
import { X, UploadCloud, FileText, Trash2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export function PowerPointImportModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 1) {
      setError("Only one PowerPoint file allowed.");
      return;
    }

    const droppedFile = droppedFiles[0];
    validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext === 'ppt' || ext === 'pptx') {
      setFile({ name: f.name, size: (f.size / (1024 * 1024)).toFixed(1) + ' MB' });
    } else {
      setError(".ppt or .pptx only.");
    }
  };

  const handleImport = () => {
    if (!file) return;
    setIsConverting(true);
    
    // Simulate conversion progress
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onClose(); // Success
        }, 1000);
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-[520px] bg-[#F5F5F5] rounded-[24px] shadow-[0_25px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-8 py-6 flex items-center justify-between">
           <div className="flex flex-col">
              <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Import PowerPoint</h2>
              <p className="text-xs text-[#666] mt-0.5">Convert .pptx or .ppt into presentation slides.</p>
           </div>
           <button 
             onClick={onClose}
             className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center text-[#999] hover:text-[#333] transition-all"
           >
             <X size={20} />
           </button>
        </div>

        {/* CONTENT */}
        <div className="px-8 pb-8 space-y-6">
           {/* Drag & Drop Area */}
           {!file ? (
             <div 
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
               className={`
                h-[220px] rounded-[20px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all
                ${isDragging ? 'bg-[#2D83FF]/5 border-[#2D83FF]' : 'bg-white border-[#DDD] hover:border-[#2D83FF]'}
               `}
             >
                <div className={`p-4 rounded-full ${isDragging ? 'bg-[#2D83FF] text-white' : 'bg-[#2D83FF]/10 text-[#2D83FF]'} transition-all`}>
                   <UploadCloud size={32} />
                </div>
                <div className="text-center">
                   <p className="font-semibold text-[#333]">Drag & Drop your PowerPoint file here</p>
                   <p className="text-xs text-[#999] mt-1">.pptx or .ppt only</p>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-semibold animate-bounce mt-2">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}
             </div>
           ) : (
             <div className="p-6 bg-white rounded-[20px] border border-[#DDD] flex items-center justify-between group shadow-sm">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-xl bg-[#2D83FF]/10 text-[#2D83FF] flex items-center justify-center">
                      <FileText size={24} />
                   </div>
                   <div className="flex flex-col">
                      <span className="font-bold text-[#333] truncate max-w-[240px]">{file.name}</span>
                      <span className="text-[11px] text-[#999] font-medium uppercase mt-0.5">{file.size}</span>
                   </div>
                </div>
                {!isConverting && (
                  <button onClick={() => setFile(null)} className="p-2 text-[#999] hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                )}
             </div>
           )}

           {/* Conversion Preview */}
           {file && !isConverting && (
             <div className="flex items-center gap-2 text-[#2D83FF] font-semibold text-sm animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 size={18} />
                <span>Ready to convert slides</span>
             </div>
           )}

           {/* Progress Bar */}
           {isConverting && (
             <div className="space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Loader2 size={18} className="text-[#2D83FF] animate-spin" />
                      <span className="text-sm font-bold text-[#333]">Converting slide assets...</span>
                   </div>
                   <span className="text-sm font-black text-[#2D83FF]">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
                   <div className="h-full bg-[#2D83FF] transition-all duration-300 shadow-[0_0_10px_rgba(45,131,255,0.4)]" style={{ width: `${progress}%` }} />
                </div>
             </div>
           )}

           {/* Buttons */}
           <div className="flex items-center gap-4 pt-2">
              <button 
                onClick={onClose}
                disabled={isConverting}
                className="flex-1 h-13 rounded-xl border border-[#DDD] text-sm font-bold text-[#666] hover:bg-black/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleImport}
                disabled={!file || isConverting}
                className={`
                  flex-1 h-13 rounded-xl text-sm font-bold text-white transition-all shadow-lg
                  ${!file || isConverting ? 'bg-[#999] shadow-none cursor-not-allowed' : 'bg-[#2D83FF] hover:brightness-110 shadow-[#2D83FF]/30 active:scale-95'}
                `}
              >
                {isConverting ? 'Processing...' : 'Import Now'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
