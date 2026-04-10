import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const BIBLE_PATH = path.join(process.cwd(), 'tb.ewb');
let db: any = null;

export function initBible() {
  try {
    if (fs.existsSync(BIBLE_PATH)) {
      // Note: tb.ewb might be proprietary, but if user asked for better-sqlite3, 
      // we attempt to connect. Use readonly for safety.
      db = new Database(BIBLE_PATH, { readonly: true, fileMustExist: true });
    }
  } catch (err) {
    console.warn('Failed to connect to tb.ewb with SQLite:', err);
    db = null;
  }
}

export async function getTranslations() {
  return { success: true, translations: ['Alkitab TB', 'KJV', 'ASV'] };
}

export async function getBooks() {
  if (!db) return getMockBooks();
  try {
    // Attempt to query common EW/SQLite schemas: 'books' or 'words'
    const books = db.prepare('SELECT name FROM books ORDER BY id').all();
    return { success: true, books: books.map((b: any) => b.name) };
  } catch (err) {
    return getMockBooks();
  }
}

export async function getVerses(bookName: string, chapter: number, translation: string) {
  if (!db || translation !== 'Alkitab TB') return getMockVerses(bookName, chapter);
  try {
    // Mapping Bible Reference to Text
    const stmt = db.prepare(`
      SELECT verses.verse as id, verses.text 
      FROM verses 
      JOIN books ON books.id = verses.book_id 
      WHERE books.name = ? AND verses.chapter = ?
      ORDER BY verses.verse
    `);
    const verses = stmt.all(bookName, chapter);
    return { success: true, verses };
  } catch (err) {
    return getMockVerses(bookName, chapter);
  }
}

export async function searchReference(query: string) {
  // Parsing 'John 3:16' or 'Yohanes 3:16-18'
  const regex = /^([\d\s]*\w+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/i;
  const match = query.match(regex);
  
  if (match) {
    const book = match[1].trim();
    const chapter = parseInt(match[2]);
    const verseStart = match[3] ? parseInt(match[3]) : 1;
    const verseEnd = match[4] ? parseInt(match[4]) : verseStart;
    
    const verses = [];
    for (let v = verseStart; v <= verseEnd; v++) {
      verses.push(v);
    }

    return { 
      success: true, 
      results: [{ book, chapter, verses }] 
    };
  }
  
  return { success: false, error: 'Invalid reference format' };
}

// ── FALLBACK / MOCK ENGINE ──
function getMockBooks() {
  return { 
    success: true, 
    books: [
      'Kejadian', 'Keluaran', 'Imamat', 'Bilangan', 'Ulangan', 
      'Yosua', 'Hakim-hakim', 'Rut', '1 Samuel', '2 Samuel',
      'Matius', 'Markus', 'Lukas', 'Yohanes', 'Kisah Para Rasul'
    ]
  };
}

function getMockVerses(book: string, chapter: number) {
  const count = 31;
  const verses = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    text: `Teks ayat dari ${book} pasal ${chapter} ayat ${i + 1} (Mock Data). Karena tb.ewb bukan SQLite yang valid.`
  }));
  return { success: true, verses };
}
