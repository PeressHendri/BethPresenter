export interface LyricsSlide {
  label: string;
  text: string;
}

export interface Song {
  id: string;
  title: string;
  author: string | null;
  ccli: string | null;
  lyricsJson: string; // JSON string of LyricsSlide[]
  tags: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PresentationItem {
  id: string;
  presentationId: string;
  songId: string | null;
  type: 'song' | 'bible' | 'custom' | 'blank';
  content: string | null;
  order: number;
  song?: Song;
}

export interface Presentation {
  id: string;
  name: string;
  itemsJson: string;
  createdAt: Date;
  updatedAt: Date;
  items: PresentationItem[];
}

export interface SlideData {
  title: string;
  text: string;
  label?: string;
  background?: string;
  type: 'song' | 'bible' | 'custom' | 'blank';
}
