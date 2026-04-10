import { useEffect } from 'react';
import { usePresentationStore } from '../stores/presentationStore';

export function useKeyboardShortcuts() {
  const { nextSlide, prevSlide, toggleBlank, isLive } = usePresentationStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          toggleBlank();
          break;
        case 'Escape':
          // Optional: clear output or stop live
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, toggleBlank, isLive]);
}
