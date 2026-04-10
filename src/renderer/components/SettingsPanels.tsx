import React from 'react';

export function SettingsGroup({ title, children }: { title: string, children: any }) {
  return (
    <div className="flex flex-col gap-6 p-6 bg-[var(--surface-elevated)] bg-opacity-20 border border-white/5 rounded-xl">
       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-green)] border-b border-white/5 pb-2">
         {title}
       </h3>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {children}
       </div>
    </div>
  );
}

export function SettingsControl({ label, description, children }: { label: string, description?: string, children: any }) {
  return (
    <div className="flex flex-col gap-2">
       <div className="flex flex-col">
          <label className="text-xs font-bold text-white uppercase tracking-tight">{label}</label>
          {description && <p className="text-[10px] text-[var(--text-600)] mt-0.5 leading-tight">{description}</p>}
       </div>
       <div className="mt-1">
          {children}
       </div>
    </div>
  );
}

export function Toggle({ checked }: { checked: boolean }) {
  return (
    <div className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${checked ? 'bg-[var(--accent-green)]' : 'bg-white/10'}`}>
       <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </div>
  );
}

export function Select({ options, value }: { options: string[], value: string }) {
  return (
    <div className="relative group">
       <select className="w-full h-10 bg-black/40 border border-white/10 rounded px-3 text-xs font-bold text-white appearance-none focus:border-[var(--accent-blue)] transition-all cursor-pointer">
          {options.map(o => <option key={o} value={o}>{o}</option>)}
       </select>
       <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
          ▼
       </div>
    </div>
  );
}

export function GeneralPanel() {
  return (
    <div className="flex flex-col gap-8">
      <SettingsGroup title="Interface">
         <SettingsControl label="Language" description="Select your preferred UI language">
            <Select options={['English', 'Indonesian', 'Spanish', 'Tagalog']} value="English" />
         </SettingsControl>
         <SettingsControl label="UI Theme" description="Choose between dark, light or auto mode">
            <div className="flex bg-black/40 p-1 rounded border border-white/10">
               <button className="flex-1 py-1.5 text-[9px] font-black uppercase text-black bg-[var(--accent-green)] rounded">Dark</button>
               <button className="flex-1 py-1.5 text-[9px] font-black uppercase text-[var(--text-600)] hover:text-white">Light</button>
               <button className="flex-1 py-1.5 text-[9px] font-black uppercase text-[var(--text-600)]">Auto</button>
            </div>
         </SettingsControl>
      </SettingsGroup>
      
      <SettingsGroup title="System Behaviors">
         <div className="flex items-center justify-between col-span-2">
            <div className="flex flex-col">
               <span className="text-xs font-bold text-white uppercase">Enable Auto-Save</span>
               <span className="text-[10px] text-[var(--text-600)]">Changes are saved instantly as you edit</span>
            </div>
            <Toggle checked={true} />
         </div>
         <div className="flex items-center justify-between col-span-2 border-t border-white/5 pt-4">
            <div className="flex flex-col">
               <span className="text-xs font-bold text-white uppercase">Show Tooltips</span>
               <span className="text-[10px] text-[var(--text-600)]">Display helpful hints on hover</span>
            </div>
            <Toggle checked={true} />
         </div>
      </SettingsGroup>
    </div>
  );
}

export function OutputPanel() {
  return (
    <div className="flex flex-col gap-8">
      <SettingsGroup title="Primary Output">
         <SettingsControl label="Output Device" description="Select the monitor for audience output">
            <Select options={['Main Monitor', 'Display 2 (HDMI)', 'Display 3 (NDI)']} value="Display 2" />
         </SettingsControl>
         <SettingsControl label="Resolution" description="Target projection resolution">
            <Select options={['1920x1080', '1280x720', '3840x2160']} value="1920x1080" />
         </SettingsControl>
         <SettingsControl label="Scaling" description="Fine-tune output scale percentage">
            <input type="range" className="w-full accent-[var(--accent-green)]" />
         </SettingsControl>
         <SettingsControl label="Output Test">
            <button className="w-full h-10 border border-[var(--accent-green)] text-[var(--accent-green)] rounded text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent-green)] hover:text-black transition-all">Show Test Pattern</button>
         </SettingsControl>
      </SettingsGroup>
    </div>
  );
}
