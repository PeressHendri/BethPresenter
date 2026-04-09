import React from 'react';
import { Plus, BookText, Settings2 } from 'lucide-react';

interface TranslationListProps {
  translations: string[];
  activeTranslation: string;
  onSelect: (tr: string) => void;
  onImportClick: () => void;
}

export function TranslationList({ translations, activeTranslation, onSelect, onImportClick }: TranslationListProps) {
  return (
    <div className="w-[120px] shrink-0 border-r border-border-default bg-surface-sidebar flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-default bg-surface-elevated shrink-0 min-h-[44px]">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-400">Version</h3>
        <button onClick={onImportClick} className="text-text-400 hover:text-accent-400 transition-colors p-1" title="Import Translation">
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {translations.map((tr) => (
          <button
            key={tr}
            onClick={() => onSelect(tr)}
            className={`flex items-center justify-center p-3 rounded-lg text-sm font-bold tracking-wide transition-all ${
              activeTranslation === tr
                ? 'bg-accent-600 text-white shadow-md shadow-accent-600/20'
                : 'text-text-300 hover:bg-surface-hover hover:text-text-100'
            }`}
          >
            {tr}
          </button>
        ))}

        {translations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-text-500 opacity-60">
            <BookText size={24} className="mb-2" />
            <span className="text-[10px] text-center px-2">No Bibles<br/>Installed</span>
          </div>
        )}
      </div>

      <div className="p-2 border-t border-border-default mt-auto shrink-0 bg-surface-elevated shadow-[0_-4px_10px_rgba(0,0,0,0.2)]">
        <button onClick={onImportClick} className="w-full flex items-center justify-center gap-1.5 p-2 rounded bg-surface-base border border-border-strong hover:bg-surface-hover hover:border-text-600 transition-colors text-xs text-text-300 font-bold">
           <Settings2 size={12} /> Manage
        </button>
      </div>
    </div>
  );
}
