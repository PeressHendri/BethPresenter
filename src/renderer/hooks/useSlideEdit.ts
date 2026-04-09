import { useEffect, useRef, useState, useCallback } from 'react';

interface UseSlideEditProps {
  initialText: string;
  onChange: (text: string) => void;
  onSplit: (textBeforeCursor: string, textAfterCursor: string) => void;
}

export function useSlideEdit({ initialText, onChange, onSplit }: UseSlideEditProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<string[]>([initialText]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Sync initialText if changed from outside (e.g. clicking another slide)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerText !== initialText) {
      editorRef.current.innerText = initialText;
      setHistory([initialText]);
      setHistoryIndex(0);
    }
  }, [initialText]);

  const pushHistory = useCallback((text: string) => {
    setHistory((prev) => {
      const past = prev.slice(0, historyIndex + 1);
      const newHistory = [...past, text];
      if (newHistory.length > 50) newHistory.shift(); // Max 50 steps
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 50));
    onChange(text);
  }, [historyIndex, onChange]);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    pushHistory(text);
  }, [pushHistory]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Undo
    if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      if (historyIndex > 0) {
        const text = history[historyIndex - 1];
        if (editorRef.current) editorRef.current.innerText = text;
        setHistoryIndex((prev) => prev - 1);
        onChange(text);
      }
    }
    // Redo 
    else if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const text = history[historyIndex + 1];
        if (editorRef.current) editorRef.current.innerText = text;
        setHistoryIndex((prev) => prev + 1);
        onChange(text);
      }
    }
    // Alt + Enter (Split slide)
    else if (e.key === 'Enter' && e.altKey) {
      e.preventDefault();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && editorRef.current) {
        const range = selection.getRangeAt(0);
        
        // We clone the range contents from start of editor to cursor
        const preRange = document.createRange();
        preRange.selectNodeContents(editorRef.current);
        preRange.setEnd(range.startContainer, range.startOffset);
        
        // We clone from cursor to end
        const postRange = document.createRange();
        postRange.selectNodeContents(editorRef.current);
        postRange.setStart(range.endContainer, range.endOffset);

        const before = preRange.cloneContents().textContent || '';
        const after = postRange.cloneContents().textContent || '';
        
        onSplit(before.trim(), after.trim());
      }
    }
  }, [history, historyIndex, onChange, onSplit]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  return {
    editorRef,
    handleInput,
    handleKeyDown,
    handlePaste
  };
}
