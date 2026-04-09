import { useState, useCallback, useEffect } from 'react';
import { FormattingState, defaultFormatting, useFormattingStore } from '../stores/formattingStore';

export interface FormattingPreset {
  id: string;
  name: string;
  isDefault?: boolean;
  formatting: Partial<FormattingState>;
}

const STOCK_PRESETS: FormattingPreset[] = [
  {
    id: 'default',
    name: 'Clean White',
    isDefault: true,
    formatting: { ...defaultFormatting }
  },
  {
    id: 'bold-worship',
    name: 'Bold Worship',
    isDefault: true,
    formatting: { ...defaultFormatting, fontFamily: 'Montserrat', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, paddingV: 40 }
  },
  {
    id: 'soft-shadow',
    name: 'Soft Shadow',
    isDefault: true,
    formatting: { ...defaultFormatting, fontFamily: 'Poppins', fontWeight: 600, textShadow: 'soft', paddingV: 100 }
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    isDefault: true,
    formatting: { ...defaultFormatting, textBackground: '#000000', textBackgroundOpacity: 0.8, textShadow: 'none', paddingH: 150 }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    isDefault: true,
    formatting: { ...defaultFormatting, fontFamily: 'system-ui', fontSize: 60, textShadow: 'none', textAlign: 'left', verticalAlign: 'bottom', paddingV: 60, paddingH: 60 }
  }
];

export function useFormattingPreset() {
  const [presets, setPresets] = useState<FormattingPreset[]>(STOCK_PRESETS);
  const { setFormatting } = useFormattingStore();

  const loadPresets = useCallback(async () => {
    try {
      const saved = await (window as any).electron.ipcRenderer.invoke('setting:get', 'formatting-presets');
      if (saved && Array.isArray(saved)) {
        setPresets([...STOCK_PRESETS, ...saved]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    void loadPresets();
  }, [loadPresets]);

  const savePreset = async (name: string, currentFormatting: FormattingState) => {
    const newPreset: FormattingPreset = {
      id: `custom-${Date.now()}`,
      name,
      formatting: { ...currentFormatting }
    };
    
    const customPresets = presets.filter(p => !p.isDefault);
    const updatedCustom = [...customPresets, newPreset];
    
    await (window as any).electron.ipcRenderer.invoke('setting:set', {
       key: 'formatting-presets',
       value: updatedCustom
    });
    
    setPresets([...STOCK_PRESETS, ...updatedCustom]);
  };

  const deletePreset = async (id: string) => {
    if (STOCK_PRESETS.find(p => p.id === id)) return; // prevent defaults from deletion
    
    const customPresets = presets.filter(p => !p.isDefault && p.id !== id);
    await (window as any).electron.ipcRenderer.invoke('setting:set', {
       key: 'formatting-presets',
       value: customPresets
    });
    
    setPresets([...STOCK_PRESETS, ...customPresets]);
  };

  const applyPreset = (id: string) => {
    const preset = presets.find(p => p.id === id);
    if (preset) {
      // merge with default safely to ensure no missing properties
      setFormatting({ ...defaultFormatting, ...preset.formatting } as FormattingState);
    }
  };

  return { presets, loadPresets, savePreset, deletePreset, applyPreset };
}
