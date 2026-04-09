import { create } from 'zustand';

export type ThemeId = 'dark' | 'light' | 'youthbeth';

const STORAGE_KEY = 'bethpresenter.theme';

function applyTheme(theme: ThemeId) {
  document.documentElement.dataset.theme = theme;
}

function loadInitialTheme(): ThemeId {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark' || saved === 'light' || saved === 'youthbeth') return saved;
  return 'light';
}

interface ThemeState {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  init: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
  init: () => {
    const theme = loadInitialTheme();
    applyTheme(theme);
    set({ theme });
  },
}));

