import { useState, useLayoutEffect, useRef } from 'react';

interface AutoFontSizeConfig {
  text: string;
  fontFamily: string;
  fontWeight: number;
  containerWidth: number;
  containerHeight: number;
  minSize?: number;
  maxSize?: number;
}

/**
 * Calculates optimal font size using binary search to fit text within a container.
 */
export function useAutoFontSize({
  text,
  fontFamily,
  fontWeight,
  containerWidth,
  containerHeight,
  minSize = 12,
  maxSize = 120,
}: AutoFontSizeConfig) {
  const [fontSize, setFontSize] = useState(maxSize);
  const tempRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!text || containerWidth === 0 || containerHeight === 0) return;

    if (!tempRef.current) {
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.visibility = 'hidden';
      el.style.whiteSpace = 'pre-wrap';
      el.style.wordBreak = 'break-word';
      el.style.fontFamily = fontFamily;
      el.style.fontWeight = fontWeight.toString();
      el.style.width = `${containerWidth}px`;
      el.style.lineHeight = '1.2';
      // Optional: add text-transform uppercase if global style enforces it
      document.body.appendChild(el);
      tempRef.current = el;
    }

    const el = tempRef.current;
    if (el) {
      el.style.width = `${containerWidth}px`;
      el.innerText = text; // or textContent

      let low = minSize;
      let high = maxSize;
      let best = minSize;

      // Binary search
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        el.style.fontSize = `${mid}px`;
        
        // Check if fits
        if (el.scrollHeight <= containerHeight) {
          best = mid;
          low = mid + 1; // try bigger
        } else {
          high = mid - 1; // too big, shrink
        }
      }

      setFontSize(best);
    }

    return () => {
      // Cleanup happens on unmount
    };
  }, [text, fontFamily, fontWeight, containerWidth, containerHeight, minSize, maxSize]);

  useLayoutEffect(() => {
    // True cleanup
    return () => {
      if (tempRef.current) {
        document.body.removeChild(tempRef.current);
        tempRef.current = null;
      }
    };
  }, []);

  return fontSize;
}
