export interface SlideTheme {
  id: string;
  name: string;
  text: {
    font: string;
    size: number;
    weight: string;
    color: string;
    lineHeight: number;
    outline: { enabled: boolean; color: string; thickness: number };
    shadow: { enabled: boolean; color: string; blur: number; offset: number };
  };
  alignment: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  background: {
    type: 'solid' | 'gradient' | 'image' | 'video';
    value: string;
    gradientEnd?: string;
  };
}

export const MOCK_THEMES: SlideTheme[] = [
  {
    id: 'th1',
    name: 'Default Lyrics',
    text: {
      font: 'Inter', size: 72, weight: 'Black', color: '#FFFFFF', lineHeight: 1.2,
      outline: { enabled: true, color: '#000000', thickness: 3 },
      shadow: { enabled: true, color: '#000000AA', blur: 10, offset: 4 }
    },
    alignment: 'center',
    background: { type: 'gradient', value: '#1a1a1a', gradientEnd: '#000000' }
  },
  {
    id: 'th2',
    name: 'Modern Scripture',
    text: {
      font: 'Montserrat', size: 48, weight: 'Medium', color: '#FFFFFF', lineHeight: 1.4,
      outline: { enabled: false, color: '#000', thickness: 0 },
      shadow: { enabled: true, color: '#00000088', blur: 6, offset: 2 }
    },
    alignment: 'center-left',
    background: { type: 'solid', value: '#121212' }
  }
];
