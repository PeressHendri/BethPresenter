import { useState } from 'react';
import { X, FileText, Database, UploadCloud, FileJson } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

interface SongImportModalProps {
  onClose: () => void;
  onImportSuccess: () => void;
}

export function SongImportModal({ onClose, onImportSuccess }: SongImportModalProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'ew'>('text');
  
  // Custom text import state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // File import state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImportText = async () => {
    if (!title.trim() && !textContent.trim()) return;
    setIsImporting(true);
    try {
      await (window as any).electron.ipcRenderer.invoke('song:importFromText', {
        title,
        author,
        text: textContent
      });
      onImportSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to import text');
    }
    setIsImporting(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    try {
      const text = await selectedFile.text();
      // Assume simple text format if JSON fails
      let parsed = false;
      if (selectedFile.name.endsWith('.json')) {
        try {
          const arr = JSON.parse(text);
          // if bulk json import (we'll skip advanced json parsing for now unless implemented)
          for (const item of arr) {
            await (window as any).electron.ipcRenderer.invoke('song:importFromText', {
              title: item.title, author: item.author, text: item.text || item.lyrics
            });
          }
          parsed = true;
        } catch { } // fallback to text
      }
      
      if (!parsed) {
        await (window as any).electron.ipcRenderer.invoke('song:importFromText', {
          title: selectedFile.name.replace(/\.[^/.]+$/, ""),
          author: '',
          text
        });
      }
      onImportSuccess();
      onClose();
    } catch (e) {
      alert('Import failed');
    }
    setIsImporting(false);
  };

  const handleEWImport = async () => {
    // We would use an input file dialog from the main process ideally, but for now we'll trigger a file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.db,.sqlite';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      setIsImporting(true);
      try {
        const res = await (window as any).electron.ipcRenderer.invoke('song:importFromEasyWorship', file.path);
        if (res.success) {
          alert(`Successfully imported ${res.count} songs from EasyWorship.`);
          onImportSuccess();
          onClose();
        } else {
          alert(`Import failed: ${res.error}`);
        }
      } catch (err) {
        alert('EasyWorship DB import error');
      }
      setIsImporting(false);
    };
    input.click();
  };

  const tabs = [
    { id: 'text', label: 'Paste Text', icon: FileText },
    { id: 'file', label: 'Import File', icon: UploadCloud },
    { id: 'ew', label: 'EasyWorship DB', icon: Database },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card variant="elevated" className="flex flex-col h-[600px] max-h-[90vh] overflow-hidden border border-border-strong shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-default bg-surface-elevated">
            <h2 className="text-lg font-bold text-text-100 flex items-center gap-2">
               <UploadCloud size={18} className="text-accent-400" /> Import Songs
            </h2>
            <button onClick={onClose} className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-surface-hover transition-all">
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-3 border-b border-border-default bg-surface-sidebar">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-2 rounded-lg transition-all ${
                  activeTab === t.id ? 'bg-surface-elevated text-text-100 shadow' : 'text-text-500 hover:text-text-300 hover:bg-black/20'
                }`}
              >
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
            <AnimatePresence mode="wait">
               {activeTab === 'text' && (
                 <motion.div key="text" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col gap-4 h-full">
                    <div className="grid grid-cols-2 gap-4 shrink-0">
                       <div>
                         <label className="block text-xs font-bold text-text-400 mb-1.5 uppercase tracking-wide">Song Title</label>
                         <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Amazing Grace" className="w-full" />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-text-400 mb-1.5 uppercase tracking-wide">Author / Artist</label>
                         <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="e.g. John Newton" className="w-full" />
                       </div>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0 pt-2">
                       <label className="block text-xs font-bold text-text-400 mb-1.5 uppercase tracking-wide">Lyrics Content</label>
                       <p className="text-[10px] text-text-500 mb-2">Separate slides using an empty line. Prepend tags like <code>[Verse 1]</code> on a new line to name slides.</p>
                       <textarea 
                         className="flex-1 w-full bg-surface-sidebar rounded-lg border border-border-default p-4 text-sm resize-none focus:border-accent-500 outline-none transition-colors font-mono"
                         placeholder="[Verse 1]&#10;Amazing grace! How sweet the sound&#10;That saved a wretch like me!&#10;&#10;[Chorus]&#10;I once was lost, but now am found;&#10;Was blind, but now I see."
                         value={textContent}
                         onChange={(e) => setTextContent(e.target.value)}
                       />
                    </div>
                    <div className="pt-2 flex justify-end shrink-0">
                       <Button variant="primary" onClick={handleImportText} disabled={isImporting || !textContent.trim()}>
                         {isImporting ? 'Processing...' : 'Parse & Import'}
                       </Button>
                    </div>
                 </motion.div>
               )}

               {activeTab === 'file' && (
                 <motion.div key="file" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center justify-center h-full">
                    <div 
                      className={`w-full max-w-md aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors ${
                        selectedFile ? 'border-accent-500 bg-accent-500/5' : 'border-border-strong hover:border-text-500 bg-surface-sidebar'
                      }`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                    >
                      {selectedFile ? (
                        <>
                          <FileJson size={48} className="text-accent-400 mb-4" />
                          <p className="font-bold text-text-100">{selectedFile.name}</p>
                          <p className="text-xs text-text-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                          <button onClick={() => setSelectedFile(null)} className="mt-4 text-xs font-bold text-danger hover:underline">Clear</button>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={48} className="text-text-500 mb-4" />
                          <p className="font-bold text-text-300">Drag & Drop file here</p>
                          <p className="text-xs text-text-500 mt-1">Supports .txt and .json files</p>
                          <Button variant="secondary" className="mt-6" onClick={() => {
                            const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.txt,.json';
                            inp.onchange = (e: any) => setSelectedFile(e.target.files[0]); inp.click();
                          }}>Browse Files</Button>
                        </>
                      )}
                    </div>
                    
                    <div className="mt-8 text-center">
                       <Button variant="primary" onClick={handleProcessFile} disabled={!selectedFile || isImporting}>
                         {isImporting ? 'Importing...' : 'Start Import'}
                       </Button>
                    </div>
                 </motion.div>
               )}

               {activeTab === 'ew' && (
                 <motion.div key="ew" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                      <Database size={36} className="text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-text-100 mb-2">EasyWorship Database</h3>
                    <p className="text-sm text-text-400 leading-relaxed mb-8">
                       Migrasikan seluruh koleksi lagu dari EasyWorship 9 ke BethPresenter. Pilih file <code className="bg-black/30 px-1 rounded text-accent-300">v6.2.db</code> atau <code className="bg-black/30 px-1 rounded text-accent-300">.sqlite</code> dari folder data profile EasyWorship.
                    </p>
                    
                    <Button variant="primary" size="lg" className="w-full justify-center" onClick={handleEWImport} disabled={isImporting}>
                       {isImporting ? 'Connecting to Database...' : 'Select EasyWorship DB File'}
                    </Button>
                 </motion.div>
               )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
