import React, { useState } from 'react';
import { ProjectSidebarNavigator } from '../components/ProjectSidebarNavigator';
import { ProjectGrid, ProjectPreviewPanel } from '../components/ProjectManagerPanels';
import { MOCK_PROJECTS } from '../data/project-manager-data';

export function ProjectManagerPage() {
  const [activeProjectId, setActiveProjectId] = useState('p1');
  const activeProject = MOCK_PROJECTS.find(p => p.id === activeProjectId) || null;

  return (
    <div className="flex-1 flex overflow-hidden bg-[var(--surface-base)]">
      {/* 1. Repository Navigator */}
      <ProjectSidebarNavigator />

      {/* 2. Asset Gallery */}
      <ProjectGrid 
        projects={MOCK_PROJECTS} 
        activeId={activeProjectId} 
        onSelect={setActiveProjectId} 
      />

      {/* 3. Blueprint Inspector */}
      <ProjectPreviewPanel project={activeProject} />
    </div>
  );
}
