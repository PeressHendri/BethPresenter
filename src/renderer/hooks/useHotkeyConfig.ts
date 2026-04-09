/**
 * useHotkeyConfig — Custom Keyboard Shortcut Configuration
 * Stores user-defined hotkeys in localStorage and exposes an updater.
 */
import { useState, useCallback, useEffect, useRef } from 'react';

export interface HotkeyConfig {
  nextSlide:    string;
  prevSlide:    string;
  blank:        string;
  hideText:     string;
  fullscreen:   string;
  rehearsal:    string;
  clearText:    string;
  clearBg:      string;
  clearAll:     string;
}

export const DEFAULT_HOTKEYS: HotkeyConfig = {
  nextSlide:  'ArrowRight',
  prevSlide:  'ArrowLeft',
  blank:      'b',
  hideText:   'h',
  fullscreen: 'F11',
  rehearsal:  'r',
  clearText:  'c',
  clearBg:    'g',
  clearAll:   'Escape',
};

const STORAGE_KEY = 'bethpresenter:hotkeys';

function loadHotkeys(): HotkeyConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_HOTKEYS, ...JSON.parse(raw) } : DEFAULT_HOTKEYS;
  } catch {
    return DEFAULT_HOTKEYS;
  }
}

export function useHotkeyConfig() {
  const [hotkeys, setHotkeys] = useState<HotkeyConfig>(loadHotkeys);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hotkeys));
    } catch { /* quota */ }
  }, [hotkeys]);

  const updateHotkey = useCallback(<K extends keyof HotkeyConfig>(
    action: K,
    key: string
  ) => {
    setHotkeys(prev => ({ ...prev, [action]: key }));
  }, []);

  const resetHotkeys = useCallback(() => {
    setHotkeys(DEFAULT_HOTKEYS);
  }, []);

  return { hotkeys, updateHotkey, resetHotkeys };
}

/**
 * useHotkeyListener — Attach the configured hotkeys to keyboard events
 */
export function useHotkeyListener(
  hotkeys: HotkeyConfig,
  handlers: Partial<Record<keyof HotkeyConfig, () => void>>
) {
  const handlersRef = useRef(handlers);
  useEffect(() => { handlersRef.current = handlers; });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      // Skip if typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

      const key = e.key;
      const action = (Object.keys(hotkeys) as (keyof HotkeyConfig)[]).find(
        (k) => hotkeys[k].toLowerCase() === key.toLowerCase()
      );
      if (action && handlersRef.current[action]) {
        e.preventDefault();
        handlersRef.current[action]!();
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [hotkeys]);
}
