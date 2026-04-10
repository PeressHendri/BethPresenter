import { create } from 'zustand';

export interface MediaItem {
  id: string;
  filename: string;
  filepath: string;
  type: 'image' | 'video';
  thumbnail?: string;
  createdAt: string;
  size?: string;
  resolution?: string;
  duration?: string;
}

interface MediaState {
  media: MediaItem[];
  isLoading: boolean;
  filter: 'all' | 'image' | 'video';
  searchQuery: string;
  sortBy: 'newest' | 'oldest' | 'name';
  
  // Actions
  fetchMedia: () => Promise<void>;
  addMedia: (media: MediaItem[]) => void;
  removeMedia: (id: string) => Promise<void>;
  setFilter: (filter: 'all' | 'image' | 'video') => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'newest' | 'oldest' | 'name') => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  media: [],
  isLoading: false,
  filter: 'all',
  searchQuery: '',
  sortBy: 'newest',

  fetchMedia: async () => {
    set({ isLoading: true });
    try {
      if ((window as any).electron?.ipcRenderer) {
        const res = await (window as any).electron.ipcRenderer.invoke('media-library-load');
        if (res.success) {
          set({ media: res.media });
        }
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addMedia: (newMedia) => set((state) => ({ media: [...newMedia, ...state.media] })),

  removeMedia: async (id) => {
    try {
      if ((window as any).electron?.ipcRenderer) {
        const res = await (window as any).electron.ipcRenderer.invoke('media-delete', id);
        if (res.success) {
          set((state) => ({ media: state.media.filter(m => m.id !== id) }));
        }
      }
    } catch (err) {
      console.error('Failed to delete media:', err);
    }
  },

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
}));
