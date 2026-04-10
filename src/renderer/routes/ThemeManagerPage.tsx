import React, { useState } from 'react';
import { ThemeListSidebar } from '../components/ThemeListSidebar';
import { ThemeEditorPanel } from '../components/ThemeEditorPanel';
import { ThemePreviewPanel } from '../components/ThemePreviewPanel';
import { MOCK_THEMES } from '../data/theme-manager-data';

export function ThemeManagerPage() {
  const [activeThemeId, setActiveThemeId] = useState('th1');
  const activeTheme = MOCK_THEMES.find(t => t.id === activeThemeId) || MOCK_THEMES[0];

  return (
    <div className="flex-1 flex overflow-hidden bg-[var(--surface-base)]">
       {/* 1. The Style Repository */}
       <ThemeListSidebar 
         themes={MOCK_THEMES} 
         activeId={activeThemeId}
         onSelect={setActiveThemeId}
       />

       {/* 2. The Dynamic Calibration Deck */}
       <ThemeEditorPanel 
         theme={activeTheme} 
         onChange={() => {}} 
       />

       {/* 3. The Broadcast Mirror */}
       <ThemePreviewPanel 
         theme={activeTheme} 
       />
    </div>
  );
}
