import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { QuickLibrary } from '../components/builder/QuickLibrary';
import { ServiceOrder } from '../components/builder/ServiceOrder';
import { ServiceItemData } from '../components/builder/ServiceItem';
import { CustomSlideEditor } from '../components/builder/CustomSlideEditor';
import {
  DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

const uuidv4 = () => Math.random().toString(36).substring(2, 9);

export function PresentationBuilder() {
  const [items, setItems] = useState<ServiceItemData[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  // Custom slide modal state
  const [showCustomSlideEditor, setShowCustomSlideEditor] = useState(false);

  // Autosave periodically
  useEffect(() => {
    const timer = setInterval(() => {
      // In a real app, hit IPC database endpoint here
      console.log('Autosaved sequence to DB...', items.length, 'items');
    }, 30000);
    return () => clearInterval(timer);
  }, [items]);

  // DnD States
  const [activeDragItem, setActiveDragItem] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    const isLibraryOrigin = active.data.current?.type === 'library-item';
    
    if (isLibraryOrigin) {
      setActiveDragItem(active.data.current.payload); // Set item info for DragOverlay tracking
    } else {
      // Reording existing item
      const itemToMove = items.find(i => i.id === active.id);
      setActiveDragItem(itemToMove);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    // If dropped nowhere
    if (!over) return;

    if (active.data.current?.type === 'library-item') {
      // Dropping a NEW item from quick library onto the ServiceOrder
      const payload = active.data.current.payload;
      const newItem: ServiceItemData = {
        id: uuidv4(),
        type: payload.type,
        title: payload.title,
        subtitle: payload.artist || payload.preview,
        slides: new Array(payload.slideCount || 1).fill({ text: payload.preview || `${payload.title} Base Slide` })
      };

      // Determine where to insert
      if (over.id === 'service-order-droppable') {
        // Appended at the end
        setItems(prev => [...prev, newItem]);
      } else {
        // Insert at specific sortable position
        setItems(prev => {
           const overIndex = prev.findIndex(i => i.id === over.id);
           if (overIndex >= 0) {
             const copy = [...prev];
             copy.splice(overIndex, 0, newItem);
             return copy;
           }
           return [...prev, newItem];
        });
      }
    } else {
      // Reording within the Service Order
      if (active.id !== over.id) {
        setItems((prevItems) => {
          const oldIndex = prevItems.findIndex((item) => item.id === active.id);
          const newIndex = prevItems.findIndex((item) => item.id === over.id);
          return arrayMove(prevItems, oldIndex, newIndex);
        });
      }
    }
  };

  const handleQuickAdd = (type: 'blank' | 'custom' | 'timer') => {
     if (type === 'custom') {
        setShowCustomSlideEditor(true);
        return;
     }

     const newItem: ServiceItemData = {
        id: uuidv4(),
        type,
        title: type === 'blank' ? 'Layar Hitam' : '5 Menit Countdown',
        slides: [{ text: type === 'blank' ? '' : '05:00' }]
     };
     setItems(prev => [...prev, newItem]);
  };

  const onAboardCustom = (data: { title: string; text: string }) => {
     setShowCustomSlideEditor(false);
     setItems(prev => [...prev, {
        id: uuidv4(),
        type: 'custom',
        title: data.title,
        slides: [{ text: data.text }]
     }]);
  };

  return (
    <MainLayout>
      <div className="flex h-full min-h-0 bg-surface-base" style={{ height: 'calc(100vh - 2rem)' }}>
         <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
         >
            {/* Quick Library Left Panel */}
            <QuickLibrary onQuickAdd={handleQuickAdd} />

            {/* Service Order Droppable Right Panel */}
            <ServiceOrder 
               items={items}
               activeId={activeItemId}
               onActivateItem={setActiveItemId}
               onDeleteItem={(id) => setItems(prev => prev.filter(i => i.id !== id))}
               onDuplicateItem={(id) => {
                  const target = items.find(i => i.id === id);
                  if (target) {
                     const idx = items.findIndex(i => i.id === id);
                     const clone: ServiceItemData = { ...target, id: uuidv4() };
                     const copy = [...items];
                     copy.splice(idx + 1, 0, clone);
                     setItems(copy);
                  }
               }}
            />

            {/* Drag Overlay indicating ghost positioning */}
            <DragOverlay>
                {activeDragItem ? (
                   <div className="p-3 rounded-lg border-2 border-accent-500 bg-surface-elevated/80 shadow-2xl backdrop-blur">
                      <h4 className="text-sm font-bold truncate text-text-100">{activeDragItem.title}</h4>
                   </div>
                ) : null}
            </DragOverlay>
         </DndContext>
      </div>

      {showCustomSlideEditor && (
         <CustomSlideEditor 
            onAboard={onAboardCustom}
            onCancel={() => setShowCustomSlideEditor(false)}
         />
      )}
    </MainLayout>
  );
}
