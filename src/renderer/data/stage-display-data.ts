export interface SDWidget {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  style: any;
}

export const MOCK_WIDGETS: SDWidget[] = [
  { id: 'w1', type: 'current_lyrics', x: 10, y: 30, w: 80, h: 20, label: 'Current Lyrics', style: { fontSize: 40, color: '#FFFFFF' } },
  { id: 'w2', type: 'next_lyrics', x: 10, y: 60, w: 80, h: 20, label: 'Next Lyrics', style: { fontSize: 30, color: '#A0A0A0' } },
  { id: 'w3', type: 'clock', x: 75, y: 5, w: 20, h: 10, label: 'Clock', style: { fontSize: 24, color: '#00E091' } },
  { id: 'w4', type: 'timer', x: 5, y: 5, w: 20, h: 10, label: 'Countdown', style: { fontSize: 24, color: '#FF3B30' } },
];

export const SD_TEMPLATES = [
  { id: 't1', name: 'Lyrics Line Display', icon: 'text' },
  { id: 't2', name: 'Current + Next', icon: 'layers' },
  { id: 't3', name: 'Chords View', icon: 'music' },
  { id: 't4', name: 'Time Clock', icon: 'clock' },
  { id: 't5', name: 'Message Notes', icon: 'file-text' },
];

export const DISPLAY_OUTPUTS = [
  'Main Output (HDMI 1)',
  'Stage Display 1 (HDMI 2)',
  'Stage Display 2 (NDI)',
  'Internal Monitor',
];
