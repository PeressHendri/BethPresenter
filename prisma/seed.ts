const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial setup...');

  // Default settings
  const defaultSettings = [
    { key: 'aspectRatio', value: '16:9' },
    { key: 'fontSize', value: '48' },
    { key: 'theme', value: 'dark' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      create: setting,
      update: setting,
    });
  }

  // Bible data to seed
  const bibleData = [
    { book: 'Genesis', bookNumber: 1, chapter: 1, verse: 1, text: 'In the beginning God created the heaven and the earth.', translation: 'KJV' },
    { book: 'Exodus', bookNumber: 2, chapter: 1, verse: 1, text: 'Now these are the names of the children of Israel, which came into Egypt; every man and his household came with Jacob.', translation: 'KJV' },
    { book: 'John', bookNumber: 43, chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', translation: 'KJV' },
    { book: 'John', bookNumber: 43, chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth on him should not perish, but have eternal life.', translation: 'ASV' },
    { book: 'John', bookNumber: 43, chapter: 3, verse: 16, text: 'Sapagka\'t gayon na lamang ang pagsinta ng Dios sa sanglibutan, na ibinigay niya ang kaniyang bugtong na Anak, upang ang sinomang sa kaniya\'y sumampalataya ay huwag mapahamak, kundi magkaroon ng buhay na walang hanggan.', translation: 'Tagalog' },
    { book: 'Psalms', bookNumber: 19, chapter: 23, verse: 1, text: 'The LORD is my shepherd; I shall not want.', translation: 'KJV' },
  ];

  for (const b of bibleData) {
    await prisma.bibleVerse.upsert({
      where: {
        book_chapter_verse_translation: {
          book: b.book,
          chapter: b.chapter,
          verse: b.verse,
          translation: b.translation,
        }
      },
      create: b,
      update: b,
    });
  }

  // Songs with tags (idempotent by title)
  const songSeeds = [
    {
      title: 'Mighty to Save',
      author: 'Hillsong',
      lyricsJson: JSON.stringify([
        { label: 'Verse 1', text: 'Everyone needs compassion\nA love that’s never failing\nLet mercy fall on me' },
        { label: 'Chorus', text: 'Savior, He can move the mountains\nMy God is mighty to save' },
      ]),
      tags: JSON.stringify(['Penyembahan', 'Paskah']),
    },
    {
      title: 'O Come All Ye Faithful',
      author: 'Traditional',
      lyricsJson: JSON.stringify([
        { label: 'Verse 1', text: 'O come all ye faithful\nJoyful and triumphant' },
        { label: 'Chorus', text: 'O come let us adore Him\nChrist the Lord' },
      ]),
      tags: JSON.stringify(['Natal', 'Kidung Jemaat']),
    },
    {
      title: 'How Great Thou Art',
      author: 'Traditional',
      lyricsJson: JSON.stringify([
        { label: 'Verse 1', text: 'O Lord my God, when I in awesome wonder' },
        { label: 'Chorus', text: 'Then sings my soul, my Savior God, to Thee\nHow great Thou art' },
      ]),
      tags: JSON.stringify(['Penyembahan', 'Kidung Jemaat']),
    },
  ];

  for (const s of songSeeds) {
    const existing = await prisma.song.findFirst({ where: { title: s.title } });
    if (existing) {
      await prisma.song.update({
        where: { id: existing.id },
        data: { author: s.author, lyricsJson: s.lyricsJson, tags: s.tags },
      });
    } else {
      await prisma.song.create({ data: s });
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
