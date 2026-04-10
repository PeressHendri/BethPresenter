export interface SongSection {
  id: string;
  label: string;
  type: 'verse' | 'chorus' | 'bridge' | 'tag' | 'title';
  slides: any[];
}

export const MOCK_EDIT_SONG = {
  title: 'Wait On You',
  author: 'Elevation Worship & Maverick City',
  key: 'Bb',
  bpm: 72,
  tags: ['Worship', 'Ballad'],
  sections: [
    { id: 's1', label: 'Title / Meta', type: 'title', slides: [{ text: 'Wait On You' }] },
    { id: 's2', label: 'Verse 1', type: 'verse', slides: [
      { text: "I'VE TASTED AND SEEN\nOF THE GOODNESS OF THE LORD" },
      { text: "YOU'VE ANCHORED MY SOUL\nIN THE QUITE OF THE STORM" }
    ]},
    { id: 's3', label: 'Chorus', type: 'chorus', slides: [
      { text: "I'M GONNA WAIT ON YOU\nI'M GONNA WAIT ON YOU" }
    ]},
  ]
};
