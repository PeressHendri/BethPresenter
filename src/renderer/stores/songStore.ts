import { create } from 'zustand';
import { Song } from '@/shared/types';

interface SongState {
  songs: Song[];
  loading: boolean;
  fetchSongs: (search?: string, tag?: string) => Promise<void>;
  createSong: (data: Partial<Song>) => Promise<Song>;
  updateSong: (id: string, data: Partial<Song>) => Promise<Song>;
  deleteSong: (id: string) => Promise<void>;
  duplicateSong: (id: string) => Promise<Song>;
  bulkDeleteSongs: (ids: string[]) => Promise<void>;
}

export const useSongStore = create<SongState>((set) => ({
  songs: [],
  loading: false,
  fetchSongs: async (search, tag) => {
    set({ loading: true });
    try {
      const songs = await (window as any).electron.ipcRenderer.invoke('song:getAll', { search, tag });
      set({ songs, loading: false });
    } catch (error) {
      console.error('Failed to fetch songs:', error);
      set({ loading: false });
    }
  },
  createSong: async (data) => {
    const newSong = await (window as any).electron.ipcRenderer.invoke('song:create', data);
    set((state) => ({ songs: [...state.songs, newSong] }));
    return newSong;
  },
  updateSong: async (id, data) => {
    const updatedSong = await (window as any).electron.ipcRenderer.invoke('song:update', { id, ...data });
    set((state) => ({
      songs: state.songs.map((s) => (s.id === id ? updatedSong : s)),
    }));
    return updatedSong;
  },
  deleteSong: async (id) => {
    await (window as any).electron.ipcRenderer.invoke('song:delete', id);
    set((state) => ({
      songs: state.songs.filter((s) => s.id !== id),
    }));
  },
  duplicateSong: async (id) => {
    const duplicated = await (window as any).electron.ipcRenderer.invoke('song:duplicate', id);
    set((state) => ({
      songs: [...state.songs, duplicated],
    }));
    return duplicated;
  },
  bulkDeleteSongs: async (ids) => {
    await (window as any).electron.ipcRenderer.invoke('song:bulkDelete', ids);
    set((state) => ({
      songs: state.songs.filter((s) => !ids.includes(s.id)),
    }));
  },
}));
