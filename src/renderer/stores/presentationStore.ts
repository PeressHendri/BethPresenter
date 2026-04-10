import { create } from 'zustand';
import { SlideData } from '@/shared/types';

interface PresentationState {
  // Core State
  activeItemIndex: number;
  activeSlideIndex: number;
  activeSlideId: string | number | null;
  currentServiceItem: any | null; 
  currentItems: any[];
  
  isLive: boolean;
  isBlank: boolean;
  isHideText: boolean;
  isRehearsal: boolean;
  remoteClientCount: number;

  // Actions
  setActiveSlide: (itemIndex: number, slideIndex: number) => Promise<void>;
  nextSlide: () => void;
  prevSlide: () => void;
  toggleBlank: () => Promise<void>;
  toggleHideText: () => Promise<void>;
  toggleRehearsal: () => void;
  toggleFullscreen: () => Promise<void>;
  openOutput: () => Promise<void>;
  endLive: () => void;
  
  // High-Level Production Actions
  goLive: (itemIndex: number, slideIndex: number) => Promise<void>;
  reorderItems: (items: any[]) => void;
  addBlank: () => void;
  addCustom: (text: string) => void;
  setRemoteClientCount: (count: number) => void;
  
  // Data Management
  addItem: (item: any) => void;
  removeItem: (index: number) => void;
  setItems: (items: any[]) => void;
  clearAll: () => void;
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  activeItemIndex: -1,
  activeSlideIndex: -1,
  activeSlideId: null,
  currentServiceItem: null,
  currentItems: [],
  
  isLive: false,
  isBlank: false,
  isHideText: false,
  isRehearsal: false,
  remoteClientCount: 0,

  setActiveSlide: async (itemIndex, slideIndex) => {
    const { currentItems, isRehearsal } = get();
    const item = currentItems[itemIndex];
    if (!item) return;

    // Determine Slide ID
    const slideId = `${itemIndex}-${slideIndex}`;
    
    set({ 
      activeItemIndex: itemIndex, 
      activeSlideIndex: slideIndex,
      activeSlideId: slideId,
      currentServiceItem: item
    });

    // Handle Live Logic
    if (!isRehearsal) {
      set({ isLive: true });
      
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
      } else if (item.type === 'scripture') {
        slideData = {
           title: item.title,
           text: item.text,
           label: item.reference,
           type: 'scripture'
        };
      } else if (item.type === 'media') {
        slideData = {
           title: item.title,
           text: '',
           type: 'media',
           url: item.url
        };
      } else if (item.type === 'custom') {
        slideData = {
           title: item.title || 'Custom Slide',
           text: item.content,
           type: 'song' // Render as text
        };
      } else {
        slideData = { title: '', text: '', type: 'blank' };
      }

      try {
        await (window as any).electron.ipcRenderer.invoke('output-open');
        await (window as any).electron.ipcRenderer.invoke('slide-live', slideData);
      } catch (err) {
        console.error('IPC Error in setActiveSlide:', err);
      }
    }
  },

  nextSlide: () => {
    const { activeItemIndex, activeSlideIndex, currentItems, setActiveSlide } = get();
    const currentItem = currentItems[activeItemIndex];
    
    if (!currentItem) {
      if (currentItems.length > 0) void setActiveSlide(0, 0);
      return;
    }

    let slideCount = 1;
    if (currentItem.type === 'song' && currentItem.song) {
      slideCount = JSON.parse(currentItem.song.lyricsJson).length;
    }

    if (activeSlideIndex < slideCount - 1) {
      void setActiveSlide(activeItemIndex, activeSlideIndex + 1);
    } else if (activeItemIndex < currentItems.length - 1) {
      void setActiveSlide(activeItemIndex + 1, 0);
    }
  },

  prevSlide: () => {
    const { activeItemIndex, activeSlideIndex, currentItems, setActiveSlide } = get();
    
    if (activeSlideIndex > 0) {
      void setActiveSlide(activeItemIndex, activeSlideIndex - 1);
    } else if (activeItemIndex > 0) {
      const prevItem = currentItems[activeItemIndex - 1];
      let prevSlideCount = 1;
      if (prevItem.type === 'song' && prevItem.song) {
        prevSlideCount = JSON.parse(prevItem.song.lyricsJson).length;
      }
      void setActiveSlide(activeItemIndex - 1, prevSlideCount - 1);
    }
  },

  toggleBlank: async () => {
    const { isBlank } = get();
    await (window as any).electron.ipcRenderer.invoke('output-blank', !isBlank);
    set({ isBlank: !isBlank });
  },

  toggleHideText: async () => {
    const { isHideText } = get();
    // Assuming 'output-hide-text' handler in main if needed, or using same blank logic
    set({ isHideText: !isHideText });
  },

  toggleRehearsal: () => set((state) => ({ isRehearsal: !state.isRehearsal })),

  toggleFullscreen: async () => {
    await (window as any).electron.ipcRenderer.invoke('output-fullscreen');
  },

  openOutput: async () => {
    await (window as any).electron.ipcRenderer.invoke('output-open');
  },

  endLive: () => {
    (window as any).electron.ipcRenderer.invoke('output-blank', true);
    (window as any).electron.ipcRenderer.invoke('presentation-end-live');
    set({ isLive: false, activeItemIndex: -1, activeSlideIndex: -1, activeSlideId: null });
  },

  goLive: async (itemIndex, slideIndex) => {
    const { setActiveSlide } = get();
    await setActiveSlide(itemIndex, slideIndex);
  },

  reorderItems: (items) => set({ currentItems: items }),

  addBlank: () => {
    const newItem = { id: crypto.randomUUID(), type: 'blank', title: 'Blank Slide' };
    set((state) => ({ currentItems: [...state.currentItems, newItem] }));
  },

  addCustom: (text) => {
    const newItem = { id: crypto.randomUUID(), type: 'custom', title: 'Custom Text', content: text };
    set((state) => ({ currentItems: [...state.currentItems, newItem] }));
  },

  setRemoteClientCount: (count) => set({ remoteClientCount: count }),

  addItem: (item) => set((state) => ({ currentItems: [...state.currentItems, item] })),
  removeItem: (index) => set((state) => ({ 
    currentItems: state.currentItems.filter((_, i) => i !== index) 
  })),
  setItems: (items) => set({ currentItems: items }),
  clearAll: () => set({ currentItems: [], activeItemIndex: -1, activeSlideIndex: -1, activeSlideId: null }),
}));

