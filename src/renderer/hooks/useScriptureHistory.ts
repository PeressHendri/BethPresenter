/**
 * useScriptureHistory — Quick History for Scripture Browser
 * Stores the last 10 viewed verse references (book + chapter) in localStorage.
 */
import { useState, useCallback, useEffect } from 'react';

export interface VerseRef {
  id:          string;
  book:        string;
  chapter:     number;
  translation: string;
  label:       string;   // Display: "Yohanes 3 (TB)"
  timestamp:   number;
}

const STORAGE_KEY  = 'bethpresenter:scripture-history';
const MAX_HISTORY  = 10;

function loadHistory(): VerseRef[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VerseRef[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: VerseRef[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch { /* quota */ }
}

export function useScriptureHistory() {
  const [history, setHistory] = useState<VerseRef[]>(loadHistory);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const pushHistory = useCallback((ref: Omit<VerseRef, 'id' | 'timestamp' | 'label'> & { label?: string }) => {
    const entry: VerseRef = {
      id:          crypto.randomUUID(),
      book:        ref.book,
      chapter:     ref.chapter,
      translation: ref.translation,
      label:       ref.label ?? `${ref.book} ${ref.chapter} (${ref.translation})`,
      timestamp:   Date.now(),
    };

    setHistory((prev) => {
      // Remove if same book/chapter/translation already exists
      const filtered = prev.filter(
        (h) => !(h.book === ref.book && h.chapter === ref.chapter && h.translation === ref.translation)
      );
      return [entry, ...filtered].slice(0, MAX_HISTORY);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, pushHistory, clearHistory };
}
