import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Music, 
  Type, 
  Layers, 
  ChevronRight, 
  GripVertical, 
  Copy, 
  Maximize2,
  FileText,
  Clock,
  Zap,
  Tag
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/Toast';

interface SongSection {
  id: string;
  type: 'VERSE' | 'CHORUS' | 'BRIDGE' | 'TAG' | 'PRE-CHORUS' | 'CUSTOM';
  title: string;
  lyrics: string;
  isCollapsed?: boolean;
}

export function SongEditorPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { songId } = useParams();
  
  // ── STATE ──
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [key, setKey] = useState('G');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [sections, setSections] = useState<SongSection[]>([
    { id: '1', type: 'VERSE', title: 'Verse 1', lyrics: '' }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('1');

  // ── AUTO-SAVE DRAFT ──
  useEffect(() => {
    const draft = localStorage.getItem('g-song-draft');
    if (draft && !songId) {
       const data = JSON.parse(draft);
       setTitle(data.title || '');
       setSections(data.sections || []);
       showToast('Draft restored', 'success');
    }
  }, [songId]);

  useEffect(() => {
    const timer = setTimeout(() => {
       if (title || sections[0].lyrics) {
          localStorage.setItem('g-song-draft', JSON.stringify({ title, author, key, sections }));
       }
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, author, key, sections]);

  // ── HANDLERS ──
  const addSection = (type: SongSection['type'] = 'VERSE') => {
    const newId = Math.random().toString(36).substr(2, 9);
    const count = sections.filter(s => s.type === type).length + 1;
    setSections([...sections, {
       id: newId,
       type,
       title: `${type === 'CUSTOM' ? 'New Section' : type} ${count}`,
       lyrics: '',
       isCollapsed: false
    }]);
    setActiveSectionId(newId);
    setHasUnsavedChanges(true);
  };

  const updateSection = (id: string, updates: Partial<SongSection>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    setHasUnsavedChanges(true);
  };

  const deleteSection = (id: string) => {
    if (sections.length <= 1) return;
    setSections(prev => prev.filter(s => s.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleSave = async (andAdd: boolean = false) => {
    if (!title.trim()) {
       showToast('Title is required', 'error');
       return;
    }
    setIsLoading(true);
    if ((window as any).electron?.ipcRenderer) {
       const channel = andAdd ? 'song-save-and-add' : 'song-save';
       const res = await (window as any).electron.ipcRenderer.invoke(channel, {
          id: songId, title, author, key, tags, sections
       });
       if (res.success) {
          showToast(andAdd ? 'Song Saved & Added to Service' : 'Song Saved successfully', 'success');
          setHasUnsavedChanges(false);
          localStorage.removeItem('g-song-draft');
          navigate('/songs');
       }
    }
    setIsLoading(false);
  };

  // Preview generation for active section
  const previewSlides = useMemo(() => {
    const section = sections.find(s => s.id === activeSectionId);
    if (!section || !section.lyrics) return [];
    return section.lyrics.split('\n\n').flatMap(block => {
       const lines = block.split('\n').filter(l => !l.startsWith('[')); // Hide chords in preview
       const slides = [];
       for (let i = 0; i < lines.length; i += 2) {
          slides.push(lines.slice(i, i + 2).join('\n'));
       }
       return slides;
    });
  }, [sections, activeSectionId]);

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden text-white font-sans select-none">
      {/* ── HEADER ── */}
      <div className="h-16 px-6 flex items-center justify-between bg-[#0A0C10] border-b border-white/5 z-20">
        <div className="flex items-center gap-6">
           <button onClick={() => navigate('/songs')} className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-all">
             <ArrowLeft size={18} />
           </button>
           <div className="flex flex-col">
              <input 
                type="text" 
                placeholder="Untitled Song" 
                className="bg-transparent border-none text-lg font-black tracking-tight placeholder:text-white/20 focus:outline-none focus:ring-0 w-80"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <span className="text-[9px] font-black uppercase text-[#2D83FF] tracking-[0.2em]">{songId ? 'Editing Library Entry' : 'Creating New Song'}</span>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => handleSave(false)}
             disabled={isLoading}
             className="h-9 px-5 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
           >
             Save Changes
           </button>
           <button 
             onClick={() => handleSave(true)}
             disabled={isLoading}
             className="h-9 px-6 rounded-lg bg-[#2D83FF] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1C69FF] shadow-lg shadow-[#2D83FF]/20 transition-all active:scale-95 flex items-center gap-3"
           >
             <Zap size={14} fill="currentColor" />
             Save & Add to Service
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* ── LEFT: METADATA & SECTION LIST ── */}
         <div className="w-80 bg-[#0A0C10]/60 border-r border-white/5 flex flex-col shrink-0">
            <div className="p-6 space-y-8 overflow-y-auto no-scrollbar">
               
               {/* Metadata Section */}
               <section className="space-y-4">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#2D83FF]">Core Metadata</h3>
                  <div className="space-y-3">
                     <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Author / Artist</span>
                        <input type="text" className="bg-white/5 border border-white/5 rounded px-3 py-1.5 text-xs font-bold" value={author} onChange={e => setAuthor(e.target.value)} />
                     </div>
                     <div className="flex gap-2">
                        <div className="flex-1 flex flex-col gap-1">
                           <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Key</span>
                           <input type="text" className="bg-white/5 border border-white/5 rounded px-3 py-1.5 text-xs font-bold" value={key} onChange={e => setKey(e.target.value)} />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                           <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Tags</span>
                           <input type="text" className="bg-white/5 border border-white/5 rounded px-3 py-1.5 text-xs font-bold" placeholder="+ Tag" onKeyDown={e => {
                             if (e.key === 'Enter' && tagInput) { setTags([...tags, tagInput]); setTagInput(''); }
                           }} value={tagInput} onChange={e => setTagInput(e.target.value)} />
                        </div>
                     </div>
                     <div className="flex flex-wrap gap-1 pt-1">
                        {tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase tracking-tighter text-[#2D83FF] border border-[#2D83FF]/20">{t}</span>)}
                     </div>
                  </div>
               </section>

               {/* Sections List */}
               <section className="space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#2D83FF]">Song Sections</h3>
                     <button onClick={() => addSection('VERSE')} className="p-1 hover:bg-[#2D83FF] hover:text-white rounded bg-white/5 text-[#2D83FF] transition-all"><Plus size={14}/></button>
                  </div>
                  <div className="space-y-1">
                     {sections.map((s, idx) => (
                       <div 
                         key={s.id}
                         onClick={() => setActiveSectionId(s.id)}
                         className={`
                           group flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all border-l-4
                           ${activeSectionId === s.id 
                             ? 'bg-[#2D83FF]/10 border-[#2D83FF] text-white' 
                             : 'border-transparent text-white/40 hover:bg-white/5'}
                         `}
                       >
                          <GripVertical size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex flex-col flex-1 min-w-0">
                             <span className="text-[10px] font-black uppercase tracking-tight truncate">{s.title}</span>
                             <span className="text-[8px] font-medium opacity-40 uppercase tracking-widest">{s.lyrics.split('\n').filter(l => l.trim()).length} lines</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); deleteSection(s.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"><Trash2 size={12}/></button>
                       </div>
                     ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                     <QuickAddBtn label="Verse" onClick={() => addSection('VERSE')} />
                     <QuickAddBtn label="Chorus" onClick={() => addSection('CHORUS')} />
                     <QuickAddBtn label="Bridge" onClick={() => addSection('BRIDGE')} />
                     <QuickAddBtn label="Custom" onClick={() => addSection('CUSTOM')} />
                  </div>
               </section>
            </div>
         </div>

         {/* ── CENTER: LYRIC EDITOR ── */}
         <div className="flex-1 flex flex-col bg-black/40">
            {activeSectionId ? (
               <div className="flex-1 flex flex-col h-full overflow-hidden p-12">
                  <div className="mb-6 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <span className="w-10 h-10 rounded-2xl bg-[#2D83FF] flex items-center justify-center text-white"><Type size={20}/></span>
                        <div className="flex flex-col">
                           <input 
                             className="bg-transparent border-none text-2xl font-black uppercase tracking-tight focus:outline-none focus:ring-0 p-0" 
                             value={sections.find(s => s.id === activeSectionId)?.title || ''}
                             onChange={e => updateSection(activeSectionId, { title: e.target.value })}
                           />
                           <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Editing arrangement segment</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase text-white/20 hover:text-white transition-colors">
                           <Layers size={14}/>
                           Section Logic
                        </button>
                     </div>
                  </div>

                  <div className="flex-1 relative">
                     <textarea 
                        className="w-full h-full bg-transparent border-none resize-none text-xl font-medium leading-[2] focus:outline-none focus:ring-0 scrollbar-hide placeholder:italic placeholder:font-light"
                        placeholder="Type lyrics here... use [Chord] brackets for chord mode."
                        value={sections.find(s => s.id === activeSectionId)?.lyrics || ''}
                        onChange={e => updateSection(activeSectionId, { lyrics: e.target.value })}
                        spellCheck={false}
                     />
                     <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex items-center justify-center opacity-10">Select a section to begin.</div>
            )}
         </div>

         {/* ── RIGHT: SLIDE PREVIEW ── */}
         <div className="w-[450px] border-l border-white/5 flex flex-col overflow-hidden bg-black shadow-2xl z-10">
            <div className="p-6 bg-[#0A0C10] border-b border-white/5 flex items-center justify-between shrink-0">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">Live Preview</h3>
               <div className="flex items-center gap-4 bg-white/5 rounded-full px-4 py-1.5 grayscale opacity-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00D2D2]" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Broadcast Theme</span>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-gradient-to-b from-[#0A0C10] to-[#050505]">
               {previewSlides.length > 0 ? (
                 previewSlides.map((s, idx) => (
                   <div key={idx} className="group relative aspect-video bg-[#111] rounded-[30px] border-4 border-white/5 shadow-2xl flex flex-col items-center justify-center text-center p-8 transition-all hover:scale-[1.02] hover:border-[#2D83FF]/20">
                      <div className="absolute top-4 left-6 text-[9px] font-black uppercase text-white/10 tracking-[0.2em]">{idx + 1}</div>
                      <p className="text-sm font-black uppercase leading-tight tracking-tight text-white/80 whitespace-pre-wrap">{s}</p>
                      
                      <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#2D83FF]">Slide {idx + 1}</span>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center h-[500px]">
                    <div className="w-16 h-16 rounded-[20px] bg-white/5 flex items-center justify-center mb-6 opacity-20">
                       <FileText size={32} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">Type to generate preview</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

function QuickAddBtn({ label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="py-1.5 rounded-lg border border-white/5 bg-white/[0.03] text-[9px] font-black uppercase tracking-widest text-white/40 hover:bg-[#2D83FF]/20 hover:text-[#2D83FF] hover:border-[#2D83FF]/30 transition-all"
    >
      {label}
    </button>
  );
}