// ── REMOTE SYNC LOGIC ──
if (typeof window !== 'undefined' && (window as any).electron) {
  (window as any).electron.ipcRenderer.on('remote:control-slide', (data: any) => {
    const store = usePresentationStore.getState();
    if (data === 'next') store.nextSlide();
    else if (data === 'prev') store.prevSlide();
    else if (typeof data === 'object' && 'itemIndex' in data) {
      void store.setActiveSlide(data.itemIndex, data.slideIndex);
    }
  });

  (window as any).electron.ipcRenderer.on('remote:control-blank', (isBlank: boolean) => {
    usePresentationStore.setState({ isBlank });
  });

  (window as any).electron.ipcRenderer.on('remote:control-bible', (data: any) => {
    const store = usePresentationStore.getState();
    const newItem = {
      id: crypto.randomUUID(),
      type: 'scripture',
      title: `${data.book} ${data.chapter}:${data.verse}`,
      text: data.text,
      reference: `${data.book} ${data.chapter}:${data.verse}`,
      translation: data.translation
    };
    store.addItem(newItem);
    void store.setActiveSlide(store.currentItems.length - 1, 0);
  });

  // Listen for client count from main
  (window as any).electron.ipcRenderer.on('remote:client-count', (count: number) => {
    usePresentationStore.getState().setRemoteClientCount(count);
  });

  usePresentationStore.subscribe((state) => {
    let slides: any[] = [];
    if (state.currentServiceItem) {
      if (state.currentServiceItem.type === 'song' && state.currentServiceItem.song) {
        slides = JSON.parse(state.currentServiceItem.song.lyricsJson);
      } else if (state.currentServiceItem.type === 'scripture') {
        slides = [{ label: state.currentServiceItem.reference, text: state.currentServiceItem.text }];
      }
    }

    const remoteState = {
      currentIndex: state.activeSlideIndex,
      activeItemIndex: state.activeItemIndex,
      isBlank: state.isBlank,
      isHidden: state.isHideText,
      slides,
      serviceItems: state.currentItems.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title || item.song?.title || 'Unknown',
        slides: item.type === 'song' && item.song ? JSON.parse(item.song.lyricsJson).length : 1
      }))
    };
    (window as any).electron.ipcRenderer.invoke('remote-broadcast-state', remoteState);
  });
}
