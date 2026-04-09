export const SHORTCUTS = {
  NEXT_SLIDE: ['Space', 'ArrowRight'],
  PREV_SLIDE: ['Backspace', 'ArrowLeft'],
  TOGGLE_BLANK: ['b', 'B'],
  TOGGLE_HIDE_TEXT: ['h', 'H'],
  BLACK_SCREEN: ['Escape'],
  FULLSCREEN: ['F11'],
  FOCUS_SEARCH: ['f', 'F'], // Needs Ctrl/Cmd check
  SAVE: ['s', 'S'], // Needs Ctrl/Cmd check
  UNDO: ['z', 'Z'], // Needs Ctrl/Cmd check
};

// Helper for React to match shortcuts easily
export function matchesShortcut(event: KeyboardEvent, keys: string[], requireCtrlCmd = false) {
  if (requireCtrlCmd && !event.ctrlKey && !event.metaKey) return false;
  if (!requireCtrlCmd && (event.ctrlKey || event.metaKey)) return false; // Prevent catching Cmd+S if we only wanted S
  return keys.includes(event.key);
}
