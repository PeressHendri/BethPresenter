export interface CountdownTemplate {
  id: string;
  title: string;
  duration: number; // in seconds
  type: 'timer' | 'message';
  style: {
    color: string;
    fontSize: number;
    fontFamily: string;
    background: string; // hex or image path
  };
}

export const MOCK_COUNTDOWNS: CountdownTemplate[] = [
  { id: 'c1', title: 'Countdown 5 min', duration: 300, type: 'timer', style: { color: '#FFFFFF', fontSize: 120, fontFamily: 'sans-serif', background: '#000000' } },
  { id: 'c2', title: 'Start Soon', duration: 180, type: 'timer', style: { color: '#00E091', fontSize: 130, fontFamily: 'serif', background: 'gradient' } },
  { id: 'c3', title: 'Service Begins In', duration: 600, type: 'timer', style: { color: '#FFFFFF', fontSize: 110, fontFamily: 'sans-serif', background: 'dark-forest' } },
  { id: 'c4', title: 'Custom Countdown', duration: 0, type: 'timer', style: { color: '#FFC83D', fontSize: 100, fontFamily: 'sans-serif', background: '#0A0A0A' } },
];
