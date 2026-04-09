/**
 * useShellStore — Global state for AppShell layout
 * Controls sidebar expand/collapse state
 */
import { create } from 'zustand';

const STORAGE_KEY = 'bethpresenter:shell';

interface ShellState {
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (v: boolean) => void;
}

function load(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) !== 'false'; }
  catch { return false; }
}

export const useShellStore = create<ShellState>((set) => ({
  sidebarExpanded: load(),
  toggleSidebar: () =>
    set((s) => {
      const next = !s.sidebarExpanded;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return { sidebarExpanded: next };
    }),
  setSidebarExpanded: (v) => set({ sidebarExpanded: v }),
}));
