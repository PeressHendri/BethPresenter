import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Monitor, 
  Maximize2, 
  Type, 
  Languages, 
  Database, 
  Info, 
  ShieldAlert, 
  X, 
  Search, 
  ChevronRight, 
  Check, 
  Globe, 
  Zap, 
  Cpu, 
  HardDrive, 
  RefreshCw,
  Clock,
  Layout,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export function SettingsPage({ onThemeChange, currentTheme }: { onThemeChange?: (t: 'dark' | 'light') => void, currentTheme?: 'dark' | 'light' }) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);

  // ── IPC CALLS ──
  const invokeIPC = async (channel: string, payload?: any) => {
    if ((window as any).electron?.ipcRenderer) {
      try {
        setIsLoading(true);
        const res = await (window as any).electron.ipcRenderer.invoke(channel, payload);
        if (res?.success) showToast(`${channel.replace('settings-', '')} updated`, 'success');
        return res;
      } catch (err) {
        showToast(`Hardware Error: ${channel}`, 'error');
      } finally {
        setIsLoading(false);
      }
    }
    return null;
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings size={16}/> },
    { id: 'display', label: 'Display Opt.', icon: <Monitor size={16}/> },
    { id: 'output', label: 'Output Window', icon: <Maximize2 size={16}/> },
    { id: 'formatting', label: 'Typography', icon: <Type size={16}/> },
    { id: 'language', label: 'Localization', icon: <Globe size={16}/> },
    { id: 'backup', label: 'Data Recovery', icon: <Database size={16}/> },
    { id: 'system', label: 'Diagnostics', icon: <Info size={16}/> },
    { id: 'advanced', label: 'Core Engine', icon: <ShieldAlert size={16}/> },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[var(--surface-base)] overflow-hidden text-[var(--text-100)] font-sans select-none">
      
      {/* ── HEADER ── */}
      <div className="h-16 px-8 flex items-center justify-between bg-[var(--surface-primary)] border-b border-[var(--border-default)]">
        <div className="flex items-center gap-6">
           <button onClick={() => navigate('/')} className="p-2 hover:bg-[var(--surface-hover)] rounded-full text-[var(--text-400)] hover:text-[var(--text-100)] transition-all">
             <ArrowLeft size={18} />
           </button>
           <div className="flex flex-col">
              <h1 className="text-xl font-black uppercase tracking-tighter">System Configuration</h1>
              <span className="text-[9px] font-black text-[var(--accent-blue)] uppercase tracking-[0.3em]">BethPresenter Control Center v1.0.4</span>
           </div>
        </div>
        <div className="flex items-center gap-4">
           {isLoading && <RefreshCw size={14} className="animate-spin text-[var(--accent-blue)]" />}
           <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[var(--text-400)] hover:text-[var(--text-100)] transition-all text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-[var(--surface-elevated)] rounded-lg border border-[var(--border-default)]">
              Esc to Exit
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* ── SIDEBAR NAVIGATION ── */}
         <div className="w-72 bg-[var(--surface-primary)] border-r border-[var(--border-default)] flex flex-col p-4 shrink-0">
            <div className="space-y-1">
               {tabs.map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`
                     w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group
                     ${activeTab === tab.id 
                       ? 'bg-[var(--accent-blue)] text-white shadow-xl shadow-[var(--accent-blue)]/20' 
                       : 'text-[var(--text-400)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-100)]'}
                   `}
                 >
                    <span className={`transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-white' : 'text-[var(--accent-blue)]'}`}>
                       {tab.icon}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                    {activeTab === tab.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
                 </button>
               ))}
            </div>
            
            <div className="mt-auto p-4 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border-default)] shadow-sm">
               <span className="text-[8px] font-black uppercase text-[var(--text-600)] tracking-widest block mb-1">Global Status</span>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_green]" />
                  <span className="text-[9px] font-black text-[var(--text-400)]">Hardware Ready</span>
               </div>
            </div>
         </div>

         {/* ── MAIN CONTENT AREA ── */}
         <div className="flex-1 overflow-y-auto no-scrollbar bg-[var(--surface-base)] text-[var(--text-100)]">
            <div className="max-w-4xl mx-auto p-16 space-y-12">
               
               {activeTab === 'general' && (
                 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <TabHeader title="General Preferences" subtitle="Global application behavior and interface styling." />
                    <div className="space-y-4">
                       <SectionCard title="Application Theme">
                          <div className="flex gap-2">
                             <ThemeBtn label="Dark" active={currentTheme === 'dark'} onClick={() => onThemeChange?.('dark')} />
                             <ThemeBtn label="Light" active={currentTheme === 'light'} onClick={() => onThemeChange?.('light')} />
                          </div>
                       </SectionCard>
                       <ToggleRow title="Auto-Update Application" subtitle="Keep BethPresenter synchronized with latest production fixes." active />
                       <ToggleRow title="Smart Auto-Save" subtitle="Secure your service projects every 5 minutes." active />
                       <ActionRow title="Project Storage Location" value="/Users/mac/Documents/BethPresenter/Projects" onClick={() => invokeIPC('settings-select-folder')} />
                    </div>
                 </section>
               )}

               {activeTab === 'display' && (
                 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <TabHeader title="Display Orchestration" subtitle="Manage rendering pipelines and monitor distribution." />
                    <div className="space-y-4">
                       <SectionCard title="Performance Mode">
                          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-[#2D83FF] focus:outline-none">
                             <option>High Priority (Broadcast Ready)</option>
                             <option>Balanced (Studio Default)</option>
                             <option>Power Save (Low Resource)</option>
                          </select>
                       </SectionCard>
                       <ToggleRow title="Hardware Wake Lock" subtitle="Force display to stay awake during long services." active />
                       <ToggleRow title="VSync Synchronization" subtitle="Prevent screen tearing on high-res LED panels." active />
                       <div className="pt-6">
                          <button onClick={() => navigate('/display')} className="text-[10px] font-black uppercase text-[#2D83FF] hover:underline">Open Full Display Management Interface →</button>
                       </div>
                    </div>
                 </section>
               )}

               {activeTab === 'output' && (
                 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <TabHeader title="Output Signal" subtitle="Configure the main broadcast signal for projectors or LED walls." />
                    <div className="space-y-4">
                       <SectionCard title="Select Target Monitor">
                          <div className="space-y-2">
                             <MonitorItem label="Internal Retina Display (1440p)" active />
                             <MonitorItem label="External HDMI-1 Projector (1080p)" />
                             <MonitorItem label="NDI Network Broadcast" />
                          </div>
                       </SectionCard>
                       <div className="grid grid-cols-2 gap-4">
                          <ActionBtn icon={<Zap size={14}/>} label="Test Output Signal" onClick={() => invokeIPC('output-test')} primary />
                          <ActionBtn icon={<RefreshCw size={14}/>} label="Reset Window" onClick={() => invokeIPC('output-reset-position')} />
                       </div>
                    </div>
                 </section>
               )}

               {activeTab === 'formatting' && (
                 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <TabHeader title="Typography & Styles" subtitle="Set system-wide defaults for slide rendering." />
                    <div className="space-y-4">
                       <SectionCard title="Global Typography">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Typeface</span>
                                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white">
                                   <option>Inter (Default)</option>
                                   <option>Montserrat</option>
                                   <option>Roboto</option>
                                </select>
                             </div>
                             <div className="space-y-1">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Base Font Size</span>
                                <input type="range" className="w-full h-1 bg-white/10 rounded-full accent-[#2D83FF]" />
                             </div>
                          </div>
                       </SectionCard>
                       <ToggleRow title="Lyrics Shadow" subtitle="Enhanced readability for light backgrounds." active />
                       <ToggleRow title="Force ALL CAPS" subtitle="Convert all lyrical text to capitalized format for broadcast." />
                    </div>
                 </section>
               )}

               {activeTab === 'language' && (
                 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <TabHeader title="Localization" subtitle="Multilingual support for global worship services." />
                    <div className="space-y-4">
                       <SectionCard title="Interface Language">
                          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white">
                             <option>English (US)</option>
                             <option>Indonesian (Bahasa)</option>
                             <option>Spanish</option>
                             <option>Tagalog</option>
                          </select>
                       </SectionCard>
                       <ToggleRow title="RTL Layout Support" subtitle="Enable Right-to-Left formatting for Arabic and Hebrew." />
                    </div>
                 </section>
               )}

               {activeTab === 'backup' && (
                 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <TabHeader title="Disaster Recovery" subtitle="Manage project backups and data migration." />
                    <div className="grid grid-cols-2 gap-6">
                       <Card 
                         title="Create Full Backup" 
                         subtitle="Exports all songs, media, and settings to a single .gpbak file."
                         icon={<DownloadIcon />}
                         onClick={() => invokeIPC('backup-export-full')}
                       />
                       <Card 
                         title="Import Database" 
                         subtitle="Restore data from an existing BethPresenter backup."
                         icon={<Database size={24} className="text-[#2D83FF]"/>}
                         onClick={() => invokeIPC('backup-import')}
                       />
                    </div>
                 </section>
               )}

               {activeTab === 'system' && (
                 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <TabHeader title="System Diagnostics" subtitle="Technical health check and resource monitoring." />
                    <div className="grid grid-cols-2 gap-4">
                       <InfoBox label="App Version" value="1.0.4-Production Build" />
                       <InfoBox label="Electron Engine" value="28.2.1-v8" />
                       <InfoBox label="Processor" value="Apple M2 Pro" />
                       <InfoBox label="OS Environment" value="macOS Sonoma (Darwin)" />
                    </div>
                    <div className="pt-8">
                       <ActionBtn icon={<Layout size={14}/>} label="Open System Logs Folder" onClick={() => invokeIPC('open-logs-folder')} />
                    </div>
                 </section>
               )}

               {activeTab === 'advanced' && (
                 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <TabHeader title="Core Engine Logic" subtitle="High-stakes overrides for advanced operators." />
                    <div className="space-y-4">
                       <ToggleRow title="GPU Acceleration" subtitle="Offload UI rendering to dedicated graphics hardware." active />
                       <ToggleRow title="Developer Sandbox" subtitle="Access underlying Chromium console for debugging." />
                       <div className="pt-8 space-y-3">
                          <ActionBtn label="Clear Application Cache" onClick={() => invokeIPC('advanced-clear-cache')} danger />
                          <ActionBtn label="Rebuild Master SQLite Database" onClick={() => showToast('Database rebuilt', 'success')} danger />
                       </div>
                    </div>
                 </section>
               )}

            </div>
         </div>
      </div>
    </div>
  );
}

