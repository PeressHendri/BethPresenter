import React, { useState, useEffect, useCallback } from 'react';
import { 
  Music, 
  Book, 
  Image, 
  Clock, 
  Layers, 
  Square, 
  Plus, 
  Trash2, 
  GripVertical, 
  ChevronRight, 
  Settings, 
  Play, 
  RotateCcw,
  Monitor,
  Search,
  ArrowLeft,
  ChevronDown,
  Layout,
  Save,
  Zap,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

interface ServiceItem {
  id: string;
  type: 'SONG' | 'SCRIPTURE' | 'MEDIA' | 'COUNTDOWN' | 'CUSTOM' | 'BLANK';
  title: string;
  subtitle?: string;
  author?: string;
  passage?: string;
  isExpanded?: boolean;
  notes?: string;
  properties?: any;
}

export function ServiceOrderManagerPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // ── PRODUCTION STATE ──
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ── LOADERS ──
  useEffect(() => {
    loadService();
  }, []);

  const loadService = async () => {
    setIsLoading(true);
    if ((window as any).electron?.ipcRenderer) {
      const res = await (window as any).electron.ipcRenderer.invoke('service-get');
      if (res.success) setItems(res.items);
    }
    setIsLoading(false);
  };

  const handleUpdateOrder = async (newOrder: ServiceItem[]) => {
    setItems(newOrder);
    if ((window as any).electron?.ipcRenderer) {
      await (window as any).electron.ipcRenderer.invoke('service-update-order', newOrder);
    }
  };

  const handleRemove = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if ((window as any).electron?.ipcRenderer) {
      await (window as any).electron.ipcRenderer.invoke('service-remove-item', id);
      showToast('Item removed from service', 'success');
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<ServiceItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const selectedItem = items.find(i => i.id === selectedId);

  return (
    <div className="flex-1 flex flex-col bg-[var(--surface-base)] overflow-hidden text-[var(--text-100)] font-sans select-none">
      
      {/* ── HEADER ── */}
      <div className="h-20 px-10 flex items-center justify-between bg-[var(--surface-primary)] border-b border-[var(--border-default)] z-20">
        <div className="flex items-center gap-8">
           <button onClick={() => navigate('/')} className="p-2 hover:bg-[var(--surface-hover)] rounded-full text-[var(--text-400)] hover:text-[var(--text-100)] transition-all">
             <ArrowLeft size={20} />
           </button>
           <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-100)]">Service Order Manager</h1>
              <span className="text-[10px] font-black text-[var(--accent-blue)] uppercase tracking-[0.2em]">Live Presentation Orchestration</span>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => {(window as any).electron?.ipcRenderer.invoke('service-sync'); showToast('Signals Synchronized', 'success'); }}
             className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent-blue)] text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-[var(--accent-blue)]/30 hover:brightness-110 transition-all active:scale-95"
           >
              <Zap size={14} fill="currentColor" />
              Sync to Live
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* ── LEFT: SERVICE ORDER LIST ── */}
         <div className="w-[500px] border-r border-[var(--border-subtle)] bg-[var(--surface-primary)] flex flex-col shrink-0">
            {/* Toolbar */}
            <div className="p-8 border-b border-[var(--border-subtle)] flex flex-wrap gap-2">
               <QuickAddBtn label="Song" onClick={() => navigate('/songs')} icon={<Music size={12}/>} />
               <QuickAddBtn label="Scripture" onClick={() => navigate('/scripture')} icon={<Book size={12}/>} />
               <QuickAddBtn label="Media" onClick={() => navigate('/media')} icon={<Image size={12}/>} />
               <QuickAddBtn label="Timer" onClick={() => {}} icon={<Clock size={12}/>} />
               <QuickAddBtn label="Blank" onClick={() => {}} icon={<Square size={12}/>} />
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-3 no-scrollbar">
               {items.map((item, idx) => (
                 <DraggableItem 
                   key={item.id}
                   item={item}
                   active={selectedId === item.id}
                   onClick={() => setSelectedId(item.id)}
                   onRemove={() => handleRemove(item.id)}
                 />
               ))}
               
               {items.length === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
                     <Layers size={48} className="mb-4 text-[var(--text-400)]" />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-400)]">Service Flow Empty</p>
                  </div>
               )}
            </div>
         </div>

         {/* ── RIGHT: INSPECTOR PANEL ── */}
         <div className="flex-1 flex flex-col bg-[var(--surface-base)] overflow-y-auto no-scrollbar">
            {selectedItem ? (
               <div className="p-16 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-right-4 duration-500">
                  
                  {/* Item Preview Card */}
                  <div className="mb-12 aspect-video bg-[var(--surface-primary)] rounded-[40px] border border-[var(--border-default)] shadow-lg flex flex-col items-center justify-center text-center p-12 relative overflow-hidden group">
                     {selectedItem.type === 'SONG' && (
                       <div className="space-y-4">
                          <h2 className="text-3xl font-black uppercase tracking-tight text-[var(--text-100)]">{selectedItem.title}</h2>
                          <p className="text-sm font-bold text-[var(--text-400)] capitalize italic">{selectedItem.author || 'Lyrical Presentation'}</p>
                       </div>
                     )}
                     {selectedItem.type === 'SCRIPTURE' && (
                       <div className="space-y-4">
                          <h2 className="text-3xl font-black tracking-tight text-[var(--text-100)]">{selectedItem.passage}</h2>
                          <p className="text-sm font-bold text-[var(--accent-blue)] uppercase tracking-widest">Biblical Reference</p>
                       </div>
                     )}
                     <div className="absolute top-8 left-8 p-2 bg-[var(--surface-elevated)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--text-600)]">Live Preview Simulation</div>
                  </div>

                  {/* Properties Grid */}
                  <div className="space-y-10">
                     <section className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D83FF]">Identity & Context</h3>
                        <div className="grid grid-cols-2 gap-6">
                           <InputBlock label="Display Title" value={selectedItem.title} onChange={v => handleUpdateItem(selectedItem.id, { title: v })} />
                           <InputBlock label="Operator Notes" value={selectedItem.notes || ''} onChange={v => handleUpdateItem(selectedItem.id, { notes: v })} />
                        </div>
                     </section>

                     <section className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D83FF]">Visual Overrides</h3>
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
                           <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Global Theme</span>
                              <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-[#2D83FF]">
                                 <option>System Default (Broadcast)</option>
                                 <option>Dark Minimalist</option>
                                 <option>Nature Ambient</option>
                              </select>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Background Layer</span>
                              <button className="flex items-center gap-2 text-xs font-black text-[#2D83FF] hover:underline">
                                 <Image size={14}/>
                                 Change Asset
                              </button>
                           </div>
                        </div>
                     </section>

                     <div className="pt-10 flex items-center gap-4">
                        <button className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-[var(--accent-blue)] text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[var(--accent-blue)]/20 hover:brightness-110 active:scale-95 transition-all">
                           <Save size={16} />
                           Save Configuration
                        </button>
                        <button className="px-8 py-4 rounded-2xl bg-[var(--surface-elevated)] text-[var(--text-400)] text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all border border-[var(--border-default)]">
                           Revert
                        </button>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center opacity-10">
                  <div className="w-24 h-24 rounded-[40px] bg-[var(--surface-elevated)] border border-[var(--border-default)] flex items-center justify-center mb-8 shadow-sm text-[var(--text-100)]">
                     <Info size={40} />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-100)]">Select an element to inspect</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

