import { create } from 'zustand';

export interface FormattingState {
  fontFamily: string;
  fontSize: number | 'auto';
  fontWeight: string | number;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'center' | 'bottom';
  lineHeight: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase';
  textShadow: 'none' | 'soft' | 'strong' | 'glow';
  textColor: string;
  textBackground: string | null;
  textBackgroundOpacity: number;
  paddingH: number;
  paddingV: number;
  overlayOpacity: number;
  aspectRatio: string;
}

interface FormattingStore {
  formatting: FormattingState;
  updateFormatting: (updates: Partial<FormattingState>) => void;
  setFormatting: (fmt: FormattingState) => void;
}

export const defaultFormatting: FormattingState = {
  fontFamily: 'Inter',
  fontSize: 'auto',
  fontWeight: 800,
  textAlign: 'center',
  verticalAlign: 'center',
  lineHeight: 1.3,
  letterSpacing: 0,
  textTransform: 'none',
  textShadow: 'soft',
  textColor: '#ffffff',
  textBackground: null,
  textBackgroundOpacity: 0.5,
  paddingH: 120,
  paddingV: 80,
  overlayOpacity: 0.4,
  aspectRatio: '16:9',
};

// Debounce timer var for IPC
let ipcTimeout: any = null;

export const useFormattingStore = create<FormattingStore>((set, get) => ({
  formatting: { ...defaultFormatting },

  updateFormatting: (updates) => {
    set((state) => {
      const next = { ...state.formatting, ...updates };

      // Debounce and emit IPC
      if (ipcTimeout) clearTimeout(ipcTimeout);
      ipcTimeout = setTimeout(() => {
        // Broadcast formatting change to electron main process -> output windows
        const ipc = (window as any).electron?.ipcRenderer;
        if (ipc) {
          ipc.invoke('output:send-formatting', next).catch(console.error);
        }
      }, 50);

      return { formatting: next };
    });
  },

  setFormatting: (fmt) => {
    set({ formatting: fmt });
    const ipc = (window as any).electron?.ipcRenderer;
    if (ipc) {
      ipc.invoke('output:send-formatting', fmt).catch(console.error);
    }
  }
}));
