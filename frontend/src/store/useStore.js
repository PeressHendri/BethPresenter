import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSongStore = create(
  persist(
    (set, get) => ({
      songs: [],
      currentSong: null,
      
      // Actions
      addSong: (song) => set((state) => ({ 
        songs: [...state.songs, { ...song, id: Date.now() }] 
      })),
      
      updateSong: (id, updatedSong) => set((state) => ({
        songs: state.songs.map((s) => s.id === id ? { ...s, ...updatedSong } : s)
      })),
      
      deleteSong: (id) => set((state) => ({
        songs: state.songs.filter((s) => s.id !== id)
      })),
      
      setCurrentSong: (song) => set({ currentSong: song }),
    }),
    {
      name: 'beth-songs-storage', // Persist in LocalStorage
    }
  )
);

export const useProjectorStore = create((set) => ({
  activeSlide: { text: '', label: '' },
  isBlackout: false,
  isClearText: false,
  
  // Actions
  showSlide: (slide) => set({ activeSlide: slide, isBlackout: false, isClearText: false }),
  setBlackout: (val) => set({ isBlackout: val }),
  setClearText: (val) => set({ isClearText: val }),
}));
