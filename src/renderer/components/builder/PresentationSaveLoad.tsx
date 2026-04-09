import React, { useState } from 'react';
import { Save, FolderOpen, Plus, Printer, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

export function PresentationSaveLoad() {
  const [activeName, setActiveName] = useState('New Service (Unsaved)');
  const [showDropdown, setShowDropdown] = useState(false);

  const mockPresets = ['Sunday Service (Morning)', 'Youth Fellowship', 'Revival Night 2026'];

  return (
    <div className="flex items-center gap-2 relative">
      <div className="flex bg-surface-sidebar border border-border-default rounded-lg">
         <button 
           onClick={() => setShowDropdown(!showDropdown)}
           className="px-3 py-1.5 text-sm font-bold text-text-100 hover:bg-surface-hover flex items-center gap-2"
         >
           {activeName}
           <FolderOpen size={14} className="text-accent-500" />
         </button>
         
         <div className="w-px bg-border-default" />
         
         <button className="px-2 py-1.5 text-text-300 hover:text-accent-400 hover:bg-surface-hover transition" title="Save">
            <Save size={16} />
         </button>
      </div>

      <Button variant="ghost" size="sm" className="px-2 border border-border-default" title="New Service">
        <Plus size={16} />
      </Button>

      <Button variant="ghost" size="sm" className="px-2 border border-border-default hover:text-blue-400" title="Print Handout/Order">
        <Printer size={16} />
      </Button>

      {showDropdown && (
        <div className="absolute top-10 left-0 w-64 bg-surface-elevated border border-border-strong rounded-xl shadow-2xl z-50 overflow-hidden">
           <div className="p-2 border-b border-border-default text-xs font-bold text-text-400 uppercase tracking-widest bg-surface-sidebar">
             Saved Presentations
           </div>
           <div className="max-h-48 overflow-y-auto">
             {mockPresets.map(preset => (
                <div key={preset} className="flex justify-between items-center px-3 py-2 text-sm text-text-200 hover:bg-surface-hover cursor-pointer group">
                  <span onClick={() => { setActiveName(preset); setShowDropdown(false); }} className="flex-1 font-semibold">{preset}</span>
                  <button className="text-text-500 hover:text-danger-400 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Trash2 size={14} />
                  </button>
                </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}
