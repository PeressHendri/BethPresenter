import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BackupResult {
  success: boolean;
  path?: string;
  error?: string;
  songCount?: number;
  mediaCount?: number;
}

export interface ImportResult {
  success: boolean;
  imported: { songs: number; media: number; presentations: number };
  skipped: { songs: number; media: number };
  duplicates: string[];
  error?: string;
}

// ── EXPORT ────────────────────────────────────────────────────────────────────

export async function exportData(destPath: string, options: { songs?: boolean; presentations?: boolean; media?: boolean } = {}): Promise<BackupResult> {
  const include = {
    songs: options.songs !== false,
    presentations: options.presentations !== false,
    media: options.media !== false,
  };

  try {
    let archiver: any;
    try { archiver = require('archiver'); } catch {
      // Fallback: export as single JSON file
      return exportAsJson(destPath, include);
    }

    const output = fs.createWriteStream(destPath);
    const archive = archiver('zip', { zlib: { level: 6 } });

    return new Promise((resolve) => {
      output.on('close', () => resolve({ success: true, path: destPath }));
      archive.on('error', (err: Error) => resolve({ success: false, error: err.message }));
      archive.pipe(output);

      // Build manifest
      const manifest: any = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        app: 'BethPresenter',
        includes: include,
      };

      Promise.all([
        include.songs ? prisma.song.findMany() : Promise.resolve([]),
        include.presentations ? prisma.presentation.findMany({ include: { items: true } }) : Promise.resolve([]),
        include.media ? prisma.media.findMany() : Promise.resolve([]),
      ]).then(([songs, presentations, mediaItems]) => {
        manifest.songs = songs;
        manifest.presentations = presentations;
        manifest.mediaMetadata = mediaItems.map(m => ({ ...m, filepath: path.basename(m.filepath) }));

        archive.append(JSON.stringify(manifest, null, 2), { name: 'bethpresenter-backup.json' });

        // Include media files
        if (include.media) {
          for (const item of mediaItems) {
            if (fs.existsSync(item.filepath)) {
              archive.file(item.filepath, { name: `media/${path.basename(item.filepath)}` });
            }
          }
        }

        archive.finalize();
        resolve({ success: true, path: destPath, songCount: songs.length, mediaCount: mediaItems.length });
      }).catch(err => resolve({ success: false, error: err.message }));
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function exportAsJson(destPath: string, include: any): Promise<BackupResult> {
  const [songs, presentations, mediaItems] = await Promise.all([
    include.songs ? prisma.song.findMany() : Promise.resolve([]),
    include.presentations ? prisma.presentation.findMany({ include: { items: true } }) : Promise.resolve([]),
    include.media ? prisma.media.findMany() : Promise.resolve([]),
  ]);

  const manifest = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    app: 'BethPresenter',
    includes: include,
    songs,
    presentations,
    mediaMetadata: mediaItems.map(m => ({ ...m, filepath: path.basename(m.filepath) })),
  };

  fs.writeFileSync(destPath, JSON.stringify(manifest, null, 2), 'utf8');
  return { success: true, path: destPath, songCount: songs.length, mediaCount: mediaItems.length };
}

// ── IMPORT ────────────────────────────────────────────────────────────────────

export async function importData(
  srcPath: string,
  mediaDestDir: string,
  options: { overwriteDuplicates?: boolean } = {}
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    imported: { songs: 0, media: 0, presentations: 0 },
    skipped: { songs: 0, media: 0 },
    duplicates: [],
  };

  try {
    let manifest: any;
    let mediaDir: string | null = null;

    const ext = path.extname(srcPath).toLowerCase();

    if (ext === '.zip') {
      let AdmZip: any;
      try { AdmZip = require('adm-zip'); } catch {
        result.error = 'adm-zip not installed. Run: npm install adm-zip';
        return result;
      }

      const zip = new AdmZip(srcPath);
      const jsonEntry = zip.getEntry('bethpresenter-backup.json');
      if (!jsonEntry) { result.error = 'Invalid backup file (missing bethpresenter-backup.json)'; return result; }

      manifest = JSON.parse(zip.readAsText(jsonEntry));

      // Extract media files to mediaDestDir safely
      const tmpMediaDir = path.join(mediaDestDir, '_import_tmp_' + Date.now());
      fs.mkdirSync(tmpMediaDir, { recursive: true });

      const entries = zip.getEntries();
      for (const entry of entries) {
        // Prevent Zip Slip path traversal
        const resolvedPath = path.resolve(tmpMediaDir, entry.entryName);
        if (resolvedPath.startsWith(path.resolve(tmpMediaDir))) {
          if (!entry.isDirectory) {
            const destDir = path.dirname(resolvedPath);
            fs.mkdirSync(destDir, { recursive: true });
            fs.writeFileSync(resolvedPath, entry.getData());
          }
        }
      }

      mediaDir = path.join(tmpMediaDir, 'media');
    } else if (ext === '.json') {
      manifest = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
    } else {
      result.error = 'Unsupported backup format. Use .zip or .json';
      return result;
    }

    if (manifest.app !== 'BethPresenter') {
      result.error = 'File bukan backup BethPresenter yang valid';
      return result;
    }

    // ── Import Songs ──
    if (manifest.songs?.length) {
      for (const song of manifest.songs) {
        const existing = await prisma.song.findFirst({ where: { title: song.title } });
        if (existing) {
          result.duplicates.push(song.title);
          if (options.overwriteDuplicates) {
            await prisma.song.update({
              where: { id: existing.id },
              data: { author: song.author, lyricsJson: song.lyricsJson, tags: song.tags, ccli: song.ccli },
            });
            result.imported.songs++;
          } else {
            result.skipped.songs++;
          }
        } else {
          await prisma.song.create({
            data: {
              id: song.id,
              title: song.title,
              author: song.author,
              ccli: song.ccli,
              lyricsJson: song.lyricsJson,
              tags: song.tags,
              createdAt: song.createdAt ? new Date(song.createdAt) : new Date(),
              updatedAt: new Date(),
            },
          });
          result.imported.songs++;
        }
      }
    }

    // ── Import Media ──
    if (manifest.mediaMetadata?.length && mediaDir && fs.existsSync(mediaDir)) {
      for (const meta of manifest.mediaMetadata) {
        const srcFile = path.join(mediaDir, meta.filepath);
        if (!fs.existsSync(srcFile)) { result.skipped.media++; continue; }

        const existing = await prisma.media.findFirst({ where: { filename: meta.filename } });
        if (existing) { result.skipped.media++; continue; }

        const destFile = path.join(mediaDestDir, meta.filename);
        if (!fs.existsSync(destFile)) {
          fs.copyFileSync(srcFile, destFile);
        }

        await prisma.media.create({
          data: { id: meta.id, filename: meta.filename, filepath: destFile, type: meta.type, thumbnail: meta.thumbnail },
        });
        result.imported.media++;
      }
    }

    result.success = true;
    return result;
  } catch (err: any) {
    result.error = err.message;
    return result;
  }
}
