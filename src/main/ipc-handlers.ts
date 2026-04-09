import { IpcMain, BrowserWindow, dialog, app, powerSaveBlocker } from 'electron';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { startRemoteServer, stopRemoteServer, broadcastState, getLocalIP, generateQRCode } from './remoteServer';
import { exportData, importData } from './backup';

const prisma = new PrismaClient();

// --------------------------------------------------------------------------
// Media storage directory: <userData>/BethPresenter/media
// --------------------------------------------------------------------------
function getMediaDir(): string {
  const dir = path.join(app.getPath('userData'), 'BethPresenter', 'media');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// --------------------------------------------------------------------------
// Resolve list_passage.csv (books list) for dev + prod
// --------------------------------------------------------------------------
function resolveBibleCsv(): string {
  const candidates = [
    path.resolve(process.cwd(), 'src/shared/bible/list_passage.csv'),
    path.resolve(__dirname, '../../src/shared/bible/list_passage.csv'),
    path.join(path.dirname(app.getPath('exe')), 'resources', 'src', 'shared', 'bible', 'list_passage.csv'),
  ];
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch { /* skip */ }
  }
  return '';
}

function loadBookList() {
  const csvPath = resolveBibleCsv();
  if (!csvPath) return [];
  const content = fs.readFileSync(csvPath, 'utf8');
  return content
    .split('\n').map(l => l.trim()).filter(Boolean)
    .map(line => line.split(','))
    .filter(parts => parts.length >= 4)
    .map(([bookNumber, abbr, name, totalChapter]) => ({
      bookNumber: Number(bookNumber), abbr, name, totalChapter: Number(totalChapter),
    }));
}

// --------------------------------------------------------------------------
// Bible reference parser: "Yoh 3:16" | "John 3:16" | "43:3:16"
// --------------------------------------------------------------------------
const BOOK_ALIASES: Record<string, number> = {
  // Indonesian
  kej:1,kel:2,ima:3,bil:4,ul:5,yos:6,'hak':7,rut:8,'1sam':9,'2sam':10,
  '1raj':11,'2raj':12,'1taw':13,'2taw':14,ezr:15,neh:16,est:17,ayb:18,
  mzm:19,'ams':20,pkh:21,'kid':22,yes:23,yer:24,rat:25,yeh:26,dan:27,
  hos:28,yoe:29,ams2:30,ob:31,yun:32,mik:33,nah:34,hab:35,zef:36,hag:37,
  zak:38,mal:39,mat:40,mrk:41,luk:42,yoh:43,'kis':44,rom:45,'1kor':46,
  '2kor':47,gal:48,ef:49,flp:50,kol:51,'1tes':52,'2tes':53,'1tim':54,
  '2tim':55,tit:56,flm:57,ibr:58,yak:59,'1ptr':60,'2ptr':61,'1yoh':62,
  '2yoh':63,'3yoh':64,yud:65,why:66,
  // English abbreviations
  gen:1,exo:2,lev:3,num:4,deu:5,jos:6,jdg:7,rth:8,'1sa':9,'2sa':10,
  '1ki':11,'2ki':12,'1ch':13,'2ch':14,ezr2:15,neh2:16,est2:17,job:18,
  psa:19,pro:20,ecc:21,sng:22,isa:23,jer:24,lam:25,eze:26,dan2:27,
  hos2:28,joe:29,amo:30,oba:31,jon:32,mic:33,nah2:34,hab2:35,zep:36,
  hag2:37,zec:38,mal2:39,
  mat2:40,mark:41,mrk2:41,luk2:42,john:43,act:44,rom2:45,
  '1co':46,'2co':47,gal2:48,eph:49,php:50,col:51,'1th':52,'2th':53,
  '1ti':54,'2ti':55,tit2:56,phm:57,heb:58,jas:59,'1pe':60,'2pe':61,
  '1jo':62,'2jo':63,'3jo':64,jud:65,rev:66,
};

