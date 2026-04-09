import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { PresentationSaveLoad } from './PresentationSaveLoad';
import { ServiceItem, ServiceItemData } from './ServiceItem';
import { Loader2, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

interface ServiceOrderProps {
  items: ServiceItemData[];
  activeId: string | null;
  onActivateItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem: (id: string) => void;
}

export function ServiceOrder({ items, activeId, onActivateItem, onDeleteItem, onDuplicateItem }: ServiceOrderProps) {
  const { setNodeRef } = useDroppable({
    id: 'service-order-droppable',
    data: { type: 'service-order' }
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-base">
       {/* Header Bar */}
       <div className="flex items-center justify-between p-4 bg-surface-base border-b border-border-default shrink-0">
          <PresentationSaveLoad />
          <p className="text-[10px] font-bold tracking-widest uppercase text-text-500">Estimasi Total Slide: {items.reduce((s, i) => s + i.slides.length, 0)}</p>
       </div>

       {/* List / Droppable Container */}
       <div 
         className="flex-1 overflow-y-auto p-4 space-y-3"
         ref={setNodeRef}
       >
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
             {items.map(item => (
                <ServiceItem 
                   key={item.id} 
                   item={item} 
                   active={activeId === item.id}
                   onActivate={() => onActivateItem(item.id)}
                   onDelete={() => onDeleteItem(item.id)}
                   onDuplicate={() => onDuplicateItem(item.id)}
                />
             ))}

             {items.length === 0 && (
                <div className="border-2 border-dashed border-border-strong rounded-2xl p-10 flex flex-col items-center justify-center text-center opacity-70">
                   <Zap size={32} className="text-text-500 mb-3" />
                   <h3 className="font-bold text-text-200">Rencana Ibadah Kosong!</h3>
                   <p className="text-sm text-text-400 max-w-[250px] mt-2">
                     Tarik (Drag) Lagu, Media, maupun Firman dari Laci Perpustakaan di kiri.
                   </p>
                </div>
             )}
          </SortableContext>
       </div>

       {/* Footer */}
       <div className="p-4 bg-surface-sidebar border-t border-border-default shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-bold text-text-400">Order Disimpan (Just Now)</span>
          </div>

          <Button variant="primary" className="gap-2 font-bold px-8 shadow-xl shadow-accent-500/20">
             GO LIVE SEKARANG <Zap size={16} />
          </Button>
       </div>
    </div>
  );
}
