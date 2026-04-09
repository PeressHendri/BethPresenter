import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Scrollbar } from '../ui/Scrollbar';

interface SlideData {
  id: string; // temporary id for dnd
  label: string;
  text: string;
}

interface SlideListProps {
  slides: SlideData[];
  activeIdx: number;
  onSelect: (idx: number) => void;
  onReorder: (slides: SlideData[]) => void;
  onDelete: (idx: number) => void;
  onAddSlide: () => void;
}

function SortableSlideItem({ id, slide, index, isActive, onSelect, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.8 : 1
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      onClick={() => onSelect(index)}
      className={`group relative flex flex-col p-3 mb-3 rounded-lg border cursor-pointer transition-all min-h-[80px] ${
        isActive 
          ? 'bg-accent-600/10 border-accent-500 shadow-md shadow-accent-500/10' 
          : 'bg-surface-elevated border-border-default hover:border-text-500'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
           <div {...attributes} {...listeners} className="text-text-600 hover:text-text-300 cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors -ml-1">
             <GripVertical size={14} />
           </div>
           <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-accent-400' : 'text-text-500'}`}>
             {slide.label || 'Slide'}
           </span>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(index); }}
          className="text-text-600 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex-1 px-1">
        <p className={`text-xs line-clamp-3 leading-snug whitespace-pre-wrap ${isActive ? 'text-text-100' : 'text-text-300'}`}>
          {slide.text || <span className="italic opacity-40">Empty Slide</span>}
        </p>
      </div>
    </div>
  );
}

export function SlideList({ slides, activeIdx, onSelect, onReorder, onDelete, onAddSlide }: SlideListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [draggingId, setDraggingId] = React.useState<string | null>(null);

  const handleDragStart = (e: any) => setDraggingId(e.active.id);
  const handleDragEnd = (e: any) => {
    const { active, over } = e;
    setDraggingId(null);
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex(s => s.id === active.id);
      const newIndex = slides.findIndex(s => s.id === over.id);
      onReorder(arrayMove(slides, oldIndex, newIndex));
    }
  };

  const activeSlide = draggingId ? slides.find(s => s.id === draggingId) : null;

  return (
    <div className="flex flex-col h-full bg-surface-sidebar border-x border-border-default">
      <div className="px-4 py-3 border-b border-border-default shrink-0 flex justify-between items-center bg-surface-elevated">
         <h3 className="text-xs font-bold uppercase tracking-widest text-text-400">Slides</h3>
      </div>
      
      <Scrollbar className="flex-1 p-3">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={slides.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="min-h-full pb-20">
              {slides.map((slide, index) => (
                <SortableSlideItem 
                  key={slide.id}
                  id={slide.id}
                  slide={slide}
                  index={index}
                  isActive={activeIdx === index}
                  onSelect={onSelect}
                  onDelete={onDelete}
                />
              ))}
              
              <button 
                onClick={onAddSlide}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-border-strong hover:border-accent-500 hover:text-accent-400 text-text-500 transition-colors mt-2"
              >
                <Plus size={16} /> <span className="text-xs font-bold">Add Slide</span>
              </button>
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
             {activeSlide ? (
               <div className="p-3 rounded-lg border border-accent-500 bg-surface-elevated shadow-xl opacity-90">
                 <div className="text-[10px] font-bold text-accent-400 mb-1">{activeSlide.label}</div>
                 <div className="text-xs line-clamp-2">{activeSlide.text}</div>
               </div>
             ) : null}
          </DragOverlay>
        </DndContext>
      </Scrollbar>
    </div>
  );
}
