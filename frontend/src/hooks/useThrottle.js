import { useRef, useCallback } from 'react';

export function useThrottle(callback, delay) {
  const lastCall = useRef(0);
  const timeoutId = useRef(null);

  return useCallback((...args) => {
    const now = new Date().getTime();
    
    // Clear any existing timeout
    if (timeoutId.current) {
        clearTimeout(timeoutId.current);
    }
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    } else {
        // Schedule trailing call
        timeoutId.current = setTimeout(() => {
            lastCall.current = new Date().getTime();
            callback(...args);
        }, delay - (now - lastCall.current));
    }
  }, [callback, delay]);
}