function parseReference(ref: string): { bookNumber: number; chapter: number; verse: number } | null {
  const s = ref.trim();
  // Format: "43:3:16"
  const numFmt = s.match(/^(\d+):(\d+):(\d+)$/);
  if (numFmt) return { bookNumber: +numFmt[1], chapter: +numFmt[2], verse: +numFmt[3] };
  // Format: "Yoh 3:16" or "John 3:16" or "Mzm 23"
  const textFmt = s.match(/^(\d?\w+)\s+(\d+)(?::(\d+))?$/i);
  if (textFmt) {
    const abbr = textFmt[1].toLowerCase().replace(/[^a-z0-9]/g, '');
    const ch = parseInt(textFmt[2]);
    const vs = textFmt[3] ? parseInt(textFmt[3]) : 1;
    const bn = BOOK_ALIASES[abbr];
    if (bn) return { bookNumber: bn, chapter: ch, verse: vs };
  }
  return null;
}

type SongGetAllParams = string | { search?: string; tag?: string };

export function setupIpcHandlers(
  ipcMain: IpcMain,
  getOutputWindow: () => BrowserWindow | null,
  createOutputWindow: () => BrowserWindow,
  getStageWindow?: () => BrowserWindow | null,
  createStageWindow?: () => BrowserWindow
) {
  ipcMain.handle('ping', () => 'pong');

  // ═══════════════════════════════════════════════════════════════
  // POWER SAVE BLOCKER (Screen Wake Lock)
  // ═══════════════════════════════════════════════════════════════
  let wakeLockId: number | null = null;
  ipcMain.handle('app:set-live-state', (_, isLive: boolean) => {
    if (isLive && wakeLockId === null) {
      wakeLockId = powerSaveBlocker.start('prevent-display-sleep');
      console.log('App is live. Display sleep prevented.');
    } else if (!isLive && wakeLockId !== null) {
      powerSaveBlocker.stop(wakeLockId);
      wakeLockId = null;
      console.log('Live ended. Display sleep allowed.');
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // BIBLE HANDLERS
  // ═══════════════════════════════════════════════════════════════

  ipcMain.handle('bible:listBooks', async () => loadBookList());

  ipcMain.handle('bible:getBooks', async (_, translation: string) => {
    // Returns books that have data for translation, in canonical order
    const bookList = loadBookList();
    const found = await prisma.bibleVerse.findMany({
      where: { translation },
      select: { book: true, bookNumber: true },
      distinct: ['book'],
      orderBy: { bookNumber: 'asc' },
    });
    // Merge with CSV for totalChapter info
    return found.map(f => {
      const meta = bookList.find(b => b.bookNumber === f.bookNumber);
      return { bookNumber: f.bookNumber, book: f.book, name: meta?.name ?? f.book, abbr: meta?.abbr ?? '', totalChapter: meta?.totalChapter ?? 1 };
    });
  });

  ipcMain.handle('bible:getChapters', async (_, params: { bookNumber: number; translation: string }) => {
    const { bookNumber, translation } = params;
    const rows = await prisma.bibleVerse.findMany({
      where: { bookNumber, translation },
      select: { chapter: true },
      distinct: ['chapter'],
      orderBy: { chapter: 'asc' },
    });
    return rows.map(r => r.chapter);
  });

  ipcMain.handle('bible:getVerses', async (_, params: { bookNumber: number; chapter: number; translation: string }) => {
    const { bookNumber, chapter, translation } = params;
    return await prisma.bibleVerse.findMany({
      where: { bookNumber, chapter, translation },
      orderBy: { verse: 'asc' },
    });
  });

  ipcMain.handle('bible:getChapter', async (_, params: { bookNumber: number; chapter: number; translation: string }) => {
    const { bookNumber, chapter, translation } = params;
    return await prisma.bibleVerse.findMany({
      where: { bookNumber, chapter, translation },
      orderBy: { verse: 'asc' },
    });
  });

  ipcMain.handle('bible:hasTranslation', async (_, translation: string) => {
    const count = await prisma.bibleVerse.count({ where: { translation } });
    return count > 0;
  });

  ipcMain.handle('bible:getTranslations', async () => {
    const rows = await prisma.bibleVerse.findMany({
      select: { translation: true },
      distinct: ['translation'],
    });
    return rows.map(r => r.translation);
  });

  ipcMain.handle('bible:search', async (_, params: { query: string; translation: string; limit?: number }) => {
    const { query, translation, limit = 50 } = params;
    if (!query.trim()) return [];
    return await prisma.bibleVerse.findMany({
      where: {
        translation,
        text: { contains: query },
      },
      orderBy: [{ bookNumber: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }],
      take: limit,
    });
  });

  ipcMain.handle('bible:jumpTo', async (_, ref: string) => {
    const parsed = parseReference(ref);
    if (!parsed) return { error: `Cannot parse reference: ${ref}` };
    return { ...parsed };
  });

  ipcMain.handle('bible:importZefania', async (event, { filePath, translationName }: { filePath: string; translationName: string }) => {
    try {
      const xml = fs.readFileSync(filePath, 'utf8');
      const versesToInsert: any[] = [];
      
      // Simple Regex parsing for standard Zefania format
      const bookRegex = /<BIBLEBOOK[^>]*bnumber="(\d+)"[^>]*bname="([^"]+)"[^>]*>([\s\S]*?)<\/BIBLEBOOK>/g;
      const chapterRegex = /<CHAPTER[^>]*cnumber="(\d+)"[^>]*>([\s\S]*?)<\/CHAPTER>/g;
      const verseRegex = /<VERS[^>]*vnumber="(\d+)"[^>]*>([\s\S]*?)<\/VERS>/g;
      
      let bMatch;
      while ((bMatch = bookRegex.exec(xml)) !== null) {
        const bookNumber = parseInt(bMatch[1]);
        const bookName = bMatch[2];
        const bookContent = bMatch[3];
        
        let cMatch;
        while ((cMatch = chapterRegex.exec(bookContent)) !== null) {
          const chapterNumber = parseInt(cMatch[1]);
          const chapterContent = cMatch[2];
          
          let vMatch;
          while ((vMatch = verseRegex.exec(chapterContent)) !== null) {
            const verseNumber = parseInt(vMatch[1]);
            const verseText = vMatch[2].replace(/<[^>]+>/g, '').trim(); 
            
            versesToInsert.push({
              translation: translationName,
              bookNumber,
              book: bookName,
              chapter: chapterNumber,
              verse: verseNumber,
              text: verseText
            });
          }
        }
      }
      
      const total = versesToInsert.length;
      if (total === 0) return { success: false, error: 'No verses found in XML' };
      
      for (let i = 0; i < total; i += 5000) {
         event.sender.send('bible:import-progress', { current: i, total });
         const chunk = versesToInsert.slice(i, i + 5000);
         await prisma.bibleVerse.createMany({ data: chunk });
      }
      event.sender.send('bible:import-progress', { current: total, total });
      
      return { success: true, count: total };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // SONG HANDLERS
  // ═══════════════════════════════════════════════════════════════

  ipcMain.handle('song:getAll', async (_, params?: SongGetAllParams) => {
    const search = typeof params === 'string' ? params : params?.search;
    const tag    = typeof params === 'string' ? undefined : params?.tag;
    const and: any[] = [];
    if (search?.trim()) {
      and.push({ OR: [{ title: { contains: search } }, { lyricsJson: { contains: search } }] });
    }
    if (tag?.trim()) {
      and.push({ tags: { contains: `"${tag}"` } });
    }
    return await prisma.song.findMany({
      where: and.length ? { AND: and } : undefined,
      orderBy: { title: 'asc' },
    });
  });

  ipcMain.handle('song:create', async (_, data: any) => await prisma.song.create({ data }));
  ipcMain.handle('song:update', async (_, { id, ...data }: any) => await prisma.song.update({ where: { id }, data }));
  ipcMain.handle('song:delete', async (_, id: string) => await prisma.song.delete({ where: { id } }));
  
  ipcMain.handle('song:duplicate', async (_event, id: string) => {
    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) throw new Error('Song not found');
    const { id: _id, ...data } = song; // exclude id
    data.title = `${data.title} (Copy)`;
    return await prisma.song.create({ data });
  });

  ipcMain.handle('song:bulkDelete', async (_, ids: string[]) => {
    return await prisma.song.deleteMany({ where: { id: { in: ids } } });
  });

  ipcMain.handle('song:importFromText', async (_, { title, author, text }: { title: string; author: string; text: string }) => {
    // Basic text to slide parser.
    const sections = text.split(/\n\s*\n/);
    const slides = sections.map((sec, i) => {
      let label = 'Verse';
      let content = sec.trim();
      const match = content.match(/^\[(.*?)\]\s*\n([\s\S]*)$/);
      if (match) {
        label = match[1];
        content = match[2];
      } else if (i === 0) {
        label = 'Verse 1';
      }
      return { label, text: content };
    });
    return await prisma.song.create({
      data: {
        title: title || 'Untitled Song',
        author: author || 'Unknown',
        lyricsJson: JSON.stringify(slides),
        tags: '[]',
      }
    });
  });

  ipcMain.handle('song:importFromEasyWorship', async (_, dbPath: string) => {
    try {
      const Database = require('better-sqlite3');
      const db = new Database(dbPath, { readonly: true });
      
      const ewSongs = db.prepare('SELECT id, title, author, copyright FROM song').all();
      const ewSlides = db.prepare('SELECT id, song_id, slide_number, body, label FROM song_slide ORDER BY song_id, slide_number').all();
      
      const imported = [];
      for (const es of ewSongs) {
        const slidesForSong = ewSlides.filter((s: any) => s.song_id === es.id).map((s: any) => ({
          label: s.label || `Slide ${s.slide_number}`,
          text: s.body || ''
        }));
        
        const created = await prisma.song.create({
          data: {
            title: es.title || 'Untitled',
            author: es.author || '',
            ccli: es.copyright || null,
            lyricsJson: JSON.stringify(slidesForSong),
            tags: '["Imported"]',
          }
        });
        imported.push(created);
      }
      db.close();
      return { success: true, count: imported.length };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('tag:getAll', async () => {
    const songs = await prisma.song.findMany({ select: { tags: true } });
    const counts = new Map<string, number>();
    for (const s of songs) {
      if (!s.tags) continue;
      try {
        const tags = JSON.parse(s.tags) as unknown;
        if (!Array.isArray(tags)) continue;
        for (const t of tags) {
          if (typeof t !== 'string') continue;
          const tag = t.trim();
          if (tag) counts.set(tag, (counts.get(tag) || 0) + 1);
        }
      } catch { /* ignore */ }
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag));
  });

  // ═══════════════════════════════════════════════════════════════
  // PRESENTATION HANDLERS
  // ═══════════════════════════════════════════════════════════════

  ipcMain.handle('presentation:getAll', async () => {
    return await prisma.presentation.findMany({
      include: { items: { include: { song: true }, orderBy: { order: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });
  });

  ipcMain.handle('presentation:save', async (_, { name, items }: { name: string; items: any[] }) => {
    return await prisma.presentation.create({
      data: {
        name,
        itemsJson: JSON.stringify(items),
        items: {
          create: items.map((item, index) => ({
            songId: item.songId,
            type: item.type,
            content: item.content,
            order: index,
          })),
        },
      },
    });
  });

  ipcMain.handle('config:update', async (_, params: { category: string; key: string; value: any }) => {
    const { category, key, value } = params;
    const fullKey = `${category}.${key}`;
    const strValue = typeof value === 'string' ? value : JSON.stringify(value);

    await prisma.setting.upsert({
      where: { key: fullKey },
      update: { value: strValue },
      create: { key: fullKey, value: strValue },
    });

    const out = getOutputWindow();
    if (out) out.webContents.send('config:updated', { category, key, value });

    const stage = getStageWindow?.();
    if (stage) stage.webContents.send('config:updated', { category, key, value });

    return true;
  });

  // ═══════════════════════════════════════════════════════════════
  // MEDIA HANDLERS
  // ═══════════════════════════════════════════════════════════════

  ipcMain.handle('media:selectAndImport', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Pilih Foto atau Video',
      filters: [
        { name: 'Media', extensions: ['jpg','jpeg','png','gif','webp','bmp','svg','mp4','mov','webm','mkv','avi','m4v'] },
        { name: 'Foto', extensions: ['jpg','jpeg','png','gif','webp','bmp','svg'] },
        { name: 'Video', extensions: ['mp4','mov','webm','mkv','avi','m4v'] },
      ],
      properties: ['openFile', 'multiSelections'],
    });
    if (result.canceled || !result.filePaths.length) return [];

    const mediaDir = getMediaDir();
    const imported: any[] = [];
    for (const srcPath of result.filePaths) {
      try {
        const stats = fs.statSync(srcPath);
        const filename = path.basename(srcPath);
        const ext = path.extname(srcPath).toLowerCase().replace('.', '');
        const isImage = ['jpg','jpeg','png','gif','webp','bmp','svg'].includes(ext);
        const type = isImage ? 'image' : 'video';
        const destName = `${Date.now()}_${filename}`;
        const destPath = path.join(mediaDir, destName);
        fs.copyFileSync(srcPath, destPath);
        const record = await prisma.media.create({ data: { filename: destName, filepath: destPath, type } });
        imported.push({ ...record, sizeBytes: stats.size });
      } catch (err: any) {
        console.error('Failed to import media:', err.message);
      }
    }
    return imported;
  });

  ipcMain.handle('media:getAll', async () => {
    const items = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
    return items.map(m => {
      let sizeBytes = 0; let exists = false;
      try { const s = fs.statSync(m.filepath); sizeBytes = s.size; exists = true; } catch { /* missing */ }
      return { ...m, sizeBytes, exists };
    });
  });

  ipcMain.handle('media:delete', async (_, id: string) => {
    const record = await prisma.media.findUnique({ where: { id } });
    if (record) {
      try { fs.unlinkSync(record.filepath); } catch { /* gone */ }
      await prisma.media.delete({ where: { id } });
    }
    return true;
  });

  ipcMain.handle('media:getAsBase64', async (_, filePath: string) => {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > 50 * 1024 * 1024) return { error: 'File too large for inline preview (max 50MB).' };
      const data = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase().replace('.', '');
      const mime: Record<string,string> = {
        jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',gif:'image/gif',
        webp:'image/webp',svg:'image/svg+xml',bmp:'image/bmp',
        mp4:'video/mp4',mov:'video/quicktime',webm:'video/webm',mkv:'video/x-matroska',avi:'video/x-msvideo',
      };
      return { base64: `data:${mime[ext]||'application/octet-stream'};base64,${data.toString('base64')}` };
    } catch (err: any) { return { error: err.message }; }
  });

  ipcMain.handle('media:getFileUrl', async (_, filePath: string) => `media://${filePath}`);

  // ═══════════════════════════════════════════════════════════════
  // SETTINGS HANDLERS
  // ═══════════════════════════════════════════════════════════════

  ipcMain.handle('setting:get', async (_, key: string) => {
    const s = await prisma.setting.findUnique({ where: { key } });
    if (!s) return null;
    try { return JSON.parse(s.value); } catch { return s.value; }
  });

  ipcMain.handle('setting:set', async (_, params: { key: string; value: any }) => {
    const { key, value } = params;
    const strValue = typeof value === 'string' ? value : JSON.stringify(value);
    return await prisma.setting.upsert({
      where: { key },
      update: { value: strValue },
      create: { key, value: strValue },
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // OUTPUT WINDOW HANDLERS
  // ═══════════════════════════════════════════════════════════════

  ipcMain.handle('output:open', () => {
    const win = getOutputWindow();
    if (win) { win.show(); win.focus(); return true; }
    createOutputWindow(); return true;
  });

  ipcMain.handle('output:send-slide', (_, slideData: any) => {
    const win = getOutputWindow();
    if (win) { win.webContents.send('display-slide', slideData); return true; }
    return false;
  });

  ipcMain.handle('output:send-bible', (_, bibleData: any) => {
    const win = getOutputWindow();
    if (win) { win.webContents.send('display-bible', bibleData); return true; }
    return false;
  });

  ipcMain.handle('output:send-formatting', (_, formatting: any) => {
    const win = getOutputWindow();
    if (win) { win.webContents.send('apply-formatting', formatting); return true; }
    return false;
  });

  ipcMain.handle('output:send-background', (_, bg: any) => {
    const win = getOutputWindow();
    if (win) { win.webContents.send('set-background', bg); return true; }
    return false;
  });

  ipcMain.handle('output:send-blank', (_, isBlank: boolean) => {
    const win = getOutputWindow();
    if (win) { win.webContents.send('set-blank', isBlank); return true; }
    return false;
  });

  ipcMain.handle('output:control', (_, action: string) => {
    const win = getOutputWindow();
    if (win) { win.webContents.send('output-action', action); return true; }
    return false;
  });

  ipcMain.handle('output:toggle-fullscreen', () => {
    const win = getOutputWindow();
    if (win) { win.setFullScreen(!win.isFullScreen()); return true; }
    return false;
  });

  /* ── Video Playback Output Handlers ── */
  ipcMain.handle('output:video:play', () => {
    const win = getOutputWindow();
    if (win) { win.webContents.send('video:play'); return true; }
    return false;
  });

  ipcMain.handle('output:video:pause', () => {
    const win = getOutputWindow();
    if (win) { win.webContents.send('video:pause'); return true; }
    return false;
  });

  ipcMain.handle('output:video:stop', () => {
    const win = getOutputWindow();
    if (win) { win.webContents.send('video:stop'); return true; }
    return false;
  });

  ipcMain.handle('output:video:setLoop', (_, loop: boolean) => {
    const win = getOutputWindow();
    if (win) { win.webContents.send('video:setLoop', loop); return true; }
    return false;
  });

  ipcMain.handle('output:video:setMuted', (_, muted: boolean) => {
    const win = getOutputWindow();
    if (win) { win.webContents.send('video:setMuted', muted); return true; }
    return false;
  });

  // Listener to bounce video progress updates back to the requesting front-ends (operator panels)
  ipcMain.on('output:video:progress-update', (_, state) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      // Avoid sending it back to output
      if (win !== getOutputWindow() && !win.isDestroyed()) {
        win.webContents.send('media:video-progress', state);
      }
    });
  });

  // ── Timer handlers (forward to output + stage) ──
  ipcMain.handle('timer:start', (_, timerData: { duration: number; title?: string; subtext?: string; background?: any }) => {
    const out = getOutputWindow();
    const stage = getStageWindow?.();
    if (out) out.webContents.send('timer-start', timerData);
    if (stage) stage.webContents.send('stage:timer-update', { remaining: timerData.duration, total: timerData.duration, running: true, title: timerData.title });
    return !!out;
  });

  ipcMain.handle('timer:stop', () => {
    const out = getOutputWindow(); const stage = getStageWindow?.();
    if (out) out.webContents.send('timer-stop');
    if (stage) stage.webContents.send('stage:timer-update', null);
    return true;
  });

  ipcMain.handle('timer:pause', () => {
    const out = getOutputWindow();
    if (out) out.webContents.send('timer-pause');
    return true;
  });

  ipcMain.handle('timer:resume', () => {
    const out = getOutputWindow();
    if (out) out.webContents.send('timer-resume');
    return true;
  });

  // ═══════════════════════════════════════════════════════════════
  // STAGE DISPLAY HANDLERS
  // ═══════════════════════════════════════════════════════════════

  ipcMain.handle('stage:open', () => {
    if (createStageWindow) {
      const w = getStageWindow?.();
      if (w) { w.show(); w.focus(); return true; }
      createStageWindow();
      return true;
    }
    return false;
  });

  ipcMain.handle('stage:close', () => {
    const w = getStageWindow?.();
    if (w) { w.close(); return true; }
    return false;
  });

  ipcMain.handle('stage:send-slide', (_, data: { current: any; next: any }) => {
    const w = getStageWindow?.();
    if (w) { w.webContents.send('stage:update-slide', data); return true; }
    return false;
  });

  ipcMain.handle('stage:send-message', (_, msg: string) => {
    const w = getStageWindow?.();
    if (w) { w.webContents.send('stage:set-message', msg); return true; }
    return false;
  });

  ipcMain.handle('stage:is-open', () => {
    return !!(getStageWindow?.());
  });

  // ═══════════════════════════════════════════════════════════════
  // REMOTE CONTROL HANDLERS
  // ═══════════════════════════════════════════════════════════════

  let remotePort = 4321;

  ipcMain.handle('remote:start', async (_, port?: number) => {
    remotePort = port || 4321;
    try {
      // Add bible search REST endpoint hook (injected via express route)
      const result = await startRemoteServer(remotePort, {
        onSlideChange: (index) => {
          // Forward to output window
          const state = (broadcastState as any).__state;
          const slides = state?.slides || [];
          const slide = slides[index];
          if (slide) {
            const out = getOutputWindow();
            if (out) out.webContents.send('display-slide', { text: slide.text, title: slide.songTitle || '', type: 'song', label: slide.label });
          }
        },
        onBlankToggle: (blank) => {
          const out = getOutputWindow();
          if (out) out.webContents.send('set-blank', blank);
        },
        onHideToggle: (hidden) => {
          const out = getOutputWindow();
          // The output window already listens to 'output-action', 'toggle-hide' 
          // or 'output:hideText'. I mapped 'output:hideText' explicitly.
          if (out) out.webContents.send('output:hideText', hidden);
        },
        onSendBible: (data) => {
          const out = getOutputWindow();
          if (out) out.webContents.send('display-bible', { text: (data as any).text, reference: (data as any).reference, translation: (data as any).translation });
        },
        onClientChange: (count) => {
          BrowserWindow.getAllWindows().forEach(win => {
            if (!win.isDestroyed()) win.webContents.send('remote:client-count', count);
          });
        }
      });
      return { success: true, ...result };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('remote:stop', async () => {
    await stopRemoteServer();
    return true;
  });

  ipcMain.handle('remote:get-info', async () => {
    const ip = getLocalIP();
    const url = `http://${ip}:${remotePort}`;
    const qrDataUrl = await generateQRCode(url);
    return { ip, port: remotePort, url, qrDataUrl };
  });

  // Push current slide list to remote clients
  ipcMain.handle('remote:sync-slides', (_, slides: any[]) => {
    broadcastState({ slides, currentIndex: 0 });
    return true;
  });

  ipcMain.handle('remote:sync-current', (_, index: number) => {
    broadcastState({ currentIndex: index });
    return true;
  });

  // ═══════════════════════════════════════════════════════════════
  // BACKUP / RESTORE HANDLERS
  // ═══════════════════════════════════════════════════════════════

  ipcMain.handle('backup:export', async (_, options: { songs?: boolean; presentations?: boolean; media?: boolean } = {}) => {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Simpan Backup BethPresenter',
      defaultPath: `BethPresenter-backup-${new Date().toISOString().slice(0, 10)}.zip`,
      filters: [
        { name: 'ZIP Archive', extensions: ['zip'] },
        { name: 'JSON', extensions: ['json'] },
      ],
    });
    if (canceled || !filePath) return { success: false, canceled: true };
    return await exportData(filePath, options);
  });

  ipcMain.handle('backup:import', async (_, options: { overwriteDuplicates?: boolean } = {}) => {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: 'Pilih File Backup BethPresenter',
      filters: [
        { name: 'Backup', extensions: ['zip', 'json'] },
      ],
      properties: ['openFile'],
    });
    if (canceled || !filePaths.length) return { success: false, canceled: true };
    const mediaDir = require('path').join(app.getPath('userData'), 'BethPresenter', 'media');
    if (!require('fs').existsSync(mediaDir)) require('fs').mkdirSync(mediaDir, { recursive: true });
    return await importData(filePaths[0], mediaDir, options);
  });
}

