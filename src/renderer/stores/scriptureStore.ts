import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScriptureState {
  lastBook: string;
  lastChapter: number;
  lastTranslation: string;
  compareTranslation: string | null;
  viewMode: 'standard' | 'comparison';
  
  // Actions
  setLastPosition: (book: string, chapter: number) => void;
  setTranslation: (trans: string) => void;
  setCompareTranslation: (trans: string | null) => void;
  setViewMode: (mode: 'standard' | 'comparison') => void;
}

export const useScriptureStore = create<ScriptureState>()(
  persist(
    (set) => ({
      lastBook: 'John',
      lastChapter: 1,
      lastTranslation: 'Alkitab TB',
      compareTranslation: 'KJV',
      viewMode: 'standard',

      setLastPosition: (lastBook, lastChapter) => set({ lastBook, lastChapter }),
      setTranslation: (lastTranslation) => set({ lastTranslation }),
      setCompareTranslation: (compareTranslation) => set({ compareTranslation }),
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: 'beth-presenter-scripture-state',
    }
  )
);
