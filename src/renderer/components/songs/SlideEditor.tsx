import React from 'react';
import { Bold, Undo, Redo, Maximize, AlignCenter, AlignLeft, AlignRight, SplitSquareHorizontal } from 'lucide-react';
import { useAutoFontSize } from '../../hooks/useAutoFontSize';
import { useSlideEdit } from '../../hooks/useSlideEdit';

interface SlideEditorProps {
  text: string;
  onChange: (text: string) => void;
  onSplit: (before: string, after: string) => void;
  background?: string;
  theme?: any; // To support future theme options
}

export function SlideEditor({ text, onChange, onSplit, background = '#000000', theme }: SlideEditorProps) {
  // Use our custom hooks
  const { editorRef, handleInput, handleKeyDown, handlePaste } = useSlideEdit({
    initialText: text,
    onChange,
    onSplit
  });

  // Calculate font size dynamically based on a typical 16:9 1920x1080 bounding box scaled down to preview
  // Actually, we calculate it using the hook over a logical container 1920x1080 space.
  // Then we map that via CSS transform to the visual box width.
  const LOGICAL_WIDTH = 1920;
  const LOGICAL_HEIGHT = 1080;

  const calculatedFontSize = useAutoFontSize({
    text: text || ' ', // ensure we get a size
    fontFamily: 'Inter, sans-serif', // or fetch from theme
    fontWeight: 700,
    containerWidth: LOGICAL_WIDTH * 0.9, // 90% padded
    containerHeight: LOGICAL_HEIGHT * 0.8, // 80% padded
    minSize: 40,
    maxSize: 140,
  });

  // Editor Toolbar handlers
  const execCmd = (cmd: string) => document.execCommand(cmd, false);
  const handleSplit = () => {
    // If user clicks split button manually instead of Alt+Enter
    // Send a mock alt+enter to editor or force a caret split
    const ev = new KeyboardEvent('keydown', { key: 'Enter', altKey: true });
    handleKeyDown(ev as any);
  };

  return (
    <div className="flex flex-col h-full bg-surface-base">
      {/* Editor Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-default bg-surface-elevated shrink-0">
         <div className="flex items-center bg-surface-sidebar rounded p-1 border border-border-default">
           <button onClick={() => execCmd('bold')} className="p-1.5 hover:bg-surface-hover rounded text-text-400 hover:text-text-100 transition-colors" title="Bold"><Bold size={16}/></button>
         </div>
         
         <div className="flex items-center bg-surface-sidebar rounded p-1 border border-border-default">
           <button onClick={() => execCmd('justifyLeft')} className="p-1.5 hover:bg-surface-hover rounded text-text-400 hover:text-text-100 transition-colors" title="Align Left"><AlignLeft size={16}/></button>
           <button onClick={() => execCmd('justifyCenter')} className="p-1.5 hover:bg-surface-hover rounded text-text-400 hover:text-text-100 transition-colors" title="Align Center"><AlignCenter size={16}/></button>
           <button onClick={() => execCmd('justifyRight')} className="p-1.5 hover:bg-surface-hover rounded text-text-400 hover:text-text-100 transition-colors" title="Align Right"><AlignRight size={16}/></button>
         </div>
         
         <div className="h-4 w-px bg-border-strong mx-1" />

         <button 
           onClick={handleSplit}
           className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-sidebar border border-border-default hover:bg-surface-hover hover:border-accent-500 rounded text-text-400 hover:text-accent-400 transition-colors text-xs font-semibold"
           title="Split Slide at Cursor (Alt+Enter)"
         >
           <SplitSquareHorizontal size={14}/> Split
         </button>

         <div className="ml-auto flex items-center gap-2 text-xs text-text-500">
            <span>Font Size: {calculatedFontSize}px</span>
            <span className="opacity-40 px-2">|</span>
            <span className="flex items-center gap-1"><kbd className="bg-surface-sidebar px-1 rounded border border-border-default">Alt</kbd> + <kbd className="bg-surface-sidebar px-1 rounded border border-border-default">Enter</kbd> to split</span>
         </div>
      </div>

      {/* WYSIWYG Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-checkerboard">
         <div 
           className="relative shadow-2xl overflow-hidden flex items-center justify-center outline-none ring-offset-4 ring-offset-surface-base focus-within:ring-2 ring-accent-500 transition-all"
           style={{
             width: '100%',
             maxWidth: '960px', // half of 1920 (scale 0.5)
             aspectRatio: '16/9',
             backgroundColor: background,
           }}
         >
            {/* The Logical Canvas Scaled */}
            <div 
              className="absolute flex items-center justify-center pointer-events-none"
              style={{
                width: `${LOGICAL_WIDTH}px`,
                height: `${LOGICAL_HEIGHT}px`,
                transform: `scale(0.5)`, // If container is 960px, scale is 0.5. For responsive, we might use CSS container queries or a ResizeObserver. But CSS transform scale keeps font crisp.
                transformOrigin: 'center center',
              }}
            >
               <div
                 ref={editorRef}
                 contentEditable
                 suppressContentEditableWarning
                 onInput={handleInput}
                 onKeyDown={handleKeyDown}
                 onPaste={handlePaste}
                 className="outline-none text-center pointer-events-auto"
                 style={{
                   width: '90%',
                   maxHeight: '90%',
                   color: 'white',
                   fontFamily: 'Inter, sans-serif',
                   fontWeight: 700,
                   fontSize: `${calculatedFontSize}px`,
                   lineHeight: 1.2,
                   textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                   whiteSpace: 'pre-wrap',
                   wordBreak: 'break-word',
                   caretColor: 'white'
                 }}
               />
            </div>
         </div>
      </div>
    </div>
  );
}
