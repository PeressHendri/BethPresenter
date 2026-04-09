import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Music, BookOpen, FileText, Image, Clock, Trash2, Copy, MonitorDown, ChevronDown, ChevronRight } from 'lucide-react';

export interface ServiceItemData {
  id: string;
  type: 'song' | 'bible' | 'custom' | 'blank' | 'timer' | 'media';
  title: string;
  subtitle?: string;
  slides: any[];
}

interface ServiceItemProps {
  item: ServiceItemData;
  active: boolean;
  onActivate: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function ServiceItem({ item, active, onActivate, onDelete, onDuplicate }: ServiceItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const getIcon = () => {
    switch (item.type) {
      case 'song': return <Music size={16} className="text-accent-400" />;
      case 'bible': return <BookOpen size={16} className="text-emerald-400" />;
      case 'custom': return <FileText size={16} className="text-blue-400" />;
      case 'media': return <Image size={16} className="text-purple-400" />;
      case 'timer': return <Clock size={16} className="text-amber-400" />;
      default: return <div className="w-4 h-4 border-2 border-text-500 rounded bg-black/20" />; // blank
    }
  };

  return (
    <div 
       ref={setNodeRef} 
       style={style} 
       className={`rounded-xl border transition-all bg-surface-elevated flex flex-col ${
          isDragging ? 'shadow-2xl opacity-80 border-accent-500 ring-2 ring-accent-500/20' : 
          active ? 'border-accent-500 bg-accent-500/5 shadow-md' : 'border-border-default hover:border-border-strong hover:shadow-panel'
       }`}
    >
       {/* Main Row Header */}
       <div className="flex items-stretch group" onClick={onActivate}>
          {/* Drag Handle */}
          <div 
             {...attributes} 
             {...listeners} 
             className="w-10 flex flex-col justify-center items-center text-text-500 hover:text-text-200 cursor-grab active:cursor-grabbing border-r border-transparent group-hover:border-border-default bg-surface-sidebar rounded-l-xl transition-colors"
          >
             <GripVertical size={16} />
          </div>

          {/* Content Summary */}
          <div className="flex-1 p-3 flexItems-center flex items-center justify-between gap-3 min-w-0 pr-4">
             <div className="flex items-center gap-3 min-w-0">
                <button 
                   onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                   className="p-1.5 rounded bg-surface-sidebar border border-border-strong text-text-300 hover:text-white"
                >
                   {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <div className="w-8 h-8 rounded-lg bg-surface-sidebar border border-border-strong flex items-center justify-center shrink-0 shadow-inner">
                   {getIcon()}
                </div>
                <div className="truncate">
                   <h3 className={`text-sm font-bold truncate ${active ? 'text-accent-400' : 'text-text-100'}`}>{item.title}</h3>
                   {item.subtitle && <p className="text-xs text-text-400 truncate mt-0.5">{item.subtitle}</p>}
                </div>
             </div>
             
             {/* Badges / Metrics */}
             <div className="flex items-center gap-3 shrink-0">
                 <span className="text-[10px] font-bold text-text-500 uppercase tracking-widest bg-surface-hover px-2 py-0.5 rounded border border-border-default h-fit">
                    {item.slides.length} SLIDE
                 </span>
                 
                 {/* Hover Actions */}
                 <div className="hidden group-hover:flex items-center gap-1">
                    <button onClick={e => { e.stopPropagation(); onDuplicate(); }} className="p-1.5 text-text-400 hover:text-blue-400 rounded hover:bg-surface-hover" title="Duplicate">
                       <Copy size={16} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-text-400 hover:text-danger-400 rounded hover:bg-surface-hover" title="Delete from order">
                       <Trash2 size={16} />
                    </button>
                 </div>
             </div>
          </div>
       </div>

       {/* Expanded Slide Preview Grid */}
       {expanded && (
          <div className="p-4 bg-surface-base border-t border-border-default rounded-b-xl grid grid-cols-5 gap-3 cursor-default" onClick={e => e.stopPropagation()}>
             {item.slides.map((s: any, idx: number) => (
                <div key={idx} className="aspect-video bg-black border border-border-strong rounded-lg overflow-hidden flex flex-col items-center justify-center relative hover:border-accent-400 transition-colors cursor-pointer group/slide">
                   <span className="absolute top-1 left-1 bg-black/60 text-white text-[8px] px-1 rounded font-mono">{idx + 1}</span>
                   <p className="text-[8px] text-white font-bold p-2 text-center line-clamp-3">{s.text || 'Kosong'}</p>
                   
                   {/* Hover Play Button */}
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/slide:opacity-100 transition-opacity flex items-center justify-center">
                       <button className="flex items-center gap-1 bg-accent-600 text-white text-[10px] px-2 py-1 rounded font-bold">
                          <MonitorDown size={12}/> Live
                       </button>
                   </div>
                </div>
             ))}
          </div>
       )}
    </div>
  );
}
