import { useEffect, useRef } from 'react';
import { useCountdownStore } from '../stores/countdownStore';

export function useCountdown() {
  const { isActive, tick, timeRemaining } = useCountdownStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, tick, timeRemaining]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');

    if (h > 0) return `${hh}:${mm}:${ss}`;
    return `${mm}:${ss}`;
  };

  return {
    formattedTime: formatTime(timeRemaining),
    timeRemaining
  };
}