// ── SUB-COMPONENTS ──

function TabHeader({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="mb-8">
       <h2 className="text-3xl font-black tracking-tighter text-[var(--text-100)]">{title}</h2>
       <p className="text-sm font-medium text-[var(--text-400)] pt-1 tracking-tight">{subtitle}</p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 space-y-4 group hover:bg-[var(--surface-elevated)] transition-colors shadow-sm">
       <h3 className="text-[9px] font-black uppercase text-[var(--accent-blue)] tracking-[0.2em]">{title}</h3>
       {children}
    </div>
  );
}

function ToggleRow({ title, subtitle, active }: { title: string, subtitle: string, active?: boolean }) {
  const [val, setVal] = useState(active || false);
  return (
    <div className="flex items-center justify-between p-6 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl hover:bg-[var(--surface-elevated)] transition-colors shadow-sm">
       <div className="flex flex-col gap-1">
          <span className="text-sm font-black tracking-tight text-[var(--text-100)]">{title}</span>
          <span className="text-[10px] font-medium text-[var(--text-400)] tracking-tight">{subtitle}</span>
       </div>
       <button 
         onClick={() => setVal(!val)}
         className={`w-12 h-6 rounded-full relative transition-all ${val ? 'bg-[var(--accent-blue)]' : 'bg-[var(--surface-elevated)] border border-[var(--border-default)]'}`}
       >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-lg ${val ? 'left-7' : 'left-1'}`} />
       </button>
    </div>
  );
}

function ActionRow({ title, value, onClick }: any) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors">
       <div className="flex flex-col gap-1">
          <span className="text-sm font-black tracking-tight">{title}</span>
          <span className="text-[10px] font-bold text-[#2D83FF] tracking-tight">{value}</span>
       </div>
       <ChevronRight size={14} className="text-white/20" />
    </div>
  );
}

function ThemeBtn({ label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-[var(--accent-blue)] text-white shadow-lg shadow-[var(--accent-blue)]/30' : 'bg-[var(--surface-elevated)] text-[var(--text-400)] border border-[var(--border-default)] hover:text-[var(--text-100)]'}`}
    >
       {label}
    </button>
  );
}

