import React, { useEffect, useState, useCallback } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { useThemeStore } from '../stores/themeStore';
import {
  Settings2, Monitor, Download, Upload, Loader2,
  CheckCircle, XCircle, Copy, MonitorPlay,
  Layout, ShieldCheck, Info, Gauge, HardDrive, Smartphone, Server
} from 'lucide-react';

const ipc = (window as any).electron?.ipcRenderer;

type SettingsTab = 'general' | 'display' | 'stage' | 'remote' | 'performance' | 'license' | 'about' | 'backup';

export function Settings() {
  const { theme, setTheme, init } = useThemeStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // ================= GENERAL =================
  const [language, setLanguage] = useState('id');
  const [autoSave, setAutoSave] = useState('30s');
  const [wakeLock, setWakeLock] = useState(true);

  // ================= DISPLAY =================
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('Auto');
  const [opacityOverlay, setOpacityOverlay] = useState(40);
  const [transitionFade, setTransitionFade] = useState('200ms');

  // ================= STAGE =================
  const [stageLayout, setStageLayout] = useState('A');
  const [fontScale, setFontScale] = useState(100);
  const [clockFormat, setClockFormat] = useState('24');
  const [showClock, setShowClock] = useState(true);

  // ================= REMOTE =================
  const [remoteActive, setRemoteActive] = useState(false);
  const [remotePort, setRemotePort] = useState(4321);
  const [remoteInfo, setRemoteInfo] = useState<{ ip: string; url: string; qrDataUrl: string } | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteCopied, setRemoteCopied] = useState(false);

  // ================= BACKUP & IMPORT =================
  const [backupLoading, setBackupLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [backupResult, setBackupResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => { init(); }, [init]);

  // IPC Hooks
  // Broadcast Stage formatting changes
  useEffect(() => {
    ipc?.invoke('config:update', { category: 'stage', key: 'layout', value: stageLayout });
    ipc?.invoke('config:update', { category: 'stage', key: 'fontScale', value: fontScale });
    ipc?.invoke('config:update', { category: 'stage', key: 'clockFormat', value: clockFormat });
  }, [stageLayout, fontScale, clockFormat]);

  // Broadcast General output formats
  useEffect(() => {
    ipc?.invoke('config:update', { category: 'output', key: 'transition', value: transitionFade });
    ipc?.invoke('config:update', { category: 'output', key: 'opacityOverlay', value: opacityOverlay });
    ipc?.invoke('config:update', { category: 'output', key: 'aspectRatio', value: aspectRatio });
  }, [transitionFade, opacityOverlay, aspectRatio]);

  const startRemote = useCallback(async () => {
    setRemoteLoading(true);
    const res = await ipc?.invoke('remote:start', remotePort);
    if (res?.success) {
      setRemoteActive(true);
      setRemoteInfo(await ipc?.invoke('remote:get-info'));
    }
    setRemoteLoading(false);
  }, [remotePort]);

  const stopRemote = useCallback(async () => {
    setRemoteLoading(true);
    await ipc?.invoke('remote:stop');
    setRemoteActive(false);
    setRemoteInfo(null);
    setRemoteLoading(false);
  }, []);

  const openStage = async () => ipc?.invoke('stage:open');
  const closeStage = async () => ipc?.invoke('stage:close');

  const handleExport = async (options: any = {}) => {
    setBackupLoading(true); setBackupResult(null);
    const res = await ipc?.invoke('backup:export', options);
    if (!res?.canceled) {
      setBackupResult(res?.success
        ? { type: 'success', message: `✓ Backup berhasil! ${res.songCount || 0} lagu disimpan.` }
        : { type: 'error', message: `✗ Error: ${res?.error}` }
      );
    }
    setBackupLoading(false);
  };

  const handleImport = async () => {
    setImportLoading(true);
    const res = await ipc?.invoke('backup:import', { overwriteDuplicates: false });
    if (!res?.canceled) {
       // Optional: Display success/toast popup
    }
    setImportLoading(false);
  };

  return (
    <MainLayout>
      <div className="flex h-full min-h-0 bg-surface-base" style={{ height: 'calc(100vh - 2rem)' }}>
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-64 border-r border-border-default bg-surface-sidebar flex flex-col shrink-0 overflow-y-auto hidden md:flex">
           <div className="p-4 pt-6 shrink-0 flex items-center gap-2 text-text-100">
             <Settings2 size={24} className="text-accent-500" />
             <h2 className="text-xl font-bold tracking-wide">Pengaturan</h2>
           </div>

           <nav className="flex-1 px-3 py-2 space-y-1">
             <TabButton tab="general" current={activeTab} set={setActiveTab} label="General" icon={<Settings2 size={16}/>} />
             <TabButton tab="display" current={activeTab} set={setActiveTab} label="Display & Output" icon={<Monitor size={16}/>} />
             <TabButton tab="stage" current={activeTab} set={setActiveTab} label="Stage Display" icon={<Layout size={16}/>} />
             <TabButton tab="remote" current={activeTab} set={setActiveTab} label="Remote Control" icon={<Smartphone size={16}/>} />
             <TabButton tab="backup" current={activeTab} set={setActiveTab} label="Backup & Restore" icon={<HardDrive size={16}/>} />
             <div className="my-2 border-t border-border-strong opacity-50" />
             <TabButton tab="performance" current={activeTab} set={setActiveTab} label="Performance" icon={<Gauge size={16}/>} />
             <TabButton tab="license" current={activeTab} set={setActiveTab} label="License" icon={<ShieldCheck size={16}/>} />
             <TabButton tab="about" current={activeTab} set={setActiveTab} label="About" icon={<Info size={16}/>} />
           </nav>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 relative">
           <div className="max-w-3xl">
              
              {/* TAB: GENERAL */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <h3 className="text-2xl font-bold border-b border-border-default pb-2">General Setting</h3>
                  
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                       <label className="text-sm font-semibold text-text-300">Bahasa UI</label>
                       <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-surface-elevated border border-border-strong rounded-lg p-2 text-sm outline-none focus:border-accent-500 transition-colors">
                         <option value="id">Indonesia</option>
                         <option value="en">English</option>
                       </select>
                     </div>

                     <div className="space-y-2">
                       <label className="text-sm font-semibold text-text-300">Tema Visual</label>
                       <select value={theme} onChange={e => setTheme(e.target.value as any)} className="w-full bg-surface-elevated border border-border-strong rounded-lg p-2 text-sm outline-none focus:border-accent-500 transition-colors">
                         <option value="dark">Dark Theme (Default G-Presenter)</option>
                         <option value="light">Light Theme</option>
                         <option value="youthbeth">YouthBeth Accent</option>
                       </select>
                     </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border-default">
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="font-semibold text-sm">Auto-Save Interval</p>
                         <p className="text-xs text-text-400">Database cadangan untuk Presentasi.</p>
                       </div>
                       <select value={autoSave} onChange={e => setAutoSave(e.target.value)} className="bg-surface-elevated border border-border-strong rounded py-1 px-2 text-sm outline-none">
                          <option value="10s">10 Detik</option>
                          <option value="30s">30 Detik</option>
                          <option value="60s">60 Detik</option>
                          <option value="off">Off (Manual)</option>
                       </select>
                     </div>
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="font-semibold text-sm">Screen Wake Lock</p>
                         <p className="text-xs text-text-400">Pencegahan sistem menidurkan komputer saat ibadah berlangsung.</p>
                       </div>
                       <Toggle on={wakeLock} onClick={() => setWakeLock(!wakeLock)} />
                     </div>
                  </div>
                </div>
              )}

              {/* TAB: DISPLAY */}
              {activeTab === 'display' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <h3 className="text-2xl font-bold border-b border-border-default pb-2">Display & Output</h3>
                  
                  <div className="bg-surface-sidebar border border-border-default rounded-xl p-5 mb-4 space-y-4">
                     <div>
                       <label className="text-sm font-semibold text-text-200">Layar Output Terutama</label>
                       <select className="w-full mt-1 bg-surface-elevated border border-border-strong rounded-lg p-2 text-sm outline-none focus:border-accent-500 transition-colors">
                         <option value="mon1">Display 1 (Primary - 1920x1080)</option>
                         <option value="mon2">Display 2 (Projector HDMI)</option>
                       </select>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-text-400 font-semibold">Aspect Ratio Default</label>
                          <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full bg-surface-elevated border border-border-strong rounded px-2 py-1.5 text-sm outline-none">
                            <option value="16:9">16:9 (Widescreen)</option>
                            <option value="4:3">4:3 (Standard)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-text-400 font-semibold">Resolusi Output Target</label>
                          <select value={resolution} onChange={e => setResolution(e.target.value)} className="w-full bg-surface-elevated border border-border-strong rounded px-2 py-1.5 text-sm outline-none">
                            <option value="Auto">Auto-detect Murni</option>
                            <option value="1920x1080">1920x1080 (FHD)</option>
                            <option value="1280x720">1280x720 (HD)</option>
                          </select>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div>
                       <div className="flex justify-between mb-1 text-sm font-semibold">
                         <span>Background Overlay Dimming</span>
                         <span className="text-accent-500 font-mono">{opacityOverlay}%</span>
                       </div>
                       <input type="range" min="0" max="100" value={opacityOverlay} onChange={e => setOpacityOverlay(+e.target.value)} className="w-full accent-accent-500" />
                       <p className="text-xs text-text-500 mt-1">Kegelapan overlay layar untuk menonjolkan lirik di atas background cerah.</p>
                     </div>

                     <div className="flex items-center justify-between">
                       <span className="font-semibold text-sm">Transisi Default (Slide)</span>
                       <select value={transitionFade} onChange={e => setTransitionFade(e.target.value)} className="bg-surface-elevated border border-border-strong rounded py-1 px-2 text-sm outline-none">
                          <option value="0ms">None</option>
                          <option value="100ms">Fade (100ms)</option>
                          <option value="200ms">Fade Smooth (200ms)</option>
                          <option value="400ms">Fade Cinematic (400ms)</option>
                       </select>
                     </div>
                  </div>
                </div>
              )}

              {/* TAB: STAGE */}
              {activeTab === 'stage' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <h3 className="text-2xl font-bold border-b border-border-default pb-2">Stage Monitor (Musisi)</h3>

                  <div className="flex items-center gap-4 bg-accent-500/10 border border-accent-500 text-accent-500 p-4 rounded-xl">
                     <MonitorPlay size={24} />
                     <p className="text-sm font-semibold">Tampilan spesialis proyektor bawah panggung untuk Worship Leader & Pemain Musik.</p>
                     <div className="ml-auto flex gap-2">
                        <button onClick={openStage} className="px-3 py-1.5 bg-accent-600 text-white rounded text-xs font-bold hover:bg-accent-500 active:scale-95 transition-transform">Test Open</button>
                        <button onClick={closeStage} className="px-3 py-1.5 bg-surface-elevated text-text-200 border border-border-strong rounded text-xs font-bold shadow hover:bg-surface-hover active:scale-95 transition-transform">Close</button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-4">
                     <div className="space-y-2">
                       <label className="text-sm font-semibold">Stage Screen Target</label>
                       <select className="w-full bg-surface-elevated border border-border-strong rounded-lg p-2 text-sm outline-none">
                         <option value="auto">Auto-Windowed / Monitor 3</option>
                       </select>
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-semibold">Layout Struktur Tampilan</label>
                       <select value={stageLayout} onChange={e => setStageLayout(e.target.value)} className="w-full bg-surface-elevated border border-border-strong rounded-lg p-2 text-sm outline-none">
                         <option value="A">Layout A (3 Kolom Horizontal - Lebar)</option>
                         <option value="B">Layout B (2 Baris Atas-Bawah - Tinggi)</option>
                       </select>
                     </div>
                  </div>

                  <div className="pt-4 space-y-4">
                     <div>
                       <div className="flex justify-between mb-1 text-sm font-semibold">
                         <span>Batas Maksimum Scale Font (Skala AutoFit)</span>
                         <span className="text-accent-500 font-mono">{fontScale}%</span>
                       </div>
                       <input type="range" min="80" max="150" value={fontScale} onChange={e => setFontScale(+e.target.value)} className="w-full accent-accent-500" />
                     </div>
                     
                     <div className="flex items-center justify-between border-t border-border-default pt-4">
                       <span className="font-semibold text-sm">Menampilkan Indikator Jam Waktu Jemaat</span>
                       <Toggle on={showClock} onClick={() => setShowClock(!showClock)} />
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="font-semibold text-sm">Format Waktu Mode</span>
                       <select value={clockFormat} onChange={e => setClockFormat(e.target.value)} className="bg-surface-elevated border border-border-strong rounded py-1 px-2 text-sm outline-none">
                          <option value="12">12 Jam (AM/PM)</option>
                          <option value="24">24 Jam</option>
                       </select>
                     </div>
                  </div>
                </div>
              )}

              {/* TAB: REMOTE */}
              {activeTab === 'remote' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <h3 className="text-2xl font-bold border-b border-border-default pb-2 flex items-center justify-between">
                     <span>Mobile Web Remote Control</span>
                     <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow ${remoteActive ? 'bg-green-500 text-white' : 'bg-surface-elevated border border-border-strong text-text-400'}`}>
                        {remoteActive ? 'Running' : 'Stopped'}
                     </span>
                  </h3>

                  <div className="flex items-end gap-3 bottom-0">
                     <div className="flex-1 space-y-1">
                        <label className="text-sm font-semibold text-text-300">Listener Port</label>
                        <input type="number" value={remotePort} onChange={e => setRemotePort(+e.target.value)} disabled={remoteActive} className="w-full bg-surface-sidebar border border-border-strong rounded-lg p-2 outline-none disabled:opacity-50" />
                     </div>
                     <button 
                        onClick={remoteActive ? stopRemote : startRemote}
                        disabled={remoteLoading}
                        className={`px-6 py-2 rounded-lg font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2 ${remoteActive ? 'bg-danger-500 text-white' : 'bg-accent-600 text-white'}`}
                     >
                        {remoteLoading ? <Loader2 size={16} className="animate-spin" /> : <Server size={16} />}
                        {remoteActive ? 'Hentikan Server' : 'Nyalakan Remote'}
                     </button>
                  </div>

                  {remoteActive && remoteInfo && (
                     <Card className="p-4 bg-surface-sidebar border-accent-500/20 ring-1 ring-accent-500/20 shadow-xl flex gap-6">
                        <div className="shrink-0 flex flex-col items-center gap-2">
                           <div className="p-2 bg-white rounded-lg opacity-90 hover:opacity-100 transition-opacity">
                              <img src={remoteInfo.qrDataUrl} alt="QR Code" className="w-[140px] h-[140px] mix-blend-multiply" />
                           </div>
                           <p className="text-xs uppercase font-bold tracking-widest text-text-400 mt-1">Pindai dari HP</p>
                        </div>
                        <div className="flex-1 flex flex-col justify-center gap-3">
                           <div>
                              <p className="text-xs text-text-400 uppercase font-semibold tracking-wider mb-1">Alamat Akses Remote Panel:</p>
                              <div className="flex items-center bg-surface-base border border-border-strong rounded px-3 py-2">
                                 <span className="font-mono text-accent-500 text-sm font-bold flex-1">{remoteInfo.url}</span>
                                 <button onClick={() => { navigator.clipboard.writeText(remoteInfo.url); setRemoteCopied(true); setTimeout(() => setRemoteCopied(false), 2000); }} className="text-text-500 hover:text-white transition-colors">
                                    <Copy size={16} className={remoteCopied ? 'text-green-400' : ''} />
                                 </button>
                              </div>
                           </div>
                           <p className="text-xs text-text-400 bg-surface-elevated p-2 rounded border border-border-default shadow-inner">
                              Perangkat yang memindai QR (Ponsel/Tablet) harus berada di dalam jaringan <b>WLAN/Wi-Fi yang sama</b> dengan Operator Komputer agar jalur sinyal tercapai. Mendukung kontrol Swipe Sentuh penuh.
                           </p>
                        </div>
                     </Card>
                  )}
                </div>
              )}

              {/* TAB: BACKUP */}
              {activeTab === 'backup' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <h3 className="text-2xl font-bold border-b border-border-default pb-2">Manajemen Direktori Backup</h3>

                  <div className="grid grid-cols-2 gap-4">
                     <Card className="p-5 flex flex-col items-center justify-center gap-3 bg-surface-sidebar hover:border-accent-500/50 transition-colors border border-border-strong">
                        <Download size={32} className="text-text-400" />
                        <h4 className="font-bold">Eksport Sistem Penuh</h4>
                        <p className="text-xs text-center text-text-400">Arsipkan seluruh Lagu, Preset, Latar Belakang dan Layout Anda ke file persinggahan `.zip` yang mudah dipindahkan antar Laptop.</p>
                        <button onClick={() => handleExport()} disabled={backupLoading} className="mt-2 w-full px-4 py-2 bg-accent-600 hover:bg-accent-500 active:scale-95 text-white font-bold text-sm rounded shadow flex items-center justify-center transition">
                           {backupLoading ? <Loader2 size={16} className="animate-spin" /> : 'Mulai Export .ZIP'}
                        </button>
                     </Card>
                     <Card className="p-5 flex flex-col items-center justify-center gap-3 bg-surface-sidebar hover:border-amber-500/50 transition-colors border border-border-strong">
                        <Upload size={32} className="text-text-400" />
                        <h4 className="font-bold">Restore Backup (Impor)</h4>
                        <p className="text-xs text-center text-text-400">Pulihkan arsip .zip sistem BethPresenter menimpa state kosong. Pastikan mencadangkan terlebih dahulu sebelum melakukan penimpaan.</p>
                        <button onClick={handleImport} disabled={importLoading} className="mt-2 w-full px-4 py-2 border border-border-default bg-surface-elevated hover:bg-surface-hover active:scale-95 text-text-100 font-bold text-sm rounded shadow flex items-center justify-center transition">
                           {importLoading ? <Loader2 size={16} className="animate-spin" /> : 'Pilih File Impor Vault'}
                        </button>
                     </Card>
                  </div>
                  {backupResult && (
                     <div className={`p-4 rounded-xl flex items-center gap-3 shadow-inner ${backupResult.type === 'success' ? 'bg-green-500/10 border border-green-500 text-green-400' : 'bg-red-500/10 border border-red-500 text-red-500'}`}>
                        {backupResult.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        <span className="font-semibold text-sm">{backupResult.message}</span>
                     </div>
                  )}
                </div>
              )}

              {/* TAB: PERFORMANCE */}
              {activeTab === 'performance' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <h3 className="text-2xl font-bold border-b border-border-default pb-2">Hardware & Performance</h3>
                  
                  <div className="space-y-4">
                     <div className="flex items-center justify-between bg-surface-sidebar p-4 rounded border border-border-default">
                       <div>
                         <p className="font-bold text-sm">GPU Rendering Acceleration</p>
                         <p className="text-xs text-text-400">Paksa transisi HTML canvas digambar menggunakan Hardware Khusus.</p>
                       </div>
                       <Toggle on={true} onClick={() => {}} />
                     </div>

                     <div className="flex items-center justify-between">
                       <span className="font-semibold text-sm">Video Thumbnail Decode Quality</span>
                       <select className="bg-surface-elevated border border-border-strong rounded py-1 px-2 text-sm outline-none">
                          <option>Low (Irit RAM)</option>
                          <option selected>Medium (Standard)</option>
                          <option>High (Frame Akurat)</option>
                       </select>
                     </div>

                     <div className="border-t border-border-default pt-4 space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-text-400">Database Engine</h4>
                        <div className="flex items-center justify-between bg-surface-elevated p-3 rounded border border-border-strong">
                           <span className="text-xs font-mono font-semibold">SQLITE DATA SIZE</span>
                           <span className="text-xs bg-surface-hover text-accent-400 px-2 flex inline-block rounded font-bold">12.4 MB</span>
                        </div>
                        <div className="flex items-center justify-between bg-surface-elevated p-3 rounded border border-border-strong">
                           <span className="text-xs font-mono font-semibold">PREVIEW IMAGE CACHE (.WEBP, .THUMB)</span>
                           <div className="flex gap-4 items-center">
                              <span className="text-xs text-text-300 px-2 flex inline-block rounded font-bold border border-border-default">184.2 MB</span>
                              <button className="text-xs font-bold text-danger-400 hover:text-danger-300 transition-colors">Clear Cache...</button>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {/* TAB: LICENSE */}
              {activeTab === 'license' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <h3 className="text-2xl font-bold border-b border-border-default pb-2">Otorisasi Hak Cipta & Lisensi</h3>
                  
                  <Card className="p-6 bg-gradient-to-br from-surface-sidebar to-surface-base border-accent-500/20 ring-1 ring-inset ring-accent-500/10">
                     <div className="flex items-start justify-between">
                        <div>
                           <h4 className="text-3xl font-extrabold text-accent-500 tracking-tight">BethPresenter PRO</h4>
                           <span className="px-2 py-0.5 bg-green-500/20 text-green-400 uppercase text-[10px] font-black rounded tracking-widest mt-1 inline-block border border-green-500/40">Registered Permanent</span>
                        </div>
                        <ShieldCheck size={40} className="text-accent-500 opacity-60" />
                     </div>

                     <div className="mt-8 space-y-4">
                        <div>
                           <p className="text-[10px] font-bold tracking-widest uppercase text-text-500 mb-1">Identifikasi Mac/PC Anda (HWID)</p>
                           <input type="text" readOnly value="MAC-BETH-8F4A-219C-DD0B" className="w-full bg-surface-elevated border border-border-strong rounded px-3 py-2 text-sm font-mono tracking-widest text-text-100 outline-none" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold tracking-widest uppercase text-text-500 mb-1">Registrasi Token</p>
                           <input type="password" value="*****************************************" readOnly className="w-full bg-surface-elevated border border-border-strong rounded px-3 py-2 text-sm font-mono tracking-widest text-text-100 outline-none" />
                        </div>
                     </div>
                  </Card>
                </div>
              )}

              {/* TAB: ABOUT */}
              {activeTab === 'about' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-300 flex flex-col items-center">
                  
                  <div className="mt-10 flex flex-col items-center text-center">
                     <div className="w-24 h-24 bg-gradient-to-br from-accent-500 to-accent-700 rounded-2xl shadow-2xl shadow-accent-500/40 flex flex-col items-center justify-center p-3 text-white mb-6 animate-pulse">
                        <MonitorPlay size={40} />
                     </div>
                     <h2 className="text-3xl font-black tracking-tight mb-1">BethPresenter</h2>
                     <p className="text-accent-400 font-bold uppercase tracking-[0.2em] text-sm">Versi 1.4.2 — Built for Worship</p>
                  </div>

                  <div className="w-full max-w-sm space-y-2 mt-4">
                     <div className="flex justify-between items-center px-4 py-2 bg-surface-sidebar border border-border-default shadow-inner rounded-lg text-sm">
                        <span className="text-text-400">Node JS Engine</span>
                        <span className="font-mono text-text-200 font-bold">v18.17.0</span>
                     </div>
                     <div className="flex justify-between items-center px-4 py-2 bg-surface-sidebar border border-border-default shadow-inner rounded-lg text-sm">
                        <span className="text-text-400">Chromium V8</span>
                        <span className="font-mono text-text-200 font-bold">116.0.5845.188</span>
                     </div>
                     <div className="flex justify-between items-center px-4 py-2 bg-surface-sidebar border border-border-default shadow-inner rounded-lg text-sm">
                        <span className="text-text-400">Electron Native Wrapper</span>
                        <span className="font-mono text-text-200 font-bold">x64 26.2.2</span>
                     </div>
                  </div>

                  <div className="flex gap-4 mt-4">
                     <button className="px-5 py-2.5 bg-accent-600 text-white font-bold rounded-xl shadow-lg shadow-accent-500/20 active:scale-95 transition-transform text-sm">Periksa Pembaruan Sistem</button>
                     <button className="px-5 py-2.5 border border-border-default text-text-300 hover:bg-surface-hover hover:text-text-100 font-bold rounded-xl shadow active:scale-95 transition-colors text-sm">Panduan Wiki Online</button>
                  </div>
                  
                  <p className="text-xs text-text-500 mt-10">© 2026 Developer System BethAsuhan Team.</p>
                </div>
              )}

           </div>
        </div>

      </div>
    </MainLayout>
  );
}

function TabButton({ tab, current, set, label, icon }: any) {
  const active = tab === current;
  return (
    <button
      onClick={() => set(tab)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all focus:outline-none ${
         active 
           ? 'bg-accent-600/10 text-accent-500 font-bold shadow shadow-accent-500/5' 
           : 'text-text-300 font-medium hover:bg-surface-hover hover:text-text-100'
      }`}
    >
      <span className={active ? 'opacity-100' : 'opacity-70'}>{icon}</span>
      {label}
      {active && <span className="ml-auto w-1 h-3 bg-accent-500 rounded-full" />}
    </button>
  );
}

// Minimal Toggle Reusable component mapping
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
   return (
      <button 
         onClick={onClick}
         className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${on ? 'bg-accent-500/80 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-surface-sidebar border border-border-strong'}`}
      >
         <span className={`absolute top-0.5 left-0.5 aspect-square h-4 rounded-full bg-white transition-transform ${on ? 'translate-x-5 shadow-lg' : 'translate-x-0 bg-text-400'}`} />
      </button>
   );
}
