import React, { useState, useEffect } from 'react';
import { UploadCloud, X, Database, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

interface ZefaniaImportProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ZefaniaImport({ onClose, onSuccess }: ZefaniaImportProps) {
  const [filePath, setFilePath] = useState('');
  const [filename, setFilename] = useState('');
  const [translationName, setTranslationName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const handleProgress = (_: any, data: { current: number, total: number }) => {
      setProgress(data);
    };
    const ipc = (window as any).electron?.ipcRenderer;
    if (ipc) ipc.on('bible:import-progress', handleProgress);
    return () => {
      if (ipc) ipc.removeListener('bible:import-progress', handleProgress);
    };
  }, []);

  const handleSelectFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setFilePath(file.path);
        setFilename(file.name);
        if (!translationName) {
           setTranslationName(file.name.replace(/\.[^/.]+$/, "").toUpperCase());
        }
      }
    };
    input.click();
  };

  const startImport = async () => {
    if (!filePath || !translationName.trim()) return;
    setIsImporting(true);
    setProgress({ current: 0, total: 100 }); // indeterminate start
    try {
      const res = await (window as any).electron.ipcRenderer.invoke('bible:importZefania', {
        filePath,
        translationName
      });
      if (res.success) {
        alert(`Successfully imported ${res.count} verses.`);
        onSuccess();
        onClose();
      } else {
        alert(`Failed: ${res.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsImporting(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
       <Card className="w-full max-w-lg bg-surface-base border-border-strong overflow-hidden flex flex-col shadow-2xl">
          <div className="flex justify-between items-center p-4 border-b border-border-default bg-surface-sidebar">
             <h2 className="flex items-center gap-2 font-bold text-text-100 uppercase tracking-widest text-xs">
                <Database size={14} className="text-accent-400" /> Import Zefania XML
             </h2>
             <button onClick={onClose} disabled={isImporting} className="text-text-500 hover:text-text-100 transition-colors disabled:opacity-30">
               <X size={18} />
             </button>
          </div>

          <div className="p-6 flex flex-col gap-5">
             <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-400">XML File</label>
                <div className="flex items-center gap-2">
                   <div className="flex-1 bg-surface-elevated border border-border-default rounded flex items-center px-3 h-10 overflow-hidden text-sm truncate opacity-70">
                      {filename || 'Select a .xml file...'}
                   </div>
                   <Button variant="secondary" onClick={handleSelectFile} disabled={isImporting} className="h-10 px-4">
                     Browse
                   </Button>
                </div>
             </div>

             <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-400">Translation Abbreviation (Identifier)</label>
                <Input 
                  value={translationName} 
                  onChange={(e) => setTranslationName(e.target.value.toUpperCase())} 
                  placeholder="e.g. KJV, TB, NIV" 
                  disabled={isImporting}
                  className="bg-surface-elevated border-border-default uppercase h-10 placeholder:normal-case font-mono" 
                />
                <p className="text-[10px] text-text-500">This will be the display identifier. Keep it short (2-5 letters).</p>
             </div>

             {isImporting && (
               <div className="mt-2 bg-surface-sidebar rounded-xl border border-border-default p-4 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-accent-600 border-t-accent-400 rounded-full animate-spin" />
                  <div className="text-xs font-bold text-text-300">
                     {progress.total > 0 && progress.current > 0 ? (
                       `Processing... ${progress.current} / ${progress.total} verses`
                     ) : 'Piping file stream...'}
                  </div>
                  {progress.total > 0 && progress.current > 0 && (
                     <div className="w-full bg-surface-elevated rounded-full h-1.5 overflow-hidden">
                       <div className="bg-accent-500 h-full transition-all duration-300" style={{ width: `${(progress.current/progress.total)*100}%`}} />
                     </div>
                  )}
               </div>
             )}

             {!isImporting && filename && translationName && (
               <div className="mt-2 bg-accent-500/10 border border-accent-500/30 rounded-xl p-4 flex gap-3 text-sm text-accent-100">
                  <CheckCircle2 size={24} className="text-accent-400 shrink-0" />
                  <div>
                    <strong className="block mb-1">Ready to import</strong>
                    <span className="opacity-80 text-xs">This operation may take up to 10 seconds depending on the file size. Background saves will run in batches of 5000 lines.</span>
                  </div>
               </div>
             )}
          </div>

          <div className="p-4 border-t border-border-default bg-surface-sidebar flex justify-end gap-3">
             <Button variant="ghost" onClick={onClose} disabled={isImporting}>Cancel</Button>
             <Button variant="primary" onClick={startImport} disabled={isImporting || !filePath || !translationName} className="flex items-center gap-2">
                <UploadCloud size={16} /> {isImporting ? 'Importing...' : 'Start Import'}
             </Button>
          </div>
       </Card>
    </div>
  );
}
