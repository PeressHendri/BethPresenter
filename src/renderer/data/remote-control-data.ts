export interface RemoteDevice {
  id: string;
  name: string;
  type: 'phone' | 'tablet';
  status: 'connected' | 'pending' | 'blocked';
  ip: string;
  permissions: {
    canControl: boolean;
    canViewLyrics: boolean;
    canSeeNext: boolean;
  };
}

export const MOCK_REMOTES: RemoteDevice[] = [
  { 
    id: 'rd1', 
    name: "Hendri's iPhone 14 Pro", 
    type: 'phone', 
    status: 'connected', 
    ip: '192.168.1.15',
    permissions: { canControl: true, canViewLyrics: true, canSeeNext: true }
  },
  { 
    id: 'rd2', 
    name: 'Worship Leader iPad', 
    type: 'tablet', 
    status: 'pending', 
    ip: '192.168.1.22',
    permissions: { canControl: false, canViewLyrics: true, canSeeNext: true }
  },
];
