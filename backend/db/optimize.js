const initOptimize = (db) => {
  // 1. Set PRAGMAs for massive performance gains
  db.pragma('journal_mode = WAL'); // Write-Ahead Logging
  db.pragma('synchronous = NORMAL'); // Faster writes
  db.pragma('cache_size = -65536'); // 64MB cache
  db.pragma('mmap_size = 268435456'); // 256MB memory mapped size
  db.pragma('temp_store = MEMORY'); // Store temp tables in memory

  // 2. Setup Indexing
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_songs_title_author ON songs(title, author);
      CREATE INDEX IF NOT EXISTS idx_slides_song_id ON slides(song_id);
    `);
  } catch (e) {
    console.log('Optimize: Index creation skipped (tables might not exist yet)');
  }
};

const batchInsert = (db, table, items) => {
  if (!items || !items.length) return;
  const keys = Object.keys(items[0]).join(', ');
  const placeholders = Object.keys(items[0]).map(() => '?').join(', ');
  
  const insert = db.prepare(`INSERT INTO ${table} (${keys}) VALUES (${placeholders})`);
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(Object.values(row));
  });
  insertMany(items);
};

const getOptimizedQuery = (db, query) => {
  return db.prepare(query);
};

module.exports = {
  initOptimize,
  batchInsert,
  getOptimizedQuery,
};
