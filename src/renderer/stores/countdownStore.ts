import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CountdownMode = 'duration' | 'target';
export type ShowOnMode = 'both' | 'main' | 'display';

interface CountdownState {
  // Config
  title: string;
  subtext: string;
  mode: CountdownMode;
  durationMinutes: number;
  durationSeconds: number;
  targetTime: string; // HH:mm:ss
  showOn: ShowOnMode;
  background: string; // hex or image path
  bgType: 'color' | 'image';

  // Active State
  isActive: boolean;
  timeRemaining: number; // in seconds
  initialTime: number;

  // Actions
  setConfig: (config: Partial<CountdownState>) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

export const useCountdownStore = create<CountdownState>()(
  persist(
    (set, get) => ({
      title: 'Get Ready',
      subtext: 'Service will start in',
      mode: 'duration',
      durationMinutes: 5,
      durationSeconds: 0,
      targetTime: '09:00:00',
      showOn: 'both',
      background: '#10b981',
      bgType: 'color',

      isActive: false,
      timeRemaining: 300,
      initialTime: 300,

      setConfig: (config) => set((state) => ({ ...state, ...config })),

      start: () => {
        const { mode, durationMinutes, durationSeconds, targetTime } = get();
        let seconds = 0;

        if (mode === 'duration') {
          seconds = durationMinutes * 60 + durationSeconds;
        } else {
          // Calculate seconds until target time
          const now = new Date();
          const target = new Date();
          const [h, m, s] = targetTime.split(':').map(Number);
          target.setHours(h, m, s || 0, 0);
          if (target < now) target.setDate(target.getDate() + 1);
          seconds = Math.floor((target.getTime() - now.getTime()) / 1000);
        }

        set({ 
          isActive: true, 
          timeRemaining: seconds, 
          initialTime: seconds 
        });

        // Broadcast to Output
        (window as any).electron?.ipcRenderer.invoke('countdown:start', {
           seconds,
           title: get().title,
           subtext: get().subtext,
           showOn: get().showOn,
           bg: get().background,
           bgType: get().bgType
        });
      },

      pause: () => {
        set({ isActive: false });
        (window as any).electron?.ipcRenderer.invoke('countdown:pause');
      },

      reset: () => {
        const { mode, durationMinutes, durationSeconds } = get();
        const seconds = mode === 'duration' ? (durationMinutes * 60 + durationSeconds) : 0;
        set({ isActive: false, timeRemaining: seconds });
        (window as any).electron?.ipcRenderer.invoke('countdown:reset');
      },

      tick: () => {
        set((state) => {
          if (!state.isActive || state.timeRemaining <= 0) {
            if (state.timeRemaining <= 0 && state.isActive) {
               // Finished logic
               return { ...state, isActive: false, timeRemaining: 0 };
            }
            return state;
          }
          return { ...state, timeRemaining: state.timeRemaining - 1 };
        });
      }
    }),
    {
      name: 'beth-presenter-countdown',
      partialize: (state) => ({
        title: state.title,
        subtext: state.subtext,
        mode: state.mode,
        durationMinutes: state.durationMinutes,
        durationSeconds: state.durationSeconds,
        targetTime: state.targetTime,
        showOn: state.showOn,
        background: state.background,
        bgType: state.bgType
      })
    }
  )
);
