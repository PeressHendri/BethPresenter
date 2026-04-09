import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Save, Clock } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Song, LyricsSlide } from '@/shared/types';
import { useSongStore } from '../stores/songStore';
import { SlideList } from './songs/SlideList';
import { SlideEditor } from './songs/SlideEditor';
import { motion, AnimatePresence } from 'framer-motion';

interface SongEditorProps {
  song?: Song | null;
  onClose: () => void;
}

export function SongEditor({ song, onClose }: SongEditorProps) {
  const [title, setTitle] = useState(song?.title || '');
  const [author, setAuthor] = useState(song?.author || '');
  const [ccli, setCcli] = useState(song?.ccli || '');
  const [tags, setTags] = useState<string[]>(() => {
    if (!song?.tags) return [];
    try {
      const parsed = JSON.parse(song.tags) as unknown;
      if (Array.isArray(parsed)) return parsed.filter((t) => typeof t === 'string').map(t => t.trim()).filter(Boolean);
      return [];
    } catch { return []; }
  });
  
  const defaultSlides: LyricsSlide[] = [{ label: 'Verse 1', text: '' }];
  const initialSlides = song ? JSON.parse(song.lyricsJson) : defaultSlides;
  // Make sure they have internal UUIDs for dnd-kit
  const [slides, setSlides] = useState<any[]>(initialSlides.map((s: any) => ({ ...s, id: s.id || crypto.randomUUID() })));
  
  const [activeIdx, setActiveIdx] = useState(0);
  const [tagInput, setTagInput] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { createSong, updateSong } = useSongStore();

  const handleSave = useCallback(async () => {
    if (!title.trim() && slides.length === 0) return; // Ignore blank empty states
    
    setIsSaving(true);
    const data = {
      title: title || 'Untitled Song',
      author,
      ccli,
      lyricsJson: JSON.stringify(slides.map(({ id, ...s }) => s)), // strip temporary id
      tags: JSON.stringify(tags),
    };

    try {
      if (song?.id) {
        await updateSong(song.id, data);
      } else {
        // If creating new song, we don't have ID unless we push. 
        // We might want to mutate `song` prop to make it persistent, but since it's just a modal, we only auto-save if it already exists or we create it once.
        // Actually, if it's new, we create it and update our local reference so it updates instead of duplicates on next auto-save.
        // Wait, `song` is passed as prop. We can't mutate prop. Let's just create it on manual save if new, or rely on a local ref trick.
      }
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  }, [title, author, ccli, slides, tags, song, updateSong]);

  // Auto-save effect (every 30s)
  useEffect(() => {
    if (!song?.id) return; // Only auto-save existing songs to prevent spamming creation
    const interval = setInterval(() => {
      void handleSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [handleSave, song?.id]);

  // Split Logic (Auto-numbering)
  const handleSplit = (before: string, after: string) => {
    const current = slides[activeIdx];
    const prevLabel = current.label.trim();

    // Logic: Verse 1 -> Verse 1a, Verse 1b
    // Verse 1a -> Verse 1a, Verse 1b (existing 1b becomes 1c)
    
    // Parse the label: "Verse 1", "Verse 1a", "Chorus"
    const match = prevLabel.match(/^(.+?)\s*(\d*)([a-z]?)$/i);
    let base = prevLabel;
    let num = '';
    let letter = '';
    if (match) {
      base = match[1].trim();
      num = match[2];
      letter = match[3];
    }

    let firstLabel = prevLabel;
    let secondLabel = prevLabel;

    if (letter) {
      // Split "Verse 1a" -> "1a" and "1b"
      // We must shift downstream letters. 
      // i.e if we have Verse 1b after us, we make it Verse 1c.
      let targetPrefix = `${base} ${num}`; // "Verse 1"
      let nextCharCode = letter.charCodeAt(0) + 1; // 'b'
      secondLabel = `${targetPrefix}${String.fromCharCode(nextCharCode)}`;

      const newSlides = [...slides];
      newSlides[activeIdx] = { ...current, text: before };
      newSlides.splice(activeIdx + 1, 0, { id: crypto.randomUUID(), label: secondLabel, text: after });
      
      // Shift subsequent slides with matching prefix
      let currCode = nextCharCode + 1;
      for (let i = activeIdx + 2; i < newSlides.length; i++) {
        const downstreamMatch = newSlides[i].label.match(/^(.+?)\s*(\d*)([a-z]?)$/i);
        if (downstreamMatch && downstreamMatch[1].trim() === base && downstreamMatch[2] === num && downstreamMatch[3]) {
           newSlides[i].label = `${targetPrefix}${String.fromCharCode(currCode)}`;
           currCode++;
        } else {
           break; // Stop shifting if prefix changes
        }
      }
      setSlides(newSlides);
      setActiveIdx(activeIdx + 1);

    } else {
      // First split: "Verse 1" -> "Verse 1a" and "Verse 1b"
      firstLabel = `${base} ${num}a`;
      secondLabel = `${base} ${num}b`;
      
      const newSlides = [...slides];
      newSlides[activeIdx] = { ...current, label: firstLabel, text: before };
      newSlides.splice(activeIdx + 1, 0, { id: crypto.randomUUID(), label: secondLabel, text: after });
      setSlides(newSlides);
      setActiveIdx(activeIdx + 1);
    }
  };

  const handleAddSlide = () => {
    const newSlides = [...slides, { id: crypto.randomUUID(), label: `Verse ${slides.length + 1}`, text: '' }];
    setSlides(newSlides);
    setActiveIdx(newSlides.length - 1);
  };

  const handleDeleteSlide = (idx: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== idx);
    setSlides(newSlides);
    setActiveIdx(Math.max(0, idx > activeIdx ? activeIdx : activeIdx - 1));
  };

  const handleManualSave = async () => {
    if (!title.trim()) { alert('Title is required'); return; }
    
    setIsSaving(true);
    const data = {
      title, author, ccli,
      lyricsJson: JSON.stringify(slides.map(({ id, ...s }) => s)),
      tags: JSON.stringify(tags),
    };
    
    if (song?.id) {
      await updateSong(song.id, data);
    } else {
      await createSong(data);
    }
    
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-surface-base">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
         <AnimatePresence>
           {lastSaved && (
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex items-center gap-1.5 text-xs text-text-400 bg-surface-sidebar px-3 py-1.5 rounded-full border border-border-default">
               <Clock size={12} /> Saved {lastSaved.toLocaleTimeString()}
             </motion.div>
           )}
         </AnimatePresence>
         <Button variant="ghost" onClick={async () => {
            if (song?.id) await handleSave(); // save on close
            onClose();
         }} className="px-5 bg-surface-elevated/50 hover:bg-surface-elevated">
            <X size={16} className="mr-2"/> Close
         </Button>
         <Button variant="primary" onClick={handleManualSave} disabled={isSaving || !title.trim()} className="px-6 flex items-center gap-2">
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save & Exit'}
         </Button>
      </div>

      <div className="w-full h-full flex pt-16">
         {/* PANEL 1: Info (Left) 240px */}
         <div className="w-[260px] shrink-0 border-r border-border-default bg-surface-sidebar flex flex-col p-5 gap-5 overflow-y-auto">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-400 mb-2">Song Details</h2>
            
            <div>
              <label className="text-xs font-bold text-text-400 mb-1.5 block">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Song Title" className="w-full bg-surface-elevated" />
            </div>
            
            <div>
              <label className="text-xs font-bold text-text-400 mb-1.5 block">Author / Artist</label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="e.g. Hillsong" className="w-full bg-surface-elevated" />
            </div>
            
            <div>
              <label className="text-xs font-bold text-text-400 mb-1.5 block">CCLI Number</label>
              <Input value={ccli} onChange={(e) => setCcli(e.target.value)} placeholder="123456" className="w-full bg-surface-elevated" />
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-text-400 mb-1.5 block">Tags</label>
              <div className="flex flex-col gap-2">
                <Input 
                   placeholder="Type and press Enter" 
                   value={tagInput}
                   onChange={(e) => setTagInput(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' || e.key === ',') {
                       e.preventDefault();
                       const val = tagInput.trim();
                       if (val && !tags.includes(val)) {
                         setTags([...tags, val]);
                         setTagInput('');
                       }
                     }
                   }}
                   className="w-full bg-surface-elevated text-xs border-border-default" 
                />
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => (
                    <div key={t} className="flex items-center gap-1 bg-surface-elevated px-2 py-1 rounded text-[10px] uppercase font-bold border border-border-default">
                      {t}
                      <button onClick={() => setTags(tags.filter(x => x !== t))} className="hover:text-danger ml-1"><X size={10}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
         </div>

         {/* PANEL 2: Slide List (Center) 300px */}
         <div className="w-[300px] shrink-0 border-r border-border-default">
            <SlideList 
              slides={slides}
              activeIdx={activeIdx}
              onSelect={setActiveIdx}
              onReorder={setSlides}
              onDelete={handleDeleteSlide}
              onAddSlide={handleAddSlide}
            />
         </div>

         {/* PANEL 3: WYSIWYG Editor (Right) Flex-1 */}
         <div className="flex-1 min-w-0" onBlur={() => { if (song?.id) void handleSave(); /* Auto-save on blur */ }}>
            <SlideEditor 
              key={slides[activeIdx]?.id} // Remounts contenteditable to bypass innerText cache sync bugs reliably
              text={slides[activeIdx]?.text || ''}
              onChange={(text) => {
                const newSlides = [...slides];
                newSlides[activeIdx].text = text;
                setSlides(newSlides);
              }}
              onSplit={handleSplit}
            />
         </div>
      </div>
    </div>
  );
}
