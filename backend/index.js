const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const Database = require('better-sqlite3');
const { spawn } = require('child_process');
const { Index } = require('flexsearch');
const { initOptimize } = require('./db/optimize');
const SlideBroadcaster = require('./socket/broadcaster');
const BackupManager = require('./db/backup');
const PowerPointService = require('./services/powerpointService');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  perMessageDeflate: {
    threshold: 1024, 
    zlibDeflateOptions: { chunkSize: 1024 }
  }
});

const broadcaster = new SlideBroadcaster(io);

// Middleware
app.use(cors());
app.use(express.json());

// Multer for file uploads
const powerpointUpload = multer({ dest: 'uploads/', limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB limit

// Backup Manager
const backupManager = new BackupManager();

// PowerPoint Service
const powerPointService = new PowerPointService();

// Database Setup (SQLite)
const dbPath = path.resolve(__dirname, '../database/beth_presenter.db');
const db = new Database(dbPath, { verbose: console.log });

// FlexSearch Store
const bibleIndexes = {};
console.log('[Bible Engine] Initializing FlexSearch Indexes...');

function initBibleIndexes() {
  const t0 = Date.now();
  try {
    const tableInfo = db.prepare(`PRAGMA table_info(bible_verses)`).all();
    if (tableInfo.length === 0) {
       console.log('[Bible Engine] Table bible_verses not found, skipping FlexSearch initialization');
       return;
    }
    
    const columnNames = tableInfo.map(col => col.name);
    let typeColumn = null;
    
    if (columnNames.includes('type')) {
      typeColumn = 'type';
    } else if (columnNames.includes('t')) {
      typeColumn = 't';
    }

    const versions = db.prepare('SELECT DISTINCT version_id FROM bible_verses').all();
    if (versions.length === 0) return;

    for (const v of versions) {
      const index = new Index({
        preset: 'score',
        tokenize: 'forward',
        resolution: 9,
        cache: true
      });
      
      let verses;
      if (typeColumn) {
        verses = db.prepare(`SELECT id, content FROM bible_verses WHERE version_id = ? AND ${typeColumn} != 't'`).all(v.version_id);
      } else {
        verses = db.prepare(`SELECT id, content FROM bible_verses WHERE version_id = ?`).all(v.version_id);
      }
      
      for (const verse of verses) {
        index.add(verse.id, verse.content);
      }
      
      bibleIndexes[v.version_id] = index;
      console.log(`[Bible Engine] Indexed ${verses.length} verses for ${v.version_id}`);
    }
    const t1 = Date.now();
    console.log(`[Bible Engine] All indexes ready in ${t1 - t0}ms`);
  } catch (err) {
    console.error('[Bible Engine] FlexSearch initialization skipped:', err.message);
  }
}

// Build index after data might be imported
setTimeout(initBibleIndexes, 2000);

// Initialize Modern Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    ccli TEXT,
    tags TEXT, 
    slides TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS display_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pin TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    active_clients INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS bible_verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT,
    version TEXT,
    version_id TEXT,
    bookID INTEGER,
    abbreviation TEXT,
    book TEXT,
    chapter INTEGER,
    verse INTEGER,
    content TEXT,
    type TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_bible_lookup ON bible_verses(version_id, bookID, chapter);
  CREATE INDEX IF NOT EXISTS idx_bible_search ON bible_verses(version_id, content);
`);

// Migration: Add missing columns if they don't exist
const columns = db.prepare("PRAGMA table_info(songs)").all();
const columnNames = columns.map(c => c.name);

if (!columnNames.includes('updated_at')) db.exec("ALTER TABLE songs ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP");
 
// Media Table Setup
db.exec(`
  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Optimize performance and set indexes AFTER tables are created
initOptimize(db);

// Static Folder for Uploads
const uploadsDir = path.join(__dirname, 'uploads');
const mediaDir = path.join(uploadsDir, 'media');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir);

app.use('/uploads', express.static(uploadsDir));

// --- MEDIA UPLOAD MIDDLEWARE (Optional: assumes multer is installed, fallback provided) ---

const storage = multer ? multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads/media')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
}) : null;

