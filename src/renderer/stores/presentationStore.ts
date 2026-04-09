import { create } from 'zustand';
import { Presentation, SlideData } from '@/shared/types';

interface PresentationState {
  currentItems: any[];
  activeItemIndex: number;
  activeSlideIndex: number;

  presentations: Presentation[];
  loadingPresentations: boolean;

  isLive: boolean;
  isRehearsal: boolean;
  isBlank: boolean;
  isHideText: boolean;
  toggleRehearsal: () => void;
  
  remoteClientCount: number;
  setRemoteClientCount: (count: number) => void;
  endLive: () => void;
  
  addItem: (item: any) => void;
  removeItem: (index: number) => void;
  reorderItems: (items: any[]) => void;

  addCustom: (text: string) => void;
  addBlank: () => void;
  clearAll: () => void;
  
  fetchPresentations: () => Promise<void>;
  savePresentation: (name: string) => Promise<Presentation>;
  loadPresentation: (presentationId: string) => Promise<void>;

  openOutput: () => Promise<boolean>;
  toggleBlank: () => Promise<boolean>;
  toggleHideText: () => Promise<boolean>;
  toggleFullscreen: () => Promise<boolean>;

  goLive: (itemIndex: number, slideIndex: number) => Promise<void>;
  nextSlide: () => void;
  prevSlide: () => void;
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  currentItems: [],
  activeItemIndex: -1,
  activeSlideIndex: -1,
  presentations: [],
  loadingPresentations: false,
  isLive: false,
  isRehearsal: false,
  isBlank: false,
  isHideText: false,
  remoteClientCount: 0,

  toggleRehearsal: () => set((state) => ({ isRehearsal: !state.isRehearsal })),
  setRemoteClientCount: (count) => set({ remoteClientCount: count }),
  endLive: () => {
    (window as any).electron.ipcRenderer.invoke('output:control', 'set-blank'); // Optionally clear screen
    (window as any).electron.ipcRenderer.invoke('app:set-live-state', false);
    set({ isLive: false, activeItemIndex: -1, activeSlideIndex: -1 });
  },

  addItem: (item) => set((state) => ({ currentItems: [...state.currentItems, item] })),
  removeItem: (index) => set((state) => ({ 
    currentItems: state.currentItems.filter((_, i) => i !== index) 
  })),
  reorderItems: (items) => set({ currentItems: items }),

  addCustom: (text) =>
    set((state) => ({
      currentItems: [
        ...state.currentItems,
        {
          id: crypto.randomUUID(),
          type: 'custom',
          title: 'Custom',
          content: text,
        },
      ],
    })),

  addBlank: () =>
    set((state) => ({
      currentItems: [
        ...state.currentItems,
        {
          id: crypto.randomUUID(),
          type: 'blank',
          title: 'Blank Screen',
        },
      ],
    })),

  clearAll: () => set({ currentItems: [], activeItemIndex: -1, activeSlideIndex: -1 }),

  fetchPresentations: async () => {
    set({ loadingPresentations: true });
    try {
      const presentations = await (window as any).electron.ipcRenderer.invoke('presentation:getAll');
      set({ presentations, loadingPresentations: false });
    } catch (e) {
      console.error('Failed to fetch presentations:', e);
      set({ loadingPresentations: false });
    }
  },

  savePresentation: async (name) => {
    const { currentItems } = get();
    const saved = await (window as any).electron.ipcRenderer.invoke('presentation:save', {
      name,
      items: currentItems.map((i) => ({
        type: i.type,
        songId: i.songId,
        content: i.content,
      })),
    });
    // Refresh list after save
    await get().fetchPresentations();
    return saved;
  },

  loadPresentation: async (presentationId) => {
    const { presentations } = get();
    const p = presentations.find((x) => x.id === presentationId);
    if (!p) return;
    // Items returned from IPC already include song objects inside p.items
    const items = (p.items || []).map((it) => ({
      id: crypto.randomUUID(),
      type: it.type,
      songId: it.songId,
      song: it.song,
      content: it.content,
      title: it.type === 'blank' ? 'Blank Screen' : it.type === 'custom' ? 'Custom' : it.song?.title,
    }));
    set({ currentItems: items, activeItemIndex: items.length ? 0 : -1, activeSlideIndex: items.length ? 0 : -1 });
  },

  openOutput: async () => {
    return await (window as any).electron.ipcRenderer.invoke('output:open');
  },

  toggleBlank: async () => {
    const result = await (window as any).electron.ipcRenderer.invoke('output:control', 'toggle-blank');
    set((state) => ({ isBlank: !state.isBlank }));
    return result;
  },

  toggleHideText: async () => {
    const result = await (window as any).electron.ipcRenderer.invoke('output:control', 'toggle-hide');
    set((state) => ({ isHideText: !state.isHideText }));
    return result;
  },

  toggleFullscreen: async () => {
    return await (window as any).electron.ipcRenderer.invoke('output:toggle-fullscreen');
  },

  goLive: async (itemIndex, slideIndex) => {
    const { currentItems } = get();
    const item = currentItems[itemIndex];
    if (!item) return;

    let slideData: SlideData;
    
    if (item.type === 'song' && item.song) {
      const lyrics = JSON.parse(item.song.lyricsJson);
      const slide = lyrics[slideIndex];
      slideData = {
        title: item.song.title,
        text: slide.text,
        label: slide.label,
        type: 'song'
      };
    } else if (item.type === 'custom') {
      slideData = {
        title: 'Notice',
        text: item.content || '',
        type: 'custom'
      };
    } else {
      slideData = { title: '', text: '', type: 'blank' };
    }

    if (!get().isRehearsal) {
      set({ isLive: true, activeItemIndex: itemIndex, activeSlideIndex: slideIndex });
      await get().openOutput();
      (window as any).electron.ipcRenderer.invoke('output:send-slide', slideData);
      (window as any).electron.ipcRenderer.invoke('app:set-live-state', true);
    } else {
      set({ activeItemIndex: itemIndex, activeSlideIndex: slideIndex });
    }
  },

  nextSlide: () => {
    const { activeItemIndex, activeSlideIndex, currentItems, goLive } = get();
    const currentItem = currentItems[activeItemIndex];
    
    if (currentItem?.type === 'song' && currentItem.song) {
      const lyrics = JSON.parse(currentItem.song.lyricsJson);
      if (activeSlideIndex < lyrics.length - 1) {
        void goLive(activeItemIndex, activeSlideIndex + 1);
      } else if (activeItemIndex < currentItems.length - 1) {
        void goLive(activeItemIndex + 1, 0);
      }
    } else if (activeItemIndex < currentItems.length - 1) {
      void goLive(activeItemIndex + 1, 0);
    }
  },

  prevSlide: () => {
    const { activeItemIndex, activeSlideIndex, currentItems, goLive } = get();
    
    if (activeSlideIndex > 0) {
      void goLive(activeItemIndex, activeSlideIndex - 1);
    } else if (activeItemIndex > 0) {
      const prevItem = currentItems[activeItemIndex - 1];
      if (prevItem.type === 'song' && prevItem.song) {
        const lyrics = JSON.parse(prevItem.song.lyricsJson);
        void goLive(activeItemIndex - 1, lyrics.length - 1);
      } else {
        void goLive(activeItemIndex - 1, 0);
      }
    }
  }
}));
