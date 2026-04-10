import React from 'react';
import { AppShell } from '../components/layout/AppShell';
import { SidebarServiceOrder } from '../components/production/SidebarServiceOrder';
import { SlideGrid } from '../components/production/SlideGrid';
import { LiveControlPanel } from '../components/live/LiveControlPanel';

export function Presentation() {
  return (
    <AppShell>
      {/* 3-Column Display for Production */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Service Order */}
        <SidebarServiceOrder />
        
        {/* Center: Slide Grid */}
        <SlideGrid />
        
        {/* Right: Live Output Control */}
        <LiveControlPanel />
      </div>
    </AppShell>
  );
}