const upload = multer ? multer({ 
  storage, 
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB Limit
}) : null;

// --- BIBLE DATA IMPORT ---
const importBibles = () => {
  const bibleDir = path.resolve(__dirname, '../database/Bible/csv');
  const count = db.prepare('SELECT COUNT(*) as count FROM bible_verses').get().count;
  
  // If database already has verses, skip (unless you want to force re-import)
  if (count > 0) {
    console.log(`[Bible Engine] Database already contains ${count} verses. Skipping import.`);
    return;
  }

  console.log('[Bible Engine] Initializing Bible database from CSV files...');
  const languages = ['english', 'indonesia', 'suku'];
  
  db.prepare('DELETE FROM bible_verses').run();
  const insert = db.prepare(`
    INSERT INTO bible_verses (language, version, version_id, bookID, abbreviation, book, chapter, verse, content, type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    languages.forEach(lang => {
      const langPath = path.join(bibleDir, lang);
      if (!fs.existsSync(langPath)) return;
      
      const files = fs.readdirSync(langPath).filter(f => f.endsWith('.csv'));
      files.forEach(file => {
        const versionId = file.replace('.csv', '');
        const versionName = versionId.replace(/[A-Z]/g, ' $&').trim(); // Roughly format name
        const filePath = path.join(langPath, file);
        const data = fs.readFileSync(filePath, 'utf8');
        
        const lines = data.split('\n');
        // Skip header: ID,bookID,abbreviation,book,chapter,verse,content,type
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          // Basic CSV split that handles quotes
          const parts = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          if (!parts || parts.length < 7) continue;

          // Cleanup quotes
          const cleaned = parts.map(p => p.startsWith('"') && p.endsWith('"') ? p.slice(1, -1).replace(/""/g, '"') : p);
          
          insert.run(
            lang,
            versionId,
            versionId,
            parseInt(cleaned[1]),
            cleaned[2],
            cleaned[3],
            parseInt(cleaned[4]),
            parseInt(cleaned[5]),
            cleaned[6],
            cleaned[7]
          );
        }
        console.log(`[Bible Engine] Imported ${versionId}`);
      });
    });
  });

  transaction();
  const finalCount = db.prepare('SELECT COUNT(*) as count FROM bible_verses').get().count;
  console.log(`[Bible Engine] Import complete. Total verses: ${finalCount}`);
};

// Run import in background to not block server startup
setImmediate(() => {
  importBibles();
});

// --- API ENDPOINTS ---

// Create Remote Session (6-digit PIN)
app.post('/api/session/create', (req, res) => {
  try {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h expiry
    
    db.prepare('DELETE FROM display_sessions WHERE pin = ?').run(pin); // Prevent duplicates
    db.prepare('INSERT INTO display_sessions (pin, expires_at) VALUES (?, ?)').run(pin, expiresAt);
    
    res.json({ pin, qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http://localhost:3000/display/${pin}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all songs (Existing)
app.get('/api/songs', (req, res) => {
  try {
    const songs = db.prepare('SELECT * FROM songs ORDER BY updated_at DESC').all();
    const parsedSongs = songs.map(song => ({
      ...song,
      tags: JSON.parse(song.tags || '[]'),
      slides: JSON.parse(song.slides || '[]')
    }));
    res.json(parsedSongs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save new song (Existing)
app.post('/api/songs', (req, res) => {
  const { title, author, ccli, tags, slides } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    // Check if 'lyrics' column exists to avoid crash if it's missing but required by old schema
    const columns = db.prepare("PRAGMA table_info(songs)").all();
    const hasLyrics = columns.some(c => c.name === 'lyrics');
    
    if (hasLyrics) {
      db.prepare(`
        INSERT INTO songs (title, author, ccli, tags, slides, lyrics) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        title, 
        author || '', 
        ccli || '', 
        JSON.stringify(tags || []), 
        JSON.stringify(slides || []),
        '' // Empty string for legacy lyrics column to satisfy NOT NULL
      );
    } else {
      db.prepare(`
        INSERT INTO songs (title, author, ccli, tags, slides) 
        VALUES (?, ?, ?, ?, ?)
      `).run(
        title, 
        author || '', 
        ccli || '', 
        JSON.stringify(tags || []), 
        JSON.stringify(slides || [])
      );
    }
    
    res.json({ message: 'Song saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update song
app.put('/api/songs/:id', (req, res) => {
  const { id } = req.params;
  const { title, author, ccli, tags, slides } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  
  try {
    const result = db.prepare(`
      UPDATE songs 
      SET title = ?, author = ?, ccli = ?, tags = ?, slides = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title, 
      author || '', 
      ccli || '', 
      JSON.stringify(tags || []), 
      JSON.stringify(slides || []),
      id
    );
    
    if (result.changes === 0) return res.status(404).json({ error: 'Song not found' });
    res.json({ message: 'Song updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete song
app.delete('/api/songs/:id', (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare('DELETE FROM songs WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'Song not found' });
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Backup: Export all songs to JSON
app.get('/api/songs/backup', (req, res) => {
  try {
    const songs = db.prepare('SELECT * FROM songs').all();
    const formatted = songs.map(s => ({
      ...s,
      tags: JSON.parse(s.tags || '[]'),
      slides: JSON.parse(s.slides || '[]')
    }));
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=beth_library_backup.json');
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// --- MEDIA API ENDPOINTS ---

// Get all media
app.get('/api/media', (req, res) => {
  try {
    const media = db.prepare('SELECT * FROM media ORDER BY created_at DESC').all();
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload media
app.post('/api/media/upload', (req, res) => {
  if (!upload) return res.status(503).json({ error: 'Upload service unavailable (multer missing)' });

  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
      // Check limits
      const count = db.prepare('SELECT COUNT(*) as count FROM media').get().count;
      if (count >= 50) {
        // Remove file since we exceeded limit
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Layanan penuh. Maksimal 50 media.' });
      }

      const { filename, originalname, mimetype, size } = req.file;
      const type = mimetype.startsWith('video') ? 'video' : 'image';
      const relativePath = `/uploads/media/${filename}`;

      const result = db.prepare(`
        INSERT INTO media (name, original_name, type, size, path)
        VALUES (?, ?, ?, ?, ?)
      `).run(filename, originalname, type, size, relativePath);

      res.json({ 
        id: result.lastInsertRowid, 
        name: originalname, 
        type, 
        size, 
        path: relativePath 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Delete media
app.delete('/api/media/:id', (req, res) => {
  const { id } = req.params;
  try {
    const item = db.prepare('SELECT path FROM media WHERE id = ?').get(id);
    if (!item) return res.status(404).json({ error: 'Media not found' });

    // Remove from filesystem
    const fullPath = path.join(__dirname, item.path);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    // Remove from database
    db.prepare('DELETE FROM media WHERE id = ?').run(id);
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import: Bulk add songs from JSON
app.post('/api/songs/import-bulk', (req, res) => {
  const songs = req.body;
  if (!Array.isArray(songs)) return res.status(400).json({ error: 'Data must be an array' });

  const insert = db.prepare(`
    INSERT INTO songs (title, author, ccli, tags, slides) 
    VALUES (?, ?, ?, ?, ?)
  `);

  const check = db.prepare('SELECT id FROM songs WHERE title = ? AND author = ?');

  const transaction = db.transaction((songsToImport) => {
    let imported = 0;
    let skipped = 0;
    for (const song of songsToImport) {
      const existing = check.get(song.title, song.author || '');
      if (existing) {
        skipped++;
        continue;
      }
      insert.run(
        song.title,
        song.author || '',
        song.ccli || '',
        JSON.stringify(song.tags || []),
        JSON.stringify(song.slides || [])
      );
      imported++;
    }
    return { imported, skipped };
  });

  try {
    const result = transaction(songs);
    res.json({ message: `Import complete: ${result.imported} added, ${result.skipped} skipped.`, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- BIBLE API ---

// Get all available versions grouped by language
app.get('/api/bible/versions', (req, res) => {
  try {
    const versions = db.prepare('SELECT DISTINCT language, version_id, version FROM bible_verses').all();
    const grouped = versions.reduce((acc, curr) => {
      if (!acc[curr.language]) acc[curr.language] = [];
      acc[curr.language].push({ id: curr.version_id, name: curr.version });
      return acc;
    }, {});
    res.json(grouped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all books for a specific version
app.get('/api/bible/books', (req, res) => {
  const { version = 'IndonesiaTB' } = req.query;
  try {
    const books = db.prepare(`
      SELECT DISTINCT bookID, book, abbreviation 
      FROM bible_verses 
      WHERE version_id = ?
      ORDER BY bookID ASC
    `).all(version);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get max chapters for a book
app.get('/api/bible/chapters/:bookID', (req, res) => {
  try {
    const bookID = req.params.bookID;
    const result = db.prepare('SELECT MAX(chapter) as maxChapter FROM bible_verses WHERE bookID = ?').get(bookID);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get verses for a specific reference
app.get('/api/bible/verses', (req, res) => {
  const { version, bookID, chapter } = req.query;
  console.log(`[Bible API] Fetching verses for Version: ${version}, BookID: ${bookID}, Chapter: ${chapter}`);
  try {
    const verses = db.prepare(`
      SELECT verse, content, type 
      FROM bible_verses 
      WHERE version_id = ? AND bookID = ? AND chapter = ?
      ORDER BY id ASC
    `).all(version, bookID, chapter);
    console.log(`[Bible API] Found ${verses.length} verses`);
    res.json(verses);
  } catch (error) {
    console.error(`[Bible API] Error fetching verses:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Search Bible with Maximum Performance (Regex + FlexSearch)
app.get('/api/bible/search', (req, res) => {
  const { version, query } = req.query;
  if (!query || query.length < 2) return res.json([]);
  
  console.log(`[Bible API] Search Request: "${query}" (Version: ${version})`);

  try {
    // 1. SMART REGEX (Accuracy for References)
    const refMatch = query.match(/^([a-zA-Z0-9\s]+?)\s*(\d+)(?::(\d+))?$/);
    
    if (refMatch) {
      const bookName = refMatch[1].trim();
      const chapter = parseInt(refMatch[2]);
      const verse = refMatch[3] ? parseInt(refMatch[3]) : null;

      const bookRef = db.prepare(`
        SELECT bookID FROM bible_verses 
        WHERE version_id = ? AND (book LIKE ? OR abbreviation LIKE ?)
        LIMIT 1
      `).get(version, `%${bookName}%`, `${bookName}%`);

      if (bookRef) {
        let results;
        if (verse) {
           results = db.prepare(`
            SELECT book, chapter, verse, content 
            FROM bible_verses 
            WHERE version_id = ? AND bookID = ? AND chapter = ? AND verse = ?
          `).all(version, bookRef.bookID, chapter, verse);
        } else {
           results = db.prepare(`
            SELECT book, chapter, verse, content 
            FROM bible_verses 
            WHERE version_id = ? AND bookID = ? AND chapter = ?
            ORDER BY id ASC LIMIT 50
          `).all(version, bookRef.bookID, chapter);
        }
        
        if (results.length > 0) {
          return res.json(results);
        }
      }
    }

    // 2. FLEXSEARCH (High-Speed Fuzzy Keyword Search)
    const index = bibleIndexes[version];
    if (index) {
      const ids = index.search(query, 50);
      if (ids.length > 0) {
        const placeholders = ids.map(() => '?').join(',');
        const results = db.prepare(`
          SELECT book, chapter, verse, content 
          FROM bible_verses 
          WHERE id IN (${placeholders})
          ORDER BY (CASE id ${ids.map((id, index) => `WHEN ${id} THEN ${index}`).join(' ')} END)
        `).all(...ids);
        return res.json(results);
      }
    }

    // 3. FALLBACK TO SQL LIKE (Default)
    const results = db.prepare(`
      SELECT book, chapter, verse, content 
      FROM bible_verses bv
      WHERE version_id = ? AND content LIKE ? 
      LIMIT 50
    `).all(version, `%${query}%`);
    res.json(results);

  } catch (error) {
    console.error(`[Bible API] Search error:`, error);
    res.status(500).json({ error: error.message });
  }
});

// --- REALTIME COMMUNICATIONS (SOCKET.IO) ---
let globalStudioState = {};  // pin -> last slide state
let globalStageState  = {};  // pin -> last stage state

io.on('connection', (socket) => {
  console.log('Device connected:', socket.id);

  // ── Join PIN room ──────────────────────────────────────────────────────────
  socket.on('join-session', (pin) => {
    socket.join(`room_${pin}`);
    socket.join(`stage_${pin}`);
    console.log(`Device joined room: ${pin}`);
    db.prepare('UPDATE display_sessions SET active_clients = active_clients + 1 WHERE pin = ?').run(pin);

    // Sync latest state to new joiner
    if (globalStudioState[pin]) socket.emit('sync-slide', globalStudioState[pin]);
    if (globalStageState[pin])  socket.emit('sync-stage', globalStageState[pin]);
  });

  // ── Broadcast slide (Song / Bible / Media / Countdown) ────────────────────
  // Accepts both legacy {pin, slide} and new {pin, slide: {contentType, data, isBlank}} formats
  socket.on('broadcast-slide', (payload) => {
    const { pin, slide } = payload;
    if (!pin || !slide) return;

    // Normalise: if slide has no contentType, treat as legacy 'song'
    const normalised = slide.contentType
      ? slide
      : { contentType: 'song', isBlank: slide.isBlank || false, data: slide };

    globalStudioState[pin] = normalised;
    broadcaster.batchEmit(`room_${pin}`, 'sync-slide', normalised);
    console.log(`[Output] ${normalised.contentType} → room_${pin}`);
  });

  // ── Stage Monitor message ──────────────────────────────────────────────────
  socket.on('stage-message', (payload) => {
    const { pin, currentSlide, nextSlide, message, countdown } = payload;
    if (!pin) return;
    const stageData = { contentType: 'stage', data: { currentSlide, nextSlide, message, countdown } };
    globalStageState[pin] = stageData;
    broadcaster.batchEmit(`stage_${pin}`, 'sync-stage', stageData);
    console.log(`[Stage] Message → stage_${pin}`);
  });

  // ── Mobile Remote → Operator command ──────────────────────────────────────
  socket.on('remote-command', ({ pin, command }) => {
    if(!broadcaster.throttleCommand(socket.id, 'operator-command')) return; 
    io.to(`room_${pin}`).emit('operator-command', command);
    console.log(`[Remote] Command "${command}" → room_${pin}`);
  });

  // ── Sync Countdown (Global Overlay) ──────────────────────────────────────
  socket.on('sync-countdown', ({ pin, countdown }) => {
    if (!pin || !countdown) return;
    io.to(`room_${pin}`).emit('sync-countdown', { countdown });
    io.to(`stage_${pin}`).emit('sync-countdown', { countdown });
  });

  // ── Sync Video Control ────────────────────────────────────────────────────
  socket.on('sync-video-control', (payload) => {
    const { pin } = payload;
    if (!pin) return;
    io.to(`room_${pin}`).emit('sync-video-control', payload);
  });

  socket.on('disconnect', () => {
    broadcaster.cleanupClientRooms(socket);
    console.log('Device disconnected:', socket.id);
  });
});

// ── EXPORT ENDPOINTS ───────────────────────────────────────────────────────

// Export Songs
app.get('/api/export/songs', async (req, res) => {
  try {
    const songsJson = await backupManager.exportSongs();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="beth_songs_${new Date().toISOString().split('T')[0]}.json"`);
    res.send(songsJson);
  } catch (error) {
    console.error('Export songs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export Presentations
app.get('/api/export/presentations', async (req, res) => {
  try {
    const presentationsJson = await backupManager.exportPresentations();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="beth_presentations_${new Date().toISOString().split('T')[0]}.json"`);
    res.send(presentationsJson);
  } catch (error) {
    console.error('Export presentations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export Media
app.get('/api/export/media', async (req, res) => {
  try {
    const mediaJson = await backupManager.exportMedia();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="beth_media_${new Date().toISOString().split('T')[0]}.json"`);
    res.send(mediaJson);
  } catch (error) {
    console.error('Export media error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export Full Backup
app.get('/api/export/all', async (req, res) => {
  try {
    const backupPath = await backupManager.exportFull();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="beth_backup_${new Date().toISOString().split('T')[0]}.zip"`);
    res.sendFile(backupPath, (err) => {
      if (err) {
        console.error('Send file error:', err);
        res.status(500).json({ error: 'Failed to send backup file' });
      } else {
        // Clean up temp file after send
        fs.unlink(backupPath, (unlinkErr) => {
          if (unlinkErr) console.warn('Failed to cleanup temp file:', unlinkErr);
        });
      }
    });
  } catch (error) {
    console.error('Export full backup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── IMPORT ENDPOINTS ───────────────────────────────────────────────────────

// Import Songs
app.post('/api/import/songs', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const result = await backupManager.importSongs(fileContent);
    
    // Clean up temp file
    fs.unlinkSync(req.file.path);
    
    res.json(result);
  } catch (error) {
    console.error('Import songs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Import Presentations
app.post('/api/import/presentations', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const result = await backupManager.importPresentations(fileContent);
    
    // Clean up temp file
    fs.unlinkSync(req.file.path);
    
    res.json(result);
  } catch (error) {
    console.error('Import presentations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Import Media
app.post('/api/import/media', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const result = await backupManager.importMedia(fileContent);
    
    // Clean up temp file
    fs.unlinkSync(req.file.path);
    
    res.json(result);
  } catch (error) {
    console.error('Import media error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Import Full Backup
app.post('/api/import/all', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await backupManager.importFull(req.file.path);
    
    // Clean up temp file
    fs.unlinkSync(req.file.path);
    
    res.json(result);
  } catch (error) {
    console.error('Import full backup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── POWERPOINT IMPORT ENDPOINT ───────────────────────────────────────────────

// PowerPoint Import Endpoint
app.post('/api/import/powerpoint', powerpointUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PowerPoint file uploaded' });
    }

    // Check file extension
    const allowedExtensions = ['.pptx', '.ppt'];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      // Clean up temp file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid file format. Only .pptx and .ppt files are supported.' });
    }

    console.log(`[PowerPoint] Importing: ${req.file.originalname} (${req.file.size} bytes)`);
    
    const result = await powerPointService.importPowerPoint(req.file.path);
    
    // Clean up temp file
    fs.unlinkSync(req.file.path);
    
    console.log(`[PowerPoint] Successfully imported: ${result.slideCount} slides`);
    
    res.json({
      success: true,
      slides: result.slides,
      slideCount: result.slideCount,
      fileName: result.fileName
    });
  } catch (error) {
    console.error('PowerPoint import error:', error);
    
    // Clean up temp file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: error.message,
      message: 'Failed to import PowerPoint file. Please ensure the file is not corrupted and try again.'
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 BethPresenter API Server running on http://localhost:${PORT}`);
  console.log('📡 Socket.io server ready for real-time sync');
  console.log('🎯 Broadcast throttling: 50ms batch window');
  console.log('💾 Backup/Export endpoints ready');
});
