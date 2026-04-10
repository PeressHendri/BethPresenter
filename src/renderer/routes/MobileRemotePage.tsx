import React from 'react';
import { DeviceListPanel } from '../components/MobileDeviceList';
import { RemoteControllerPreview } from '../components/MobileRemotePreview';
import { MOCK_REMOTES } from '../data/remote-control-data';
import { Info, Signal } from 'lucide-react';

export function MobileRemotePage({ activeSlide }: { activeSlide: any }) {
  return (
    <div className="flex-1 flex overflow-hidden bg-[#1A1A1A]">
      {/* 1. Device Management Panel */}
      <DeviceListPanel devices={MOCK_REMOTES} />

      {/* 2. Interface Simulator */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <RemoteControllerPreview currentSlide={activeSlide} />

        {/* Global Remote Status */}
        <div className="h-12 px-8 bg-black/40 border-t border-white/5 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <Signal size={14} className="text-[#00E676]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Broadcasting on Port 8080</span>
              </div>
              <div className="flex items-center gap-2">
                 <Info size={14} className="text-[#666]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#666]">Local Network (WiFi) Only</span>
              </div>
           </div>
           <div className="text-[10px] font-black uppercase tracking-widest text-[#444]">
              G-Presenter v2.4 Remote Engine
           </div>
        </div>
      </div>
    </div>
  );
}