function DraggableItem({ item, active, onClick, onRemove }: any) {
  const getTypeColor = () => {
    switch(item.type) {
      case 'SONG': return 'bg-[var(--accent-blue)]';
      case 'SCRIPTURE': return 'bg-[var(--accent-teal)]';
      case 'MEDIA': return 'bg-[#B56DFF]';
      case 'COUNTDOWN': return 'bg-[#FFB01F]';
      default: return 'bg-[var(--text-600)]';
    }
  };

  const getIcon = () => {
    switch(item.type) {
      case 'SONG': return <Music size={14}/>;
      case 'SCRIPTURE': return <Book size={14}/>;
      case 'MEDIA': return <Image size={14}/>;
      default: return <Square size={14}/>;
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`
        group relative flex items-center gap-4 p-5 rounded-3xl cursor-pointer transition-all border-2
        ${active ? 'bg-[var(--surface-elevated)] border-[var(--accent-blue)] shadow-2xl shadow-[var(--accent-blue)]/10 z-10' : 'bg-[var(--surface-primary)] border-transparent hover:border-[var(--border-default)]'}
      `}
    >
       <div className={`w-1 h-10 rounded-full ${getTypeColor()}`} />
       <div className="p-3 rounded-2xl bg-[var(--surface-base)] text-[var(--text-600)] group-hover:text-[var(--accent-blue)] transition-colors">
          {getIcon()}
       </div>
       <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs font-black uppercase tracking-tighter truncate text-[var(--text-200)]">{item.title}</span>
          <span className="text-[9px] font-bold text-[var(--text-600)] uppercase tracking-widest">{item.type}</span>
       </div>
       <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-2 hover:bg-[var(--accent-danger)]/10 text-[var(--text-600)] hover:text-[var(--accent-danger)] rounded-xl transition-all">
             <Trash2 size={14}/>
          </button>
          <GripVertical size={16} className="text-[var(--text-muted)] cursor-grab" />
       </div>
    </div>
  );
}

function QuickAddBtn({ label, onClick, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-6 py-2 rounded-2xl bg-[var(--surface-elevated)] text-[var(--text-400)] text-[10px] font-black uppercase tracking-widest border border-[var(--border-default)] hover:bg-[var(--accent-blue)] hover:text-white hover:border-[var(--accent-blue)] transition-all shadow-sm active:scale-95"
    >
       {icon}
       {label}
    </button>
  );
}

function InputBlock({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
       <span className="text-[9px] font-black text-[var(--text-600)] uppercase tracking-widest">{label}</span>
       <input 
         type="text" 
         className="w-full bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-2xl px-5 py-3 text-sm font-bold text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all"
         value={value}
         onChange={(e) => onChange(e.target.value)}
       />
    </div>
  );
}
