import React from 'react';
import { Smartphone, Tablet, Shield, Info, QrCode, Power } from 'lucide-react';

export function DeviceListPanel({ devices }: { devices: any[] }) {
  return (
    <div className="w-[440px] bg-[#1A1A1A] border-r border-[#333] flex flex-col shrink-0">
      <div className="p-8 pb-4">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Remote Control</h2>
        <p className="text-[10px] text-[#666] uppercase tracking-[0.2em] mt-1">Connected phones and tablets.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {devices.map((device) => (
          <div key={device.id} className="bg-[#212121] border border-[#333] rounded-2xl overflow-hidden shadow-xl">
             <div className="p-5 flex items-start justify-between bg-black/10">
                <div className="flex gap-4">
                   <div className={`p-3 rounded-xl ${device.status === 'connected' ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-[#FFC400]/10 text-[#FFC400]'}`}>
                      {device.type === 'phone' ? <Smartphone size={24} /> : <Tablet size={24} />}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-black text-white">{device.name}</span>
                      <span className="text-[9px] font-black uppercase text-[#666] tracking-widest mt-1">{device.ip}</span>
                      <div className="flex items-center gap-2 mt-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'connected' ? 'bg-[#00E676] animate-pulse' : 'bg-[#FFC400]'}`} />
                         <span className={`text-[10px] font-bold uppercase ${device.status === 'connected' ? 'text-[#00E676]' : 'text-[#FFC400]'}`}>{device.status}</span>
                      </div>
                   </div>
                </div>
                <div className="flex gap-2">
                   {device.status === 'pending' && <button className="px-3 py-1.5 bg-[#00E676] text-black text-[10px] font-black rounded uppercase">Allow</button>}
                   <button className="p-2 text-[#444] hover:text-red-500 transition-colors"><Power size={18} /></button>
                </div>
             </div>

             <div className="p-5 border-t border-white/5 space-y-3">
                <PermissionToggle label="Can Control Slides" active={device.permissions.canControl} />
                <PermissionToggle label="Can View Lyrics" active={device.permissions.canViewLyrics} />
                <PermissionToggle label="See Next Slide" active={device.permissions.canSeeNext} />
             </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-[#1A1A1A] border-t border-[#333]">
         <button className="w-full h-14 bg-[#232323] border border-[#333] rounded-xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:border-[#00E676] transition-all group">
            <QrCode className="text-[#666] group-hover:text-[#00E676]" />
            Generate Pairing Code
         </button>
      </div>
    </div>
  );
}

function PermissionToggle({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-[10px] font-bold text-[#888] uppercase tracking-wide">{label}</span>
       <div className={`w-8 h-4 rounded-full relative transition-all cursor-pointer ${active ? 'bg-[#00E676]' : 'bg-white/5 border border-white/10'}`}>
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${active ? 'left-4.5' : 'left-0.5 opacity-40'}`} />
       </div>
    </div>
  );
}
