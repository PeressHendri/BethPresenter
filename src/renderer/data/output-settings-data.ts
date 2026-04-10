export interface MonitorInfo {
  id: number;
  name: string;
  resolution: string;
  hz: number;
  active?: boolean;
}

export const MOCK_MONITORS: MonitorInfo[] = [
  { id: 1, name: 'Main Display', resolution: '1920x1080', hz: 60, active: true },
  { id: 2, name: 'Projector (HDMI)', resolution: '1920x1080', hz: 60 },
  { id: 3, name: 'Stage Monitor (NDI)', resolution: '1280x720', hz: 50 },
];

export const OUTPUT_PRESETS = [
  'Lyrics + Next Line',
  'Lyrics Only',
  'Time + Service Flow',
  'Custom Layout',
];
