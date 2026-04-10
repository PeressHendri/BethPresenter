import React from 'react';
import { Clock, Grid, Plus, Layers, ShieldCheck, Trash2, HardDrive } from 'lucide-react';

export function ProjectSidebarNavigator() {
  const navItems = [
    { name: 'Recent Projects', icon: Clock, active: true },
    { name: 'All Projects', icon: Grid },
    { name: 'New Project', icon: Plus },
    { name: 'Templates', icon: Layers },
    { name: 'Backup & Restore', icon: ShieldCheck },
    { name: 'Trash', icon: Trash2 },
  ];

  return (
    <div className="w-64 bg-[var(--surface-primary)] border-r border-[var(--border-default)] flex flex-col shrink-0">
      <div className="p-8 pb-4">
        <h2 className="text-xl font-black text-[var(--text-100)] uppercase tracking-tighter">Project Manager</h2>
        <p className="text-[10px] text-[var(--text-400)] uppercase tracking-[0.2em] mt-1 text-pretty">Open or create a service project.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar pt-6">
        {navItems.map((item) => (
          <div 
            key={item.name}
            className={`
              flex items-center gap-3 px-6 py-3 rounded cursor-pointer relative transition-all group
              ${item.active ? 'text-[var(--text-100)] font-bold' : 'text-[var(--text-400)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-100)]'}
            `}
          >
            {item.active && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#00E676] rounded-r shadow-[0_0_10px_#00E676]" />}
            <item.icon size={16} className={item.active ? 'text-[#00E676]' : 'text-[var(--text-600)] group-hover:text-[var(--text-100)]'} />
            <span className="text-xs uppercase tracking-widest">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Storage Meter */}
      <div className="p-6 bg-[var(--surface-elevated)] border-t border-[var(--border-default)] space-y-3 shrink-0">
         <div className="flex items-center gap-2 mb-1">
            <HardDrive size={12} className="text-[var(--text-600)]" />
            <span className="text-[10px] font-black text-[var(--text-600)] uppercase tracking-widest">Local Storage</span>
         </div>
         <div className="w-full h-1.5 bg-[var(--surface-base)] rounded-full overflow-hidden">
            <div className="w-[8%] h-full bg-[#00E676] rounded-full shadow-[0_0_10px_#00E676/50]" />
         </div>
         <div className="flex justify-between items-center text-[9px] font-black uppercase text-[var(--text-600)]">
            <span>2.1GB Used</span>
            <span>25GB Free</span>
         </div>
      </div>
    </div>
  );
}
