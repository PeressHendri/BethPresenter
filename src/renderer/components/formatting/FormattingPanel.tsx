import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Type, AlignLeft, AlignCenter, AlignRight, 
  AlignVerticalSpaceAround, AlignVerticalJustifyStart, AlignVerticalJustifyEnd,
  PaintBucket, Layout, Bookmark, Save, Trash2, Maximize2
} from 'lucide-react';
import { useFormattingStore, defaultFormatting } from '../../stores/formattingStore';
import { useFormattingPreset } from '../../hooks/useFormattingPreset';
import { Scrollbar } from '../ui/Scrollbar';

interface FormattingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FONTS = ['Inter', 'Poppins', 'Montserrat', 'Arial', 'Times New Roman', 'Impact', 'Comic Sans MS'];

export function FormattingPanel({ isOpen, onClose }: FormattingPanelProps) {
  const { formatting, updateFormatting, setFormatting } = useFormattingStore();
  const { presets, savePreset, deletePreset, applyPreset } = useFormattingPreset();
  const [newPresetName, setNewPresetName] = useState('');
  
  const [activeTab, setActiveTab] = useState<'style' | 'preset'>('style');

  const handleUpdate = (key: keyof typeof formatting, value: any) => {
    updateFormatting({ [key]: value });
  };

  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      savePreset(newPresetName, formatting);
      setNewPresetName('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ x: 320, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           exit={{ x: 320, opacity: 0 }}
           transition={{ type: 'spring', damping: 25, stiffness: 200 }}
           className="fixed top-0 right-0 bottom-0 w-[320px] bg-surface-sidebar border-l border-border-default shadow-2xl z-50 flex flex-col"
        >
           {/* HEADER */}
           <div className="flex items-center justify-between p-4 border-b border-border-default bg-surface-elevated shrink-0">
             <div className="flex items-center gap-2">
                <PaintBucket size={16} className="text-accent-400" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-text-200">Live Formatting</h2>
             </div>
             <button onClick={onClose} className="p-1.5 text-text-500 hover:text-text-100 transition-colors">
               <X size={16} />
             </button>
           </div>

           {/* TABS */}
           <div className="flex border-b border-border-default shrink-0">
             <button 
               onClick={() => setActiveTab('style')}
               className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'style' ? 'text-accent-400 border-b-2 border-accent-400' : 'text-text-500 hover:text-text-300'}`}
             >
               Style
             </button>
             <button 
               onClick={() => setActiveTab('preset')}
               className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'preset' ? 'text-accent-400 border-b-2 border-accent-400' : 'text-text-500 hover:text-text-300'}`}
             >
               Presets
             </button>
           </div>

           <Scrollbar className="flex-1 p-5">
              
              {activeTab === 'style' && (
                <div className="flex flex-col gap-6 pb-20">
                   
                   {/* Typography */}
                   <section className="flex flex-col gap-3">
                     <h3 className="text-[10px] font-bold text-text-500 uppercase tracking-wider flex items-center gap-1.5 mb-1"><Type size={12}/> Typography</h3>
                     
                     <div className="flex flex-col gap-1.5">
                       <label className="text-[10px] text-text-400">Font Family</label>
                       <select 
                          className="w-full h-8 bg-surface-elevated border border-border-strong rounded text-xs px-2"
                          value={formatting.fontFamily}
                          onChange={(e) => handleUpdate('fontFamily', e.target.value)}
                       >
                         {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                       </select>
                     </div>

                     <div className="flex flex-col gap-1.5">
                       <div className="flex justify-between">
                         <label className="text-[10px] text-text-400">Font Size (Auto/Manual)</label>
                         <span className="text-[10px] text-accent-400">{formatting.fontSize === 'auto' ? 'Auto' : `${formatting.fontSize}px`}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <input 
                           type="range" min="20" max="140" 
                           value={formatting.fontSize === 'auto' ? 60 : formatting.fontSize}
                           disabled={formatting.fontSize === 'auto'}
                           onChange={(e) => handleUpdate('fontSize', Number(e.target.value))}
                           className="flex-1 accent-accent-500"
                         />
                         <button 
                           onClick={() => handleUpdate('fontSize', formatting.fontSize === 'auto' ? 60 : 'auto')}
                           className={`p-1.5 rounded border ${formatting.fontSize === 'auto' ? 'bg-accent-600 border-accent-500 text-white' : 'bg-surface-elevated border-border-strong text-text-400'}`}
                           title="Toggle Auto Fit"
                         >
                           <Maximize2 size={12} />
                         </button>
                       </div>
                     </div>

                     <div className="grid grid-cols-2 gap-2 mt-1">
                        <button 
                          onClick={() => handleUpdate('fontWeight', formatting.fontWeight === 800 ? 500 : 800)}
                          className={`py-1.5 text-xs rounded border transition-colors ${formatting.fontWeight === 800 ? 'bg-surface-hover border-text-400 text-text-100 font-bold' : 'bg-surface-base border-border-default text-text-400'}`}
                        >
                          Bold
                        </button>
                        <button 
                          onClick={() => handleUpdate('textTransform', formatting.textTransform === 'uppercase' ? 'none' : 'uppercase')}
                          className={`py-1.5 text-xs rounded border transition-colors ${formatting.textTransform === 'uppercase' ? 'bg-surface-hover border-text-400 text-text-100 uppercase' : 'bg-surface-base border-border-default text-text-400'}`}
                        >
                          Aa / AA
                        </button>
                     </div>
                   </section>

                   <hr className="border-border-default" />

                   {/* Alignment */}
                   <section className="flex flex-col gap-3">
                     <h3 className="text-[10px] font-bold text-text-500 uppercase tracking-wider mb-1">Alignment</h3>
                     <div className="flex bg-surface-elevated rounded border border-border-strong overflow-hidden p-0.5">
                        {[{v:'left', i: AlignLeft}, {v:'center', i: AlignCenter}, {v:'right', i: AlignRight}].map(opt => (
                           <button 
                             key={opt.v}
                             onClick={() => handleUpdate('textAlign', opt.v)}
                             className={`flex-1 py-1.5 flex justify-center items-center rounded-sm transition-colors ${formatting.textAlign === opt.v ? 'bg-surface-hover shadow text-text-100' : 'text-text-500 hover:text-text-300'}`}
                           >
                              <opt.i size={14} />
                           </button>
                        ))}
                     </div>
                     <div className="flex bg-surface-elevated rounded border border-border-strong overflow-hidden p-0.5">
                        {[{v:'top', i: AlignVerticalJustifyStart}, {v:'center', i: AlignVerticalSpaceAround}, {v:'bottom', i: AlignVerticalJustifyEnd}].map(opt => (
                           <button 
                             key={opt.v}
                             onClick={() => handleUpdate('verticalAlign', opt.v)}
                             className={`flex-1 py-1.5 flex justify-center items-center rounded-sm transition-colors ${formatting.verticalAlign === opt.v ? 'bg-surface-hover shadow text-text-100' : 'text-text-500 hover:text-text-300'}`}
                           >
                              <opt.i size={14} />
                           </button>
                        ))}
                     </div>
                   </section>

                   <hr className="border-border-default" />

                   {/* Additions */}
                   <section className="flex flex-col gap-3">
                     <h3 className="text-[10px] font-bold text-text-500 uppercase tracking-wider mb-1">Effects & Spacing</h3>
                     
                     <div className="flex flex-col gap-1.5">
                       <label className="text-[10px] text-text-400">Text Shadow</label>
                       <select 
                          className="w-full h-8 bg-surface-elevated border border-border-strong rounded text-xs px-2"
                          value={formatting.textShadow}
                          onChange={(e) => handleUpdate('textShadow', e.target.value)}
                       >
                         <option value="none">None</option>
                         <option value="soft">Soft Drop</option>
                         <option value="strong">Strong Bold</option>
                         <option value="glow">Glow Emit</option>
                       </select>
                     </div>

                     <div className="flex flex-col gap-1.5 mt-2">
                       <div className="flex justify-between">
                         <label className="text-[10px] text-text-400">Background Overlay</label>
                         <span className="text-[10px] text-text-500">{Math.round(formatting.overlayOpacity * 100)}%</span>
                       </div>
                       <input 
                         type="range" min="0" max="1" step="0.05"
                         value={formatting.overlayOpacity}
                         onChange={(e) => handleUpdate('overlayOpacity', Number(e.target.value))}
                         className="flex-1 accent-accent-500"
                       />
                     </div>
                   </section>
                   
                   <div className="mt-4">
                     <button onClick={() => setFormatting(defaultFormatting)} className="text-xs text-text-500 hover:text-red-400 transition-colors w-full text-center">
                        Reset to Defaults
                     </button>
                   </div>
                </div>
              )}

              {activeTab === 'preset' && (
                <div className="flex flex-col gap-4 pb-20">
                   
                   <div className="flex flex-col gap-2 p-3 bg-surface-elevated border border-border-default rounded-xl">
                      <h4 className="text-[10px] font-bold text-text-300 uppercase">Save Current</h4>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Preset name..." 
                          value={newPresetName}
                          onChange={e => setNewPresetName(e.target.value)}
                          className="flex-1 bg-surface-base border border-border-strong rounded px-2 text-xs"
                        />
                        <button 
                          onClick={handleSavePreset}
                          disabled={!newPresetName.trim()}
                          className="p-1.5 bg-accent-600 text-white rounded disabled:opacity-50"
                        >
                           <Save size={14} />
                        </button>
                      </div>
                   </div>

                   <div className="flex flex-col gap-2 mt-2">
                     {presets.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border-default bg-surface-base hover:border-text-600 transition-colors group">
                           <div className="flex items-center gap-2">
                              <Bookmark size={14} className={p.isDefault ? 'text-accent-400' : 'text-text-400'} />
                              <span className="text-xs font-semibold text-text-100">{p.name}</span>
                           </div>
                           <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => applyPreset(p.id)}
                                className="px-2 py-1 bg-surface-elevated text-text-200 text-[10px] uppercase font-bold rounded border border-border-strong hover:bg-accent-600 hover:text-white"
                              >
                                Apply
                              </button>
                              {!p.isDefault && (
                                <button 
                                  onClick={() => deletePreset(p.id)}
                                  className="p-1 text-text-500 hover:text-red-400"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                           </div>
                        </div>
                     ))}
                   </div>

                </div>
              )}

           </Scrollbar>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
