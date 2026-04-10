export interface ServiceOrderItem {
  id: string;
  type: 'song' | 'scripture' | 'media' | 'countdown';
  title: string;
  subtext: string;
  detail: any;
}

export const MOCK_SERVICE_ORDER: ServiceOrderItem[] = [
  { id: 'item1', type: 'countdown', title: 'Pre-Service Timer', subtext: '5 minutes', detail: { duration: 300 } },
  { id: 'item2', type: 'song', title: 'Here Again', subtext: '6 slides', detail: { author: 'Elevation Worship', key: 'D' } },
  { id: 'item3', type: 'scripture', title: 'Exodus 3:1–5', subtext: 'The Burning Bush', detail: { text: 'Now Moses kept the flock of Jethro...' } },
  { id: 'item4', type: 'media', title: 'Opening Announcement', subtext: 'Video 00:30', detail: { resolution: '1920x1080', size: '12MB' } },
  { id: 'item5', type: 'song', title: 'Wait On You', subtext: '8 slides', detail: { author: 'Maverick City', key: 'Bb' } },
];
