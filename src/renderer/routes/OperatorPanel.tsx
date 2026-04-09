import { useState } from 'react';
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
import { 
  GripVertical, 
  Trash2, 
  Monitor,
  Music,
  Layout,
  Type,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Scrollbar } from '../components/ui/Scrollbar';
import { SlidePreview } from '../components/SlidePreview';
import { OperatorMessage } from '../components/operator/OperatorMessage';
import { VideoControls } from '../components/media/VideoControls';
import { usePresentationStore } from '../stores/presentationStore';

// --- Sortable Item Component ---
function SortableServiceItem({ id, item, index, isActive, onSelect, onDelete }: any) {
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

  const getIcon = () => {
    switch (item.type) {
      case 'song': return <Music size={14} className={isActive ? 'text-surface-primary' : 'text-accent-400'} />;
      case 'bible': return <Layout size={14} className={isActive ? 'text-surface-primary' : 'text-emerald-400'} />;
      case 'custom': return <Type size={14} className={isActive ? 'text-surface-primary' : 'text-blue-400'} />;
      case 'blank': return <Square size={14} className={isActive ? 'text-surface-primary' : 'text-text-400'} />;
      default: return <Layout size={14} />;
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      onClick={() => onSelect(index)}
      className={`group relative flex items-center gap-3 p-3 mb-2 rounded-xl transition-all cursor-pointer border ${
        isActive 
          ? 'bg-accent-600 border-accent-600 text-surface-primary shadow-lg shadow-accent-500/20' 
          : 'bg-surface-elevated border-border-default hover:border-accent-500/50'
      }`}
    >
      {/* Active Indicator Accent Line */}
      {isActive && (
        <motion.div layoutId="active-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-surface-primary rounded-r-md" />
      )}

      {/* Drag handle */}
      <div {...attributes} {...listeners} className={`cursor-grab active:cursor-grabbing p-1 -ml-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-surface-primary/70 hover:text-surface-primary hover:bg-black/10' : 'text-text-600 hover:text-text-200 hover:bg-surface-hover'}`}>
        <GripVertical size={16} />
      </div>
      
      <div className="flex-1 min-w-0 -ml-1">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className={`font-semibold truncate text-sm ${isActive ? 'text-surface-primary' : 'text-text-100'}`}>
            {item.type === 'song' ? item.song?.title : item.title}
          </span>
        </div>
        <p className={`text-[10px] uppercase tracking-wider font-medium mt-0.5 ${isActive ? 'text-surface-primary/80' : 'text-text-500'}`}>
          {item.type === 'song' ? `${JSON.parse(item.song.lyricsJson).length} Slides` : item.type}
        </p>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(index); }}
        className={`p-1.5 rounded transition-all opacity-0 group-hover:opacity-100 ${
          isActive 
            ? 'text-surface-primary/70 hover:text-surface-primary hover:bg-black/10' 
            : 'text-text-600 hover:text-danger hover:bg-danger/10'
        }`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function OperatorPanel() {
  const { 
    currentItems, 
    activeItemIndex, 
    activeSlideIndex, 
    removeItem, 
    reorderItems, 
    goLive,
    addBlank,
    addCustom,
    openOutput,
    isLive,
    isHideText,
    isBlank
  } = usePresentationStore();

  const [customText, setCustomText] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setDraggingId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setDraggingId(null);
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = currentItems.findIndex(item => item.id === active.id);
      const newIndex = currentItems.findIndex(item => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderItems(arrayMove(currentItems, oldIndex, newIndex));
      }
    }
  };

  const selectedItem = currentItems[activeItemIndex];
  const slides = selectedItem?.type === 'song' ? JSON.parse(selectedItem.song.lyricsJson) : [];

  const currentSlide = slides[activeSlideIndex];
  const nextSlide = slides[activeSlideIndex + 1];

  // If item is custom or blank, create a dummy slide array for the grid
  const gridSlides = selectedItem?.type === 'song' 
    ? slides 
    : selectedItem?.type === 'custom' 
      ? [{ label: 'Custom', text: selectedItem.content }]
      : selectedItem?.type === 'blank'
        ? [{ label: 'Blank', text: '' }]
        : [];

  return (
    <MainLayout>
      <div className="h-full flex gap-4">
        
        {/* =========================================
            PANEL 1: SERVICE ORDER (Left - 280px)
            ========================================= */}
        <Card variant="flat" className="w-[280px] shrink-0 flex flex-col overflow-hidden border-border-default h-full bg-surface-sidebar">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border-default flex justify-between items-center bg-surface-elevated shrink-0">
            <h3 className="font-bold text-xs uppercase tracking-widest text-text-400">Service Order</h3>
            <Badge variant="neutral" className="text-xs">{currentItems.length} items</Badge>
          </div>
          
          {/* List */}
          <Scrollbar className="flex-1 px-3 py-3 relative">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={currentItems.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="min-h-[100px]">
                  {currentItems.map((item, index) => (
                    <SortableServiceItem 
                      key={item.id} 
                      id={item.id} 
                      item={item} 
                      index={index}
                      isActive={activeItemIndex === index}
                      onSelect={(i: number) => {
                        // Switch output to this item, start at slide 0
                        void goLive(i, 0);
                      }}
                      onDelete={removeItem}
                    />
                  ))}
                  {currentItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-text-600 opacity-60">
                      <Layout size={32} className="mb-3" />
                      <p className="text-xs font-medium">Order is empty</p>
                    </div>
                  )}
                </div>
              </SortableContext>
              
              <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
                {draggingId ? (
                  <div className="p-3 rounded-xl border border-accent-500 bg-surface-elevated shadow-xl flex items-center gap-3">
                    <GripVertical size={16} className="text-accent-500" />
                    <span className="font-semibold text-sm">Moving item...</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </Scrollbar>

          {/* Quick Add Bottom */}
          <div className="p-3 border-t border-border-default bg-surface-elevated shrink-0">
            <div className="flex gap-2 mb-2">
              <Button variant="secondary" size="sm" className="flex-1 text-[11px]" onClick={addBlank}>
                <Square size={12} className="mr-1.5 opacity-70" /> Blank
              </Button>
              <Button variant="secondary" size="sm" className="flex-1 text-[11px]" onClick={() => {
                if(customText.trim()) { addCustom(customText); setCustomText(''); }
              }}>
                <Type size={12} className="mr-1.5 opacity-70" /> Custom
              </Button>
            </div>
            <Input 
              placeholder="Quick text..." 
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && customText.trim()) { addCustom(customText); setCustomText(''); }
              }}
              className="text-xs h-8"
            />
          </div>

          {/* Operator Message for Stage */}
          <div className="p-3 border-t border-border-default bg-surface-sidebar shrink-0">
             <OperatorMessage />
          </div>
        </Card>

        {/* =========================================
            PANEL 2: PREVIEW VIEWS (Center - flex-1)
            ========================================= */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          
          {/* Header Status (Optional, maybe moved to top tight) */}
          <div className="flex justify-between items-center mb-3 shrink-0">
             <div className="flex items-center gap-3">
                <Button variant="primary" size="sm" onClick={() => void openOutput()} className="h-8">
                  <Monitor size={14} className="mr-2" /> Output Monitor
                </Button>
                {isLive ? <Badge variant="danger" dot pulse>LIVE</Badge> : <Badge variant="neutral">OFFLINE</Badge>}
             </div>
             
             {/* Indicators for Blank/Hide */}
             <div className="flex items-center gap-2">
               {isBlank && <Badge variant="warning">Screen is Blank</Badge>}
               {isHideText && <Badge variant="warning">Text is Hidden</Badge>}
             </div>
          </div>

          {/* Main Current Slide Preview */}
          <Card variant="flat" className="flex-1 shrink-0 bg-black overflow-hidden relative flex flex-col justify-center items-center shadow-inner ring-1 ring-white/5 mb-4 group">
            {/* Label Badge absolute */}
            <div className="absolute top-4 left-4 z-10">
               <Badge variant="accent" className="shadow-lg backdrop-blur text-[10px] tracking-widest px-2 py-1 bg-accent-600/90 text-white font-bold uppercase rounded-md border border-white/10">
                 Current • {selectedItem?.type === 'song' ? currentSlide?.label || 'Slide' : selectedItem?.title || 'Unknown'}
               </Badge>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={`${activeItemIndex}-${activeSlideIndex}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex flex-col justify-center items-center p-8"
              >
                <div className="w-full max-w-4xl aspect-[16/9]">
                   <SlidePreview 
                     text={
                       selectedItem?.type === 'custom' ? selectedItem.content 
                       : selectedItem?.type === 'blank' ? '' 
                       : currentSlide?.text || ''
                     } 
                     title={selectedItem?.type === 'song' ? selectedItem?.song?.title : ''}
                   />
                </div>
                </motion.div>
              </AnimatePresence>
            </Card>

            {/* Injected Video Controls (only auto-renders if BackgroundLayer dispatches progress) */}
            <VideoControls />

          {/* Next Slide Preview (Smaller) */}
          <Card variant="elevated" className="h-[22%] shrink-0 bg-surface-sidebar relative flex items-center justify-center overflow-hidden border-border-default ring-1 ring-inset ring-white/5">
             <div className="absolute top-3 left-4 z-10">
               <Badge variant="neutral" className="shadow border-transparent text-[10px] tracking-widest px-2 py-0.5 font-bold uppercase rounded-md bg-surface-hover text-text-400">
                 Next • {selectedItem?.type === 'song' ? nextSlide?.label || 'End' : 'End'}
               </Badge>
             </div>
             
             <div className="w-full h-full p-4 flex flex-col justify-center items-center opacity-70">
               <div className="w-full max-w-3xl aspect-[16/9] flex justify-center items-center">
                 {/* Mini version of preview, scaling purely via css fit */}
                 <p className="text-center font-bold text-lg md:text-2xl text-text-200 line-clamp-3 leading-snug whitespace-pre-wrap px-8">
                   {nextSlide?.text || (selectedItem ? 'No upcoming slide' : 'Select an item to preview')}
                 </p>
               </div>
             </div>
          </Card>

        </div>

        {/* =========================================
            PANEL 3: SLIDE GRID (Right - 320px)
            ========================================= */}
        <Card variant="flat" className="w-[320px] shrink-0 flex flex-col overflow-hidden border-border-default h-full bg-surface-sidebar">
           <div className="px-4 py-3 border-b border-border-default bg-surface-elevated shrink-0 flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-widest text-text-400">Slide Grid</h3>
              <Badge variant="neutral" className="text-xs">{gridSlides.length} slides</Badge>
           </div>
           
           <Scrollbar className="flex-1 p-4 flex flex-col gap-3 relative">
             {gridSlides.map((slide: any, idx: number) => {
               const isActiveSlide = activeSlideIndex === idx;
               return (
                 <motion.div 
                   key={idx}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => void goLive(activeItemIndex, idx)}
                   className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm relative overflow-hidden flex flex-col gap-2 ${
                     isActiveSlide 
                       ? 'border-accent-500 bg-accent-500/10 ring-1 ring-accent-500/50' 
                       : 'border-border-default bg-surface-elevated hover:border-text-500 hover:bg-surface-hover'
                   }`}
                 >
                   {isActiveSlide && (
                     <div className="absolute top-0 left-0 w-full h-1 bg-accent-500" />
                   )}
                   <div className="flex justify-between items-center">
                     <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isActiveSlide ? 'text-accent-400' : 'text-text-500'}`}>
                       {slide.label || 'Slide'}
                     </span>
                     {isActiveSlide && <span className="flex h-2 w-2 rounded-full bg-accent-500" />}
                   </div>
                   <p className={`text-sm font-medium line-clamp-3 leading-relaxed whitespace-pre-wrap ${isActiveSlide ? 'text-text-100' : 'text-text-300'}`}>
                     {slide.text || <span className="opacity-40 italic">Empty slide</span>}
                   </p>
                 </motion.div>
               )
             })}

             {!selectedItem && (
               <div className="h-full flex flex-col justify-center items-center opacity-40">
                 <MousePointerClick size={32} className="mb-3 text-text-600" />
                 <p className="text-xs text-text-600 text-center px-4">Select an item from the Service Order to view its slides</p>
               </div>
             )}
           </Scrollbar>
        </Card>
      </div>
    </MainLayout>
  );
}

// Temporary icon for empty state
function MousePointerClick(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12A9 9 0 1 1 12 3c1.6 0 3.1.4 4.5 1.1"/>
      <path d="M21 21l-4.3-4.3"/>
      <path d="M11 11l4.5-4.5"/>
      <path d="M15 6v5h5"/>
    </svg>
  );
}
