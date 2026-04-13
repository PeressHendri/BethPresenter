/**
 * Utility to process raw text into structured slides
 * Implements "ALT + Enter" behavior (splitter) and auto-labeling
 */
export const processLyrics = (rawText) => {
  if (!rawText) return [];

  // 1. Clean formatting (placeholder logic)
  const cleanText = rawText.replace(/\r\n/g, '\n').trim();

  // 2. Split by double newline or custom delimiter (---)
  const sections = cleanText.split(/\n\s*\n/);

  let verseCount = 0;
  return sections.map((section) => {
    // Basic auto-labeling logic
    const lines = section.split('\n');
    let label = 'Verse';
    
    if (lines[0].toLowerCase().startsWith('chorus')) {
      label = 'Chorus';
    } else {
      verseCount++;
      label = `Verse ${verseCount}`;
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      content: section,
      label: label,
      style: { fontSize: '4rem', color: '#ffffff' }
    };
  });
};

/**
 * LocalStorage / API Service Abstraction
 */
export const songService = {
  getAll: () => JSON.parse(localStorage.getItem('songs')) || [],
  saveAll: (songs) => localStorage.setItem('songs', JSON.stringify(songs)),
  
  // Future-ready: check for Electron Bridge
  isDesktop: () => typeof window !== 'undefined' && window.electron !== undefined
};