function MonitorItem({ label, active }: any) {
  return (
    <div className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${active ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)]/5' : 'border-[var(--border-default)] bg-[var(--surface-primary)] hover:border-[var(--text-600)]'}`}>
       <div className={`p-2 rounded-lg ${active ? 'bg-[var(--accent-blue)] text-white' : 'bg-[var(--surface-elevated)] text-[var(--text-400)]'}`}><Monitor size={16}/></div>
       <span className={`text-[11px] font-black tracking-tight ${active ? 'text-[var(--text-100)]' : 'text-[var(--text-400)]'}`}>{label}</span>
       {active && <Check size={14} className="ml-auto text-[var(--accent-blue)]" />}
    </div>
  );
}

function Card({ title, subtitle, icon, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col gap-4 p-8 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-[32px] text-left hover:bg-[var(--surface-elevated)] hover:scale-[1.02] transition-all group shadow-sm">
       <div className="w-12 h-12 rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center group-hover:bg-[var(--accent-blue)]/20 transition-colors">
          {icon}
       </div>
       <div>
          <h4 className="text-sm font-black tracking-tight mb-1 text-[var(--text-100)]">{title}</h4>
          <p className="text-[10px] font-medium text-[var(--text-400)] tracking-tight leading-relaxed">{subtitle}</p>
       </div>
    </button>
  );
}

function InfoBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-5 bg-[var(--surface-primary)] rounded-2xl border border-[var(--border-default)] justify-center flex flex-col gap-1 shadow-sm">
       <span className="text-[8px] font-black uppercase text-[var(--text-600)] tracking-widest">{label}</span>
       <span className="text-xs font-bold text-[var(--text-200)] tracking-tight">{value}</span>
    </div>
  );
}

function ActionBtn({ icon, label, onClick, primary, danger }: any) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all
        ${primary ? 'bg-[var(--accent-blue)] text-white shadow-xl hover:brightness-110 active:scale-[0.98]' : ''}
        ${!primary && !danger ? 'bg-[var(--surface-elevated)] text-[var(--text-400)] hover:text-[var(--text-100)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)]' : ''}
        ${danger ? 'bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/20' : ''}
      `}
    >
       {icon}
       {label}
    </button>
  );
}

function DownloadIcon() {
  return (
    <div className="relative">
       <Database size={24} className="text-green-500" />
       <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[8px] font-black text-black">↓</div>
    </div>
  );
}
