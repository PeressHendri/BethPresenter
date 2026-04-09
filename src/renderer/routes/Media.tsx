import { useEffect, useState, useCallback } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Image, Video, Upload, Trash2, Monitor, Film, ImageIcon, Loader2, Grid3X3, LayoutList, UploadCloud } from 'lucide-react';

const ipc = (window as any).electron?.ipcRenderer;

interface MediaItem {
  id: string;
  filename: string;
  filepath: string;
  type: 'image' | 'video';
  thumbnail?: string;
  sizeBytes: number;
  exists: boolean;
  createdAt: string;
}

type FilterType = 'all' | 'image' | 'video';
type ViewMode = 'grid' | 'list';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '–';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function MediaThumbnail({ item, mediaUrls, onClick }: { item: MediaItem; mediaUrls: Record<string, string>; onClick?: () => void }) {
  const url = mediaUrls[item.id];

  if (item.type === 'image' && url) {
    return (
      <div className="aspect-video bg-black rounded overflow-hidden cursor-pointer group" onClick={onClick}>
        <img src={url} alt={item.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
      </div>
    );
  }
  if (item.type === 'video') {
    return (
      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded overflow-hidden flex items-center justify-center cursor-pointer group" onClick={onClick}>
        <Film size={32} className="text-white/40 group-hover:text-white/70 transition-colors" />
      </div>
    );
  }
  return (
    <div className="aspect-video bg-bg-secondary rounded flex items-center justify-center">
      <ImageIcon size={24} className="text-text-secondary opacity-40" />
    </div>
  );
}

import { MediaCard } from '../components/media/MediaCard';
import { MediaImport } from '../components/media/MediaImport';

export function Media() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [importModal, setImportModal] = useState(false);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    const list: MediaItem[] = await ipc?.invoke('media:getAll') || [];
    setItems(list);

    const urls: Record<string, string> = {};
    for (const item of list) {
      if (item.exists) {
        const url = await ipc?.invoke('media:getFileUrl', item.filepath);
        if (url) urls[item.id] = url;
      }
    }
    setMediaUrls(urls);
    setLoading(false);
  }, []);

  useEffect(() => { void loadMedia(); }, [loadMedia]);

  const handleDelete = async (id: string) => {
    await ipc?.invoke('media:delete', id);
    setMediaUrls(prev => { const n = { ...prev }; delete n[id]; return n; });
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedId(null);
    setConfirmDelete(null);
  };

  const setAsBackground = async (item: MediaItem) => {
    const url = mediaUrls[item.id] || await ipc?.invoke('media:getFileUrl', item.filepath);
    await ipc?.invoke('output:send-background', { type: item.type, url, filepath: item.filepath });
  };

  const filtered = items.filter(i => filter === 'all' || i.type === filter);
  const selectedItem = items.find(i => i.id === selectedId);

  return (
    <MainLayout>
      <div className="flex flex-col h-full gap-0 relative" style={{ height: 'calc(100vh - 2rem)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
           <div className="flex items-center gap-3">
             <Image className="text-accent" size={26} />
             <h1 className="text-2xl font-bold">Media Library</h1>
             <span className="text-xs text-text-secondary bg-bg-secondary px-2 py-1 rounded-full">{items.length} file</span>
           </div>
           
           <div className="flex items-center gap-2">
             <div className="flex bg-bg-secondary border border-border rounded-lg overflow-hidden">
               {(['all', 'image', 'video'] as FilterType[]).map(f => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                     filter === f ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
                   }`}
                 >
                   {f === 'all' ? 'Semua' : f === 'image' ? '📷 Foto' : '🎬 Video'}
                 </button>
               ))}
             </div>
             
             <div className="flex bg-bg-secondary border border-border rounded-lg overflow-hidden">
               <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-text-secondary'}`}>
                 <Grid3X3 size={15} />
               </button>
               <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-accent text-white' : 'text-text-secondary'}`}>
                 <LayoutList size={15} />
               </button>
             </div>
             
             <button
               onClick={() => setImportModal(true)}
               className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
             >
               <Upload size={15} /> Import Media
             </button>
           </div>
        </div>

        {/* Main Area */}
        <div className="flex gap-3 flex-1 min-h-0 relative">
          <div className="flex-1 overflow-y-auto">
             {loading ? (
               <div className="flex items-center justify-center py-20 text-text-secondary">
                 <Loader2 size={28} className="animate-spin mr-3" /> Memuat media…
               </div>
             ) : filtered.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-text-secondary gap-4">
                 <div className="w-20 h-20 rounded-2xl bg-bg-secondary flex items-center justify-center">
                   {filter === 'video' ? <Video size={36} className="opacity-30" /> : <Image size={36} className="opacity-30" />}
                 </div>
                 <div className="text-center">
                   <p className="font-semibold mb-1">Belum ada {filter === 'all' ? 'media' : filter === 'image' ? 'foto' : 'video'}</p>
                   <p className="text-xs opacity-60">Klik "Import Media" untuk menambahkan</p>
                 </div>
                 <button onClick={() => setImportModal(true)} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm">
                   <Upload size={15} /> Import Media
                 </button>
               </div>
             ) : viewMode === 'grid' ? (
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-1 pb-10">
                 {filtered.map(item => (
                   <MediaCard 
                     key={item.id}
                     item={item}
                     url={mediaUrls[item.id]}
                     selected={selectedId === item.id}
                     onSelect={() => setSelectedId(item.id === selectedId ? null : item.id)}
                     onSetBackground={setAsBackground}
                   />
                 ))}
               </div>
             ) : (
               <div className="space-y-1 p-1">
                 {filtered.map(item => (
                   <div
                     key={item.id}
                     onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                     className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${
                       selectedId === item.id ? 'border-accent-500 bg-accent-500/10' : 'border-transparent hover:bg-surface-hover hover:border-border-default'
                     }`}
                   >
                     <div className="w-20 h-12 bg-black rounded overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                        {item.type === 'image' && mediaUrls[item.id] ? (
                           <img src={mediaUrls[item.id]} alt="thumb" className="w-full h-full object-cover" />
                        ) : item.type === 'video' && mediaUrls[item.id] ? (
                           <video src={mediaUrls[item.id]} className="w-full h-full object-cover" />
                        ) : (
                           <Film size={20} className="text-white/30" />
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-text-100 truncate">{item.filename.replace(/^\d+_/, '')}</p>
                       <p className="text-[10px] uppercase tracking-wider text-text-400 font-semibold">{formatBytes(item.sizeBytes)} · {item.type}</p>
                     </div>
                     <div className="flex items-center gap-2 flex-shrink-0">
                       <button
                         onClick={e => { e.stopPropagation(); void setAsBackground(item); }}
                         className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-surface-elevated border border-border-strong rounded-lg hover:border-accent-500 hover:text-accent-400 transition-colors"
                       >
                         <Monitor size={12} /> Set BG
                       </button>
                       <button
                         onClick={e => { e.stopPropagation(); setConfirmDelete(item.id); }}
                         className="p-1.5 text-text-500 hover:text-danger-400 transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* Detail panel */}
          {selectedItem && (
            <Card className="w-56 flex-shrink-0 flex flex-col overflow-hidden p-0">
              <div className="p-3 border-b border-border text-xs font-semibold text-text-secondary">Detail</div>
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                <MediaThumbnail item={selectedItem} mediaUrls={mediaUrls} />
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-text-secondary">Nama:</span>
                    <p className="font-medium truncate">{selectedItem.filename.replace(/^\d+_/, '')}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Tipe:</span>
                    <p className="font-medium capitalize">{selectedItem.type}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Ukuran:</span>
                    <p className="font-medium">{formatBytes(selectedItem.sizeBytes)}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Status:</span>
                    <p className={`font-medium ${selectedItem.exists ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedItem.exists ? '✓ File tersedia' : '✗ File tidak ada'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => void setAsBackground(selectedItem)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-accent text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Monitor size={13} /> Set as Background
                  </button>
                  <button
                    onClick={() => setConfirmDelete(selectedItem.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-red-500/40 text-red-400 rounded-lg text-xs hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Import Modal */}
        {importModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setImportModal(false)}>
             <Card className="w-full max-w-lg p-6 bg-surface-elevated border-border-default shadow-2xl flex flex-col gap-4" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-2">
                 <h2 className="text-xl font-bold text-text-100 flex items-center gap-2">
                   <Upload size={20} className="text-accent-400" /> Import Media Files
                 </h2>
                 <button onClick={() => setImportModal(false)} className="text-text-500 hover:text-text-200">✕</button>
               </div>
               
               <p className="text-sm text-text-400 mb-2">
                 Bulk import multiple video loops and high-res backgrounds. They will be cached in your library folder automatically.
               </p>

               <MediaImport onImportComplete={async () => {
                  await loadMedia();
                  setTimeout(() => setImportModal(false), 800);
               }} />

               {/* Optional File Picker alternative */}
               <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-default">
                  <button onClick={() => setImportModal(false)} className="px-4 py-2 border border-border-default hover:bg-surface-hover text-text-200 text-sm font-semibold rounded-lg transition-colors">
                     Batal
                  </button>
                  <button onClick={async () => {
                     setImportModal(false);
                     await ipc?.invoke('media:selectAndImport');
                     await loadMedia();
                  }} className="px-4 py-2 bg-surface-sidebar hover:bg-surface-hover text-accent-400 border border-border-strong text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                     <UploadCloud size={16} /> Pilih via Explorer
                  </button>
               </div>
             </Card>
          </div>
        )}

        {/* Delete confirmation modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
            <Card className="p-6 w-80 shadow-2xl border-border-default bg-surface-elevated flex flex-col gap-3" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-text-100 flex items-center gap-2">
                <Trash2 size={18} className="text-danger-400" /> Konfirmasi Hapus
              </h3>
              <p className="text-sm text-text-400 mb-2">
                File akan dihapus dari disk dan database. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 border border-border-default rounded-lg text-sm font-semibold hover:bg-surface-hover transition-colors">
                  Batal
                </button>
                <button
                  onClick={() => void handleDelete(confirmDelete)}
                  className="px-4 py-2 bg-danger-500 hover:bg-danger-400 text-white rounded-lg text-sm font-bold shadow-lg transition-colors"
                >
                  Hapus
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
