import { useState, useLayoutEffect, useRef } from 'react';

interface AutoFitOptions {
  text: string;
  fontFamily: string;
  fontWeight: string | number;
  lineHeight: number;
  letterSpacing: number;
  textTransform: string;
  containerWidth: number;
  containerHeight: number;
  minFontSize?: number;
  maxFontSize?: number;
  isActive: boolean;
}

export function useAutoFitText({
  text,
  fontFamily,
  fontWeight,
  lineHeight,
  letterSpacing,
  textTransform,
  containerWidth,
  containerHeight,
  minFontSize = 16,
  maxFontSize = 120,
  isActive
}: AutoFitOptions) {
  const [fontSize, setFontSize] = useState(maxFontSize);
  const tempRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!isActive || !text || containerWidth <= 0 || containerHeight <= 0) return;

    if (!tempRef.current) {
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.visibility = 'hidden';
      el.style.pointerEvents = 'none';
      el.style.whiteSpace = 'pre-wrap';
      el.style.wordBreak = 'break-word';
      document.body.appendChild(el);
      tempRef.current = el;
    }

    const el = tempRef.current;
    
    // Apply exact typography config used in presentation
    el.style.fontFamily = fontFamily;
    el.style.fontWeight = fontWeight.toString();
    el.style.lineHeight = lineHeight.toString();
    el.style.letterSpacing = `${letterSpacing}px`;
    el.style.textTransform = textTransform;
    el.style.width = `${containerWidth}px`;
    
    // Process HTML if script tags were sent (like sup for Bible)
    el.innerHTML = text; 

    let low = minFontSize;
    let high = maxFontSize;
    let best = minFontSize;

    // Binary search for max font size that fits height
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      el.style.fontSize = `${mid}px`;
      
      const currentHeight = el.scrollHeight;
      
      if (currentHeight <= containerHeight) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    setFontSize(best);

  }, [text, fontFamily, fontWeight, lineHeight, letterSpacing, textTransform, containerWidth, containerHeight, minFontSize, maxFontSize, isActive]);

  useLayoutEffect(() => {
    return () => {
      if (tempRef.current) {
        document.body.removeChild(tempRef.current);
        tempRef.current = null;
      }
    };
  }, []);

  return fontSize;
}
