export interface ProjectFile {
  id: string;
  name: string;
  modified: string;
  created: string;
  size: string;
  path: string;
  counts: {
    slides: number;
    songs: number;
    scriptures: number;
    media: number;
  };
}

export const MOCK_PROJECTS: ProjectFile[] = [
  { 
    id: 'p1', 
    name: 'Sunday Morning Service - Apr 12', 
    modified: '2 hours ago', 
    created: '2026-04-01',
    size: '124MB', 
    path: '/Users/mac/Documents/GPresenter/Sunday_Apr12.gpres',
    counts: { slides: 42, songs: 5, scriptures: 2, media: 20 }
  },
  { 
    id: 'p2', 
    name: 'Youth Night - Friday Fusion', 
    modified: 'Yesterday', 
    created: '2026-03-28',
    size: '85MB', 
    path: '/Users/mac/Documents/GPresenter/Youth_Fri.gpres',
    counts: { slides: 28, songs: 4, scriptures: 1, media: 12 }
  },
  { 
    id: 'p3', 
    name: 'Easter Special Production', 
    modified: '3 days ago', 
    created: '2026-03-15',
    size: '1.2GB', 
    path: '/Users/mac/Documents/GPresenter/Easter2026.gpres',
    counts: { slides: 120, songs: 12, scriptures: 8, media: 85 }
  },
];
