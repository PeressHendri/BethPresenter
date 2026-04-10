import React, { useState } from 'react';
import { Monitor, Zap, Play, Maximize, Palette, Trash2, Cpu } from 'lucide-react';
import { useToast } from '../components/Toast';

export function DisplayManagementPage() {
  const { showToast } = useToast();
  const [wakeLock, setWakeLock] = useState(true);
  const [preventSleep, setPreventSleep] = useState(true);
  const [vsync, setVsync] = useState('Default');
  const [rendering, setRendering] = useState('GPU Accelerated');
  const [scale, setScale] = useState(1.0);

  const toggleWakeLock = async () => {
    const newState = !wakeLock;
    setWakeLock(newState);
    if ((window as any).electron?.ipcRenderer) {
      await (window as any).electron.ipcRenderer.invoke(newState ? 'wake-lock-enable' : 'wake-lock-disable');
      showToast(newState ? 'Wake Lock Enabled' : 'Wake Lock Disabled', 'success');
    }
  };

  const setRenderingMode = async (mode: string) => {
    setRendering(mode);
    if ((window as any).electron?.ipcRenderer) {
       await (window as any).electron.ipcRenderer.invoke('display-set-engine', mode);
       showToast(`Switched to ${mode} engine`, 'success');
    }
  };

  return (
    <div className="flex-1 bg-[var(--surface-base)] flex flex-col overflow-hidden">
      <div className="p-12 pb-8">
         <h1 className="text-3xl font-black text-[var(--text-100)] tracking-tighter">Display Management</h1>
         <p className="text-sm font-medium text-[var(--text-400)] mt-1 tracking-wide">Control projector behavior, wake lock, and display modes.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-12 pb-12 space-y-4 max-w-[1000px] no-scrollbar">
        
        {/* WAKE LOCK */}
        <SettingCard 
          icon={<Zap size={20} className="text-amber-500" />}
          title="Wake Lock"
          subtitle="Prevent display/projector from sleeping during service."
          status={wakeLock ? 'Wake lock active.' : 'Display may turn off automatically.'}
          control={<Toggle active={wakeLock} onToggle={toggleWakeLock} />}
        />

        {/* PREVENT SLEEP */}
        <SettingCard 
          icon={<Monitor size={20} className="text-blue-500" />}
          title="Prevent OS Display Sleep"
          subtitle="Overrides computer screen timeout settings globally."
          control={<Toggle active={preventSleep} onToggle={() => setPreventSleep(!preventSleep)} />}
        />

        {/* VSYNC */}
        <SettingCard 
          icon={<Play size={20} className="text-green-500" />}
          title="VSync Mode"
          subtitle="Synchronize output with display refresh rate to prevent tearing."
          control={
            <select 
              value={vsync} 
              onChange={(e) => setVsync(e.target.value)}
              className="bg-[var(--surface-elevated)] border-none rounded-lg px-4 py-2 text-xs font-bold text-[var(--text-100)] focus:ring-2 focus:ring-[var(--accent-blue)]"
            >
              <option>Default</option>
              <option>VSync ON</option>
              <option>VSync OFF</option>
            </select>
          }
        />

        {/* RENDERING */}
        <SettingCard 
          icon={<Cpu size={20} className="text-purple-500" />}
          title="Rendering Engine"
          subtitle="Choose graphics engine for output rendering based on hardware capabilities."
          control={
             <div className="flex flex-col gap-4">
                {['Canvas', 'WebGL', 'GPU Accelerated'].map(r => (
                   <label 
                     key={r} 
                     className="flex items-center gap-3 cursor-pointer group"
                   >
                      <MacOSRadio 
                        checked={rendering === r} 
                        onChange={() => setRenderingMode(r)} 
                      />
                      <span className={`text-[11px] font-bold transition-colors ${rendering === r ? 'text-[var(--text-100)]' : 'text-[var(--text-400)] group-hover:text-[var(--text-200)]'}`}>
                        {r}
                      </span>
                   </label>
                ))}
             </div>
          }
        />

        {/* SCALING */}
        <SettingCard 
          icon={<Maximize size={20} className="text-orange-500" />}
          title="Output Scale"
          subtitle="Adjust scaling for low-resolution projectors or overscan."
          status={`Current: ${scale.toFixed(2)}x`}
          control={
            <div className="w-48 flex items-center gap-4">
               <input 
                 type="range" 
                 min="0.5" 
                 max="2.0" 
                 step="0.05" 
                 value={scale} 
                 onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setScale(val);
                    if ((window as any).electron?.ipcRenderer) {
                       (window as any).electron.ipcRenderer.invoke('display-set-scale', val);
                    }
                 }}
                 className="flex-1 accent-[var(--accent-blue)]"
               />
            </div>
          }
        />

        {/* COLOR SPACE */}
        <SettingCard 
          icon={<Palette size={20} className="text-pink-500" />}
          title="Color Mode"
          subtitle="Choose color profile for projector compatibility."
          control={
            <select className="bg-[var(--surface-elevated)] border-none rounded-lg px-4 py-2 text-xs font-bold text-[var(--text-100)]">
              <option>sRGB</option>
              <option>Rec.709</option>
              <option>High Contrast</option>
            </select>
          }
        />

        <div className="pt-12">
           <button 
             onClick={() => showToast('Display settings reset to default', 'success')}
             className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 px-4 py-3 rounded-xl transition-all"
           >
              <Trash2 size={16} />
              Reset All Display Settings
           </button>
        </div>
      </div>
    </div>
  );
}

function SettingCard({ icon, title, subtitle, status, control }: { icon: any, title: string, subtitle: string, status?: string, control: any }) {
  return (
    <div className="bg-[var(--surface-primary)] rounded-2xl p-6 border border-[var(--border-default)] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all flex items-center justify-between group">
       <div className="flex items-center gap-6">
          <div className="p-3 bg-[var(--surface-elevated)] rounded-xl group-hover:bg-[var(--surface-base)] transition-all">
             {icon}
          </div>
          <div className="flex flex-col">
             <h3 className="text-sm font-black text-[var(--text-100)] leading-none mb-1.5">{title}</h3>
             <p className="text-xs text-[var(--text-400)] leading-relaxed">{subtitle}</p>
             {status && <span className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-widest mt-2">{status}</span>}
          </div>
       </div>
       <div className="ml-8 shrink-0">
          {control}
       </div>
    </div>
  );
}

function Toggle({ active, onToggle }: { active: boolean, onToggle: () => void }) {
  return (
    <div 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${active ? 'bg-[var(--accent-blue)]' : 'bg-[var(--text-600)]'}`}
    >
       <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${active ? 'left-7' : 'left-1'}`} />
    </div>
  );
}

function MacOSRadio({ checked, onChange }: { checked: boolean, onChange: () => void }) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`
        relative flex items-center justify-center
        w-[18px] h-[18px] rounded-full cursor-pointer transition-all
        ${checked ? "border-[2px] border-[var(--accent-blue)] bg-white" : "border-[2px] border-[var(--text-600)] bg-[var(--surface-elevated)]"}
        hover:scale-105 hover:shadow-[0_0_6px_rgba(45,131,255,0.25)]
        focus:outline-none focus:ring-[3px] focus:ring-[rgba(45,131,255,0.35)]
      `}
    >
      {checked && (
        <div
          className="
            w-[10px] h-[10px] rounded-full
            bg-[var(--accent-blue)]
            shadow-[0_0_4px_rgba(45,131,255,0.6)]
            bg-gradient-to-b from-[#4D9BFF] to-[var(--accent-blue)]
          "
        />
      )}
    </div>
  );
}
